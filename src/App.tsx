import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppSplash } from "./components/AppSplash";
import { ToastProvider } from "./components/ui";
import { useScrollTopOnChange } from "./lib/a11y";

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

/**
 * `/discover` is the guest-accessible quiz surface. A signed-in student belongs
 * in the dashboard's Discover tab instead, so we forward them - preserving the
 * `showResult` / `testId` contract that the gated-result flow depends on.
 */
function DiscoverRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    const params = new URLSearchParams(location.search);
    const showResult = params.get("showResult") || params.get("testId");
    const redirectUrl = showResult
      ? `/dashboard?tab=discover&showResult=${encodeURIComponent(showResult)}`
      : "/dashboard?tab=discover";
    return <Navigate to={redirectUrl} replace />;
  }
  return <DiscoverPage />;
}

/**
 * Every route change starts at the top of the new page. Without this, react-router
 * keeps the window's scroll offset across navigations, so following a footer link
 * lands you halfway down the next page. `useScrollTopOnChange` reads the
 * reduced-motion preference, so this is smooth for most people and instant for
 * anyone who asked for less movement.
 */
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
    const testIdParam = params.get("testId");
    if (redirectParam) {
      // `redirect` may already carry its own query (e.g. /dashboard?tab=talkmindly),
      // so append with the correct separator instead of assuming there is none.
      const target = testIdParam
        ? `${redirectParam}${redirectParam.includes("?") ? "&" : "?"}showResult=${encodeURIComponent(testIdParam)}`
        : redirectParam;
      return <Navigate to={target} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      {/* Respect the OS-level reduce-motion setting on every platform, native
          included - a Capacitor webview reports prefers-reduced-motion too.
          Every animation in the design system is transform/opacity only, so it
          composites on the GPU and stays smooth in the Android webview. */}
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <ScrollToTopOnNavigate />
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
        </ToastProvider>
      </MotionConfig>
    </AuthProvider>
  );
}

export default App;
