/* ============================================================================
   The wellbeing check-in scale - single source of truth.
   ----------------------------------------------------------------------------
   WHAT THIS IS, AND WHAT IT IS NOT.

   The Discover instrument this bands is five questions on a 0-3 frequency
   scale, total 0-15. It was branded "PHQ-9 screening" and its output was
   labelled "clinical-grade", but it is neither:

     • The real PHQ-9 has NINE items and a max of 27. This asks five.
     • The four it omits include PHQ-9 item 9 - the suicidal-ideation item -
       so it has no risk-detection path at all.
     • Its bands were invented, not published, and they disagreed with the
       published PHQ-9 bands (0-4 / 5-9 / 10-14 / 15-19 / 20-27).

   A five-item subset with invented bands is not a validated instrument, and
   labelling its output "Severe Depression" is a diagnosis this product is not
   in a position to make. HubView and DiscoverPage already say the honest thing
   out loud - "a non-clinical self-reflection tool, not a medical or
   psychological assessment. It doesn't diagnose anything" - so the clinical
   framing was drift, and this module is where it stops.

   The band BOUNDARIES are unchanged (0-4 / 5-8 / 9-12 / 13-15). Both the old
   client ladder (useDashboard) and the old server ladder (quizzes.ts) already
   agreed on those cut points and only disagreed on the words, so no stored
   result moves band and no migration is needed. Only the labels change.

   THREE places used to hard-code this and all three now read from here:
     • hooks/useDashboard.ts        "Escalated Anxiety / Stress"
     • dashboard/ReportDetailModal  score > 12 / > 7 / > 4 thresholds
     • backend/src/routes/quizzes.ts  "Severe Depression" at >= 13

   The backend cannot import this file across the process boundary, so it keeps
   its own copy of the same table. If you change a boundary or a label here,
   change it there too - the comment in quizzes.ts points back at this file.
   ========================================================================= */

/** Five items x 0-3 frequency scale. */
export const WELLBEING_MAX_SCORE = 15;

/** The honest name. Not "PHQ-9", not "screening", not "clinical-grade". */
export const WELLBEING_TITLE = "Wellbeing check-in";

export type WellbeingBandId = "steady" | "patchy" | "demanding" | "heavy";

export interface WellbeingBand {
  id: WellbeingBandId;
  /** Inclusive bounds on the 0-15 total. */
  min: number;
  max: number;
  /** Shown to the student in place of the old diagnosis-shaped classification. */
  label: string;
  /** What to do about it. Describes the score; never names a condition. */
  support: string;
  /** Subset of `BadgeTone` - kept as a literal union so lib/ stays free of component imports. */
  tone: "sage" | "gold" | "coral" | "rose";
  /**
   * Top band only. Surfaces the existing `/crisis` route next to the result.
   * Before this, a student could be told "Severe Depression" and be offered
   * nothing - there was no crisis path wired to a score anywhere in the app.
   */
  showCrisisLink: boolean;
}

export const WELLBEING_BANDS: readonly WellbeingBand[] = [
  {
    id: "steady",
    min: 0,
    max: 4,
    label: "A steady couple of weeks",
    support:
      "Nothing in your answers stands out as heavy. Checking in now and then is how you notice a shift early.",
    tone: "sage",
    showCrisisLink: false,
  },
  {
    id: "patchy",
    min: 5,
    max: 8,
    label: "Some rough patches",
    support:
      "A few of these have been showing up for you. Worth keeping an eye on rather than worrying about.",
    tone: "gold",
    showCrisisLink: false,
  },
  {
    id: "demanding",
    min: 9,
    max: 12,
    label: "A demanding stretch",
    support:
      "Several of these have been with you most days. Talking it through with someone usually helps more than pushing on alone.",
    tone: "coral",
    showCrisisLink: false,
  },
  {
    id: "heavy",
    min: 13,
    max: WELLBEING_MAX_SCORE,
    label: "A heavy couple of weeks",
    support:
      "Most of these have been present nearly every day. That is a lot to carry on your own - a counselor can help, and support is available right now if you need it.",
    tone: "rose",
    showCrisisLink: true,
  },
];

