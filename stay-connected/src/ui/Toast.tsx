import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, View, Text } from 'react-native';
import { useTheme } from '@/theme';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

export type ToastProps = {
  visible: boolean;
  message: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
  autoDismissMs?: number;
};

export const Toast: React.FC<ToastProps> = ({ visible, message, variant = 'info', onDismiss, autoDismissMs = 3000 }) => {
  const { colors, spacing, radii, motion, reducedMotion, typography } = useTheme();
  const y = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const fg =
    variant === 'success' ? colors.feedback.success :
    variant === 'warning' ? colors.feedback.warning :
    variant === 'error' ? colors.feedback.error :
    colors.feedback.info;
  const bg = `${fg}22`;

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (visible) {
      if (reducedMotion) {
        y.setValue(0); opacity.setValue(1);
      } else {
        Animated.parallel([
          Animated.timing(y, { toValue: 0, duration: motion.durations.base, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: motion.durations.base, useNativeDriver: true }),
        ]).start();
      }
      if (autoDismissMs > 0) {
        timer = setTimeout(() => onDismiss?.(), autoDismissMs);
      }
    } else {
      if (reducedMotion) {
        y.setValue(60); opacity.setValue(0);
      } else {
        Animated.parallel([
          Animated.timing(y, { toValue: 60, duration: motion.durations.fast, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: motion.durations.fast, useNativeDriver: true }),
        ]).start();
      }
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [visible, reducedMotion, motion.durations, y, opacity, onDismiss, autoDismissMs]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 24, alignItems: 'center', opacity, transform: [{ translateY: y }] }}
    >
      <Pressable
        accessibilityRole="alert"
        onPress={onDismiss}
        style={{
          backgroundColor: bg,
          borderRadius: radii.full,
          paddingVertical: spacing.s,
          paddingHorizontal: spacing.m,
        }}
      >
        <Text style={{ color: fg, fontSize: typography.body.fontSize }}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
};

export default Toast;
