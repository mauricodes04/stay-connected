import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
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
  const { colors, spacing, typography, motion, reducedMotion } = useTheme();
  const translateY = useRef(new Animated.Value(12)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reducedMotion) { translateY.setValue(0); opacity.setValue(1); return; }
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [translateY, opacity, reducedMotion, motion.durations]);
  const statusVariant = status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'info';
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
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
    </Animated.View>
  );
};

export default PlanCard;
