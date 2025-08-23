import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export const Chip: React.FC<Props> = ({ label, selected = false, onPress }) => {
  const { colors, spacing, radii } = useTheme();
  const anim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: selected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selected, anim]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.background.surface, colors.accent.primary],
  });
  const textColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.text.primary, colors.text.inverse],
  });

  return (
    <Animated.View style={{ margin: spacing.xs }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          {
            borderColor: colors.accent.primary,
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.s,
            borderRadius: radii.full,
            backgroundColor,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Animated.Text style={{ color: textColor }}>{label}</Animated.Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});

export default Chip;

