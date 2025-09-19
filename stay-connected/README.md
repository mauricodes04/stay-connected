# Stay Connected

React Native + Expo app to plan and track meaningful interactions with people you care about. Uses Firebase Auth/Firestore, React Navigation, and a small theming system.

## Quick Start
1) Install
```bash
npm i
```
2) Configure env
```bash
cp .env.example .env
# Fill the values from your Firebase Web App
```
3) Run
```bash
npx expo start -c --tunnel
```
Open iOS: `i` • Android: `a` • Web: `w`

## Configuration
Create `.env` using `.env.example` with these keys (must be `EXPO_PUBLIC_` so they’re available at runtime and mapped in `app.config.ts` under `extra.firebase`):

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_web_app_id
```

If any value is missing, startup will fail with a clear error from `src/lib/env.ts`.

### EAS Project ID
This repo omits the EAS project ID. To build with EAS:
- Create/identify an EAS project: `npx expo whoami && npx expo init` (or via Expo dashboard)
- Add to `app.config.ts` under `extra` when needed:
```ts
extra: {
  firebase: { /* env mapping */ },
  // Add your EAS project when applicable
  // eas: { projectId: "YOUR-EAS-PROJECT-ID" },
}
```

## Scripts
- `npm run start` — start Metro bundler
- `npm run web` — run web target
- `npm run typecheck` — TypeScript check
- `npm run lint` — ESLint
- `npm test` — Jest

## Project Structure
```
src/
  components/
  hooks/
  lib/          # env + firebase initialization
  navigation/
  screens/
  state/
  theme/
```

## Troubleshooting
- Missing Firebase config: ensure all `EXPO_PUBLIC_FIREBASE_*` exist in `.env` and map in `app.config.ts`.
- Cache issues: `npx expo start -c --tunnel`.
