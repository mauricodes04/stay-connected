// src/lib/firebase.ts
import { getApps, getApp, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth'; // ← use 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirebaseEnv } from './env';

// Read config from expo-constants extra (provided by app.config.ts)
const firebaseCfg = getFirebaseEnv();

// Initialize (idempotent across reloads)
const app = getApps().length ? getApp() : initializeApp(firebaseCfg);

// Auth: On RN/Expo we must use AsyncStorage persistence.
// If Auth is already initialized (Fast Refresh), reuse it.
let _auth;
try {
  // initializeAuth throws if called twice — so we catch and fallback to getAuth
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  _auth = getAuth(app);
}

export const auth = _auth;
export const db = getFirestore(app);
