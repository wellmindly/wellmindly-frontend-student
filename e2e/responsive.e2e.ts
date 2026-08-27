import { test, expect } from "@playwright/test";

/* ============================================================================
   Route × viewport measurement walk.

   This is the spec that B-036 asked a builder to run by hand. It answers three
   questions with numbers rather than opinions:

     1. Does the route scroll horizontally? (`scrollWidth > clientWidth`)
     2. What gutter does the content actually get, at each width?
     3. Are the tap targets big enough on the platform that ships as an APK?

   The brief names 375 / 390 / 768 / 1024 / 1440 + large desktop, so those are
   the widths. Only PUBLIC routes are walked: `/dashboard` is behind
   `RequireAuth` and needs a real JWT, which is a separate journey (see the
   `test.fixme` at the bottom - it is declared so the gap stays visible instead
   of being quietly absent).
   ========================================================================= */

const VIEWPORTS = [
  { name: "375 (iPhone SE / base mobile)", width: 375, height: 812 },
  { name: "390 (iPhone 14)", width: 390, height: 844 },
  { name: "768 (tablet portrait)", width: 768, height: 1024 },
  { name: "1024 (tablet landscape)", width: 1024, height: 768 },
  { name: "1440 (laptop)", width: 1440, height: 900 },
  { name: "1920 (large desktop)", width: 1920, height: 1080 },
];

const ROUTES = [
  { path: "/", name: "Landing" },
  { path: "/login", name: "Login" },
  { path: "/discover", name: "Discover" },
  { path: "/crisis", name: "Crisis" },
  { path: "/about", name: "About" },
  { path: "/contact", name: "Contact" },
  { path: "/university", name: "University" },
  { path: "/counselors", name: "Counselors" },
];

/** A tap target smaller than this fails WCAG 2.5.8 / the brief's 44px rule. */
const MIN_TAP = 44;

type Overflow = {
  scrollWidth: number;
  clientWidth: number;
  overflowBy: number;
  offenders: { tag: string; cls: string; right: number; width: number }[];
};

/**
 * Measures document overflow and, when it overflows, names the elements whose
 * right edge crosses the viewport. Without the offender list a failure says
 * "something is 40px too wide" and the next step is a manual bisect.
 */
async function measureOverflow(page: import("@playwright/test").Page): Promise<Overflow> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const clientWidth = doc.clientWidth;
    const scrollWidth = doc.scrollWidth;
    const offenders: { tag: string; cls: string; right: number; width: number }[] = [];

    if (scrollWidth > clientWidth + 1) {
      for (const el of Array.from(document.body.querySelectorAll("*"))) {
        const r = el.getBoundingClientRect();
        // Ignore zero-area nodes and anything deliberately parked off-canvas to
        // the left (transform-based slide-ins), which do not create scroll.
        if (r.width <= 0 || r.height <= 0) continue;
        if (r.right > clientWidth + 1) {
          const style = getComputedStyle(el);
          if (style.visibility === "hidden" || style.display === "none") continue;
          offenders.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.getAttribute("class") ?? "").slice(0, 90),
            right: Math.round(r.right),
            width: Math.round(r.width),
          });
        }
      }
    }

    return {
      scrollWidth,
      clientWidth,
      overflowBy: Math.max(0, scrollWidth - clientWidth),
      // Deepest-first is noisy; the widest offender is almost always the cause.
      offenders: offenders.sort((a, b) => b.right - a.right).slice(0, 6),
    };
  });
}

/**
 * The gutter the content actually gets: distance from the viewport edge to the
 * first section's content box. T-210 existed because three of four sections
 * re-applied their parent's `px-6`, spending 48px of a 375px screen on air.
 */
async function measureGutter(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return null;
    const mainRect = main.getBoundingClientRect();
    const section = main.querySelector("section, div");
    const sectionRect = section?.getBoundingClientRect() ?? null;
    return {
      mainLeft: Math.round(mainRect.left),
      mainWidth: Math.round(mainRect.width),
      sectionLeft: sectionRect ? Math.round(sectionRect.left) : null,
      sectionWidth: sectionRect ? Math.round(sectionRect.width) : null,
      gutter: sectionRect ? Math.round(sectionRect.left - mainRect.left) : null,
    };
  });
}

/**
 * Interactive elements rendered smaller than 44×44 CSS px.
 *
 * Two exclusions, both because the first run reported them and both were the
 * probe being wrong rather than the app:
 *
 *   - **sr-only skip links.** `Skip to main content` measures 1×1 because it is
 *     clipped until focused. That is the correct implementation of the pattern,
 *     so a 1×1 clipped element is skipped rather than reported.
 *   - **Names that live in `img alt`.** The kit `Logo` is a `<Link>` wrapping
 *     `<img alt="WellMindly — home">`. Its accessible name is fine; `textContent`
 *     simply cannot see it, and reporting it as "(no name)" trains me to ignore
 *     the report. Resolve the name the way a screen reader would.
 */
