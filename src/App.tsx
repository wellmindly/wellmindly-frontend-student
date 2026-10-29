import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppSplash } from "./components/AppSplash";
import { ToastProvider } from "./components/ui";
import { useScrollTopOnChange } from "./lib/a11y";
import { hideSplash } from "./lib/native";
import { AnalyticsTracker } from "./components/AnalyticsTracker";

/* ----------------------------------------------------------------------------
   Route-level code splitting.

   A cold visitor lands on `/`, so only the landing page stays in the entry
   chunk. Everything else - including login, which drags in the Google OAuth
   SDK, and the dashboard, which pulls the quiz engine, chat UI and booking flow
   - loads on demand. This is what the >500kB build warning was about.
-------------------------------------------------------------------------- */
import { LandingPage } from "./pages/LandingPage";

const LoginPage = lazy(() =>
  import("./pages/Login").then((m) => ({ default: m.LoginPage })),
);

const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const DiscoverPage = lazy(() =>
  import("./pages/DiscoverPage").then((m) => ({ default: m.DiscoverPage })),
);
const CrisisPage = lazy(() =>
  import("./pages/CrisisPage").then((m) => ({ default: m.CrisisPage })),
);
const AboutPage = lazy(() =>
  import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const ContactPage = lazy(() =>
  import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })),
);
const UniversityPage = lazy(() =>
  import("./pages/UniversityPage").then((m) => ({ default: m.UniversityPage })),
);
const CounselorsPage = lazy(() =>
  import("./pages/CounselorsPage").then((m) => ({ default: m.CounselorsPage })),
);
const PrivacyPage = lazy(() =>
  import("./pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })),
);
const TermsPage = lazy(() =>
  import("./pages/TermsPage").then((m) => ({ default: m.TermsPage })),
);
const DeleteAccountPage = lazy(() =>
  import("./pages/DeleteAccountPage").then((m) => ({ default: m.DeleteAccountPage })),
);
const VerifySubscriptionPage = lazy(() =>
  import("./pages/VerifySubscriptionPage").then((m) => ({ default: m.VerifySubscriptionPage })),
);

function DiscoverRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    const params = new URLSearchParams(location.search);
    const showResult = params.get("showResult") || params.get("testId");
    const tab = showResult === "checkin" ? "checkin" : "discover";
    const redirectUrl = showResult
      ? `/dashboard?tab=${tab}&showResult=${encodeURIComponent(showResult)}`
      : "/dashboard?tab=discover";
    return <Navigate to={redirectUrl} replace />;
  }
  return <DiscoverPage />;
}

function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();
  useScrollTopOnChange(pathname);
  return null;
}

function LoginRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AppSplash label="Signing you in" />;

  if (user) {
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get("redirect");
    const testIdParam = params.get("testId") || params.get("showResult");
    if (redirectParam) {
      const target = testIdParam && !redirectParam.includes("showResult=")
        ? `${redirectParam}${redirectParam.includes("?") ? "&" : "?"}showResult=${encodeURIComponent(testIdParam)}`
        : redirectParam;
      return <Navigate to={target} replace />;
    }
    if (testIdParam) {
      const tab = testIdParam === "checkin" ? "checkin" : "discover";
      return <Navigate to={`/dashboard?tab=${tab}&showResult=${encodeURIComponent(testIdParam)}`} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
}

function App() {
  useEffect(() => {
    hideSplash();
  }, []);

  return (
    <AuthProvider>
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <ErrorBoundary>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <ScrollToTopOnNavigate />
              <AnalyticsTracker />
              <Suspense fallback={<AppSplash />}>

                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginRoute />} />
                  <Route path="/discover" element={<DiscoverRoute />} />
                  <Route path="/crisis" element={<CrisisPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/university" element={<UniversityPage />} />
                  <Route path="/counselors" element={<CounselorsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/delete-account" element={<DeleteAccountPage />} />
                  <Route path="/verify-subscription" element={<VerifySubscriptionPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["STUDENT"]}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ErrorBoundary>
        </ToastProvider>
      </MotionConfig>
    </AuthProvider>
  );
}

export default App;
