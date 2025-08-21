import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Section } from '../components/Section';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ensureSignedIn } from '@/lib/ensureAuth';

type FireDate = Timestamp | string;
const toJsDate = (v: FireDate): Date | null => {
  if (!v) return null;
  // @ts-expect-error loose check for Firestore Timestamp
  if (v?.toDate && typeof v.toDate === 'function') {
    try {
      return (v as Timestamp).toDate();
    } catch {
      /* ignore */
    }
  }
  if (typeof v === 'string') {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

type Plan = {
  id: string;
  personName: string;
  startAt: FireDate;
  endAt: FireDate;
  durationMin: number;
  status?: string;
};

export default function HistoryScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    let unsub: undefined | (() => void);
    let canceled = false;

    (async () => {
      try {
        const uid = await ensureSignedIn();
        if (canceled) return;
        const col = collection(db, 'users', uid, 'plans');
        console.log('[history] listening to', col.path); // TODO: remove debug logs
        const q = query(col, orderBy('startAt', 'desc'));
        unsub = onSnapshot(
          q,
          snap => {
            setPlans(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
          },
          err => {
            console.warn('History listener error', { code: err.code, msg: err.message, stack: err.stack }); // TODO: remove debug logs
          }
        );
      } catch (e: any) {
        console.warn('ensureSignedIn failed', { code: e.code, msg: e.message, stack: e.stack }); // TODO: remove debug logs
      }
    })();

    return () => {
      canceled = true;
      if (unsub) unsub();
    };
  }, []);

  return (
    <Section title="History">
      {plans.map(p => {
        const start = toJsDate(p.startAt);
        if (!start) return null;
        const dateStr = start.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        const timeStr = start.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        });
        return (
          <Text key={p.id}>{`${dateStr} • ${timeStr} • ${p.durationMin} min — Plan with ${p.personName}`}</Text>
        );
      })}
    </Section>
  );
}
