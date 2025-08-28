import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/theme';

export type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  caption?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, caption }) => {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.l }}>
      <View style={{ marginBottom: spacing.s }}>{icon}</View>
      <Text style={{ color: colors.text.secondary, fontSize: typography.body.fontSize }}>{title}</Text>
      {caption ? (
        <Text style={{ marginTop: 4, color: colors.text.tertiary, fontSize: typography.label.fontSize }}>{caption}</Text>
      ) : null}
    </View>
  );
};

export default EmptyState;
