import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, Text, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

export type PrimaryButtonProps = {
  title: string;
  busy?: boolean;
  onPress: () => void | Promise<void>;
  style?: ViewStyle;
  disabled?: boolean;
};

export default function PrimaryButton({ title, busy = false, onPress, style, disabled }: PrimaryButtonProps) {
  const { colors, radii, spacing } = useTheme();
  const prog = useRef(new Animated.Value(busy ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(prog, { toValue: busy ? 1 : 0, duration: 220, useNativeDriver: false }).start();
  }, [busy, prog]);

  const bg = prog.interpolate({ inputRange: [0, 1], outputRange: [colors.accent.primary, '#10B981'] });
  const labelOpacity = prog.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const checkOpacity = prog.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={disabled || busy}
      style={[{ height: 48, borderRadius: radii.lg, overflow: 'hidden' }, style]}
    >
      <Animated.View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.m }}>
        {/* overlayed label/check centered */}
        <Animated.Text style={{ position: 'absolute', color: '#FFFFFF', fontFamily: 'Poppins_600SemiBold', opacity: labelOpacity }}>{title}</Animated.Text>
        <Animated.Text style={{ position: 'absolute', color: '#FFFFFF', fontFamily: 'Poppins_600SemiBold', opacity: checkOpacity }}>✓</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}
