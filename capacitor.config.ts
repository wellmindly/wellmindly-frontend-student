import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wellmindly.app',
  appName: 'WellMindly',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      clientId: '297995941898-4u79rg42hld9jnhph91vdenhkmaf7r55.apps.googleusercontent.com',
      serverClientId: '297995941898-4u79rg42hld9jnhph91vdenhkmaf7r55.apps.googleusercontent.com',
      forceCodeForRefreshToken: false,
    },
    // Held up until React paints its first frame (hidden from JS in App.tsx),
    // so the cold start never flashes a blank white webview. Calm brand paper,
    // no spinner - the same tone as the in-app AppSplash that follows it.
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#F7F9F7',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: false,
    },
    // Edge-to-edge: transparent bar, dark icons for the light app surface. The
    // app pads content with env(safe-area-inset-top) so nothing hides beneath it.
    StatusBar: {
      overlaysWebView: true,
      style: 'LIGHT',
      backgroundColor: '#00000000',
    },
    // Resize the whole webview when the keyboard opens so inputs and the fixed
    // bottom nav stay above it.
    Keyboard: {
      resize: 'native',
      style: 'LIGHT',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
