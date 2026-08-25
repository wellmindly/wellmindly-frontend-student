import { useState, useEffect } from "react";
import type { CredentialResponse } from '@react-oauth/google';
import { motion } from "framer-motion";
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/ui';
import { AuthBrandPanel, AuthAlerts, GoogleAuthButtons, AuthForm } from '../components/auth';

/** Resolve the ?redirect= param to a safe in-app path, appending showResult if present. */
function resolveRedirect(params: URLSearchParams, testIdParam: string | null): string {
  const raw = params.get("redirect");
  const safe = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
  if (!testIdParam) return safe;
  return `${safe}${safe.includes("?") ? "&" : "?"}showResult=${testIdParam}`;
}

export function LoginPage() {
  const { loginSuccess, user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard (or custom redirect path) if user is already authenticated
  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      const testIdParam = params.get("testId");
      navigate(resolveRedirect(params, testIdParam), { replace: true });
    }
  }, [user, navigate]);
  
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
  const [submitting, setSubmitting] = useState(false);
  const [failedAttempt, setFailedAttempt] = useState(0);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const syncGuestResults = async (authToken: string) => {
    try {
      const STORAGE_KEY = "wm-discover";
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const { TESTS } = await import("../components/discover/types");
      
      for (const [quizId, results] of Object.entries(parsed)) {
        const test = TESTS[quizId];
        if (!test) continue;
        const category = test.tag?.split(" · ")[0] || "General";
        
        for (const res of (results as any[])) {
          let overallScore = 100;
          let maxScore = 100;
          
          if (test.kind === 'profile' && !test.archetype && res.scores) {
            let minPoints = 1;
            let maxPoints = 5;
            if (test.scale && test.scale.length > 0) {
              const vals = test.scale.map((x: any) => x[1]);
              minPoints = Math.min(...vals);
              maxPoints = Math.max(...vals);
            }
            const range = maxPoints - minPoints || 1;
            overallScore = Object.values(res.scores as Record<string, unknown>).reduce<number>((sum, p) => {
              const rating = Math.round(Number(p) / 100 * range) + minPoints;
              return sum + rating;
            }, 0);
            maxScore = test.items ? test.items.length * maxPoints : 30;
          } else if (res.tone !== undefined) {
            overallScore = res.tone;
            maxScore = 100;
          }
          
          const classification = res.summary || res.label || 'Completed';
          const answers: any = {};
          if (res.scores) answers.scores = res.scores;
          if (res.top) answers.top = res.top;
          if (res.tone !== undefined) answers.tone = res.tone;
          if (res.label) answers.label = res.label;
          answers.summary = classification;
          
          await api.post("/quizzes/submit", {
            quizTitle: test.title,
            quizCategory: category,
            overallScore,
            maxScore,
            classification,
            answers
          }, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
        }
      }
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to sync guest results with backend:", err);
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    try {
      const res = await api.post('/auth/google/callback', { idToken: response.credential });
      const { token, user } = res.data;
      loginSuccess(token, user);
      await syncGuestResults(token);
      
      const params = new URLSearchParams(window.location.search);
      const testIdParam = params.get("testId");
      if (params.has("redirect")) {
        navigate(resolveRedirect(params, testIdParam));
      } else {
        const pendingTest = sessionStorage.getItem("last_test_started");
        if (pendingTest === "checkin") {
          sessionStorage.removeItem("last_test_started");
          navigate("/dashboard?tab=checkin");
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const errorMsg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Google Authentication failed.";
      setGlobalError(errorMsg);
    }
  };

  const handleMobileGoogleLogin = async () => {
    try {
      setGlobalError(null);
      setSubmitting(true);
      const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
      await GoogleAuth.initialize({
        clientId: '942167444638-jcpvjkm9j14lqj29lvn3gbcnju4nf5pt.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });

      const googleUser = await GoogleAuth.signIn();
      if (googleUser && googleUser.authentication.idToken) {
        const res = await api.post('/auth/google/callback', { idToken: googleUser.authentication.idToken });
        const { token, user } = res.data;
        loginSuccess(token, user);
        await syncGuestResults(token);
        
        const params = new URLSearchParams(window.location.search);
        const testIdParam = params.get("testId");
        if (params.has("redirect")) {
          navigate(resolveRedirect(params, testIdParam));
        } else {
          const pendingTest = sessionStorage.getItem("last_test_started");
          if (pendingTest === "checkin") {
            sessionStorage.removeItem("last_test_started");
            navigate("/dashboard?tab=checkin");
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        throw new Error("No ID Token returned from Google Sign-In.");
      }
    } catch (err: any) {
      console.error("Native Google Auth Error:", err);
      const errStr = `${err.message || ''} ${err.code || ''}`;
      if (errStr.includes('12501') || errStr.toLowerCase().includes('cancel')) {
        // User cancelled, do nothing
      } else if (errStr.includes('10')) {
        setGlobalError("Google Sign-In Developer Error (10): Ensure Web Client ID is used in configs, and Android Client ID (com.wellmindly.app + SHA-1) is registered in the SAME Google project.");
      } else if (errStr.includes('12500')) {
        setGlobalError("Google Sign-In Failed (12500): Check if package name or SHA-1 fingerprint matches your keystore, or verify Google Play Services account state.");
      } else {
        const errorMsg = err.message || "Google Authentication failed.";
        setGlobalError(`${errorMsg} (Code: ${err.code || 'unknown'})`);
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
      if (isResend) {
        setGlobalSuccess("A new code is on its way to " + email);
      }
    } catch (err) {
      const errorMsg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to send verification code. Please try again.";
      setGlobalError(errorMsg);
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
      if (isResend) {
        setGlobalSuccess("A new code is on its way to " + email);
      }
    } catch (err) {
      const errorMsg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to send reset code. Please try again.";
      setGlobalError(errorMsg);
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
      const errorMsg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to reset password. Please try again.";
      setGlobalError(errorMsg);
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
      await syncGuestResults(token);
      
      const params = new URLSearchParams(window.location.search);
      const testIdParam = params.get("testId");
      if (params.has("redirect")) {
        navigate(resolveRedirect(params, testIdParam));
      } else {
        const pendingTest = sessionStorage.getItem("last_test_started");
        if (pendingTest === "checkin") {
          sessionStorage.removeItem("last_test_started");
          navigate("/dashboard?tab=checkin");
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const errorMsg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Authentication failed. Please verify credentials.";
      setGlobalError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const clearGlobal = () => globalError && setGlobalError(null);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setOtpSent(false);
    setOtp("");
    setErrors({});
    setGlobalError(null);
  };

  const handleSwitchMode = (targetMode: 'login' | 'register' | 'forgot-password') => {
    setMode(targetMode);
    setOtpSent(false);
    setResetOtpSent(false);
    setOtp("");
    setPassword("");
    setErrors({});
    setGlobalError(null);
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-paper font-sans overflow-hidden">
      {/* LEFT PANEL: Branding & Visuals (Hidden on small screens, full width on large) */}
      <AuthBrandPanel />

      {/* RIGHT PANEL: Login/Signup Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-paper-2 lg:bg-card relative">
        {/* Mobile Header (Only visible on small screens) */}
        <Logo size="sm" className="lg:hidden absolute top-8 left-8" />

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

          <div className="mb-8 text-center lg:text-left mt-8 lg:mt-0">
            <h1 className="text-3xl font-black tracking-tight text-ink-900 mb-3">
              {mode === 'login' 
                ? "Welcome back" 
                : mode === 'register' 
                  ? "Create your account" 
                  : "Reset your password"}
            </h1>
            <p className="text-base text-ink-500 font-medium">
              {mode === 'login' 
                ? "Access your Wellmindly wellness dashboard." 
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
              onEmailChange={(v) => { setEmail(v); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); clearGlobal(); }}
              onPasswordChange={(v) => { setPassword(v); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); clearGlobal(); }}
              onOtpChange={(v) => { setOtp(v); if (errors.otp) setErrors((p) => ({ ...p, otp: undefined })); clearGlobal(); }}
              onSubmit={handleSubmit}
              onSwitchMode={(target) => (target === 'forgot-password' || target === 'login') ? handleSwitchMode(target) : toggleMode()}
              onSendOtp={handleSendOtp}
              onSendResetOtp={handleSendResetOtp}
            />
          </div>
        </motion.div>
      </div>
    </main>
  );
}
