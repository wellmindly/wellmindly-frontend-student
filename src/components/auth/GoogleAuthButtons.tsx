import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { Capacitor } from "@capacitor/core";

export interface GoogleAuthButtonsProps {
  onWebSuccess: (response: CredentialResponse) => void;
  onWebError: () => void;
  onNativeClick: () => void;
  submitting: boolean;
  mode?: "login" | "register" | "forgot-password";
}

export function GoogleAuthButtons({
  onWebSuccess,
  onWebError,
  onNativeClick,
  submitting,
  mode = "login",
}: GoogleAuthButtonsProps) {
  if (mode === "forgot-password") return null;

  return (
    <>
      {/* Google Authentication */}
      {!Capacitor.isNativePlatform() && (
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={onWebSuccess}
            onError={onWebError}
            theme="outline"
            size="large"
            shape="pill"
            text={mode === "login" ? "signin_with" : "signup_with"}
            width="320"
          />
        </div>
      )}

      {/* Mobile Google Sign-In Button */}
      {Capacitor.isNativePlatform() && (
        <button
          type="button"
          onClick={onNativeClick}
          disabled={submitting}
          className="cursor-pointer w-full flex items-center justify-center gap-3 rounded-full border border-slate-300 bg-white py-2.5 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm mb-4"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.64 14.97 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.92-2.76 3.49-4.51 6.76-4.51z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.47h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.65 2.84c2.14-1.97 3.37-4.87 3.37-8.52z"
            />
            <path
              fill="#FBBC05"
              d="M5.24 14.55A7.12 7.12 0 0 1 4.8 12c0-.89.15-1.75.44-2.55L1.39 6.46A11.94 11.94 0 0 0 0 12c0 2.02.5 3.93 1.39 5.54l3.85-2.99z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.65-2.84c-1.01.67-2.31 1.09-3.96 1.09-3.27 0-5.84-1.75-6.76-4.51L1.74 16.8A11.93 11.93 0 0 0 12 23z"
            />
          </svg>
          Sign in with Google
        </button>
      )}

      {/* Divider */}
      {!Capacitor.isNativePlatform() && (
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Or connect with
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
      )}
    </>
  );
}
