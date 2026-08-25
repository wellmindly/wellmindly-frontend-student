# CLAUDE.md - WellMindly Student Frontend

> **Audience: me, in a future session.** This is the working ledger for the student-frontend UI/UX redesign. Read it first. It records the mission, what's done, what's next, and the facts that are expensive to rediscover. Update the "Done" / "Next" / "Known issues" sections as work lands - keep it honest, not aspirational.

---

## 1. What this app is

`frontend-student` - the student-facing SPA in the WellMindly monorepo.

- **Stack:** React 19 + Vite 8 + TypeScript + Tailwind **v4** + Framer Motion. Router: react-router-dom 7. HTTP: axios. Icons: lucide-react.
- **Runs at** `:5173` (`npm run dev`). Ships as a **Capacitor Android APK** (`@capacitor/*` 8.x) - it's a real mobile app, not just a website. Treat mobile as the primary target.
- **Backend:** Node/Express/Prisma/PostgreSQL at `:5000`. API base is `VITE_API_URL` → `/api`. Auth is JWT in `localStorage` (`token`, `user`), decoded with `jwt-decode`; an axios interceptor attaches `Bearer`.
- **Feature flag:** `config.enableWriteMindly` gates the WriteMindly surface.
- Other monorepo apps (university, auraflow, admin=Vue, counselor) are **out of scope** - do not touch them.

---

## 2. Mission & design direction

From the 25-section brief "WellMindly - Student Frontend UI/UX Redesign". Rebuild the student experience into **a modern, highly interactive, emotionally engaging Gen-Z student product that feels like a real app**, not a university portal.

Design direction: **modern, youthful, premium, calm, interactive, emotionally warm, playful-not-childish, distinctive, mobile-first.** Think "consumer app + social product + wellness product + interactive dashboard," NOT "university portal + corporate website." The product should have personality.

**Core principle:** every major screen answers *"What can the student DO here?"* - not *"What information can we show?"*

**Binding constraints (do not violate):**
- Do **not** break existing functionality while redesigning UI.
- Do **not** modify admin/counselor functionality unless absolutely necessary for shared components.
- **Inspect the existing implementation** before changing it - never assume from the filename. Understand data flow / API deps / state / routing / auth first.
- Do **not** replace working functionality with mock data. Do not remove API integrations because the UI is ugly. If a change needs backend data that already exists, use it. If it genuinely needs backend changes, **flag it - don't invent data.**
- Avoid unnecessary dependencies - check the existing UI kit / libs first.
- Production-quality code only. No throwaway prototypes, no static HTML mockups, no fake screenshots. The result is the actual working app.
- **No dark patterns.** Supportive, not addictive.
- Respect `prefers-reduced-motion`.
- Use the **UI/UX Pro Max skill** before design decisions.
- Test at **375, 390, 768, 1024, 1440, and large desktop.**
- You do NOT need approval for every design decision - use judgment.

---

## 3. Conventions & gotchas (expensive to rediscover)

- **`npm install` requires `--legacy-peer-deps`** - pre-existing ERESOLVE from `@codetrix-studio/capacitor-google-auth@^3.4.0-rc.4`.
- **Build:** `cd frontend-student && npx vite build`. **Never** pass `--root` from the monorepo root - npx installs a foreign vite and dies with `CACError: Unknown option --root`. (`npm run build` runs `tsc -b && vite build` + copies `index.html`→`404.html` for gh-pages.)
- **Tailwind v4 `@theme`:** namespaced tokens (`--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--ease-*`, `--animate-*`, `--blur-*`) auto-generate utilities. **Non-namespaced** vars (`--z-*`, `--duration-*`, `--bottom-nav-height`) generate **no** utility - use arbitrary syntax: `z-[var(--z-modal)]`, not `z-modal`.
- **Static extraction:** class names can **never** be templated. `bg-${stem}-500` emits nothing. Write full literal strings; that's why `lib/mood.ts` spells every class out.
- **Ink ramp is 50→900** - there is **no `ink-950`**. Brand ramps plum/teal/coral/gold/rose/sage are 50→900. The new `rose`/`teal`/`sage`/`coral`/`gold` tokens **override** Tailwind's built-ins.
- **Vitest jsdom has no `matchMedia` mock** (`setupFiles: []`). Components must guard `window.matchMedia?.()` and fall back for `addListener`/`addEventListener` (see `Sheet.tsx`).
- Valid dynamic scales confirmed: `h-4.5`, `p-4.5`, `border-3`, `z-25`. Invalid: `py-0.8`, `text-xs.5`.

