import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';

let _authResolved = false;
let _currentUser: User | null = null;

const auth = getAuth();

export const authReady: Promise<User | null> = new Promise((resolve) => {
  // Resolve immediately if currentUser exists
  if (auth.currentUser) {
    _authResolved = true;
    _currentUser = auth.currentUser;
    resolve(_currentUser);
    return;
  }
  const unsub = onAuthStateChanged(auth, (user) => {
    _authResolved = true;
    _currentUser = user;
    resolve(user);
    unsub();
  });
});

export function getCurrentUser(): User | null {
  return _currentUser ?? auth.currentUser ?? null;
}

export function requireUid(): string {
  const u = getCurrentUser();
  if (!u) throw new Error('[auth] No user logged in');
  return u.uid;
}
