# Stay Connected Flutter

## Setup
- Install Flutter (stable) and run `flutter doctor`.
- From this folder:
  - `flutter pub get`
  - Configure Firebase: `dart pub global activate flutterfire_cli` then `flutterfire configure`
  - Run: `flutter run --dart-define=FIREBASE_API_KEY=... --dart-define=FIREBASE_PROJECT_ID=... --dart-define=FIREBASE_AUTH_DOMAIN=... --dart-define=FIREBASE_STORAGE_BUCKET=... --dart-define=FIREBASE_MESSAGING_SENDER_ID=... --dart-define=FIREBASE_APP_ID=...`

Env keys come from Expo `.env`:
- EXPO_PUBLIC_FIREBASE_API_KEY -> FIREBASE_API_KEY
- EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN -> FIREBASE_AUTH_DOMAIN
- EXPO_PUBLIC_FIREBASE_PROJECT_ID -> FIREBASE_PROJECT_ID
- EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET -> FIREBASE_STORAGE_BUCKET
- EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID -> FIREBASE_MESSAGING_SENDER_ID
- EXPO_PUBLIC_FIREBASE_APP_ID -> FIREBASE_APP_ID

## Routes
- `/` home
- `/plan` plan creation
- `/history` plan history
