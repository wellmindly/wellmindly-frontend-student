import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wellmindly.app',
  appName: 'WellMindly',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      clientId: '942167444638-jcpvjkm9j14lqj29lvn3gbcnju4nf5pt.apps.googleusercontent.com',
      androidClientId: '942167444638-n95e7684g6aufmk0m8bjvnb6vl4iv3bv.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  }
};

export default config;
