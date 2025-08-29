import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View, Text } from 'react-native';
import { useTheme } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type BannerVariant = 'warning' | 'error' | 'info' | 'success';

export type BannerProps = {
  visible: boolean;
  message: string;
  variant?: BannerVariant;
  onDismiss?: () => void;
};

const variantColor = (variant: BannerVariant, colors: ReturnType<typeof useTheme>['colors']) =>
  variant === 'error' ? colors.feedback.error :
  variant === 'warning' ? colors.feedback.warning :
  variant === 'success' ? colors.feedback.success :
  colors.feedback.info;

export const Banner: React.FC<BannerProps> = ({ visible, message, variant = 'warning', onDismiss }) => {
  const { colors, spacing, radii, motion, reducedMotion, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const shadow = useRef(new Animated.Value(0)).current; // 0..1 -> shadow ramp
  const [mounted, setMounted] = useState(visible);
  const fg = variantColor(variant, colors);
  const bg = `${fg}22`;

  useEffect(() => {
    const dur = motion.durations.base;
    if (visible) {
      setMounted(true);
      if (reducedMotion) { y.setValue(0); opacity.setValue(1); shadow.setValue(1); }
      else {
        Animated.parallel([
          Animated.timing(y, { toValue: 0, duration: dur, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: dur, useNativeDriver: true }),
          Animated.timing(shadow, { toValue: 1, duration: dur, useNativeDriver: false }),
        ]).start();
      }
    } else {
      if (reducedMotion) { y.setValue(-60); opacity.setValue(0); shadow.setValue(0); setMounted(false); }
      else {
        Animated.parallel([
          Animated.timing(y, { toValue: -60, duration: dur, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: dur, useNativeDriver: true }),
          Animated.timing(shadow, { toValue: 0, duration: dur, useNativeDriver: false }),
        ]).start(() => setMounted(false));
      }
    }
  }, [visible, reducedMotion, motion.durations, y, opacity, shadow]);

  if (!mounted) return null;

  return (
    <Animated.View style={{
      position: 'absolute', left: 0, right: 0, top: insets.top,
      transform: [{ translateY: y }], opacity,
      // Shadow ramp 0->8dp
      shadowColor: '#000',
      shadowOpacity: shadow as any,
      shadowRadius: shadow.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }) as any,
      shadowOffset: { width: 0, height: 4 },
      // Android elevation (not natively animatable but updated each frame in JS)
      elevation: shadow.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }) as any,
    }}>
      <Pressable accessibilityRole="alert" onPress={onDismiss}
        style={{ margin: spacing.m, backgroundColor: bg, borderRadius: radii.md, paddingVertical: spacing.s, paddingHorizontal: spacing.m }}>
        <Text style={{ color: fg, fontSize: typography.body.fontSize }}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
};

export default Banner;
