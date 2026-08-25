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

**Card-writing rules I learned the hard way in pass 1:**
- **Never leave user-facing copy to the builder's judgement.** Six of eight S1 bugs in pass 1 were invented claims ("Delete anytime", "4 free sessions funded by your institution"). If a card doesn't supply the sentence, the builder writes one. Supply every sentence, or say explicitly that `BLOCKED` is the correct response.
- **Verify API names before putting them in a card.** T-103 specified lucide brand icons that don't exist and blocked two tasks. Cost a whole round-trip.
- **A mandated "Step-0 inventory in Notes" gets skipped** unless the Done-when checklist has a line item for it.
- **Demand one commit per task.** Pass 1 arrived as one 45-file blob; per-task diffs were unrecoverable and I had to review whole files.

### Current status (end of review pass 1)

`vite build` ✅ · `vitest` ✅ 3/3 · `tsc -b` ❌ (one pre-existing error in `Login.tsx`, filed as B-001)

Phase 1 + 2 built. **4 ACCEPTED** (T-101, T-102, T-107, T-201), **6 REVIEW-FAIL**, **24 bugs filed**, T-103 rewritten, T-207 added. The landing page is structurally right — `LandingPage.tsx` is 761→286 lines with four extracted sections, and T-204's care-path tablist is correct accessible work. What failed was copy honesty.

**Next for me:** re-review after the builder clears `BUGS.md` + T-103/T-105/T-207, then author **Phase 3** (starting T-301, `Login.tsx`, 890 lines).

### Design-system debt map (from `guard.mjs`, for phase planning)

The guard's per-rule tally is a decent proxy for how much visual-drift work each remaining surface carries:

| File | Guard errors | Note |
|---|---|---|
| `TalkMindlyTab.tsx` | 138 | worst offender — hard-coded dark theme |
| `OverviewTab.tsx` | 72 | |
| `Login.tsx` | 44 | Phase 3 |
| `CrisisPage.tsx` | 28 | |
| `ComingSoonModal.tsx` | 22 | |
| `UniversityPage.tsx` | 16 | |

Dominant rules are `off-system-palette` (166) and `raw-white` (147) — i.e. the legacy tree mostly predates the ramp. Run `cd frontend-student && node scripts/guard.mjs --all` for the current picture.

### `guard.mjs` — my review tooling

`frontend-student/scripts/guard.mjs`, zero deps. Every rule exists because the mistake was actually made once. Scope defaults to files changed vs HEAD; pass paths (files **or** directories) to narrow, `--all` for the whole tree. Errors exit 1, warnings exit 0, `// guard-ignore` opts a line out. Prints a per-rule + worst-file tally on failure.

Rules: `templated-class`, `phantom-z-utility`, `phantom-ink-950`, `micro-type`, `raw-hex`, `off-system-palette`, `raw-white`, `clickable-div`, `new-dependency` (errors); `outline-none-no-ring`, `animate-height`, `pulse-animation`, `emoji-glyph`, `icon-button-no-label`, `small-touch-target` (warnings).

**When a review finds a class of defect the guard missed, add the rule.** Pass 1 added five.

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
- `LandingPage.confirmBooking()` (L145) is **fake** - shows "Session booked with … · Thu 5:00pm" and calls no API. **Decision:** when landing is redesigned, route guests to `/login?redirect=...` (the real endpoint `/api/v1/students/sessions/book` is auth-only). Do not fake, do not gate the whole widget behind login yet.
- No-op CTAs: TalkMindly "Close & Contact Support"; AssessmentWizard's 2 CTAs; `OverviewTab` Mood Mosaic silently calling `onDailyCheckin(3)` (~L248); CrisisPage crisis-scroll.

**Flag - do NOT fabricate data to fill these:**
- `AssessmentsTab` Sleep/Social/Study bars (invented); `ReportDetailModal` 6 hardcoded breakdowns; `WellbeingChart` Jan–Jun empty axis; `HeroSection`/`Login` "Today's tone" + "Coach Vinayak · Thu 5pm" mock cards; `UniversityPage` fabricated jsPDF report; `FeedbackForm` 6-answers-in-one-string; 3 divergent readings of `/students/hotlines`.
- **11 pre-existing npm vulns (1 critical)** - left untouched, not introduced by this work.
- Build emits a chunk-size warning (entry >500 kB) - accepted for now; route-level `lazy()` already applied.

---

*Last updated: 2026-08-25. Round completed: Phase 1 + 2 built by the builder, review pass 1 filed (24 bugs). Next: builder clears `tasks/BUGS.md`, then I author Phase 3.*
