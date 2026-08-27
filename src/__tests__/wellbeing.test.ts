import { describe, it, expect } from "vitest";
import {
  WELLBEING_BANDS,
  WELLBEING_MAX_SCORE,
  WELLBEING_TITLE,
  bandFor,
  bandForResult,
  displayClassification,
  displayQuizTitle,
  isWellbeingCheckin,
} from "../lib/wellbeing";

/* This module is mirrored by hand in backend/src/lib/wellbeing.ts, because the
   two live in different processes and cannot share an import. That makes it the
   one file in this app where a silent edit on one side is invisible on the
   other, so the boundaries and the labels are pinned here. If a test below
   fails after an intentional change, change the backend copy too. */

describe("wellbeing band table", () => {
  it("covers 0..15 with no gap and no overlap", () => {
    expect(WELLBEING_BANDS[0].min).toBe(0);
    expect(WELLBEING_BANDS[WELLBEING_BANDS.length - 1].max).toBe(WELLBEING_MAX_SCORE);
    for (let i = 1; i < WELLBEING_BANDS.length; i++) {
      expect(WELLBEING_BANDS[i].min).toBe(WELLBEING_BANDS[i - 1].max + 1);
    }
  });

  it("keeps the pre-rename cut points, so no stored result moves band", () => {
    // 0-4 / 5-8 / 9-12 / 13-15 - the boundaries both the old client ladder and
    // the old server ladder already agreed on. This is what makes the rename a
    // zero-migration change.
    expect(WELLBEING_BANDS.map((b) => [b.min, b.max])).toEqual([
      [0, 4],
      [5, 8],
      [9, 12],
      [13, 15],
    ]);
  });

  it("names no condition and no severity in any label", () => {
    const banned = /depress|anxiet|severe|disorder|diagnos|clinical|symptom/i;
    for (const band of WELLBEING_BANDS) {
      expect(band.label).not.toMatch(banned);
      expect(band.support).not.toMatch(banned);
    }
  });

  it("offers a crisis path on the top band only", () => {
    expect(WELLBEING_BANDS.filter((b) => b.showCrisisLink).map((b) => b.id)).toEqual(["heavy"]);
  });
});

describe("bandFor", () => {
  it("maps each boundary to the expected band", () => {
    expect(bandFor(0).id).toBe("steady");
    expect(bandFor(4).id).toBe("steady");
    expect(bandFor(5).id).toBe("patchy");
    expect(bandFor(8).id).toBe("patchy");
    expect(bandFor(9).id).toBe("demanding");
    expect(bandFor(12).id).toBe("demanding");
    expect(bandFor(13).id).toBe("heavy");
    expect(bandFor(15).id).toBe("heavy");
  });

  it("clamps rather than throwing, the way moodByRating does", () => {
    expect(bandFor(-3).id).toBe("steady");
    expect(bandFor(99).id).toBe("heavy");
    expect(bandFor(NaN).id).toBe("steady");
  });
});

describe("bandForResult", () => {
  it("maps every legacy classification string a stored row can hold", () => {
    // Written by the old client ladder, the old server ladder, and prisma/seed.js.
    expect(bandForResult(0, "Severe Depression").id).toBe("heavy");
    expect(bandForResult(0, "Escalated Anxiety / Stress").id).toBe("heavy");
    expect(bandForResult(0, "Moderately Severe").id).toBe("heavy");
    expect(bandForResult(0, "Moderate Stress").id).toBe("demanding");
    expect(bandForResult(0, "Mild Stress").id).toBe("patchy");
    expect(bandForResult(15, "Minimal Stress").id).toBe("steady");
  });

  it("round-trips a label this module wrote", () => {
    for (const band of WELLBEING_BANDS) {
      expect(bandForResult(0, band.label).id).toBe(band.id);
    }
  });

  it("falls back to the score when the classification is absent or unknown", () => {
    expect(bandForResult(13, null).id).toBe("heavy");
    expect(bandForResult(2, "Completed").id).toBe("steady");
  });
});

describe("isWellbeingCheckin", () => {
  it("matches the new title and every legacy title still in the database", () => {
    expect(isWellbeingCheckin(WELLBEING_TITLE)).toBe(true);
    expect(isWellbeingCheckin("PHQ-9 screening")).toBe(true);
    expect(isWellbeingCheckin("PHQ-9")).toBe(true);
    expect(isWellbeingCheckin("Baseline Screening")).toBe(true);
  });

  it("does not swallow the other Discover instruments", () => {
    expect(isWellbeingCheckin("Signature Strengths")).toBe(false);
    expect(isWellbeingCheckin("Mood snapshot")).toBe(false);
    expect(isWellbeingCheckin("")).toBe(false);
    expect(isWellbeingCheckin(null)).toBe(false);
  });
});

describe("display helpers", () => {
  it("shows the honest title for legacy rows without touching the database", () => {
    expect(displayQuizTitle("PHQ-9 screening")).toBe(WELLBEING_TITLE);
    expect(displayQuizTitle("Core Values")).toBe("Core Values");
  });

  it("never prints a stored diagnosis", () => {
    expect(displayClassification("PHQ-9 screening", "Severe Depression", 14)).toBe(
      "A heavy couple of weeks",
    );
    expect(displayClassification("PHQ-9", "Moderately Severe", 20)).toBe(
      "A heavy couple of weeks",
    );
  });

  it("passes non-wellbeing results through untouched", () => {
    expect(displayClassification("Signature Strengths", "Strongest: Curiosity", 80)).toBe(
      "Strongest: Curiosity",
    );
  });
});
