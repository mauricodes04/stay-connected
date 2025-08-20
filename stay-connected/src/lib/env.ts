import Constants from 'expo-constants';

type FirebaseEnv = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

export function getFirebaseEnv(): Required<FirebaseEnv> {
  const extra = (Constants.expoConfig?.extra as any) || {};
  const fb: FirebaseEnv = extra.firebase || {};

  const missing = Object.entries(fb)
    .filter(([_, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    throw new Error(
      `Missing Firebase config: ${missing.join(', ')}. ` +
      `Set EXPO_PUBLIC_FIREBASE_* in .env and ensure app.config.ts maps them to extra.firebase.`
    );
  }
  return fb as Required<FirebaseEnv>;
}