---

## 4. The system to build on

**Do not restyle pages independently** - the old codebase had four drifted visual languages. If a page needs a treatment that isn't in the kit, **add it to the kit first.**

- **UI kit barrel** `src/components/ui/index.ts` - `Button`/`IconButton`, `Card`/`ActionCard`/`SectionHeader`, `Badge`/`Chip`/`Avatar`/`Divider`, `Field`/`Input`/`Textarea`/`PasswordInput`, `Sheet`/`ConfirmSheet`, `ToastProvider`/`useToast`, `Skeleton`/`SkeletonText`/`SkeletonCard`/`Loadable`, `EmptyState`/`ErrorState`, `ProgressBar`/`ProgressRing`/`StepDots`, `SegmentedControl`/`Tabs`/`TabPanel`. Import via `"../ui"`.
- **Helpers:** `lib/cn.ts` (clsx+tailwind-merge), `lib/motion.ts` (springs/variants), `lib/a11y.ts`, `lib/format.ts`.
- **Mood:** `lib/mood.ts` is the **single source of truth** for the 1–5 scale (rating/label/summary/colors/affirmation). `moodByRating()` clamps out-of-range values. `ui/MoodFace.tsx` draws the line-art faces. Never redefine mood colors locally again.
- **Tokens:** `src/index.css` - all colors, z-index, safe-area, motion vars.

---

## 5. Done & verified ✅

Foundation + shell are complete and green (`tsc -b` clean, `vitest run` 3/3, `vite build` successful):

- **Design tokens** (`src/index.css`) and the **UI kit** (`src/components/ui/`).
- **`DashboardLayout.tsx`** - one unified shell for every signed-in surface (was forked into a hard-coded dark tree for TalkMindly). Fixed z-index utilities → `z-[var(--z-*)]`, `bg-ink-950`→`ink-900`, immersive-header squash. Preserves `DashboardLayoutProps` so `Dashboard.tsx` was untouched.
- **`lib/mood.ts` + `ui/MoodFace.tsx`** - killed a real data bug: the scale was defined 3× with conflicting colors (rating 2 amber-in-picker vs green-in-mosaic; rating 4 blue vs gold), so a student's history showed a different color than the face they tapped.
- **`DailyCheckinPopup.tsx`** rebuilt on `Sheet` - added focus trap, ESC, dialog role, labeled close; faces carry color permanently (hover-reveal fails on touch).
- **`Sheet.tsx`** - hardened `matchMedia` (iOS Safari <14 `addListener` fallback).
- **`useDashboard.ts`** - `normalizeTab()` fixes the `/dashboard?tab=phq9` blank-page bug; tab changes now **push** history (browser/Android back steps through sections) with a URL-sync effect.

---

## 6. How the work is now split (read this before doing anything)

Since 2026-08-25 the user has capped my token budget and moved to a **two-role model**:

- **Me (Claude/Opus) = architect, task author, reviewer.** I plan the refactor, write task cards, and review every batch. **I do not edit app code.** When I find a defect I file a bug or write a card — I never spend tokens fixing it myself.
- **Gemini 3.7 Flash (Antigravity) = builder.** It works through `../tasks/` one card at a time and marks the tracker.

The loop does not end until the refactor is 100% complete and I am satisfied with code, design, style and architecture.

**Everything lives in `Wellmindly/tasks/`** (monorepo root — note this is *outside* the git repo, since the git root is `frontend-student`, so `tasks/` is untracked by design):

