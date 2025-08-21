# Logging Guidelines

- Firestore verbose logs are enabled only in development via `setLogLevel('debug')`.
- In production, avoid verbose logging or set to `error`.
- Remove temporary `console.log/console.warn` once debugging is complete.

