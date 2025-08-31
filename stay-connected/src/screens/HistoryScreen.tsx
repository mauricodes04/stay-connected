import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Section } from '../components/Section';
import { deleteDoc, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { planDoc, plansCol } from '@/lib/userCollections';
import { useUserScopedSnapshot } from '@/hooks/useUserScopedCollection';
import { useTheme } from '@/theme';
import PlanCard from '@/ui/PlanCard';
import EmptyState from '@/ui/EmptyState';
import { Swipeable } from 'react-native-gesture-handler';
import { useIsFocused } from '@react-navigation/native';

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

  // Stable query + factory; only enable when screen focused
  const isFocused = useIsFocused();
  const plansQuery = useMemo(() => query(plansCol(db), orderBy('startAt', 'desc')), [db]);
  const qFactory = useCallback(() => plansQuery, [plansQuery]);
  const scoped = useUserScopedSnapshot<Plan>(qFactory, { enabled: isFocused });
  useEffect(() => {
    setPlans((scoped.data as any as Plan[]) ?? []);
  }, [scoped.data]);

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
          await deleteDoc(planDoc(db, p.id));
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
