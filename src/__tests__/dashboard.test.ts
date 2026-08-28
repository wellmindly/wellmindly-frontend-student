import { describe, it, expect } from "vitest";
import { normalizeTab } from "../hooks/useDashboard";

describe("normalizeTab", () => {
  it("normalizes missing, shorthand, valid, and unknown dashboard tab parameters", () => {
    // Missing / empty
    expect(normalizeTab(null)).toBe("overview");
    expect(normalizeTab(undefined)).toBe("overview");
    expect(normalizeTab("")).toBe("overview");

    // Shorthand
    expect(normalizeTab("phq9")).toBe("discover");

    // Valid tabs
    expect(normalizeTab("overview")).toBe("overview");
    expect(normalizeTab("checkin")).toBe("checkin");
    expect(normalizeTab("assessments")).toBe("assessments");
    expect(normalizeTab("discover")).toBe("discover");
    expect(normalizeTab("writemindly")).toBe("writemindly");
    expect(normalizeTab("talkmindly")).toBe("talkmindly");
    expect(normalizeTab("sessionbooking")).toBe("sessionbooking");

    // Unknown tabs fallback to overview
    expect(normalizeTab("nonsense")).toBe("overview");
    expect(normalizeTab("hotlines")).toBe("overview");
    expect(normalizeTab("Overview")).toBe("overview");
  });
});