/**
 * Band for a raw total. Clamps rather than throwing, the same way
 * `moodByRating` does: a score arriving from the API is not something the UI
 * gets to be surprised by, and rendering nothing is worse than rendering the
 * nearest band.
 */
export function bandFor(score: number): WellbeingBand {
  const s = Number.isFinite(score) ? score : 0;
  if (s <= WELLBEING_BANDS[0].max) return WELLBEING_BANDS[0];
  const hit = WELLBEING_BANDS.find((b) => s >= b.min && s <= b.max);
  return hit ?? WELLBEING_BANDS[WELLBEING_BANDS.length - 1];
}

/**
 * Band for a stored `classification` string, for rows written before the
 * rename. Falls back to the score. Historical rows hold "Minimal Stress",
 * "Mild Stress", "Moderate Stress", "Escalated Anxiety / Stress" or the
 * server's "… Depression" variants, and those students should still see a
 * coherent report rather than a mismatched one.
 */
export function bandForResult(score: number, classification?: string | null): WellbeingBand {
  const c = (classification ?? "").toLowerCase();
  if (c) {
    if (c.includes("severe") || c.includes("escalated")) return WELLBEING_BANDS[3];
    if (c.includes("moderate")) return WELLBEING_BANDS[2];
    if (c.includes("mild")) return WELLBEING_BANDS[1];
    if (c.includes("minimal")) return WELLBEING_BANDS[0];
    // A label already written by this module.
    const known = WELLBEING_BANDS.find((b) => b.label.toLowerCase() === c);
    if (known) return known;
  }
  return bandFor(score);
}

/**
 * True when a stored result came from this instrument.
 *
 * Report surfaces used to detect it with `title.includes("phq")`, which the
 * rename would have broken - "Wellbeing check-in" would have fallen through to
 * the generic check-in branch and relabelled a 0-3 *frequency* scale with
 * "Stable / Moderate / Needs Focus". The legacy titles stay in the match so
 * results stored before the rename keep rendering correctly.
 */
export function isWellbeingCheckin(quizTitle?: string | null): boolean {
  const t = (quizTitle ?? "").toLowerCase();
  if (!t) return false;
  return (
    t === WELLBEING_TITLE.toLowerCase() ||
    t.includes("wellbeing check-in") ||
    t.includes("phq") ||
    t.includes("screening")
  );
}

/**
 * The classification to *show* for a stored result.
 *
 * Replacing the band ladders was only half the job: five surfaces printed
 * `result.classification` raw, so any row written before this module existed
 * kept displaying its original string. That includes every row `prisma/seed.js`
 * creates - it stores "Minimal"/"Mild"/"Moderate"/"Moderately Severe"/"Severe"
 * against a quiz titled "PHQ-9" - so a seeded student's dashboard read
 * "Severe" on the home screen no matter what this file said.
 *
 * Non-wellbeing results pass through untouched: the other Discover tests store
 * their own meaningful strings ("Strongest: Curiosity", a mood label) and those
 * are not bands.
 */
export function displayClassification(
  quizTitle: string | null | undefined,
  classification: string | null | undefined,
  score: number,
): string {
  if (!isWellbeingCheckin(quizTitle)) return classification ?? "";
  return bandForResult(score, classification).label;
}

/**
 * Answer wording for the 0-3 frequency scale, given a 0-100 normalised
 * per-question value. Matches the scale in `TESTS.phq9.scale`.
 */
export function frequencyLabel(pct: number): string {
  if (pct >= 75) return "Nearly every day";
  if (pct >= 55) return "More than half the days";
  if (pct >= 35) return "Several days";
  return "Not at all";
}

/**
 * The title to *show* for a stored result.
 *
 * Results submitted before the rename are attached to a `Quiz` row titled
 * "PHQ-9 screening", and `POST /quizzes/submit` matches rows by title - so the
 * new title creates a new row and the old rows keep the old string forever.
 * Renaming them would be a write against live data; this fixes the claim at the
 * point of display instead, which needs no migration and covers every surface
 * that reads `quizTitle`.
 */
export function displayQuizTitle(quizTitle?: string | null): string {
  if (isWellbeingCheckin(quizTitle)) return WELLBEING_TITLE;
  return quizTitle ?? "";
}