| File | Purpose |
|---|---|
| `TRACKER.md` | Single source of truth for status. Builder sets `DONE`/`BLOCKED`; only I set `ACCEPTED`. Has the review log. |
| `BUGS.md` | My review findings, S1/S2/S3. Outranks new tasks. |
| `INDEX.md` | The ~58-task roadmap across 10 phases. |
| `README.md` | The builder's operating instructions. |
| `phase-N-*/T-NNN-*.md` | One card per task. |

**Card-writing rules I learned the hard way:**
- **Never leave user-facing copy to the builder's judgement.** Six of eight S1 bugs in pass 1 were invented claims ("Delete anytime", "4 free sessions funded by your institution"). If a card doesn't supply the sentence, the builder writes one. Supply every sentence, or say explicitly that `BLOCKED` is the correct response.
- **Verify API names before putting them in a card.** T-103 specified lucide brand icons that don't exist and blocked two tasks. Cost a whole round-trip.
- **A mandated "Step-0 inventory in Notes" gets skipped** unless the Done-when checklist has a line item for it.
- **Demand one commit per task.** Pass 1 arrived as one 45-file blob; per-task diffs were unrecoverable and I had to review whole files. Pass 2 gave 4 commits and was reviewable.
- **Say how many sites a bug has, and make counting them a Done-when line.** Both pass-2 reopens were the same failure: a *correct* fix applied to part of the surface (1 of 4 redirect call sites; 3 UI states wired but 2 unreachable from the data layer). A bug that says "N places" gets N places fixed; a bug that says "this is wrong" gets one place fixed.
- **`BUGS.md` must be append-only.** The builder replaced every bug body with a one-line status, so I could no longer diff a fix against the ask without `git log` — expensive when tokens are the constraint.
- **Read the target component's real signature before specifying the migration.** Writing Phase 3 I had to check that `Logo` only offers `sm`/`md` (so the login brand mark necessarily shrinks — a visual decision the card must own rather than discover), that `Button`'s `loading` *hides* the label and shows an `sr-only` announcement (so "Processing…" stops being visible), and that kit `Input` already wires `aria-invalid`/`aria-describedby` (so the a11y card must say "verify", not "add"). A card written from memory of the kit specifies work that doesn't exist and misses work that does.
- **When a legacy value is genuinely correct, authorise the escape hatch explicitly.** Google's sign-in mark uses fixed brand hexes that no token should ever match. If T-303 didn't name that and pre-approve four `guard-ignore`s, the builder would either retint Google's logo or never reach a clean gate.
- **For anything the client will look at, give her options with previews — never one proposal.** The user's standing constraint: she *"is way too moody, she herself doesn't know what she wants and always confuses me."* A single opinionated design guarantees a rejection round. Put 3 visually distinct directions in an `AskUserQuestion` with ASCII previews and let her pick; then write the chosen shape into the card as a **constraint**, with an explicit "do not substitute a different shape." That is how T-208 and T-209 were specified.
- **Review the file's claims, not just the card's asks.** The TalkMindly simulator fabricated peer handles (Sage/Lotus/Fern/Tulip) with scripted dialogue labelled "● Live Demo", and it survived passes 1, 2 **and** 3 — because each pass checked whether the builder did what the card said, and no card ever said "don't invent students." §8's do-not-fabricate list has to be re-read against the diff, not just against the card.
- **A card that asks for something elaborate will get it.** T-204 asked for "three visually connected pillars" and got 499 lines: a `role="tablist"` with roving tabindex, two scale-transform connectors, a `min-h-[380px]` panel, three duplicated fake simulators. The build was correct and the client rejected it as *"too many things, useless lines… doesn't make any sense at all."* The "useless lines" were the connectors **I specified.** When a card's Done-when list is long, that is a signal the design is too big, not that the spec is thorough.

### Current status (Phase 3 reviewed & accepted — review pass 4, 2026-08-25)

