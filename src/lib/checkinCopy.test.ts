import { describe, expect, it } from "vitest";
import { checkinCopy, emotionalLabelFor, emotionalPct } from "./checkinCopy";
import { displayClassification } from "./wellbeing";

// Per-dimension percentages as scoreProfile produces them (1-5 scale -> 0-100).
const pct = (v: number) => Math.round(((v - 1) / 4) * 100);
const emotional = (answers: number[]) => {
  const names = ["Good spirits", "Calm", "Energy", "Rested", "Engaged", "Connection"];
  const scores = Object.fromEntries(names.map((n, i) => [n, pct(answers[i])]));
  const total = answers.reduce((a, b) => a + b, 0);
  return { total, scores, copy: checkinCopy("Emotional check-in", total, scores)! };
};

describe("Emotional check-in copy", () => {
  it("mostly 'strongly disagree' (12/30) reads as a heavy stretch, never upbeat", () => {
    const { copy } = emotional([3, 2, 2, 2, 2, 1]);
    expect(copy.band).toBe("heavy");
    expect(copy.label).toBe("A heavy stretch");
    expect(copy.supportFirst).toBe(true);
    const all = [copy.headline, copy.narrative, copy.tip, ...copy.insights].join(" ").toLowerCase();
    expect(all).not.toMatch(/strongest|pretty good|sun is out|positive energy/);
    // The least-low dimension (Good spirits = 50%) must not be called a strength.
    expect(copy.insights.join(" ")).not.toMatch(/holding up best/);
  });

  it("all agree reads as steady", () => {
    const { copy } = emotional([5, 5, 4, 5, 5, 5]);
    expect(copy.band).toBe("steady");
    expect(copy.supportFirst).toBe(false);
  });

  it("tip targets the lowest dimension", () => {
    const { copy } = emotional([4, 4, 4, 1, 4, 4]);
    expect(copy.tip).toMatch(/lights-out/);
    expect(copy.insights.join(" ")).toMatch(/Rest is where things feel thinnest/);
  });

  it("band cut points", () => {
    expect(emotionalPct(6)).toBe(0);
    expect(emotionalPct(30)).toBe(100);
    expect(emotionalLabelFor(12)).toBe("A heavy stretch");
    expect(emotionalLabelFor(15)).toBe("Running a bit low");
    expect(emotionalLabelFor(20)).toBe("Mostly okay");
    expect(emotionalLabelFor(24)).toBe("Feeling steady");
  });

  it("old stored rows show the band, not 'Strongest: X'", () => {
    expect(displayClassification("Emotional check-in", "Strongest: Good spirits", 12)).toBe("A heavy stretch");
  });
});

describe("Wellbeing check-in copy", () => {
  it("high total (more hard days) is heavy and support-first", () => {
    const copy = checkinCopy("Wellbeing check-in", 14, { Interest: 100, Mood: 100, Sleep: 67, Energy: 100, Appetite: 100 })!;
    expect(copy.band).toBe("heavy");
    expect(copy.supportFirst).toBe(true);
  });
  it("low total is steady", () => {
    const copy = checkinCopy("Wellbeing check-in", 1, { Interest: 0, Mood: 0, Sleep: 33, Energy: 0, Appetite: 0 })!;
    expect(copy.band).toBe("steady");
  });
  it("other tests get no fixed copy", () => {
    expect(checkinCopy("Character strengths", 100, { Curiosity: 80 })).toBeNull();
  });
});
