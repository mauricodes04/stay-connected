// src/lib/firebase.ts
// SINGLETON: Do not import getAuth/initializeAuth anywhere else.
// Always: import { auth, db } from "@/lib/firebase";

import { getApps, getApp, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirebaseEnv } from '@/lib/env';

const firebaseCfg = getFirebaseEnv();
const app = getApps().length ? getApp() : initializeApp(firebaseCfg);

// global flag to avoid duplicate init on Fast Refresh
declare global {
  var __STAY_CONNECTED_AUTH_INIT__: boolean | undefined;
}

let authInstance;

if (!globalThis.__STAY_CONNECTED_AUTH_INIT__) {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  globalThis.__STAY_CONNECTED_AUTH_INIT__ = true;
} else {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);
