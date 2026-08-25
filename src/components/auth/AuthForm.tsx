import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Shield, User, Loader2 } from "lucide-react";
import { Field } from "../../pages/Login";

export interface AuthFormProps {
  mode: "login" | "register" | "forgot-password";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  otp: string;
  otpSent: boolean;
  resetOtpSent: boolean;
  showPassword: boolean;
  errors: { email?: string; password?: string; firstName?: string; lastName?: string; otp?: string };
  submitting: boolean;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onOtpChange: (v: string) => void;
  onTogglePassword: () => void;
  onSubmit: (ev: FormEvent) => void;
  onSwitchMode: (mode: "login" | "register" | "forgot-password") => void;
  onSendOtp?: () => void;
  onSendResetOtp?: () => void;
}

export function AuthForm({
  mode,
  firstName,
  lastName,
  email,
  password,
  otp,
  otpSent,
  resetOtpSent,
  showPassword,
  errors,
  submitting,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  onOtpChange,
  onTogglePassword,
  onSubmit,
  onSwitchMode,
  onSendOtp,
  onSendResetOtp,
}: AuthFormProps) {
  return (
    <>
      {/* Email & Password Form */}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
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
                onChange={(e) => onFirstNameChange(e.target.value)}
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
                onChange={(e) => onLastNameChange(e.target.value)}
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
            placeholder="name@wellmindly.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full bg-transparent py-3 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </Field>

        {/* Password Input */}
        {(mode !== 'forgot-password' || resetOtpSent) && (
          <Field
            id="password"
            label={mode === 'forgot-password' ? "New Password" : "Password"}
            icon={<Lock className="h-4.5 w-4.5" />}
            error={errors.password}
            trailing={
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            }
          >
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === 'forgot-password' ? "new-password" : "current-password"}
              required
              placeholder={mode === 'forgot-password' ? "Enter new password" : "Enter your password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full bg-transparent py-3 pl-11 pr-11 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </Field>
        )}

        {/* OTP Input (Shown only when registering/resetting and code has been sent) */}
        {((mode === 'register' && otpSent) || (mode === 'forgot-password' && resetOtpSent)) && (
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
              onChange={(e) => onOtpChange(e.target.value)}
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
              Processing…
            </>
          ) : (
            mode === 'login' 
              ? "Sign In" 
              : mode === 'register'
                ? (otpSent ? "Verify & Sign Up" : "Send Verification Code")
                : (resetOtpSent ? "Reset Password" : "Send Reset Code")
          )}
        </motion.button>
      </form>

      {/* Mode Switcher Link */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-400">
        {mode === 'forgot-password' ? (
          <button
            type="button"
            onClick={() => onSwitchMode('login')}
            className="transition-colors hover:text-slate-600 cursor-pointer border-none bg-transparent"
          >
            Back to Sign In
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')}
            className="transition-colors hover:text-slate-600 cursor-pointer border-none bg-transparent"
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        )}
        
        {mode === 'register' && otpSent && (
          <button
            type="button"
            onClick={onSendOtp}
            disabled={submitting}
            className="transition-colors hover:text-slate-600 cursor-pointer border-none bg-transparent disabled:opacity-50"
          >
            Resend Code
          </button>
        )}

        {mode === 'forgot-password' && resetOtpSent && (
          <button
            type="button"
            onClick={onSendResetOtp}
            disabled={submitting}
            className="transition-colors hover:text-slate-600 cursor-pointer border-none bg-transparent disabled:opacity-50"
          >
            Resend Code
          </button>
        )}
        
        {mode === 'login' && (
          <button
            type="button"
            onClick={() => onSwitchMode('forgot-password')}
            className="transition-colors hover:text-slate-600 cursor-pointer border-none bg-transparent text-xs font-semibold text-slate-400"
          >
            Forgot password?
          </button>
        )}
      </div>
    </>
  );
}
