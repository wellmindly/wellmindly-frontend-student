import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

const post = vi.fn();
vi.mock("../services/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { remainingPercent: 100 } }),
    post: (...args: unknown[]) => post(...args),
  },
  apiErrorMessage: (_e: unknown, fallback: string) => fallback,
}));
vi.mock("../lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("../lib/a11y", async (orig) => ({ ...(await orig<typeof import("../lib/a11y")>()), scrollToElement: vi.fn() }));

import { WriteMindlyTab } from "../components/dashboard/WriteMindlyTab";

// App Store Guideline 5.1.2(i): nothing is sent to the AI provider until the
// student has been told it is Google Gemini and has said yes.
describe("WriteMindly AI consent", () => {
  beforeEach(() => {
    localStorage.clear();
    post.mockReset();
    post.mockResolvedValue({ data: { response: "Hi there", remainingPercent: 90 } });
  });

  it("names Google Gemini and hides the message box until the student allows it", () => {
    render(<WriteMindlyTab />);
    expect(screen.getByText("Before you start")).toBeInTheDocument();
    expect(screen.getAllByText(/Google Gemini/).length).toBeGreaterThan(0);
    expect(screen.queryByLabelText("Your message")).not.toBeInTheDocument();
  });

  it("does not send anything when the student says not now", () => {
    render(<WriteMindlyTab />);
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(screen.getByText(/WriteMindly stays off until you allow it/)).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("remembers consent and then shows the message box", () => {
    render(<WriteMindlyTab />);
    fireEvent.click(screen.getByRole("button", { name: "Allow and continue" }));
    expect(localStorage.getItem("writemindlyAiConsent.v1")).toBe("granted");
    expect(screen.getByLabelText("Your message")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("skips the card for a student who already allowed it", () => {
    localStorage.setItem("writemindlyAiConsent.v1", "granted");
    render(<WriteMindlyTab />);
    expect(screen.queryByText("Before you start")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Your message")).toBeInTheDocument();
  });

  it("sends a starter tapped before consent only after the student allows it", async () => {
    render(<WriteMindlyTab />);
    fireEvent.click(screen.getByRole("button", { name: /Overwhelmed with coursework/ }));
    expect(post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Allow and continue" }));
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(
        "/chat/message",
        expect.objectContaining({ message: expect.stringContaining("assignments and deadlines") }),
      ),
    );
  });
});
