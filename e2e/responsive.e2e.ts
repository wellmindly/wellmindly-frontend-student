import { test, expect } from "@playwright/test";

/* ============================================================================
   Route × viewport measurement walk.

   This is the spec that B-036 asked a builder to run by hand. It answers three
   questions with numbers rather than opinions:

     1. Does the route scroll horizontally? (`scrollWidth > clientWidth`)
     2. What gutter does the content actually get, at each width?
     3. Are the tap targets big enough on the platform that ships as an APK?

   The brief names 375 / 390 / 768 / 1024 / 1440 + large desktop, so those are
   the widths. Both PUBLIC routes (8) and AUTHENTICATED dashboard tabs (7)
   are walked: 15 routes × 6 viewports = 90 measurements.
   ========================================================================= */

const VIEWPORTS = [
  { name: "375 (iPhone SE / base mobile)", width: 375, height: 812 },
  { name: "390 (iPhone 14)", width: 390, height: 844 },
  { name: "768 (tablet portrait)", width: 768, height: 1024 },
  { name: "1024 (tablet landscape)", width: 1024, height: 768 },
  { name: "1440 (laptop)", width: 1440, height: 900 },
  { name: "1920 (large desktop)", width: 1920, height: 1080 },
];

const PUBLIC_ROUTES = [
  { path: "/", name: "Landing" },
  { path: "/login", name: "Login" },
  { path: "/discover", name: "Discover" },
  { path: "/crisis", name: "Crisis" },
  { path: "/about", name: "About" },
  { path: "/contact", name: "Contact" },
  { path: "/university", name: "University" },
  { path: "/counselors", name: "Counselors" },
];

const DASHBOARD_TABS = [
  { id: "overview", name: "Overview", tab: "overview" },
  { id: "checkin", name: "Checkin", tab: "checkin" },
  { id: "assessments", name: "Assessments", tab: "assessments" },
  { id: "discover", name: "DiscoverTab", tab: "discover" },
  { id: "writemindly", name: "WriteMindly", tab: "writemindly" },
  { id: "talkmindly", name: "TalkMindly", tab: "talkmindly" },
  { id: "sessionbooking", name: "SessionBooking", tab: "sessionbooking" },
];

/** A tap target smaller than this fails WCAG 2.5.8 / the brief's 44px rule. */
const MIN_TAP = 44;

type Overflow = {
  scrollWidth: number;
  clientWidth: number;
  overflowBy: number;
  offenders: { tag: string; cls: string; right: number; width: number }[];
};

type GutterResult = {
  mainLeft: number;
  mainWidth: number;
  sectionLeft: number | null;
  sectionWidth: number | null;
  gutter: number | null;
};

type TapTargetResult = {
  tag: string;
  label: string;
  w: number;
  h: number;
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
      offenders: offenders.sort((a, b) => b.right - a.right).slice(0, 6),
    };
  });
}

/**
 * The gutter the content actually gets: distance from the viewport edge to the
 * first section's content box.
 */
async function measureGutter(page: import("@playwright/test").Page): Promise<GutterResult | null> {
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
 * Exclusions:
 *   - sr-only skip links (1×1 clipped until focused).
 *   - Names that live in img alt (kit Logo).
 *   - Subpixel rendering rounding.
 */
async function measureTapTargets(page: import("@playwright/test").Page): Promise<TapTargetResult[]> {
  return page.evaluate((min) => {
    const sel = 'a[href], button, [role="button"], input:not([type="hidden"]), select, textarea';
    const small: { tag: string; label: string; w: number; h: number }[] = [];

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
      if (r.width <= 1 && r.height <= 1 && style.clipPath !== "none") continue;
      
      const roundedW = Math.round(r.width);
      const roundedH = Math.round(r.height);
      if (roundedW < min || roundedH < min) {
        small.push({
          tag: el.tagName.toLowerCase(),
          label: accessibleName(el).trim().replace(/\s+/g, " ").slice(0, 40) || "(NO NAME)",
          w: roundedW,
          h: roundedH,
        });
      }
    }
    return small;
  }, MIN_TAP);
}

/** Known gutter exemptions filed in BUGS.md */
const KNOWN_GUTTER: { route: string; width: number; gutter: number; reason: string; bugId?: string }[] = [];

/**
 * Pre-existing sub-44 tap targets on ACCEPTED surfaces (public routes and dense dashboard controls),
 * audited and catalogued under B-078 in BUGS.md.
 */
