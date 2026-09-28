// The Google OAuth *web* client ID is public by design — it ships to the client
// in both the web bundle and the Android build either way, so it is not a secret.
// VITE_GOOGLE_CLIENT_ID overrides the bundled demo ID per environment; both the
// web (@react-oauth/google) and native (@codetrix-studio/capacitor-google-auth)
// sign-in paths read config.googleClientId so they can never drift apart.
const DEMO_GOOGLE_CLIENT_ID =
  '942167444638-jcpvjkm9j14lqj29lvn3gbcnju4nf5pt.apps.googleusercontent.com';

const envGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export const config = {
  enableWriteMindly: import.meta.env.VITE_ENABLE_WRITEMINDLY === 'true',
  /** Resolved Google OAuth web client ID (env override, else the bundled demo ID). */
  googleClientId: envGoogleClientId || DEMO_GOOGLE_CLIENT_ID,
  /** True when VITE_GOOGLE_CLIENT_ID was supplied for this build (vs. the demo fallback). */
  googleClientIdFromEnv: Boolean(envGoogleClientId),
};
