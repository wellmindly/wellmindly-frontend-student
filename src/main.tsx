import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initNativeShell } from './lib/native'
import { config } from './config'

import { GoogleOAuthProvider } from '@react-oauth/google';

// Google auth relies on a client ID. If the build didn't supply one we fall back
// to the bundled demo ID rather than a bogus 'mock-client-id' that fails
// silently — but warn loudly so the operator knows to set VITE_GOOGLE_CLIENT_ID
// for a real deployment.
if (!config.googleClientIdFromEnv) {
  console.warn(
    '[WellMindly] VITE_GOOGLE_CLIENT_ID is not set — using the bundled demo Google client ID. ' +
    'Set VITE_GOOGLE_CLIENT_ID for this environment before shipping to production.'
  );
}

// Status bar, keyboard resize and the hardware back button, before first paint.
// No-op on the web build.
initNativeShell();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={config.googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
