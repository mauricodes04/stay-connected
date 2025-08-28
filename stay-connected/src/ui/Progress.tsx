import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

export type ProgressProps = {
  value: number; // 0..1
  trackStyle?: ViewStyle | ViewStyle[];
  barStyle?: ViewStyle | ViewStyle[];
};

export const Progress: React.FC<ProgressProps> = ({ value, trackStyle, barStyle }) => {
  const { colors, radii, spacing, motion, reducedMotion } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, value));
    if (reducedMotion) {
      anim.setValue(clamped);
      return;
    }
    Animated.timing(anim, {
      toValue: clamped,
      duration: motion.durations.base,
      useNativeDriver: false,
    }).start();
  }, [value, reducedMotion, anim, motion.durations.base]);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(value * 100), min: 0, max: 100 }}
      style={[
        {
          height: 8,
          backgroundColor: colors.background.elevated,
          borderRadius: radii.full,
          overflow: 'hidden',
        },
        trackStyle as object,
      ]}
    >
      <Animated.View
        style={[
          {
            backgroundColor: colors.accent.primary,
            height: '100%',
            width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          },
          barStyle as object,
        ]}
      />
    </View>
  );
};

export default Progress;
