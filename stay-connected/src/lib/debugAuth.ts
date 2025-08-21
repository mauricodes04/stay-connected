// dev-only diagnostic: lightweight breadcrumb
// eslint-disable-next-line no-restricted-imports
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';

export function logAuthPersistence(tag = 'auth-persistence') {
  try {
    getAuth(); // will use the already-initialized instance
    console.log(
      `[${tag}] Platform=${Platform.OS} — Auth initialized. ` +
        `Expect RN AsyncStorage persistence in native apps.`
    );
  } catch {
    console.log(`[${tag}] getAuth() not ready yet`);
  }
}