async function measureTapTargets(page: import("@playwright/test").Page) {
  return page.evaluate((min) => {
    const sel = 'a[href], button, [role="button"], input:not([type="hidden"]), select, textarea';
    const small: { tag: string; label: string; w: number; h: number }[] = [];

    /** aria-label → aria-labelledby → text → `<label>` → img alt → title. */
    const accessibleName = (el: Element): string => {
      const aria = el.getAttribute("aria-label");
      if (aria?.trim()) return aria;
      const ref = el.getAttribute("aria-labelledby");
      if (ref) {
        const named = ref
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? "")
          .join(" ");
        if (named.trim()) return named;
      }
      if (el.textContent?.trim()) return el.textContent;
      // Form controls are named by their label, not their content. Without this
      // every correctly-labelled input reads as nameless and the report lies.
      if (el.id) {
        const forLabel = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        if (forLabel?.textContent?.trim()) return forLabel.textContent;
      }
      const wrapping = el.closest("label");
      if (wrapping?.textContent?.trim()) return wrapping.textContent;
      const img = el.querySelector("img[alt], svg > title");
      const alt = img?.getAttribute?.("alt") ?? img?.textContent;
      if (alt?.trim()) return alt;
      const title = el.getAttribute("title") ?? el.getAttribute("placeholder");
      return title?.trim() ?? "";
    };

    for (const el of Array.from(document.querySelectorAll(sel))) {
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      // The sr-only pattern: clipped to nothing until it receives focus.
      if (r.width <= 1 && r.height <= 1 && style.clipPath !== "none") continue;
      if (r.width < min || r.height < min) {
        small.push({
          tag: el.tagName.toLowerCase(),
          label: accessibleName(el).trim().replace(/\s+/g, " ").slice(0, 40) || "(NO NAME)",
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
      }
    }
    return small;
  }, MIN_TAP);
}

for (const vp of VIEWPORTS) {
  test.describe(`@ ${vp.width}px — ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of ROUTES) {
      test(`${route.name} (${route.path})`, async ({ page }) => {
        await page.goto(route.path, { waitUntil: "networkidle" });
        // The landing route fetches coaches; give layout a beat to settle so a
        // measurement is not taken mid-transition.
        await page.waitForTimeout(250);

        const overflow = await measureOverflow(page);
        const gutter = await measureGutter(page);
        const small = vp.width < 768 ? await measureTapTargets(page) : [];

        const report = [
          `${route.name} @ ${vp.width}`,
          `  scrollWidth ${overflow.scrollWidth} / clientWidth ${overflow.clientWidth}` +
            (overflow.overflowBy ? `  ← OVERFLOW +${overflow.overflowBy}px` : "  ✓ no h-scroll"), // guard-ignore — terminal report glyphs, not UI icons
          gutter
            ? `  main [left ${gutter.mainLeft}, w ${gutter.mainWidth}]  first child [left ${gutter.sectionLeft}, w ${gutter.sectionWidth}]  gutter ${gutter.gutter}px`
            : "  (no <main> on this route)",
        ];
        for (const o of overflow.offenders) {
          report.push(`  offender: <${o.tag}> right=${o.right} w=${o.width}  class="${o.cls}"`);
        }
        for (const s of small) {
          report.push(`  tap target ${s.w}×${s.h} <${s.tag}> "${s.label}"`);
        }
        console.log(report.join("\n"));

        // Horizontal scroll is the hard failure: it is the defect the client
        // reported as "looks good, except on mobile".
        expect(
          overflow.overflowBy,
          `${route.name} scrolls horizontally at ${vp.width}px by ${overflow.overflowBy}px. ` +
            `Widest offenders: ${JSON.stringify(overflow.offenders, null, 1)}`
        ).toBeLessThanOrEqual(1);
      });
    }
  });
}

/* Declared, not skipped silently: the signed-in surfaces are the bulk of the
   remaining redesign and they are behind `RequireAuth`, which reads a JWT from
   localStorage. Measuring them needs either a seeded test account with a known
   password or a token minted from the backend's secret, and the backend must be
   running on :5000. Until that fixture exists, every dashboard measurement is
   still unverified - this placeholder keeps that fact in the test report rather
   than in a comment nobody reads. */
test.fixme("dashboard routes need an auth fixture before they can be measured", () => {});
