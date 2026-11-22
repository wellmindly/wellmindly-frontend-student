/* ============================================================================
   Fixed result copy for the two check-ins (Emotional check-in, Wellbeing
   check-in).

   Before this, the headline, message and tip were written by Gemini from a
   classification like "Strongest: Good spirits", the dimension that happened
   to rank highest *relative to the others*. A student who answered "strongly
   disagree" to almost everything (12 / 30) was told "Good spirits strongest"
   and "you're feeling pretty good right now, like the sun is out".

   Now the total decides a band, the band decides the headline, message and
   tone, and the student's own dimensions decide the tip. Nothing here can
   contradict the score. Gemini may still add one personal observation (see
   backend/src/utils/ai.ts), but it is told the band and never writes the
   headline. Mirrored in backend/src/utils/checkinBands.ts - keep cut points in
   sync.
   ========================================================================= */

import { bandFor, isWellbeingCheckin } from "./wellbeing";

export const EMOTIONAL_CHECKIN_TITLE = "Emotional check-in";

export type CheckinBandId = "steady" | "okay" | "low" | "heavy";

export interface CheckinCopy {
  band: CheckinBandId;
  /** Short label stored as the classification and shown in history. */
  label: string;
  headline: string;
  narrative: string;
  tip: string;
  /** Deterministic observations built from the student's own dimensions. */
  insights: string[];
  /** Lowest band: lead with support (book / TalkMindly) and show helplines. */
  supportFirst: boolean;
}

export function isEmotionalCheckin(title?: string | null): boolean {
  return (title ?? "").trim().toLowerCase() === EMOTIONAL_CHECKIN_TITLE.toLowerCase();
}

export function isCheckin(title?: string | null): boolean {
  return isEmotionalCheckin(title) || isWellbeingCheckin(title);
}

/* ── Emotional check-in: six items, 1-5 agree scale, higher is better ─────── */

const EMOTIONAL_BANDS: { id: CheckinBandId; minPct: number; label: string; headline: string; narrative: string }[] = [
  {
    id: "steady",
    minPct: 70,
    label: "Feeling steady",
    headline: "You're in a pretty good place right now.",
    narrative:
      "Most of your answers point to a steady couple of weeks: some calm, some energy, people around you. Worth noticing what's helping, so you can come back to it when things get busier.",
  },
  {
    id: "okay",
    minPct: 50,
    label: "Mostly okay",
    headline: "Mostly okay, with a few dips.",
    narrative:
      "Some parts of the last two weeks felt fine and some felt like effort. That mix is really common. Keep an eye on the parts that dipped before they pile up.",
  },
  {
    id: "low",
    minPct: 30,
    label: "Running a bit low",
    headline: "Things have felt a bit flat lately.",
    narrative:
      "Your answers say the last two weeks have taken more out of you than they gave back. That's not a verdict on you. It's a sign to go easier on yourself and lean on someone.",
  },
  {
    id: "heavy",
    minPct: 0,
    label: "A heavy stretch",
    headline: "It sounds like a heavy couple of weeks.",
    narrative:
      "Most of your answers came in low. That's a lot to carry, and you don't have to sort it out on your own. Talking it through with someone usually makes it feel a little lighter.",
  },
];

/** What to try when a dimension is the one that dipped most. */
const EMOTIONAL_TIPS: Record<string, string> = {
  "Good spirits": "Text one person who usually makes you laugh. No reason needed.",
  Calm: "Try one slow breath tonight: in for 4, hold for 7, out for 8. Once is enough.",
  Energy: "Get ten minutes outside today, phone in your pocket.",
  Rested: "Pick a lights-out time for tonight and leave your phone across the room.",
  Engaged: "Do one small thing just because you like it, even for fifteen minutes.",
  Connection: "Reply to the message you've been sitting on, or ask someone to grab food.",
};

const EMOTIONAL_NAMES: Record<string, string> = {
  "Good spirits": "your mood",
  Calm: "feeling calm",
  Energy: "your energy",
  Rested: "rest",
  Engaged: "feeling interested in things",
  Connection: "feeling connected",
};

/** Percent (0-100) of the possible range for a six-item, 1-5 instrument. */
export function emotionalPct(total: number, itemCount = 6): number {
  const min = itemCount, max = itemCount * 5;
  return Math.round(Math.max(0, Math.min(1, (total - min) / (max - min))) * 100);
}

export function emotionalBand(total: number, itemCount = 6) {
  const pct = emotionalPct(total, itemCount);
  return EMOTIONAL_BANDS.find((b) => pct >= b.minPct) ?? EMOTIONAL_BANDS[EMOTIONAL_BANDS.length - 1];
}

