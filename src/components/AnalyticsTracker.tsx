import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView, setStudentContext } from "../lib/analytics";
import { useAuth } from "../context/AuthContext";

/**
 * AnalyticsTracker
 * ----------------------------------------------------------------------------
 * Placed inside <BrowserRouter>, this component automatically listens to
 * SPA route and query changes, firing virtual pageviews for:
 * - Direct paths: `/`, `/login`, `/about`, `/crisis`, `/counselors`, etc.
 * - Dashboard tabs: `/dashboard?tab=checkin`, `/dashboard?tab=talkmindly`, etc.
 * - Test/result routes: `/discover?start=checkin`, etc.
 *
 * It also informs analytics when an authenticated university student logs in.
 */
export function AnalyticsTracker() {
  const location = useLocation();
  const { user } = useAuth();
  const lastPathRef = useRef<string | null>(null);

  // Sync user context anonymously when authentication changes
  useEffect(() => {
    if (user) {
      setStudentContext({
        isUniversityStudent: Boolean(user.universityId || user.universityVerified),
        role: user.role || "STUDENT",
        anonymousId: user.id ? `std_${user.id.slice(0, 8)}` : undefined,
      });
    }
  }, [user]);

  // Track virtual pageviews on pathname or query change
  useEffect(() => {
    const fullPath = location.pathname + location.search;

    if (fullPath !== lastPathRef.current) {
      lastPathRef.current = fullPath;

      // Small delay allows page document.title updates to finish
      const timer = window.setTimeout(() => {
        trackPageView(fullPath, document.title);
      }, 60);

      return () => window.clearTimeout(timer);
    }
  }, [location.pathname, location.search]);

  return null;
}
