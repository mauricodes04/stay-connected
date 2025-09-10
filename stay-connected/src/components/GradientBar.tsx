import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';

export type GradientVariant = 'budget' | 'excitement';

type Props = {
  valuePct: number; // 0..1
  height?: number;
  marker?: boolean; // for excitement
  variant: GradientVariant;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const GradientBar: React.FC<Props> = ({ valuePct, height = 10, marker = false, variant }) => {
  const { colors, radii } = useTheme();
  const pct = clamp01(valuePct);

  // Fallback gradients if theme lacks dedicated tokens
  const budgetColors = ['#E5F0FF', '#BFD4FF'];
  const excitementColors = ['#DBEAFE', '#FDE68A', '#FCA5A5'];

  const gradientColors = variant === 'budget' ? budgetColors : excitementColors;

  return (
    <View
      accessible={false}
      style={{
        width: '100%',
        height,
        borderRadius: radii.full,
        overflow: 'hidden',
        backgroundColor: colors.background.surface,
      }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ width: `${pct * 100}%`, height: '100%' }}
      />
      {marker && (
        <View
          style={{
            position: 'absolute',
            left: `${pct * 100}%`,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: colors.accent.primary,
          }}
        />
      )}
    </View>
  );
};

export default GradientBar;
