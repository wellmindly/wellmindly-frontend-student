# CLAUDE.md - WellMindly Student Frontend

> **Audience: future session / team.** Working ledger for the student-frontend redesign. Read first. Contains mission, binding constraints, current status, file map, and lessons learned.

---

## 1. What this app is

`frontend-student` — student-facing SPA in the WellMindly monorepo.
- **Stack:** React 19 + Vite 8 + TypeScript + Tailwind v4 + Framer Motion. Router: react-router-dom 7. HTTP: axios (`services/api.ts`). Icons: lucide-react.
- **Platforms:** Web `:5173` (`npm run dev`) and Capacitor Android APK (`@capacitor/*` 8.x). Mobile is the primary target.
- **Backend:** Node/Express/Prisma/PostgreSQL at `:5000`. API base: `/api`. Auth: JWT in `localStorage` (`token`, `user`).
- **Feature flag:** `config.enableWriteMindly` gates WriteMindly. Monorepo sibling apps (university, auraflow, admin, counselor) are out of scope.

---

## 2. Mission & binding constraints

Rebuild the student experience into a modern, highly interactive, emotionally engaging Gen-Z student wellness product that feels like a real app. Core principle: every screen answers *"What can the student DO here?"*

**Binding constraints (verbatim from brief):**
- Do **not** break existing functionality while redesigning UI.
- Do **not** modify admin/counselor functionality unless absolutely necessary for shared components.
- **Inspect the existing implementation** before changing it — never assume from the filename. Understand data flow / API deps / state / routing / auth first.
- Do **not** replace working functionality with mock data. Do not remove API integrations because the UI is ugly. If a change needs backend data that already exists, use it. If it genuinely needs backend changes, **flag it — don't invent data.**
- Avoid unnecessary dependencies — check the existing UI kit / libs first.
- Production-quality code only. No throwaway prototypes, no static HTML mockups, no fake screenshots. The result is the actual working app.
- **No dark patterns.** Supportive, not addictive.
- Respect `prefers-reduced-motion`.
- Use the **UI/UX Pro Max skill** before design decisions.
- Test at **375, 390, 768, 1024, 1440, and large desktop.**
- You do NOT need approval for every design decision — use judgment.

---

## 3. Current status (Phase 10 — Cleanup & Release Readiness)

- **Gates:** `tsc -b` clean · `vitest` **18/18** in 3 files · `guard.mjs --all` **0 errors / 0 warnings** across 116 files (chain: `388 → 148 → 12 → 0`).
- **E2E:** `npx playwright test` **94 tests green** (90 responsive measurements across 8 public routes + 7 dashboard tabs over 6 viewports + 4 reduced-motion tests).
- **Bundle:** JS entry **521.31 kB / 168.10 kB gz** (chunk size warning expected — all bytes needed for first paint; no arbitrary `manualChunks` or raised limits). Dist images **146 kB** (down from 2.14 MB, 93.2% cut via WebP conversion and dead asset removal).
- **CSS:** Generated bundle 109.8 kB (17.8 kB gz). CSS warning resolved via `@source not "../CLAUDE.md";` in `src/index.css`.

---

## 4. File map & components

- **UI Kit (`src/components/ui/`):** Button, IconButton, Card, ActionCard, Badge, Chip, Avatar, Divider, Field, Input, Textarea, PasswordInput, Sheet, ConfirmSheet, Toast, Skeleton, EmptyState, ErrorState, Progress, SegmentedControl, Tabs, SkipLink.
- **Feature Modules (`src/components/`):** `auth/` (AuthBrandPanel, AuthForm, GoogleAuthButtons, AuthAlerts), `dashboard/` (DashboardLayout, overview/, report/, CheckinModal, DiscoverTab, TalkMindlyTab, WriteMindlyTab, AssessmentsTab), `booking/` (10 files: CounselorBookingView, CounselorCard, DateStrip, SlotGrid, BookingSummary, MySessionsList, modals, types), `discover/` (10 files: HubView, TestView, LikertMode, PairMode, PictureMode, ResultView, GatedResultView, CollectionView, FeedbackForm), `crisis/` (BreathingExercise, CountrySelect, HotlineCard, hotlines.ts), `university/` (UniversityOnboardingForm, UniversityBenefits, SampleReportSection).
- **Core Libs (`src/lib/`):** `cn.ts`, `motion.ts`, `a11y.ts` (`scrollToElement`, `useRovingKeys`), `format.ts`, `mood.ts` (single source of truth for 1–5 scale), `wellbeing.ts`.

