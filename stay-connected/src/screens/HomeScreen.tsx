import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Section } from '../components/Section';
import { useTheme } from '@/theme';
import Button from '@/ui/Button';
import EmptyState from '@/ui/EmptyState';

const plans = [
  { id: '1', title: 'Coffee with Alice' },
  { id: '2', title: 'Lunch with Bob' },
  { id: '3', title: 'Call with Charlie' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, spacing, typography } = useTheme();
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
        <Button
          title="Create a plan"
          onPress={() => navigation.navigate('Plan' as never)}
          style={{ marginTop: spacing.l }}
        />
      </View>
    </Section>
  );
}
