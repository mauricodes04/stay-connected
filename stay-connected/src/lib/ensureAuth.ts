import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Resolves when there's a currentUser; signs in anonymously if needed.
 * Use before any Firestore read/write or snapshot subscription.
 */
export function ensureSignedIn(): Promise<string> {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async user => {
      try {
        if (user) {
          unsub();
          resolve(user.uid);
          return;
        }
        // Not signed in -> sign in anonymously
        const cred = await signInAnonymously(auth);
        unsub();
        resolve(cred.user.uid);
      } catch (e) {
        unsub();
        reject(e);
      }
    });
  });
}
