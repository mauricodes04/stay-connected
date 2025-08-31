import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Section } from '../components/Section';
import { useTheme } from '@/theme';
import Button from '@/ui/Button';
import EmptyState from '@/ui/EmptyState';
import { useIsFocused } from '@react-navigation/native';
import { orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { plansCol } from '@/lib/userCollections';
import { useUserScopedSnapshot } from '@/hooks/useUserScopedCollection';
import PlanCard from '@/ui/PlanCard';

type FireDate = any;
type Plan = {
  id: string;
  personName: string;
  startAt: FireDate;
  endAt: FireDate;
  durationMin: number;
  status?: string;
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, spacing, typography, reducedMotion } = useTheme();
  const isFocused = useIsFocused();
  const pulse = useRef(new Animated.Value(1)).current;
  const [plans, setPlans] = useState<Plan[]>([]);
  useEffect(() => {
    if (!isFocused || reducedMotion) return;
    let mounted = true;
    const run = () => {
      if (!mounted) return;
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 300, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        if (!mounted) return;
        // wait ~5s
        setTimeout(run, 5000);
      });
    };
    const id = setTimeout(run, 5000);
    return () => { mounted = false; clearTimeout(id); };
  }, [isFocused, reducedMotion, pulse]);

  // Stable query + factory
  const plansQuery = useMemo(() => query(plansCol(db), orderBy('startAt', 'asc')), [db]);
  const qFactory = useCallback(() => plansQuery, [plansQuery]);
  // Subscribe via auth-aware hook; keep only upcoming; enable only when focused
  const scoped = useUserScopedSnapshot<Plan>(qFactory, { enabled: isFocused });
  useEffect(() => {
    const now = Date.now();
    const items = (scoped.data as any as Plan[]) ?? [];
    const upcoming = items.filter(p => {
      const v: any = (p as any).startAt;
      const t = v?.toDate ? v.toDate().getTime() : (typeof v === 'string' ? new Date(v).getTime() : 0);
      return t >= now - 60000;
    });
    setPlans(upcoming);
  }, [scoped.data]);
  const today = new Date();
  const dateStr = today.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });
  return (
    <Section title="Goober">
      <View style={{ paddingHorizontal: spacing.m, paddingTop: spacing.s }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.m }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.label.fontSize }}>
            Today
          </Text>
          <View style={{ width: spacing.s }} />
          <Text style={{ color: colors.text.primary, fontSize: typography.subtitle.fontSize, fontWeight: typography.subtitle.fontWeight }}>
            {dateStr}
          </Text>
        </View>
        {plans.length === 0 ? (
          <EmptyState title="No upcoming plans scheduled" />
        ) : (
          <View style={{ gap: spacing.s, marginTop: spacing.s }}>
            {plans.slice(0, 5).map((p) => {
              const start: Date = (p.startAt as any)?.toDate ? (p.startAt as any).toDate() : new Date(p.startAt as any);
              const dateStr = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
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
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Button
            title="Create a plan"
            onPress={() => navigation.navigate('Plan' as never)}
            style={{ marginTop: spacing.l }}
          />
        </Animated.View>
      </View>
    </Section>
  );
}
