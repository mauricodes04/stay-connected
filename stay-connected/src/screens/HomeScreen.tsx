import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Section } from '../components/Section';
import { useTheme } from '@/theme';
import Button from '@/ui/Button';
import EmptyState from '@/ui/EmptyState';
import { useIsFocused } from '@react-navigation/native';

const plans = [
  { id: '1', title: 'Coffee with Alice' },
  { id: '2', title: 'Lunch with Bob' },
  { id: '3', title: 'Call with Charlie' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, spacing, typography, reducedMotion } = useTheme();
  const isFocused = useIsFocused();
  const pulse = useRef(new Animated.Value(1)).current;
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
        <EmptyState title="No upcoming plans scheduled" />
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
