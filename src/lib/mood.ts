/* ============================================================================
   The 1–5 mood scale - single source of truth.
   ----------------------------------------------------------------------------
   This used to live in three places that disagreed with each other:

     • DailyCheckinPopup.EMOJIS   rating 2 = amber→orange, rating 4 = blue→indigo
     • OverviewTab.moodConfig     rating 2 = green,        rating 4 = gold
     • useDashboard.checkinConfigs  emoji + affirmation copy only

   So a student could tap the amber "Down" face and watch it appear as a green
   tile in their own history. The colour language has to be stable for the mood
   mosaic to mean anything at all, so all three now read from here.

   The ramp runs rose → coral → gold → sage → teal: a real perceptual
   progression from tender to thriving. Plum is deliberately absent - it is the
   primary *action* colour, and reusing it as a mood value would make "Great"
   look like a button.

   Class names are spelled out in full rather than composed from a stem
   (`bg-${stem}-500`), because Tailwind extracts classes statically and would  guard-ignore
   never emit a templated name.

   Emoji glyphs in `affirmation.emoji` are supportive copy/warmth in check-in
   feedback messages (rendered beside affirmation titles with aria-hidden), not
   icon slots, and are exempted under the guard rule.
   ========================================================================= */

export type MoodRating = 1 | 2 | 3 | 4 | 5;

export interface MoodLevel {
  rating: MoodRating;
  /** Picker label. Short enough to sit under a 44px target on a 375px screen. */
  label: string;
  /** Used in history, tooltips and screen-reader text where "Okay" alone is thin. */
  summary: string;
  /** Solid swatch - mosaic tiles, legend dots, chart series. */
  dot: string;
  /**
   * Raw CSS colour for inline styles (mosaic tiles use per-tile box-shadows,
   * which can't be a utility class). Same hue as `dot`, as a `var()` reference
   * so it still tracks the ramp.
   */
  color: string;
  /** Tinted surface for cards and hover states. */
  soft: string;
  border: string;
  /** Text colour that clears 4.5:1 on `soft` and on white. */
  text: string;
  /**
   * Shown once, right after the student checks in. Copy is carried over
   * verbatim from the existing product - the rating-1 message names campus
   * resources, which is safety copy, not decoration.
   */
  affirmation: { emoji: string; title: string; message: string };
}

export const MOODS: readonly MoodLevel[] = [
  {
    rating: 1,
    label: "Awful",
    summary: "A really hard day",
    dot: "bg-rose-500",
    color: "var(--color-rose-500)",
    soft: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    affirmation: {
      emoji: "💜", // guard-ignore
      title: "Gentle Reminder",
      message:
        "It's okay to have tough days. Remember to take gentle breaths and reach out to campus resources or someone you trust.",
    },
  },
  {
    rating: 2,
    label: "Down",
    summary: "Heavier than usual",
    dot: "bg-coral-500",
    color: "var(--color-coral-500)",
    soft: "bg-coral-50",
    border: "border-coral-200",
    text: "text-coral-700",
    affirmation: {
      emoji: "🌿", // guard-ignore
      title: "Self-Care Moment",
      message:
        "Be gentle with yourself today. Taking a short break, walking in nature, or listening to a favorite song might help ease things.",
    },
  },
  {
    rating: 3,
    label: "Okay",
    summary: "Steady and balanced",
    dot: "bg-gold-400",
    color: "var(--color-gold-400)",
    soft: "bg-gold-50",
    border: "border-gold-200",
    text: "text-gold-800",
    affirmation: {
      emoji: "🌱", // guard-ignore
      title: "Steady & Balanced",
      message: "A steady, balanced day. Keep taking it one step at a time!",
    },
  },
  {
    rating: 4,
    label: "Good",
    summary: "A good day",
    dot: "bg-sage-500",
    color: "var(--color-sage-500)",
    soft: "bg-sage-50",
    border: "border-sage-200",
    text: "text-sage-700",
    affirmation: {
      emoji: "☀️", // guard-ignore
      title: "Bright Energy",
      message:
        "Keep riding this positive wave. Try sharing some of your good energy with a friend or colleague today.",
    },
  },
  {
    rating: 5,
    label: "Great",
    summary: "Thriving",
    dot: "bg-teal-500",
    color: "var(--color-teal-500)",
    soft: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    affirmation: {
      emoji: "🎉", // guard-ignore
      title: "Thriving & Strong",
      message:
        "Your light is shining bright today. Celebrate this moment and keep doing what makes you thrive!",
    },
  },
] as const;

/**
 * Look up a level by rating. The backend stores `rating` as a plain int, and
 * historical rows predate any validation, so clamp rather than trusting it -
 * the old `moodConfig[checkin.rating].color` threw on any out-of-range value.
 */
export function moodByRating(rating: number | null | undefined): MoodLevel {
  if (rating == null || !Number.isFinite(rating)) return MOODS[2];
  const i = Math.min(5, Math.max(1, Math.round(rating))) - 1;
  return MOODS[i];
}

/** Safe variant for rendering history, where a row may have no rating at all. */
export function moodByRatingOrNull(rating: number | null | undefined): MoodLevel | null {
  if (rating == null || !Number.isFinite(rating)) return null;
  return moodByRating(rating);
}
