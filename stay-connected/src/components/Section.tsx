/* eslint-disable react-native/no-unused-styles */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  title?: string;
  children: React.ReactNode;
};

export function Section({ title, children }: Props) {
  const { colors, spacing, motion, reducedMotion, typography } = useTheme();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    if (!isFocused) return;
    if (reducedMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: motion.durations.slow, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: motion.durations.slow, useNativeDriver: true }),
    ]).start();
  }, [isFocused, reducedMotion, motion.durations.slow, opacity, translateY]);
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingHorizontal: spacing.m,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 12,
          flex: 1,
          backgroundColor: colors.background.app,
        },
        title: {
          fontSize: typography.h2.fontSize,
          lineHeight: typography.h2.lineHeight,
          fontWeight: typography.h2.fontWeight,
          fontFamily: 'Poppins_600SemiBold',
          marginBottom: spacing.s,
          color: colors.text.primary,
        },
      }),
    [colors, spacing, insets.top, insets.bottom, typography]
  );

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </Animated.View>
  );
}

