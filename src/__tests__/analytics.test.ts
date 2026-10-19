import { describe, it, expect, vi, beforeEach } from "vitest";
import { initAnalytics, trackPageView, trackEvent, setStudentContext } from "../lib/analytics";
import { config } from "../config";

describe("analytics module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete window.gtag;
    delete window.clarity;
    delete window.dataLayer;
  });

  it("handles missing configuration keys safely without crashing", () => {
    config.gaMeasurementId = "";
    config.clarityProjectId = "";

    expect(() => initAnalytics()).not.toThrow();
    expect(() => trackPageView("/test")).not.toThrow();
    expect(() => trackEvent("test_event", { foo: "bar" })).not.toThrow();
  });

  it("forwards pageviews to gtag and clarity when available", () => {
    config.gaMeasurementId = "G-TEST12345";
    config.clarityProjectId = "clarityTest123";

    const gtagMock = vi.fn();
    const clarityMock = vi.fn();
    window.gtag = gtagMock;
    window.clarity = clarityMock;

    trackPageView("/dashboard?tab=checkin", "Daily Check-in");

    expect(gtagMock).toHaveBeenCalledWith(
      "event",
      "page_view",
      expect.objectContaining({
        page_path: "/dashboard?tab=checkin",
        page_title: "Daily Check-in",
      })
    );
    expect(clarityMock).toHaveBeenCalledWith("set", "page", "/dashboard?tab=checkin");
  });

  it("sanitizes sensitive fields before dispatching events", () => {
    config.gaMeasurementId = "G-TEST12345";
    config.clarityProjectId = "clarityTest123";

    const gtagMock = vi.fn();
    const clarityMock = vi.fn();
    window.gtag = gtagMock;
    window.clarity = clarityMock;

    trackEvent("checkin_completed", {
      rating: 4,
      student_password: "secretpassword",
      journal_entry: "my private thoughts",
      auth_token: "jwt.secret.token",
      email: "student@university.edu",
    });

    expect(gtagMock).toHaveBeenCalledWith("event", "checkin_completed", {
      rating: 4,
      email: "...@university.edu",
    });
    expect(clarityMock).toHaveBeenCalledWith("event", "checkin_completed");
  });

  it("sets student context without leaking raw emails or PII", () => {
    config.gaMeasurementId = "G-TEST12345";
    config.clarityProjectId = "clarityTest123";

    const gtagMock = vi.fn();
    const clarityMock = vi.fn();
    window.gtag = gtagMock;
    window.clarity = clarityMock;

    setStudentContext({
      isUniversityStudent: true,
      role: "STUDENT",
      anonymousId: "std_12345678",
    });

    expect(clarityMock).toHaveBeenCalledWith("identify", "std_12345678");
    expect(gtagMock).toHaveBeenCalledWith("set", "user_properties", {
      is_uni_student: "yes",
      user_role: "STUDENT",
    });
  });
});
