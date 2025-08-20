import { getApps, getApp, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirebaseEnv } from './env';

const firebaseCfg = getFirebaseEnv();
const app = getApps().length ? getApp() : initializeApp(firebaseCfg);

// Auth with RN persistence (Hermes/Expo-safe)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
