import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Section } from '../components/Section';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ensureSignedIn } from '@/lib/ensureAuth';
import { useTheme } from '@/theme';
import PlanCard from '@/ui/PlanCard';
import EmptyState from '@/ui/EmptyState';

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
  const { spacing } = useTheme();

  useEffect(() => {
    let unsub: undefined | (() => void);
    let canceled = false;

    (async () => {
      try {
        const uid = await ensureSignedIn();
        if (canceled) return;
        const col = collection(db, 'users', uid, 'plans');
        const q = query(col, orderBy('startAt', 'desc'));
        unsub = onSnapshot(q, snap => {
          setPlans(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
        });
      } catch {
        // no-op
      }
    })();

    return () => {
      canceled = true;
      if (unsub) unsub();
    };
  }, []);

  return (
    <Section title="Plan History">
      {plans.length === 0 ? (
        <EmptyState title="No history yet" caption="Create your first plan from Home" />
      ) : (
        <View style={{ gap: spacing.s }}>
          {plans.map(p => {
            const start = toJsDate(p.startAt);
            if (!start) return null;
            const dateStr = start.toLocaleDateString(undefined, {
              weekday: 'short', month: 'short', day: 'numeric'
            });
            const timeStr = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            const status = (p.status === 'completed' ? 'completed' : p.status === 'pending' ? 'pending' : 'scheduled') as 'pending'|'completed'|'scheduled';
            return (
              <PlanCard
                key={p.id}
                title={`Plan with ${p.personName}`}
                personName={p.personName}
                dateLabel={`${dateStr} • ${timeStr}`}
                durationMin={p.durationMin}
                status={status}
              />
            );
          })}
        </View>
      )}
    </Section>
  );
}
