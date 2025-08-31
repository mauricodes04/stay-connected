// Local ambient types to satisfy TS resolution for Firebase React Native auth subpath
// This delegates to firebase/auth types to keep signatures consistent.
declare module 'firebase/auth/react-native' {
  export * from 'firebase/auth';
  export function initializeAuth(...args: any[]): import('firebase/auth').Auth;
  export function getReactNativePersistence(storage: any): any;
}
