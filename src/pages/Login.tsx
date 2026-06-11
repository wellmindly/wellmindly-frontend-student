import { useState, useEffect } from "react";
import { AlertCircle, X, Heart, Shield, Mail, Lock, Eye, EyeOff, Loader2, User } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { motion, AnimatePresence } from "framer-motion";
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import studentLoginPortrait from '../assets/student_login_portrait.png';

export function LoginPage() {
  const { loginSuccess, user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);
  
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Dynamic page title for SEO
  useEffect(() => {
    document.title = mode === 'login' ? "Sign In — WellMindly" : "Sign Up — WellMindly";
  }, [mode]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; firstName?: string; lastName?: string; otp?: string }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
            overallScore = Object.values(res.scores).reduce((a: any, b: any) => a + Number(b), 0) as number;
            maxScore = test.items ? test.items.length * 5 : 30;
          } else if (res.tone !== undefined) {
            overallScore = res.tone;
            maxScore = 100;
          }
          
          const classification = res.summary || res.label || 'Completed';
          
          await api.post("/quizzes/submit", {
            quizTitle: test.title,
            quizCategory: category,
            overallScore,
            maxScore,
            classification
          }, {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
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
      const res = await api.post('/auth/google/callback', {
        idToken: response.credential,
      });
      const { token, user } = res.data;
      loginSuccess(token, user);
      await syncGuestResults(token);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Google Authentication failed.";
      setGlobalError(errorMsg);
    }
  };

  const handleSendOtp = async () => {
    setGlobalError(null);
    const next: { email?: string; password?: string; firstName?: string; lastName?: string } = {};
    if (!firstName.trim()) next.firstName = "First name is required.";
    if (!lastName.trim()) next.lastName = "Last name is required.";
    
    const e = email.trim();
    if (!e) next.email = "Email is required.";
    else if (!EMAIL_RE.test(e)) next.email = "Enter a valid email address.";
    
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Password must be at least 8 characters.";
    
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await api.post("/auth/send-otp", { email });
      setOtpSent(true);
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

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setGlobalError(null);
    
    if (mode === 'register' && !otpSent) {
      await handleSendOtp();
      return;
    }

    if (!validate()) return;
    
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
      navigate('/dashboard');
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

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F7F9F7] font-sans overflow-hidden">
      
      {/* LEFT PANEL: Branding & Visuals (Hidden on small screens, full width on large) */}
      <div className="hidden lg:flex relative w-[45%] flex-col justify-center items-center p-12 overflow-hidden bg-transparent">
        
        {/* Header Logo */}
        <div 
          onClick={() => navigate("/")}
          className="absolute top-12 left-12 z-50 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-plum shadow-lg border border-line/50">
            <Heart className="h-7 w-7 fill-current" />
          </div>
          <span className="text-3xl font-black tracking-tight text-ink select-none">
            WellMindly
          </span>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="relative flex justify-center items-center w-full max-w-md mt-16"
        >
          {/* Soft background aura glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-sage-brand/10 to-coral/10 rounded-[2.5rem] blur-2xl opacity-60 pointer-events-none" />
          
          {/* Interactive Floating Card 1: Today's Tone */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
            className="absolute bottom-8 -left-6 bg-white/95 backdrop-blur-md border border-line rounded-2xl p-4 shadow-xl flex flex-col gap-1 max-w-[200px] z-20 pointer-events-auto"
          >
            <div className="text-[10px] text-ink-soft font-bold uppercase tracking-wider">Today's tone</div>
            <div className="text-sm font-serif font-semibold text-ink">Finding your footing</div>
            <div className="flex gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-teal" />
              <span className="w-2 h-2 rounded-full bg-gold" />
              <span className="w-2 h-2 rounded-full bg-rose opacity-40" />
              <span className="w-2 h-2 rounded-full bg-plum opacity-40" />
            </div>
          </motion.div>

          {/* Interactive Floating Card 2: Next Session with Coach */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
            className="absolute top-12 -right-4 bg-white/95 backdrop-blur-md border border-line rounded-2xl p-4 shadow-xl flex items-center gap-3 max-w-[220px] z-20 pointer-events-auto"
          >
            <div className="w-7 h-7 bg-coral/15 text-coral rounded-lg flex items-center justify-center font-bold text-xs shrink-0 select-none">
              TO
            </div>
            <div>
              <div className="text-[10px] text-ink-soft font-bold uppercase tracking-wider">Next Session</div>
              <div className="text-xs font-bold text-ink">Coach Tom &middot; Thu 5pm</div>
            </div>
          </motion.div>


          
          {/* Main image container */}
          <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-line bg-paper-2/40 shadow-2xl max-w-sm w-full aspect-[4/5] flex items-center justify-center">
            <img 
              src={studentLoginPortrait} 
              alt="Smiling, warm university student portrait" 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </motion.div>
      </div>

      {/* RIGHT PANEL: Login/Signup Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#F0F2F5] lg:bg-white relative">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div 
          onClick={() => navigate("/")}
          className="lg:hidden flex items-center gap-3 absolute top-8 left-8 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-plum text-white shadow-lg">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <span className="text-2xl font-black tracking-tight text-[#1B2433] select-none">
            WellMindly
          </span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white lg:bg-transparent rounded-3xl lg:rounded-none shadow-xl lg:shadow-none border border-slate-200/60 lg:border-none p-8 lg:p-0 relative"
        >
          {/* Error Alert */}
          <AnimatePresence>
            {globalError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -top-4 left-0 right-0 lg:static lg:mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-md z-20"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <span className="flex-1">{globalError}</span>
                <button
                  type="button"
                  onClick={() => setGlobalError(null)}
                  className="rounded-lg p-1 hover:bg-red-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-8 text-center lg:text-left mt-8 lg:mt-0">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3">
              {mode === 'login' ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-base text-slate-500 font-medium">
              {mode === 'login' 
                ? "Access your Wellmindly wellness dashboard." 
                : "Start tracking your mental well-being."}
            </p>
          </div>

          {/* Login Actions Card */}
          <div className="bg-slate-50 lg:bg-[#F8FAFC] p-8 rounded-3xl border border-slate-100/80">
            
            {/* Google Authentication */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setGlobalError("Google login widget failed to load.")}
                theme="outline"
                size="large"
                shape="pill"
                text={mode === 'login' ? "signin_with" : "signup_with"}
                width="320"
              />
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Or connect with
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              
              {/* Registration First/Last Name Inputs */}
              {mode === 'register' && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Field
                    id="firstName"
                    label="First Name"
                    icon={<User className="h-4.5 w-4.5" />}
                    error={errors.firstName}
                  >
                    <input
                      id="firstName"
                      type="text"
                      required
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName) setErrors((p) => ({ ...p, firstName: undefined }));
                        clearGlobal();
                      }}
                      className="w-full bg-transparent py-3 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </Field>

                  <Field
                    id="lastName"
                    label="Last Name"
                    icon={<User className="h-4.5 w-4.5" />}
                    error={errors.lastName}
                  >
                    <input
                      id="lastName"
                      type="text"
                      required
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (errors.lastName) setErrors((p) => ({ ...p, lastName: undefined }));
                        clearGlobal();
                      }}
                      className="w-full bg-transparent py-3 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </Field>
                </div>
              )}

              {/* Email Address Input */}
              <Field
                id="email"
                label="Student Email Address"
                icon={<Mail className="h-4.5 w-4.5" />}
                error={errors.email}
              >
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                    clearGlobal();
                  }}
                  className="w-full bg-transparent py-3 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </Field>

              {/* Password Input */}
              <Field
                id="password"
                label="Password"
                icon={<Lock className="h-4.5 w-4.5" />}
                error={errors.password}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                }
              >
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                    clearGlobal();
                  }}
                  className="w-full bg-transparent py-3 pl-11 pr-11 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </Field>

              {/* OTP Input (Shown only when registering and code has been sent) */}
              {mode === 'register' && otpSent && (
                <Field
                  id="otp"
                  label="Verification Code (6-digit OTP)"
                  icon={<Shield className="h-4.5 w-4.5" />}
                  error={errors.otp}
                >
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      if (errors.otp) setErrors((p) => ({ ...p, otp: undefined }));
                      clearGlobal();
                    }}
                    className="w-full bg-transparent py-3 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </Field>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="cursor-pointer mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-plum hover:bg-plum/90 py-3.5 text-sm font-extrabold text-white transition-all focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-plum/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  mode === 'login' 
                    ? "Sign In" 
                    : otpSent 
                      ? "Verify & Sign Up" 
                      : "Send Verification Code"
                )}
              </motion.button>
            </form>

            {/* Mode Switcher Link */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-400">
              <button
                type="button"
                onClick={toggleMode}
                className="transition-colors hover:text-slate-600 cursor-pointer border-none bg-transparent"
              >
                {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
              
              {mode === 'register' && otpSent && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={submitting}
                  className="transition-colors hover:text-slate-600 cursor-pointer border-none bg-transparent disabled:opacity-50"
                >
                  Resend Code
                </button>
              )}
              
              {mode === 'login' && (
                <a href="#" className="transition-colors hover:text-slate-600">
                  Forgot password?
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

interface FieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

function Field({
  id,
  label,
  icon,
  error,
  trailing,
  children,
}: FieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error 
    ? "rgb(239 68 68)" 
    : isFocused 
      ? "var(--color-plum)" 
      : "rgb(226, 232, 240)";

  const ringColor = error
    ? "rgb(239 68 68 / 0.15)"
    : "color-mix(in srgb, var(--color-plum) 12%, transparent)";

  return (
    <div className="w-full text-left">
      <label htmlFor={id} className="mb-2 block text-xs font-bold text-slate-500 tracking-wide uppercase">
        {label}
      </label>
      <div
        className="group relative rounded-2xl border transition-all duration-200"
        style={{ 
          borderColor, 
          boxShadow: isFocused || error ? `0 0 0 4px ${ringColor}` : "none",
          backgroundColor: isFocused ? "white" : "rgb(248, 250, 252)"
        }}
        onFocusCapture={() => setIsFocused(true)}
        onBlurCapture={() => setIsFocused(false)}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-slate-600 transition-colors">
          {icon}
        </div>
        {children}
        {trailing}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1 text-xs font-bold text-red-500"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </motion.p>
      )}
    </div>
  );
}