`tsc -b` ✅ clean · `vitest` ✅ 3/3 · `vite build` ✅ · `guard src/components/ui` ✅ **0/0** · `guard` auth route ✅ **0/0** · landing route ✅ 0 errors, 3 permitted warnings

**Phase 3 (auth) is closed: all five cards `ACCEPTED`, zero reopens** — the first batch with none. `Login.tsx` 883 → 457 lines plus four components in `src/components/auth/` (`AuthBrandPanel`, `AuthForm`, `GoogleAuthButtons`, `AuthAlerts`), and 44 guard errors → 0/0. `pages/Login.tsx` has dropped off the debt map entirely.

Two things I verified rather than trusted, and both are worth repeating on future splits: **all seven auth paths diffed byte-for-byte** against the pre-split commit (`78f6dbe`) — every `api.post`, `navigate(`, `loginSuccess`, `GoogleAuth`, `sessionStorage` line — where the only disappearances were the two `<div onClick={() => navigate("/")}>` logos that became the kit `Logo`; and **the focus-to-first-error actually moves focus**, because `Field.tsx` genuinely `forwardRef`s onto the inner `<input>` (a `ref` on a kit component that swallows it would have made the whole a11y card cosmetic and every grep would still have passed).

**Seven bugs came out of it (B-029 → B-035), and two are mine.** B-033 (the post-auth navigation block written out three times) and B-035 (`otpSent` not reset when the email changes) are pre-existing logic that T-301 correctly told the builder to move mechanically — I should have carded them in the first place. The builder's five: no divider on the native Google path, "Resend Code" announcing nothing, three decorative icons missing `aria-hidden`, a 700ms CSS scale with no `motion-reduce:`, and a redundant second mode-switch function.

