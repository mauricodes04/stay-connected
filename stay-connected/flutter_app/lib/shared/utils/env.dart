/// Environment mapping from Expo to Flutter.
/// Expo keys (from .env):
/// - EXPO_PUBLIC_FIREBASE_API_KEY
/// - EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
/// - EXPO_PUBLIC_FIREBASE_PROJECT_ID
/// - EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
/// - EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
/// - EXPO_PUBLIC_FIREBASE_APP_ID
///
/// In Flutter, we read via `--dart-define` at build time.
/// Example:
/// flutter run --dart-define=FIREBASE_API_KEY=... --dart-define=FIREBASE_PROJECT_ID=...
class Env {
  static const firebaseApiKey = String.fromEnvironment('FIREBASE_API_KEY');
  static const firebaseAuthDomain = String.fromEnvironment('FIREBASE_AUTH_DOMAIN');
  static const firebaseProjectId = String.fromEnvironment('FIREBASE_PROJECT_ID');
  static const firebaseStorageBucket = String.fromEnvironment('FIREBASE_STORAGE_BUCKET');
  static const firebaseMessagingSenderId = String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID');
  static const firebaseAppId = String.fromEnvironment('FIREBASE_APP_ID');
}
