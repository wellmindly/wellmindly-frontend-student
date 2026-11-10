import { useState, useEffect } from "react";
import type { CredentialResponse } from '@react-oauth/google';
import { motion } from "framer-motion";
import api, { apiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Logo, SkipLink } from '../components/ui';
import { AuthBrandPanel, AuthAlerts, GoogleAuthButtons, AuthForm } from '../components/auth';
import { config } from '../config';
import { trackEvent } from "../lib/analytics";

/** Resolve the ?redirect= param to a safe in-app path, appending showResult if present. */
function resolveRedirect(params: URLSearchParams, testIdParam: string | null): string {
  const raw = params.get("redirect");
  const resultParam = testIdParam || params.get("showResult") || params.get("testId");
  const fallback = resultParam
    ? `/dashboard?tab=${resultParam === "checkin" ? "checkin" : "discover"}&showResult=${encodeURIComponent(resultParam)}`
    : "/dashboard";
  const safe = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
  if (!resultParam) return safe;
  if (safe.includes("showResult=")) return safe;
  return `${safe}${safe.includes("?") ? "&" : "?"}showResult=${encodeURIComponent(resultParam)}`;
}

/**
 * Student-facing copy for the auth endpoints' failure modes. The server's own
 * text is used where it is already clear; the cases below get wording that says
 * what happened and what to do next.
 *  - 503: the code email could not be sent, so no code exists to wait for.
 *  - 429: the auth routes are rate-limited.
 *  - expired / locked / missing code: the student needs a fresh code (5 wrong
 *    attempts lock the current one), so point them at "Resend Code".
 */
function authErrorMessage(err: unknown, fallback: string): string {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 503) {
    return "We couldn't send the email right now. Please try again in a few minutes.";
  }
  if (status === 429) {
    return "Too many attempts. Please wait a few minutes, then try again.";
  }
  const message = apiErrorMessage(err, fallback);
  const lower = message.toLowerCase();
  if (lower.includes("too many incorrect attempts")) {
    return "That code was entered incorrectly too many times, so it no longer works. Tap \"Resend Code\" for a new one.";
  }
  if (lower.includes("code has expired")) {
    return "That code has expired. Tap \"Resend Code\" for a new one.";
  }
  if (lower.includes("request a verification code first")) {
    return "That code is no longer valid. Tap \"Resend Code\" for a new one.";
  }
  if (lower.includes("incorrect verification code")) {
    return "That code isn't right. Check the latest email from us and try again.";
  }
  return message;
}

/** The current code can never succeed (expired, locked or gone): clear the field. */
function isCodeSpent(err: unknown): boolean {
  const lower = apiErrorMessage(err, "").toLowerCase();
  return (
    lower.includes("too many incorrect attempts") ||
    lower.includes("code has expired") ||
    lower.includes("request a verification code first")
  );
}