**Builder queue right now:** Phase 2R (T-208 → T-209 → T-210, still `TODO` — the landing page is the client's selling point and outranks bugs), then B-029 → B-035 in three grouped commits.

**Next for me:** author **Phase 4 (dashboard home)** — T-401 `OverviewTab` redesign, T-402 the mood mosaic that silently calls `onDailyCheckin(3)`, T-403 `WellbeingChart`'s empty Jan–Jun axis, T-404 the three divergent quick-action card styles, T-405 `CheckinModal`/`ScreeningModal` onto `Sheet`. Then review 2R + the pass-4 bugs together.

Candidate new guard rule, still unwritten: **`nested-gutter`** — a section re-applying its layout parent's `px-*` or `max-w-*`. T-210 is the test of whether it earns its place.

**Deliberately not a database lookup:** the UI/UX Pro Max skill's search corpus is **not installed** in this environment — only `SKILL.md` is present, `scripts/search.py` does not exist. The design reasoning behind T-208/T-209 comes from the skill's priority table (accessibility → touch targets → layout/responsive → typography → animation) plus this app's own token system. Do not record it as a matched palette/style profile.

### Previously (Phase 2R authored — client feedback round, 2026-08-25)

**Phase 2R jumped the queue.** The client saw the landing page and rejected two things:

1. **The care-path block, outright** — *"too many things, useless lines in it, this component doesn't make any sense at all, we need to make this simple, easy to understand and genzy style."* She is right. `ExploreToolsSection.tsx` is 499 lines — **37% of the whole landing route** — to say "there are three ways to get help": 11 props, a tablist with a full arrow-key handler, two connector hairlines, a `min-h-[380px]` reserved panel, and three structurally duplicated fake simulators. T-204 is `SUPERSEDED`, **not** `REVIEW-FAIL` — the build matched my card; the card was wrong.
2. **The whole route on mobile** — *"rest of the landing page looks good, except on mobile… this is our selling point."*

| Card | What it does |
|---|---|
| T-208 | Rebuild the care path as **"one question, three answers"** — the shape the client chose from three previews. `<h2>` is the question "How much do you want to talk right now?", then three tappable rows (Not out loud / To people who get it / To a real person), then one quiet crisis line. 499→<200 lines, 11 props→3. Every string supplied. Kills the fabricated Sage/Lotus/Fern/Tulip peer handles. |
| T-209 | Hero at 375–390px. Five `absolute` children **all at `z-20`** over a ~279px canvas: the top pair wants 380px, the bottom pair wants 400px, so they physically intersect and `truncate` produces `Coach Vinayak · T…`. Bubbles → `hidden sm:flex`; the two preview cards → a static 2-up row below the portrait via a `sm:contents` wrapper. **Desktop must stay pixel-identical.** |
| T-210 | Route-wide mobile. `<main>` provides `px-6 max-w-6xl`; **three of four sections apply both again** → 48px gutters instead of 24 at 375px (a 15% width tax on the primary platform) and every `border-t` spanning a different width than its content. `ExploreToolsSection` is the one that got it right and is the reference. Plus the beta banner's dismiss button floating mid-paragraph at 375px. Ends with a measured 375/390 route walk. |

**Next for me:** review Phase 2R's three commits **and** Phase 3 against T-301's Step-0 audit in one round, then author Phase 4 off the debt map. Candidate new guard rule from this round: **`nested-gutter`** — a section re-applying its layout parent's `px-*` or `max-w-*`. No gate catches it today.

*(Phase 3 half of that has since been done — see the current-status block above. Phase 2R is still with the builder.)*

### Previously (end of review pass 3)

**Phases 1 and 2 closed** — every row `ACCEPTED`, every bug through B-028 `VERIFIED`, zero reopens and zero new bugs. The public route (header, footer, hero, care path, coaching, trust, both legacy blocks) plus the entire 15-file UI kit were clean on all four gates; `LandingPage.tsx` went 761→288 lines. One row of that has since been reopened by the client: **T-204 → `SUPERSEDED` by T-208** (see above). The gates themselves are unaffected — the rejection is about design, not correctness.

Phase 3 was authored in full in the same round: T-301 (Step-0 audit + mechanical split into `AuthBrandPanel`/`AuthForm`/`GoogleAuthButtons`/`AuthAlerts`), T-302 (delete the local `Field`, move onto kit `Input`/`PasswordInput`), T-303 (kit `Logo`/`Button`/`IconButton` + full token migration + the four authorised Google-brand `guard-ignore`s, and the `GoogleLogin width="320"` overflow), T-304 (replace the fabricated brand-panel cards), T-305 (`<h1>`, two always-mounted live regions, focus-to-first-invalid-field on a `failedAttempt` counter). All five are `DONE` and awaiting review.

### Design-system debt map (from `guard --all`, for phase planning)

**913 errors across 76 files.** Dominant rules: `off-system-palette` 552, `raw-white` 233, `micro-type` 70, `raw-hex` 58 — i.e. the legacy tree mostly predates the ramp.

| File | Guard errors | Note |
|---|---|---|
| `CounselorBookingView.tsx` | 183 | worst offender — overtook TalkMindly once the rules caught `ring-offset-*` |
| `TalkMindlyTab.tsx` | 138 | hard-coded dark theme |
| `OverviewTab.tsx` | 72 | |
| `AssessmentsTab.tsx` | 63 | |
| `ReportDetailModal.tsx` | 60 | |
| `AssessmentWizard.tsx` | 53 | |
| `ResultView.tsx` | 46 | |
| `Login.tsx` | 44 | Phase 3 — carded |

Run `cd frontend-student && node scripts/guard.mjs --all` for the current picture.

### `guard.mjs` — my review tooling

`frontend-student/scripts/guard.mjs`, zero deps. Every rule exists because the mistake was actually made once. Scope defaults to files changed vs HEAD; pass paths (files **or** directories) to narrow, `--all` for the whole tree. Errors exit 1, warnings exit 0, `// guard-ignore` opts a line out. Prints a per-rule + worst-file tally on failure.

Rules: `templated-class`, `phantom-z-utility`, `phantom-ink-950`, `micro-type`, `raw-hex`, `off-system-palette`, `raw-white`, `clickable-div`, `new-dependency` (errors); `outline-none-no-ring`, `animate-height`, `pulse-animation`, `emoji-glyph`, `icon-button-no-label`, `small-touch-target` (warnings).

A rule may set `clearedBy` + `window` to look ahead N lines before firing — `outline-none-no-ring` needs it, because a focus ring is routinely on the next line of a wrapped class list. Without it the rule both false-positived on `Field.tsx:93` and missed the real hit in `SegmentedControl.tsx:274`.

**When a review finds a class of defect the guard missed, add the rule.** Pass 1 added five; pass 2 fixed two.

---

## 7. Deferred backlog (~70–75% of the brief)

Each is a coherent chunk a future session can pick up. Line counts current as of this ledger.

**Big surfaces:** `TalkMindlyTab` (1116), `booking/CounselorBookingView` (1156), `Login` (887), `UniversityPage` (535), `WriteMindlyTab` (447), `CrisisPage` (440), `OverviewTab` full redesign (416, tokens already migrated), `AssessmentsTab` (361), `CounselorsPage` (300), `ContactPage` (260), `HeroSection` (206), `AboutPage` (146).

**Quiz/Discover engine:** `ResultView` (558), `DiscoverPage` (351), `FeedbackForm` (238), `GatedResultView` (142), `CollectionView` (119), `TestView` (116), `HubView` (97), `LikertMode`/`PictureMode`/`PairMode`, `DiscoverTab` (152).

**Modals & misc:** `ReportDetailModal` (389), `HotlinesTab` (283, dead component / live endpoint), `ComingSoonModal` (207), `WellbeingChart` (148), `CheckinModal` (67), `ScreeningModal` (33), `Dashboard` (161).

Then **QA sweep** at 375 / 390 / 768 / 1024 / 1440 / large desktop.

**Cleanup while in the area:** triplicated PHQ-9 config, `shade()` helper, 3 copies of the social-SVG markup, unused props; route TalkMindly's user id through `AuthContext`; consolidate `CounselorBookingView` onto the shared `api` instance.

---

## 8. Known issues & fix-don't-fabricate list

**Fix (real endpoint exists or behavior is broken):**
- ~~`LandingPage.confirmBooking()` is **fake**~~ — **DONE** (T-202, pass 2). The coach/slot picker is now labelled "Example slots" with a `Preview` badge and confirming routes to `/login?redirect=…`; the real endpoint `/api/v1/students/sessions/book` is auth-only. **`?redirect=` is now part of the normal product flow**, which is why the open-redirect hole in `Login.tsx` (B-014) matters.
- No-op CTAs: TalkMindly "Close & Contact Support"; AssessmentWizard's 2 CTAs; `OverviewTab` Mood Mosaic silently calling `onDailyCheckin(3)` (~L248); CrisisPage crisis-scroll.
- `LandingPage.fetchCoaches()` swallows both its error and its empty case into a hardcoded `DEFAULT_COACHES` roster, so real backend failures show placeholder people as bookable (B-016).

**Flag - do NOT fabricate data to fill these:**
- `AssessmentsTab` Sleep/Social/Study bars (invented); `ReportDetailModal` 6 hardcoded breakdowns; `WellbeingChart` Jan–Jun empty axis; `HeroSection`/`Login` "Today's tone" + "Coach Vinayak · Thu 5pm" mock cards; `UniversityPage` fabricated jsPDF report; `FeedbackForm` 6-answers-in-one-string; 3 divergent readings of `/students/hotlines`.
- **11 pre-existing npm vulns (1 critical)** - left untouched, not introduced by this work.
- Build emits a chunk-size warning (entry >500 kB) - accepted for now; route-level `lazy()` already applied.

---

*Last updated: 2026-08-25. Round completed: **review pass 4 — Phase 3 (auth) closed.** All five cards `ACCEPTED`, zero reopens, `Login.tsx` 883 → 457 lines, auth route 44 guard errors → 0/0. Seven bugs filed (B-029 → B-035); two of them are mine, not the builder's. Next: builder finishes Phase 2R then works the bugs in three grouped commits; I author Phase 4 (dashboard home) and review 2R + the bugs together.*
