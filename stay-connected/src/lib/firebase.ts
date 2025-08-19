import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {} as const;

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
