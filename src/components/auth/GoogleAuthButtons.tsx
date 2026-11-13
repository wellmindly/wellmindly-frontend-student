import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { Capacitor } from "@capacitor/core";
import { Button } from "../ui";

export interface GoogleAuthButtonsProps {
  onWebSuccess: (response: CredentialResponse) => void;
  onWebError: () => void;
  onNativeClick: () => void;
  /** iOS only. Omit to hide the Apple button. */
  onAppleClick?: () => void;
  submitting: boolean;
  mode?: "login" | "register" | "forgot-password";
}

export function GoogleAuthButtons({
  onWebSuccess,
  onWebError,
  onNativeClick,
  onAppleClick,
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
          />
        </div>
      )}

      {/* Mobile Google Sign-In Button */}
      {Capacitor.isNativePlatform() && (
        <Button
          variant="outline"
          size="md"
          fullWidth
          type="button"
          onClick={onNativeClick}
          disabled={submitting}
          leadingIcon={
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              {/* Google's brand hexes are fixed by their sign-in branding guidelines — not ours to tokenise. */}
              <path
                fill="#EA4335" // guard-ignore
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.64 14.97 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.92-2.76 3.49-4.51 6.76-4.51z"
              />
              <path
                fill="#4285F4" // guard-ignore
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.47h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.65 2.84c2.14-1.97 3.37-4.87 3.37-8.52z"
              />
              <path
                fill="#FBBC05" // guard-ignore
                d="M5.24 14.55A7.12 7.12 0 0 1 4.8 12c0-.89.15-1.75.44-2.55L1.39 6.46A11.94 11.94 0 0 0 0 12c0 2.02.5 3.93 1.39 5.54l3.85-2.99z"
              />
              <path
                fill="#34A853" // guard-ignore
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.65-2.84c-1.01.67-2.31 1.09-3.96 1.09-3.27 0-5.84-1.75-6.76-4.51L1.74 16.8A11.93 11.93 0 0 0 12 23z"
              />
            </svg>
          }
        >
          Sign in with Google
        </Button>
      )}

      {/* Sign in with Apple: iOS app only (App Store guideline 4.8). Apple's
          button style is fixed by their HIG: black fill, white logo and text. */}
      {Capacitor.getPlatform() === "ios" && onAppleClick && (
        <button
          type="button"
          onClick={onAppleClick}
          disabled={submitting}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" // guard-ignore
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
            <path d="M16.37 1.43c0 1.14-.46 2.22-1.2 3-.8.85-2.1 1.5-3.15 1.42-.13-1.1.42-2.25 1.15-3 .82-.85 2.2-1.5 3.2-1.42zM20.5 17.1c-.55 1.27-.82 1.84-1.52 2.96-.98 1.57-2.37 3.52-4.09 3.54-1.53.02-1.92-1-4-.99-2.08.01-2.51 1.01-4.04.99-1.72-.02-3.03-1.79-4.01-3.36C-.06 16.2-.35 10.9 1.9 8.1c1.6-1.97 3.67-3.12 5.7-3.12 2.07 0 3.37 1.13 5.08 1.13 1.66 0 2.67-1.14 5.06-1.14 1.81 0 3.73.99 5.1 2.7-4.48 2.46-3.75 8.86.66 9.43z" />
          </svg>
          Sign in with Apple
        </button>
      )}

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-2xs font-bold uppercase tracking-widest text-ink-400">
          or
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
    </>
  );
}