function rank(scores: Record<string, number>): [string, number][] {
  return Object.entries(scores).sort((a, b) => b[1] - a[1]);
}

function emotionalCopy(total: number, scores: Record<string, number>): CheckinCopy {
  const band = emotionalBand(total, Object.keys(scores).length || 6);
  const ranked = rank(scores);
  const [topName, topVal] = ranked[0] ?? ["", 0];
  const [lowName, lowVal] = ranked[ranked.length - 1] ?? ["", 0];

  const insights: string[] = [];
  // Only call something a strength if it actually is one, not just the least
  // low of six low answers.
  if (topName && topVal >= 60) {
    insights.push(`${cap(EMOTIONAL_NAMES[topName] ?? topName)} is holding up best for you right now.`);
  }
  if (lowName && lowName !== topName && lowVal < 50) {
    insights.push(`${cap(EMOTIONAL_NAMES[lowName] ?? lowName)} is where things feel thinnest.`);
  }
  if (!insights.length && band.id === "heavy") {
    insights.push("Nothing stood out as easy these last two weeks, and that's tiring in itself.");
  }

  const tip =
    band.id === "steady" && (!lowName || lowVal >= 60)
      ? "Write down one thing that's been working for you lately. Future you will want the list."
      : EMOTIONAL_TIPS[lowName] ?? "Pick one small, kind thing to do for yourself today.";

  return {
    band: band.id,
    label: band.label,
    headline: band.headline,
    narrative: band.narrative,
    tip,
    insights,
    supportFirst: band.id === "heavy",
  };
}

/* ── Wellbeing check-in: five items, 0-3 frequency, higher is harder ─────── */

const WELLBEING_TIPS: Record<string, string> = {
  Interest: "Do one small thing you used to enjoy, even if you don't feel like it yet. Ten minutes counts.",
  Mood: "Tell one person you trust that it's been a rough couple of weeks. You don't have to explain it all.",
  Sleep: "Keep the same wake-up time for the next three days, even after a bad night.",
  Energy: "Get some daylight and a glass of water before you reach for your phone tomorrow.",
  Appetite: "Aim for three regular meals today, even small ones. Your body runs on routine.",
};

const WELLBEING_NAMES: Record<string, string> = {
  Interest: "losing interest in things",
  Mood: "feeling down",
  Sleep: "sleep",
  Energy: "low energy",
  Appetite: "appetite",
};

const WELLBEING_HEADLINES: Record<string, string> = {
  steady: "A steady couple of weeks.",
  patchy: "Some rough patches lately.",
  demanding: "It's been a demanding stretch.",
  heavy: "It sounds like a heavy couple of weeks.",
};

function wellbeingCopy(total: number, scores: Record<string, number>): CheckinCopy {
  const band = bandFor(total);
  const ranked = rank(scores);
  const [worstName, worstVal] = ranked[0] ?? ["", 0];
  const insights: string[] = [];
  if (worstName && worstVal >= 34) {
    insights.push(`${cap(WELLBEING_NAMES[worstName] ?? worstName)} has been showing up the most for you.`);
  }
  const map: Record<string, CheckinBandId> = { steady: "steady", patchy: "okay", demanding: "low", heavy: "heavy" };
  return {
    band: map[band.id],
    label: band.label,
    headline: WELLBEING_HEADLINES[band.id],
    narrative: band.support,
    tip:
      band.id === "steady" || !worstName || worstVal < 34
        ? "Check in again in a couple of weeks. Spotting a shift early is the whole point."
        : WELLBEING_TIPS[worstName] ?? "Pick one small, kind thing to do for yourself today.",
    insights,
    supportFirst: band.id === "heavy",
  };
}

/**
 * Fixed copy for a check-in result, or null for any other test.
 * `scores` are per-dimension percentages (0-100) from scoreProfile.
 */
export function checkinCopy(title: string, total: number, scores: Record<string, number>): CheckinCopy | null {
  if (isEmotionalCheckin(title)) return emotionalCopy(total, scores);
  if (isWellbeingCheckin(title)) return wellbeingCopy(total, scores);
  return null;
}

/** Band label for a stored Emotional check-in row (old rows say "Strongest: X"). */
export function emotionalLabelFor(total: number): string {
  return emotionalBand(total).label;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Word for one Emotional check-in dimension (0-100, higher is better). The
 * generic Discover ramp ("a real strength" ... "room to grow") reads like a
 * personality test; this one describes how a part of your week felt.
 */
export function checkinDimWord(v: number): string {
  return v >= 75 ? "Going well" : v >= 50 ? "Okay" : v >= 25 ? "A bit low" : "Low";
}
