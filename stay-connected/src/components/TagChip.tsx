import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/theme';

type Props = {
  label: string;
};

export const TagChip: React.FC<Props> = ({ label }) => {
  const { colors, spacing, radii, typography } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.background.surface,
        borderRadius: radii.full,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.xs,
        marginRight: spacing.s,
        marginBottom: spacing.s,
        borderWidth: 1,
        borderColor: '#E5E7EB', // fallback subtle border to separate from bg
        minHeight: 28,
        justifyContent: 'center',
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text
        numberOfLines={1}
        style={{
          color: colors.text.secondary,
          fontSize: typography.label.fontSize,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

export default TagChip;
