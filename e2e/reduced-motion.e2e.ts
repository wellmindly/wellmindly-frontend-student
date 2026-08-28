import { test, expect } from "@playwright/test";

/* ============================================================================
   Reduced Motion E2E Suite (T-1005)

   Proves that:
     1. Programmatic scrollIntoView uses instant jump ("auto") instead of
        smooth animation when prefers-reduced-motion: reduce is active.
     2. Loading spinners (.animate-spin) remain active (slowed to 1.4s infinite)
        for essential visual feedback rather than freezing at 0.01ms.
     3. Looping keyframes settle at appropriate resting opacity.
   ========================================================================= */

test.describe("Reduced Motion Preferences", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("scrollIntoView jumps instantly in one frame without smooth scrolling in flight", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);

    const matches = await page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    expect(matches).toBe(true);

    // Initial scroll position
    const initialY = await page.evaluate(() => window.scrollY);
    expect(initialY).toBe(0);

    // Click "See how it works" which targets #explore-tools via scrollToElement
    const seeHowItWorks = page.getByRole("link", { name: "See how it works" });
    await seeHowItWorks.click();

    // Sample scrollY on consecutive requestAnimationFrames
    const [sample1, sample2] = await page.evaluate(async () => {
      return new Promise<[number, number]>((resolve) => {
        requestAnimationFrame(() => {
          const s1 = window.scrollY;
          requestAnimationFrame(() => {
            const s2 = window.scrollY;
            resolve([s1, s2]);
          });
        });
      });
    });

    // An instant jump settles immediately in frame 1, so frame 2 === frame 1 > 0
    expect(sample1).toBeGreaterThan(100);
    expect(sample2).toBe(sample1);
  });

  test("loading spinners (.animate-spin) stay active at 1.4s infinite under reduced motion", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Inspect spinner styling under reduced motion
    const duration = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "animate-spin";
      document.body.appendChild(el);
      const computed = getComputedStyle(el);
      const res = {
        duration: computed.animationDuration,
        iterationCount: computed.animationIterationCount,
      };
      el.remove();
      return res;
    });

    expect(duration.duration).toBe("1.4s");
    expect(duration.iterationCount).toBe("infinite");
  });

  test("decorative animations are cancelled to 0.01ms / 1 iteration", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const keyframeStyles = await page.evaluate(() => {
      const classes = [
        "animate-breathe",
        "animate-pulse-soft",
        "animate-drift",
        "animate-float",
        "animate-shimmer",
      ];
      const results: Record<string, { duration: string; iterationCount: string; opacity: string }> = {};

      for (const cls of classes) {
        const el = document.createElement("div");
        el.className = cls;
        document.body.appendChild(el);
        const style = getComputedStyle(el);
        results[cls] = {
          duration: style.animationDuration,
          iterationCount: style.animationIterationCount,
          opacity: style.opacity,
        };
        el.remove();
      }
      return results;
    });

    for (const [cls, res] of Object.entries(keyframeStyles)) {
      const durationSeconds = parseFloat(res.duration);
      expect(
        durationSeconds,
        `${cls} animation duration should be truncated under reduced motion`
      ).toBeLessThanOrEqual(0.001);
      expect(res.iterationCount, `${cls} iteration count`).toBe("1");
      // Verify opacity is not permanently dimmed to 0
      const op = parseFloat(res.opacity);
      expect(op, `${cls} resting opacity`).toBeGreaterThanOrEqual(0.5);
    }
  });
});
