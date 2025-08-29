import React, { useEffect, useRef } from 'react';
import { Pressable, View, Text, ViewStyle, Animated } from 'react-native';
import { useTheme } from '@/theme';

export type ListItemProps = {
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
};

export const ListItem: React.FC<ListItemProps> = ({ title, subtitle, meta, leading, trailing, onPress, style }) => {
  const { colors, spacing, typography, motion, reducedMotion } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(6)).current;
  useEffect(() => {
    if (reducedMotion) { opacity.setValue(1); y.setValue(0); return; }
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: motion.durations.base, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: motion.durations.base, useNativeDriver: true }),
    ]).start();
  }, [opacity, y, motion.durations, reducedMotion]);

  const content = (
    <Animated.View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.s, opacity, transform: [{ translateY: y }] }}>
      {leading && <View style={{ marginRight: spacing.s }}>{leading}</View>}
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text.primary, fontSize: typography.body.fontSize, fontWeight: '500' }}>{title}</Text>
        {!!subtitle && (
          <Text style={{ color: colors.text.tertiary, fontSize: typography.label.fontSize, marginTop: 2 }}>{subtitle}</Text>
        )}
        {!!meta && <View style={{ marginTop: 4 }}>{meta}</View>}
      </View>
      {trailing && <View style={{ marginLeft: spacing.s }}>{trailing}</View>}
    </Animated.View>
  );

  if (!onPress) {
    return <View style={style}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.8 : 1,
          paddingHorizontal: spacing.m,
        },
        style as object,
      ]}
    >
      {content}
    </Pressable>
  );
};

export default ListItem;
