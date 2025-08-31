# Migration Plan (PR 1)

- Enable RN New Architecture (Fabric + TurboModules) via `expo-build-properties`.
- Add `expo-dev-client` and `eas.json` build profiles.
- Scaffold monorepo directories (`apps/`, `packages/`).
- Keep app at root for now; move in PR 2+ with alias fallbacks.

Rollback: remove `plugins` entries in `app.config.ts`, uninstall dev client, delete `eas.json`.
