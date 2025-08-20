declare module 'firebase/auth/react-native' {
  export * from 'firebase/auth';
  import { Persistence } from 'firebase/auth';
  export function getReactNativePersistence(storage: unknown): Persistence;
}
