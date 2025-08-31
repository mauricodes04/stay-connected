import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Section } from '../components/Section';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ensureSignedIn } from '@/lib/ensureAuth';
import { useTheme } from '@/theme';
import PlanCard from '@/ui/PlanCard';
import EmptyState from '@/ui/EmptyState';
import { Swipeable } from 'react-native-gesture-handler';

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
  const { spacing, colors, radii } = useTheme();
  const uidRef = useRef<string | null>(null);

  useEffect(() => {
    let unsub: undefined | (() => void);
    let canceled = false;

    (async () => {
      try {
        const uid = await ensureSignedIn();
        uidRef.current = uid;
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

  const renderRightActions = (onDelete: () => void) => (
    <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Delete"
        onPress={onDelete}
        style={{ backgroundColor: '#EF4444', paddingHorizontal: 20, height: '100%', justifyContent: 'center' }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Delete</Text>
      </Pressable>
    </View>
  );

  const Row: React.FC<{ p: Plan }> = ({ p }) => {
    const h = useRef(new Animated.Value(1)).current; // scale for height via interpolation
    const opacity = useRef(new Animated.Value(1)).current;
    const [removed, setRemoved] = useState(false);

    const start = toJsDate(p.startAt);
    if (!start) return null;
    const dateStr = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const status = (p.status === 'completed' ? 'completed' : p.status === 'pending' ? 'pending' : 'scheduled') as 'pending'|'completed'|'scheduled';

    const onDelete = async () => {
      if (removed) return;
      setRemoved(true);
      // animate collapse (avoid native driver when animating height)
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: false }),
        Animated.timing(h, { toValue: 0, duration: 220, useNativeDriver: false }),
      ]).start(async () => {
        try {
          const uid = uidRef.current || (await ensureSignedIn());
          if (!uid) return;
          await deleteDoc(doc(db, 'users', uid, 'plans', p.id));
        } catch {
          // fail silently; snapshot will re-render if needed
        }
      });
    };

    const height = h.interpolate({ inputRange: [0, 1], outputRange: [0, 88] });

    return (
      <Animated.View style={{ height, opacity, overflow: 'hidden' }}>
        <Swipeable overshootRight={false} renderRightActions={() => renderRightActions(onDelete)} rightThreshold={40}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Plan with ${p.personName}`}
            onLongPress={onDelete}
            style={{ borderRadius: radii.lg, overflow: 'hidden' }}
          >
            <PlanCard
              title={`Plan with ${p.personName}`}
              personName={p.personName}
              dateLabel={`${dateStr} • ${timeStr}`}
              durationMin={p.durationMin}
              status={status}
            />
          </Pressable>
        </Swipeable>
      </Animated.View>
    );
  };

  return (
    <Section title="Plan History">
      {plans.length === 0 ? (
        <EmptyState title="No history yet" caption="Create your first plan from Home" />
      ) : (
        <View style={{ gap: spacing.s }}>
          {plans.map(p => (
            <Row key={p.id} p={p} />
          ))}
        </View>
      )}
    </Section>
  );
}