export function LoginPage() {
  const { loginSuccess, user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Redirect to dashboard (or custom redirect path) if user is already authenticated
  useEffect(() => {
    if (user && !submitting) {
      const params = new URLSearchParams(window.location.search);
      const testIdParam = params.get("testId") || params.get("showResult");
      navigate(resolveRedirect(params, testIdParam), { replace: true });
    }
  }, [user, submitting, navigate]);
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [resetOtpSent, setResetOtpSent] = useState(false);

  // Dynamic page title for SEO
  useEffect(() => {
    document.title = mode === 'login' 
      ? "Sign In | WellMindly" 
      : mode === 'register' 
        ? "Sign Up | WellMindly" 
        : "Reset Password | WellMindly";
  }, [mode]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; firstName?: string; lastName?: string; otp?: string }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [failedAttempt, setFailedAttempt] = useState(0);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const navigateAfterAuth = () => {
    const params = new URLSearchParams(window.location.search);
    const testIdParam = params.get("testId") || params.get("showResult");
    if (params.has("redirect") || testIdParam) {
      navigate(resolveRedirect(params, testIdParam));
    } else {
      const pendingTest = sessionStorage.getItem("last_test_started");
      if (pendingTest === "checkin") {
        sessionStorage.removeItem("last_test_started");
        navigate("/dashboard?tab=checkin&showResult=checkin");
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    try {
      const res = await api.post('/auth/google/callback', { idToken: response.credential });
      const { token, user } = res.data;
      loginSuccess(token, user);
      trackEvent('login_completed', { method: 'google' });
      navigateAfterAuth();
    } catch (err) {
      const errorMsg = apiErrorMessage(err, "Google Authentication failed.");
      setGlobalError(errorMsg);
    }
  };

  const handleMobileGoogleLogin = async () => {
    try {
      setGlobalError(null);
      setSubmitting(true);
      const { SocialLogin } = await import('@capgo/capacitor-social-login');
      // Must be the *web* OAuth client ID: Credential Manager mints the ID
      // token for it, and the backend verifies that audience.
      await SocialLogin.initialize({
        google: { webClientId: config.googleClientId, mode: 'online' },
      });

      // No `scopes` option: on Android the plugin always requests
      // openid/email/profile itself, and passing *any* scopes array makes it
      // reject unless MainActivity implements
      // ModifiedMainActivityForSocialLoginPlugin. Those three are all we need.
      const login = await SocialLogin.login({ provider: 'google', options: {} });
      const idToken =
        login.provider === 'google' && login.result.responseType === 'online'
          ? login.result.idToken
          : null;
      if (idToken) {
        const res = await api.post('/auth/google/callback', { idToken });
        const { token, user } = res.data;
        loginSuccess(token, user);
        trackEvent('login_completed', { method: 'google' });
        navigateAfterAuth();
      } else {
        throw new Error("No ID Token returned from Google Sign-In.");
      }
    } catch (err: any) {
      console.error("Native Google Auth Error:", err);
      const backendError = apiErrorMessage(err, "");
      const errStr = `${err?.message || ''} ${err?.code || ''}`;
      if (errStr.includes('12501') || errStr.toLowerCase().includes('cancel')) {
        // User cancelled, do nothing
      } else if (backendError && backendError !== "Authentication failed. Please verify credentials.") {
        setGlobalError(backendError);
      } else {
        const codeSuffix = err?.code
          ? ` (code: ${err.code}${err?.message && !err.message.includes(err.code) ? ` - ${err.message}` : ''})`
          : (err?.message ? ` (${err.message})` : '');
        setGlobalError(`We couldn't sign you in with Google right now${codeSuffix}. Please try again, or use your email and password.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    setGlobalError(null);
    setGlobalSuccess(null);
    const isResend = otpSent;
    const next: { email?: string; password?: string; firstName?: string; lastName?: string } = {};
    if (!firstName.trim()) next.firstName = "First name is required.";
    if (!lastName.trim()) next.lastName = "Last name is required.";
    
    const e = email.trim();
    if (!e) next.email = "Email is required.";
    else if (!EMAIL_RE.test(e)) next.email = "Enter a valid email address.";
    
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Password must be at least 8 characters.";
    
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setFailedAttempt((n) => n + 1);
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/send-otp", { email });
      setOtpSent(true);
      setGlobalSuccess(
        isResend
          ? "A new code is on its way to " + email
          : "We've emailed a 6-digit code to " + email + ". It expires in 5 minutes.",
      );
    } catch (err) {
      setGlobalError(authErrorMessage(err, "Failed to send verification code. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const validate = () => {
    const next: { email?: string; password?: string; firstName?: string; lastName?: string; otp?: string } = {};
    if (mode === 'register') {
      if (!firstName.trim()) next.firstName = "First name is required.";
      if (!lastName.trim()) next.lastName = "Last name is required.";
      if (otpSent && !otp.trim()) next.otp = "Verification code is required.";
    }
    const e = email.trim();
    if (!e) next.email = "Email is required.";
    else if (!EMAIL_RE.test(e)) next.email = "Enter a valid email address.";
    
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Password must be at least 8 characters.";
    
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSendResetOtp = async () => {
    setGlobalError(null);
    setGlobalSuccess(null);
    const isResend = resetOtpSent;
    const next: { email?: string } = {};
    const e = email.trim();
    if (!e) next.email = "Email is required.";
    else if (!EMAIL_RE.test(e)) next.email = "Enter a valid email address.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      setFailedAttempt((n) => n + 1);
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setResetOtpSent(true);
      // The server answers the same way whether or not the account exists (no
      // account enumeration), so the copy has to be conditional too.
      setGlobalSuccess(
        isResend
          ? "If an account exists for " + email + ", a new code is on its way."
          : "If an account exists for " + email + ", we've emailed it a 6-digit code. Enter it below with your new password.",
      );
    } catch (err) {
      setGlobalError(authErrorMessage(err, "Failed to send reset code. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setGlobalError(null);
    const next: { email?: string; password?: string; otp?: string } = {};
    const e = email.trim();
    if (!e) next.email = "Email is required.";
    else if (!EMAIL_RE.test(e)) next.email = "Enter a valid email address.";
    
    if (!password) next.password = "New password is required.";
    else if (password.length < 8) next.password = "Password must be at least 8 characters.";
    
    if (!otp.trim()) next.otp = "Verification code is required.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      setFailedAttempt((n) => n + 1);
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { email, otp, newPassword: password, role: 'STUDENT' });
      setGlobalError(null);
      setGlobalSuccess("Password has been reset successfully! Please sign in with your new password.");
      setMode('login');
      setResetOtpSent(false);
      setOtp("");
      setPassword("");
    } catch (err) {
      if (isCodeSpent(err)) setOtp("");
      setGlobalError(authErrorMessage(err, "Failed to reset password. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setGlobalError(null);
    
    if (mode === 'forgot-password') {
      if (!resetOtpSent) {
        await handleSendResetOtp();
      } else {
        await handleResetPassword();
      }
      return;
    }

    if (mode === 'register' && !otpSent) {
      await handleSendOtp();
      return;
    }

    if (!validate()) {
      setFailedAttempt((n) => n + 1);
      return;
    }
    
    setSubmitting(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email, password, role: 'STUDENT' }
        : { email, password, firstName, lastName, otp };
        
      const response = await api.post(endpoint, payload);
      const { token, user } = response.data;
      loginSuccess(token, user);
      trackEvent(mode === 'login' ? 'login_completed' : 'registration_completed', { method: 'email' });
      navigateAfterAuth();
    } catch (err) {
      if (mode === 'register' && isCodeSpent(err)) setOtp("");
      setGlobalError(authErrorMessage(err, "Authentication failed. Please verify credentials."));
    } finally {
      setSubmitting(false);
    }
  };

  const clearGlobal = () => {
    if (globalError) setGlobalError(null);
    if (globalSuccess) setGlobalSuccess(null);
  };

  const handleSwitchMode = (targetMode: 'login' | 'register' | 'forgot-password') => {
    setMode(targetMode);
    setOtpSent(false);
    setResetOtpSent(false);
    setOtp("");
    setPassword("");
    setErrors({});
    setGlobalError(null);
    setGlobalSuccess(null);
  };

  return (
    <>
      <SkipLink />
      <main id="main-content" tabIndex={-1} className="min-h-screen w-full flex flex-col lg:flex-row bg-paper font-sans overflow-hidden">
        {/* LEFT PANEL: Branding & Visuals (Hidden on small screens, full width on large) */}
        <AuthBrandPanel />

      {/* RIGHT PANEL: Login/Signup Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 pt-[calc(var(--safe-area-top)+1.5rem)] sm:p-12 sm:pt-[calc(var(--safe-area-top)+3rem)] bg-paper-2 lg:bg-card relative">
        {/* Mobile header (small screens only). In normal flow, not absolute: the
            card is taller than a phone viewport, so an absolutely placed logo
            ended up hidden behind it - leaving no visible way home on mobile.
            The safe-area top padding keeps it clear of the edge-to-edge Android
            status bar. */}
        <div className="lg:hidden w-full max-w-md mb-4">
          <Logo size="sm" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card lg:bg-transparent rounded-3xl lg:rounded-none shadow-xl lg:shadow-none border border-line/60 lg:border-none p-8 lg:p-0 relative"
        >
          <AuthAlerts 
            error={globalError}
            success={globalSuccess}
            onClearError={() => setGlobalError(null)}
            onClearSuccess={() => setGlobalSuccess(null)}
          />

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-black tracking-tight text-ink-900 mb-3">
              {mode === 'login' 
                ? "Welcome back" 
                : mode === 'register' 
                  ? "Create your account" 
                  : "Reset your password"}
            </h1>
            <p className="text-base text-ink-500 font-medium">
              {mode === 'login' 
                ? "Access your Wellmindly student dashboard." 
                : mode === 'register'
                  ? "Start tracking your mental well-being."
                  : "We'll help you secure your account."}
            </p>
          </div>

          {/* Login Actions Card */}
          <div className="bg-paper p-5 sm:p-8 rounded-3xl border border-line-soft">
            <GoogleAuthButtons
              onWebSuccess={handleGoogleSuccess}
              onWebError={() => setGlobalError("Google login widget failed to load.")}
              onNativeClick={handleMobileGoogleLogin}
              submitting={submitting}
              mode={mode}
            />

            <AuthForm
              mode={mode}
              firstName={firstName}
              lastName={lastName}
              email={email}
              password={password}
              otp={otp}
              otpSent={otpSent}
              resetOtpSent={resetOtpSent}
              errors={errors}
              submitting={submitting}
              failedAttempt={failedAttempt}
              onFirstNameChange={(v) => { setFirstName(v); if (errors.firstName) setErrors((p) => ({ ...p, firstName: undefined })); clearGlobal(); }}
              onLastNameChange={(v) => { setLastName(v); if (errors.lastName) setErrors((p) => ({ ...p, lastName: undefined })); clearGlobal(); }}
              onEmailChange={(v) => { setEmail(v); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); if (otpSent) { setOtpSent(false); setOtp(""); } if (resetOtpSent) { setResetOtpSent(false); setOtp(""); } clearGlobal(); }}
              onPasswordChange={(v) => { setPassword(v); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); clearGlobal(); }}
              onOtpChange={(v) => { setOtp(v); if (errors.otp) setErrors((p) => ({ ...p, otp: undefined })); clearGlobal(); }}
              onSubmit={handleSubmit}
              onSwitchMode={handleSwitchMode}
              onSendOtp={handleSendOtp}
              onSendResetOtp={handleSendResetOtp}
            />
          </div>
        </motion.div>
      </div>
    </main>
    </>
  );
}
