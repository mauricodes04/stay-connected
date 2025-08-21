# Firestore paths for plans and history

The code currently reads and writes only under user-namespaced collections. No root-level `/plans` or `/history` collections were found.

| File | Lines | Firestore path | Operation | Requires ownerUid/effectiveUid field? | Excerpt |
| --- | --- | --- | --- | --- | --- |
| `src/screens/PlanScreen.tsx` | 232-255 | `users/{uid}/plans/{autoId}` | `addDoc` write | No (UID in path) | `const col = collection(db, "users", uid, "plans");` … `await addDoc(col, { ... })`
| `src/screens/HistoryScreen.tsx` | 40-59 | `users/{uid}/plans/{planId}` | `onSnapshot` listen | No (UID in path) | `const col = collection(db, 'users', uid, 'plans');` … `onSnapshot(q, …)`

### Suggested Firestore rules

```sql
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/plans/{planId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### Run the app with Firestore debug logs

```bash
npm start # opens Expo and shows Firestore debug output
```
