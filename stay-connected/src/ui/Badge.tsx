import React from 'react';
import { View, ViewStyle, Text } from 'react-native';
import { useTheme } from '@/theme';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info';

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle | ViewStyle[];
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', style }) => {
  const { colors, spacing, radii, typography } = useTheme();

  const fg =
    variant === 'success'
      ? colors.feedback.success
      : variant === 'warning'
      ? colors.feedback.warning
      : variant === 'error'
      ? colors.feedback.error
      : variant === 'info'
      ? colors.feedback.info
      : colors.text.secondary;

  // Use low-alpha background derived from role color; relies on hex in theme
  const bg = variant === 'neutral' ? colors.background.surface : `${fg}22`;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      style={{
        alignSelf: 'flex-start',
        backgroundColor: bg,
        borderRadius: radii.full,
        paddingHorizontal: spacing.s,
        paddingVertical: spacing.xs,
        ...((style as object) || {}),
      }}
    >
      <Text style={{ color: fg, fontSize: typography.label.fontSize, fontWeight: typography.label.fontWeight }}>
        {label}
      </Text>
    </View>
  );
};

export default Badge;
