import { defineConfig, devices } from "@playwright/test";

/* ============================================================================
   Playwright — measurement harness, not a regression suite.

   This exists to close one specific gap: the reviewer cannot see a rendered
   pixel. Every "test at 375 / 390 / 768 / 1024 / 1440" line in the brief used to
   be unverifiable from here, so it was either delegated (B-036) or marked
   explicitly unverified (T-406's keyboard/focus checks). These specs take the
   measurements instead of asking for them.

   `testMatch` is `*.e2e.ts` ON PURPOSE. Vitest has no `test` block in
   vite.config.ts, so it uses its default include glob - every `.test.` and
   `.spec.` file, at any depth - and would try to run these specs in jsdom, so
   `vitest run` would go red on a suite it cannot execute. `.e2e.ts` matches
   neither vitest's default nor Playwright's, which is why it is declared here
   explicitly.
   ========================================================================= */

export default defineConfig({
  testDir: "./e2e",

  // Measurements have to be stable to be evidence, so nothing runs concurrently
  // and a failure is never retried into a pass.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,

  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],

  use: {
    baseURL: "http://localhost:5173",
    // Artefacts only on failure - a green run should leave nothing behind.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
      testMatch: /.*\.e2e\.ts/,
    },
  ],

  // The dev server, not the preview build: this measures what `npm run dev`
  // serves, which is what every other gate in the pipeline compiles.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
