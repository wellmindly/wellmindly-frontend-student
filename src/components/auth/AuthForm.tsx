import type { FormEvent } from "react";
import { Mail, Lock, Shield, User } from "lucide-react";
import { Button, Input, PasswordInput } from "../ui";

export interface AuthFormProps {
  mode: "login" | "register" | "forgot-password";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  otp: string;
  otpSent: boolean;
  resetOtpSent: boolean;
  errors: { email?: string; password?: string; firstName?: string; lastName?: string; otp?: string };
  submitting: boolean;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onOtpChange: (v: string) => void;
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
  errors,
  submitting,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  onOtpChange,
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
            <Input
              label="First Name"
              type="text"
              autoComplete="given-name"
              required
              placeholder="Jane"
              icon={<User className="h-4.5 w-4.5" />}
              error={errors.firstName}
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              className="min-h-11"
              containerClassName="flex-1"
            />

            <Input
              label="Last Name"
              type="text"
              autoComplete="family-name"
              required
              placeholder="Doe"
              icon={<User className="h-4.5 w-4.5" />}
              error={errors.lastName}
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              className="min-h-11"
              containerClassName="flex-1"
            />
          </div>
        )}

        {/* Email Address Input */}
        <Input
          label="Student Email Address"
          type="email"
          autoComplete="email"
          required
          placeholder="name@wellmindly.com"
          icon={<Mail className="h-4.5 w-4.5" />}
          error={errors.email}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="min-h-11"
        />

        {/* Password Input */}
        {(mode !== 'forgot-password' || resetOtpSent) && (
          <PasswordInput
            label={mode === 'forgot-password' ? "New Password" : "Password"}
            autoComplete={mode === 'login' ? "current-password" : "new-password"}
            required
            placeholder={mode === 'forgot-password' ? "Enter new password" : "Enter your password"}
            icon={<Lock className="h-4.5 w-4.5" />}
            error={errors.password}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="min-h-11"
          />
        )}

        {/* OTP Input (Shown only when registering/resetting and code has been sent) */}
        {((mode === 'register' && otpSent) || (mode === 'forgot-password' && resetOtpSent)) && (
          <Input
            label="Verification Code (6-digit OTP)"
            type="text"
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            maxLength={6}
            placeholder="123456"
            icon={<Shield className="h-4.5 w-4.5" />}
            error={errors.otp}
            value={otp}
            onChange={(e) => onOtpChange(e.target.value)}
            className="min-h-11"
          />
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={submitting}
          loadingLabel="Working…"
          className="mt-6"
        >
          {mode === 'login' 
            ? "Sign In" 
            : mode === 'register'
              ? (otpSent ? "Verify & Sign Up" : "Send Verification Code")
              : (resetOtpSent ? "Reset Password" : "Send Reset Code")}
        </Button>
      </form>

      {/* Mode Switcher Link */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-ink-500">
        {mode === 'forgot-password' ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onSwitchMode('login')}
          >
            Back to Sign In
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </Button>
        )}
        
        {mode === 'register' && otpSent && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onSendOtp}
            disabled={submitting}
          >
            Resend Code
          </Button>
        )}

        {mode === 'forgot-password' && resetOtpSent && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onSendResetOtp}
            disabled={submitting}
          >
            Resend Code
          </Button>
        )}
        
        {mode === 'login' && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onSwitchMode('forgot-password')}
          >
            Forgot password?
          </Button>
        )}
      </div>
    </>
  );
}
