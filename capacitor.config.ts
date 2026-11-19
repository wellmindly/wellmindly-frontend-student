import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wellmindly.app',
  appName: 'WellMindly',
  webDir: 'dist',
  // Production talks only to https://api.wellmindly.com, so plain-HTTP and
  // mixed content stay off in the store build.
  server: {
    androidScheme: 'https',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    // Native Google Sign-In via Android Credential Manager. Only Google is
    // bundled. The web client ID is passed at runtime (SocialLogin.initialize);
    // Android OAuth clients (package + SHA-1) live only in Google Cloud Console.
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: true,
        twitter: false,
      },
      logLevel: 1,
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
