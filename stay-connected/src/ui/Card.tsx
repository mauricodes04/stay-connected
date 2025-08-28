import React, { useMemo, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

export type CardProps = {
  elevated?: boolean;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({ elevated = true, onPress, style, children }) => {
  const { colors, radii, spacing, elevation, motion } = useTheme();
  const pressedY = useRef(new Animated.Value(0)).current;

  const baseStyle = useMemo<ViewStyle>(() => ({
    backgroundColor: colors.background.surface,
    borderRadius: radii.lg,
    padding: spacing.m,
    ...(Platform.OS === 'android'
      ? { elevation: elevated ? elevation.low : elevation.none }
      : {
          shadowColor: `${colors.text.primary}22`,
          shadowOffset: { width: 0, height: elevated ? 1 : 0 },
          shadowOpacity: elevated ? 0.08 : 0,
          shadowRadius: elevated ? 4 : 0,
        }),
  }), [colors.background.surface, colors.text.primary, radii.lg, spacing.m, elevation.low, elevation.none]);

  const handlePressIn = () => {
    Animated.timing(pressedY, {
      toValue: 1,
      duration: motion.durations.fast,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.timing(pressedY, {
      toValue: 0,
      duration: motion.durations.base,
      useNativeDriver: true,
    }).start();
  };

  const translateY = pressedY.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const animatedStyle: ViewStyle = { transform: [{ translateY }] };

  const content = (
    <Animated.View style={[baseStyle, animatedStyle, style]}>
      {children}
    </Animated.View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.fill}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fill: { alignSelf: 'stretch' },
});

export default Card;
