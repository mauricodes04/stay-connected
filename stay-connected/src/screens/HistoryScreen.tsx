import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Section } from '../components/Section';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

type Plan = {
  id: string;
  personName: string;
  startAt: string;
  endAt: string;
  durationMin: number;
  status?: string;
};

export default function HistoryScreen() {
  const { uid } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'users', uid, 'plans'),
      orderBy('startAt', 'desc')
    );
    return onSnapshot(q, snap => {
      setPlans(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    });
  }, [uid]);

  return (
    <Section title="History">
      {plans.map(p => {
        const start = new Date(p.startAt);
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
