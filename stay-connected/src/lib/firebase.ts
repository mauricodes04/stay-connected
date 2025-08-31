// src/lib/firebase.ts
// SINGLETON: Do not import getAuth/initializeAuth anywhere else.
// Always: import { auth, db } from "@/lib/firebase";

import { getApps, getApp, initializeApp } from 'firebase/app';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirebaseEnv } from '@/lib/env';

const firebaseCfg = getFirebaseEnv();
const app = getApps().length ? getApp() : initializeApp(firebaseCfg);

// global flag to avoid duplicate init on Fast Refresh
declare global {
  var __STAY_CONNECTED_AUTH_INIT__: boolean | undefined;
}

let authInstance: Auth;

if (!globalThis.__STAY_CONNECTED_AUTH_INIT__) {
  try {
    // Try the RN subpath first (preferred). Build path dynamically to avoid Metro static resolution.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rnPath = 'firebase/auth/' + 'react-native';
    const rnAuth = require(rnPath);
    authInstance = rnAuth.initializeAuth(app, {
      persistence: rnAuth.getReactNativePersistence(AsyncStorage),
    });
  } catch (_e) {
    // Fallback: web initialize (works but without explicit RN persistence)
    authInstance = getAuth(app);
  }
  globalThis.__STAY_CONNECTED_AUTH_INIT__ = true;
} else {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);
if (__DEV__) {
  setLogLevel('debug');
} else {
  setLogLevel('error');
}