---

## 5. Lessons learned & operational rules

- **A guard error can live in a field no consumer reads:** `mood.ts`'s 4 errors were in unrendered `MoodLevel.fill`. Measure consumers before modifying colours.
- **A tool's own remediation advice can be wrong:** Guard suggested `text-white` → `text-rose-50` on `bg-rose-500` (4.07:1 → 3.78:1, worse and failing WCAG AA).
- **A legacy alias that looks like a ramp step may not be one:** `text-sage` was `#E2F1E6` (1.02:1 on `bg-sage-100`, invisible icon); resolved to `text-sage-600` (5.51:1).
- **A normaliser that closes one case can leave the general case open:** `normalizeTab` mapped `phq9`, but `?tab=hotlines` rendered a blank `<main>`. Use whitelist matching.
- **A tool's blind spot is not evidence of absence:** `guard.mjs` missed bare `outline-none` (B-071); `deadexports.cjs` excluded `*.test.*` and reported test exports as dead.
- **`tsc`'s `noUnusedLocals` gives false confidence:** Unused exports are invisible to it; 53 accumulated across refactors.
- **A file extension can lie:** Three `.png` heroes were JPEGs at quality ~98; PNG optimisations did nothing until re-encoded to WebP.
- **`public/` ships whether imported or not:** 812 kB unreferenced hero was bundled in every build with zero tool warnings.
- **Gzip does not compress images:** 2.04 MB of pictures dwarfed 475 kB gzipped JS; bundle bloat was assets, not code.
- **Root markdown files are Tailwind sources:** Prose about arbitrary classes emits invalid CSS unless excluded via `@source not "../CLAUDE.md";`.
- **Student-facing absolutes can be contradicted by B2B pages:** "Never shared with your school" vs `/about` aggregate reporting required precise qualification ("No identifying data shared with your school").
- **`scrollIntoView({behavior:"smooth"})` overrides CSS:** Global `prefers-reduced-motion` CSS does not stop JS smooth scrolling; gate via `scrollToElement` in `a11y.ts`.
- **Never leave user-facing copy to builder judgment:** Supply exact sentences in cards or mandate `BLOCKED`.
- **`BUGS.md` is append-only:** Status vocabulary is strictly `OPEN · FIXED · VERIFIED · WONTFIX · BLOCKED`. Never invent status words.

---

*Last updated: 2026-08-28. Status: **Phase 10 (T-1001..T-1007, CHECKPOINT-10A) DONE**. Monorepo task cards and tracker in `../tasks/`.*

---

## Session Start Protocol ⚡

**MANDATORY** at start of each session:

```bash
# Load essential docs (~800 tokens - 2 min read)
✓ .claude/COMMON_MISTAKES.md      # ⚠️ CRITICAL - Read FIRST
✓ .claude/QUICK_START.md          # Essential commands
✓ .claude/ARCHITECTURE_MAP.md     # File locations
```

**At task completion:**
- Create completion doc in `.claude/completions/YYYY-MM-DD-task-name.md`
- Move session file to `.claude/sessions/archive/` (if created)

**⚠️ NEVER auto-load:**
- Files in `.claude/completions/` (0 token cost)
- Files in `.claude/sessions/` (0 token cost)
- Files in `docs/archive/` (0 token cost)

---

**Last Updated**: 2026-08-29
**Optimized with**: [Claude Token Optimizer](https://github.com/nadimtuhin/claude-token-optimizer)
