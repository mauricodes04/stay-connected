import 'dotenv/config';
import type { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
  name: 'Stay Connected',
  slug: 'stay-connected',
  scheme: 'stayconnected',
  version: '1.0.0',
  orientation: 'portrait',
  // icon removed to silence missing asset warnings
  userInterfaceStyle: 'automatic',
  splash: { image: './assets/splash.png', resizeMode: 'contain', backgroundColor: '#ffffff' },
  ios: { supportsTablet: true },
  android: { adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#ffffff' } },
  web: { bundler: 'metro' },

  extra: {
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    },
  },
};

export default config;
