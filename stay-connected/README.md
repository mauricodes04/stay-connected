# stay-connected

Stay Connected is a React Native app built with Expo that helps you plan and track meaningful interactions with the people in your life. It uses Firebase for authentication and data storage, React Navigation for app flow, and a modern theming system with custom typography.

## Features
- Track contacts and view details
- Plan upcoming touchpoints and review history
- Secure sign-in with Firebase Authentication
- Persistent auth on React Native via `initializeAuth` with AsyncStorage
- Polished bottom tabs and stack navigation with theming and custom fonts (Poppins)

## Tech Stack
- Expo SDK: `expo@53`
- React Native: `0.79`
- React: `19`
- Navigation: `@react-navigation/*`
- Firebase Web SDK: `^10`
- State: `zustand`
- UI: `expo-image`, `react-native-svg`, `moti`, custom theme
- Testing: `jest-expo`, `@testing-library/react-native`

## Requirements
- Node.js 18+ (LTS recommended)
- npm or yarn
- Expo CLI (installed via `npx`, no global install required)
- iOS Simulator (macOS) or Android Emulator/device
- A Firebase project (Web app) with config values

## Environment Variables (.env)
This app expects Firebase config to be provided via Expo public env vars. Create a `.env` file in the project root with the following keys:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_web_app_id
```

Notes:
- The `EXPO_PUBLIC_` prefix is required so values are available at runtime. See mapping in `app.config.ts` under `extra.firebase`.
- If any value is missing, the app will throw at startup from `src/lib/env.ts` with a helpful message.

## Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Add a Web App to obtain the config values above
3. Enable Authentication (e.g., Email/Password) under Build → Authentication
4. (Optional) Create a Firestore database under Build → Firestore Database
5. Add the config values to `.env` as shown

Related files:
- `app.config.ts` loads `.env` via `dotenv/config` and exposes values under `extra.firebase`
- `src/lib/env.ts` validates presence of those values
- `src/lib/firebase.ts` initializes the Firebase App, Firestore, and Auth (with RN persistence)

## Project Structure
```
src/
  components/         # Reusable UI components
  hooks/              # Custom hooks (e.g., people data)
  lib/                # env + firebase initialization
  navigation/         # Tabs + Stack routing
  screens/            # Home, Contacts, Plan, History, Settings, Auth
  services/           # Service layer (if applicable)
  state/              # Zustand store
  theme/              # Theme provider and tokens
  ui/, utils/, types/ # UI primitives, helpers, types
```

Entry points:
- `App.tsx` wires theme, fonts, navigation, and surfaces Firebase config errors
- `src/navigation/index.tsx` switches between Auth flow and main tabs based on `firebase.auth()` state

## Scripts
- `npm run start` — start Metro bundler
- `npm run web` — run web target
- `npm run typecheck` — TypeScript type check only
- `npm run lint` — ESLint
- `npm test` — Jest tests

## Development
1. Install deps
   ```bash
   npm i
   ```
2. Create `.env` as described above
3. Start the app with an Expo tunnel (recommended for real devices and restricted networks)
   ```bash
   npx expo start -c --tunnel
   ```
4. Open a platform target:
   - iOS Simulator (macOS): press `i` in the terminal or run `npx expo start --ios`
   - Android Emulator: press `a` in the terminal or run `npx expo start --android`
   - Web: press `w` or run `npm run web`

## Troubleshooting
- Missing Firebase config error at startup
  - Ensure all `EXPO_PUBLIC_FIREBASE_*` keys are present in `.env`
  - Confirm `app.config.ts` maps them to `extra.firebase`
- RN Auth persistence not applied
  - The app first attempts `firebase/auth/react-native` with `initializeAuth` and AsyncStorage
  - If that import fails, it falls back to `getAuth(app)` without explicit RN persistence
- Fonts not applied or blank screen at launch
  - `App.tsx` waits for Poppins fonts to load; if they fail to load, ensure internet connectivity and try re-running Metro (`r`)
- Stuck bundler or cache issues
  - Use the provided command with `-c` to clear cache: `npx expo start -c --tunnel`

## CI/Quality Utilities
- `npm run scan:auth` — scans the repo to ensure Firebase Auth is only initialized in `src/lib/firebase.ts`
- ESLint + TypeScript are configured; see `eslint.config.cjs` and `tsconfig.json`

## How to run

npm i

npx expo start -c --tunnel

### iOS Simulator
npx expo start --ios

### Android Emulator
npx expo start --android
