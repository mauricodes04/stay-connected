import 'dotenv/config';
import type { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
  name: 'Stay Connected',
  slug: 'stay-connected',
  scheme: 'stayconnected',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  // Splash and adaptive icon assets removed (no assets/ directory present)
  ios: { supportsTablet: true, bundleIdentifier: 'com.anonymous.stayconnected' },
  android: {
    package: 'com.anonymous.stayconnected',
    adaptiveIcon: { backgroundColor: '#ffffff' },
  },
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
    eas: {
      projectId: '4fdde5d4-75b8-472a-9f2e-1464fd16bfad',
    },
  },
};

export default config;