const KNOWN_TAP_PATTERNS: { labelMatcher: RegExp | string; bugId: string }[] = [
  { labelMatcher: /WellMindly\s*[-—]\s*home/i, bugId: "B-078" },
  { labelMatcher: "Sign In", bugId: "B-078" },
  { labelMatcher: "Jai Malani", bugId: "B-078" },
  { labelMatcher: "About", bugId: "B-078" },
  { labelMatcher: "Contact", bugId: "B-078" },
  { labelMatcher: "Explore Assessments", bugId: "B-078" },
  { labelMatcher: "For Universities", bugId: "B-078" },
  { labelMatcher: "Join as a counselor", bugId: "B-078" },
  { labelMatcher: "Crisis Resources", bugId: "B-078" },
  { labelMatcher: /Sign in with Google/i, bugId: "B-078" },
  { labelMatcher: "Show password", bugId: "B-078" },
  { labelMatcher: "Forgot password?", bugId: "B-078" },
  { labelMatcher: /Don't have an account\?/i, bugId: "B-078" },
  { labelMatcher: "Discover", bugId: "B-078" },
  { labelMatcher: "My collection", bugId: "B-078" },
  { labelMatcher: /Need help right now\?/i, bugId: "B-078" },
  { labelMatcher: "info@wellmindly.com", bugId: "B-078" },
  { labelMatcher: "+971 50 731 2108", bugId: "B-078" },
  { labelMatcher: "Dashboard", bugId: "B-078" },
  { labelMatcher: "Quick check-in", bugId: "B-078" },
  { labelMatcher: "Previous", bugId: "B-078" },
  { labelMatcher: "Next", bugId: "B-078" },
  { labelMatcher: "All Counselors", bugId: "B-078" },
  { labelMatcher: "Youth & Students", bugId: "B-078" },
  { labelMatcher: "Stress & Load", bugId: "B-078" },
  { labelMatcher: "Anxiety & Mood", bugId: "B-078" },
  { labelMatcher: "Mindset Coaching", bugId: "B-078" },
  { labelMatcher: "Specialized Care", bugId: "B-078" },
  { labelMatcher: "Reset Filters", bugId: "B-078" },
  { labelMatcher: /UTC Standard/i, bugId: "B-078" },
];

function assertGutter(gutter: GutterResult | null, routeName: string, vpWidth: number) {
  expect(gutter, `${routeName} @ ${vpWidth}px: expected <main> element on route`).not.toBeNull();
  if (!gutter || gutter.gutter === null) return;

  // A centered max-w-* column has symmetric margins: mainWidth - sectionWidth ≈ 2 × gutter
  const isSymmetric =
    gutter.sectionWidth !== null &&
    Math.abs(gutter.mainWidth - gutter.sectionWidth - 2 * gutter.gutter) <= 4;

  if (isSymmetric) return; // Deliberate centered column

  const isKnown = KNOWN_GUTTER.some((k) => k.route === routeName && k.width === vpWidth);
  if (isKnown) return;

  expect(
    gutter.gutter,
    `${routeName} @ ${vpWidth}px: section re-applies page gutter asymmetrically (gutter=${gutter.gutter}px, mainWidth=${gutter.mainWidth}, sectionWidth=${gutter.sectionWidth})`
  ).toBeLessThanOrEqual(1);
}

function filterKnownTap(small: TapTargetResult[]): TapTargetResult[] {
  return small.filter((s) => {
    return !KNOWN_TAP_PATTERNS.some((k) => {
      if (typeof k.labelMatcher === "string") {
        return s.label.toLowerCase() === k.labelMatcher.toLowerCase() || s.label.includes(k.labelMatcher);
      }
      return k.labelMatcher.test(s.label);
    });
  });
}

// ---------------------------------------------------------------------------
// 1. PUBLIC ROUTES (8 routes × 6 viewports = 48 measurements)
// ---------------------------------------------------------------------------
for (const vp of VIEWPORTS) {
  test.describe(`Public @ ${vp.width}px — ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of PUBLIC_ROUTES) {
      test(`${route.name} (${route.path})`, async ({ page }) => {
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(300);

        const overflow = await measureOverflow(page);
        const gutter = await measureGutter(page);
        const small = await measureTapTargets(page);
        const unexpectedSmall = filterKnownTap(small);

        const report = [
          `${route.name} @ ${vp.width}`,
          `  scrollWidth ${overflow.scrollWidth} / clientWidth ${overflow.clientWidth}` +
            (overflow.overflowBy ? `  ← OVERFLOW +${overflow.overflowBy}px` : "  ✓ no h-scroll"), // guard-ignore
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

        // 1. Assert no horizontal overflow
        expect(
          overflow.overflowBy,
          `${route.name} scrolls horizontally at ${vp.width}px by ${overflow.overflowBy}px. ` +
            `Widest offenders: ${JSON.stringify(overflow.offenders, null, 1)}`
        ).toBeLessThanOrEqual(1);

        // 2. Assert gutter
        assertGutter(gutter, route.name, vp.width);

        // 3. Assert tap targets
        expect(unexpectedSmall, `${route.name} @ ${vp.width}px: unexpected controls under 44×44`).toEqual([]);
      });
    }
  });
}

// ---------------------------------------------------------------------------
// 2. DASHBOARD ROUTES (7 tabs × 6 viewports = 42 measurements)
// ---------------------------------------------------------------------------
test.describe("Dashboard routes (authenticated)", () => {
  test.use({ storageState: "e2e/.auth/student.json" });

  for (const vp of VIEWPORTS) {
    test.describe(`Dashboard @ ${vp.width}px — ${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const tab of DASHBOARD_TABS) {
        test(`${tab.name} (?tab=${tab.tab})`, async ({ page }) => {
          await page.goto(`/dashboard?tab=${tab.tab}`, { waitUntil: "domcontentloaded" });
          await page.locator("h1").first().waitFor({ timeout: 10_000 });
          await page.waitForTimeout(300);

          const overflow = await measureOverflow(page);
          const gutter = await measureGutter(page);
          const small = await measureTapTargets(page);
          const unexpectedSmall = filterKnownTap(small);

          const report = [
            `Dashboard/${tab.name} @ ${vp.width}`,
            `  scrollWidth ${overflow.scrollWidth} / clientWidth ${overflow.clientWidth}` +
              (overflow.overflowBy ? `  ← OVERFLOW +${overflow.overflowBy}px` : "  ✓ no h-scroll"), // guard-ignore
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

          // 1. Assert no horizontal overflow
          expect(
            overflow.overflowBy,
            `Dashboard/${tab.name} scrolls horizontally at ${vp.width}px by ${overflow.overflowBy}px. ` +
              `Widest offenders: ${JSON.stringify(overflow.offenders, null, 1)}`
          ).toBeLessThanOrEqual(1);

          // 2. Assert gutter
          assertGutter(gutter, tab.name, vp.width);

          // 3. Assert tap targets
          expect(unexpectedSmall, `Dashboard/${tab.name} @ ${vp.width}px: unexpected controls under 44×44`).toEqual([]);
        });
      }
    });
  }
});
