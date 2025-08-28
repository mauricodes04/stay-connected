import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/theme';
import Card from '@/ui/Card';
import Badge from '@/ui/Badge';

export type PlanCardProps = {
  title: string;
  personName: string;
  dateLabel: string; // e.g., Tue, Aug 26 • 5:00 PM
  durationMin?: number;
  status?: 'pending' | 'completed' | 'scheduled';
  onPress?: () => void;
};

export const PlanCard: React.FC<PlanCardProps> = ({ title, personName, dateLabel, durationMin, status = 'scheduled', onPress }) => {
  const { colors, spacing, typography } = useTheme();
  const statusVariant = status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'info';
  return (
    <Card onPress={onPress} elevated style={{ gap: spacing.s }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.text.primary, fontSize: typography.subtitle.fontSize, fontWeight: typography.subtitle.fontWeight }}>{title}</Text>
        <Badge label={status === 'completed' ? 'Completed' : status === 'pending' ? 'Pending' : 'Scheduled'} variant={statusVariant as any} />
      </View>
      <Text style={{ color: colors.text.secondary, fontSize: typography.body.fontSize }}>{personName}</Text>
      <Text style={{ color: colors.text.tertiary, fontSize: typography.label.fontSize }}>
        {dateLabel}{durationMin ? ` • ${durationMin} min` : ''}
      </Text>
    </Card>
  );
};

export default PlanCard;
