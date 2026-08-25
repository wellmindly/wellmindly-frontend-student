import type { ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AppSplash } from "./AppSplash";
import { Button } from "./ui";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) return <AppSplash label="Checking your session" />;

  if (!isAuthenticated || !user) {
    // Send them to login - not the landing page - and carry the intended
    // destination in `redirect`, which is the contract LoginRoute already reads.
    // `state.from` is kept for anything that prefers router state.
    const intended = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(intended)}`}
        state={{ from: location }}
        replace
      />
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Reached when a counselor/admin account signs in to the student app. The
    // old copy said "403 Forbidden … contact your administrator", which is
    // meaningless to the person actually reading it.
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-paper px-6 py-16 text-center">
        <span
          aria-hidden
          className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gold-100 text-gold-700"
        >
          <ShieldAlert className="h-8 w-8" />
        </span>

        <div className="measure-tight">
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            This is the student space
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            You're signed in as{" "}
            <span className="font-semibold text-ink-800">{user.role.toLowerCase()}</span>, so this
            area isn't available to your account. Sign out to switch to a student login.
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col-reverse gap-2 sm:w-auto sm:flex-row">
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to home
          </Button>
          <Button
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            Sign out
          </Button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
