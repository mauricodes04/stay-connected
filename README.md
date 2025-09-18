# stay-connected

Stay Connected is a React Native app built with Expo that helps you plan and track meaningful interactions with the people in your life. It uses Firebase for authentication and data storage, React Navigation for app flow, and a modern theming system with custom typography.

## Features
- Imports Contacts
- Creates calendar invites and review history
- Secure sign-in with Firebase Authentication

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

## Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Add a Web App to obtain the config values above
3. Enable Authentication (e.g., Email/Password) under Build → Authentication
4. (Optional) Create a Firestore database under Build → Firestore Database
5. Add the config values to `.env` as shown
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


## How to run

npm i

npx expo start -c --tunnel

