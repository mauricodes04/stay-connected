import { collection, doc, type Firestore } from 'firebase/firestore';
import { requireUid } from './authReady';

export function plansCol(db: Firestore) {
  const uid = requireUid();
  return collection(db, 'users', uid, 'plans');
}

export function planDoc(db: Firestore, planId: string) {
  const uid = requireUid();
  return doc(db, 'users', uid, 'plans', planId);
}

export function contactsCol(db: Firestore) {
  const uid = requireUid();
  return collection(db, 'users', uid, 'contacts');
}

export function contactDoc(db: Firestore, contactId: string) {
  const uid = requireUid();
  return doc(db, 'users', uid, 'contacts', contactId);
}
