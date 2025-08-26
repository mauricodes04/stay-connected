import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme';

type Variant = 'primary' | 'secondary' | 'destructive';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle | ViewStyle[];
};

export const Button: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
}) => {
  const { colors, spacing, radii, motion } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (Platform.OS !== 'android') {
      Animated.timing(scale, {
        toValue: 0.97,
        duration: motion.durations.fast,
        useNativeDriver: true,
      }).start();
    }
  };
  const handlePressOut = () => {
    if (Platform.OS !== 'android') {
      Animated.timing(scale, {
        toValue: 1,
        duration: motion.durations.base,
        useNativeDriver: true,
      }).start();
    }
  };

  const bg =
    variant === 'primary'
      ? colors.accent.primary
      : variant === 'destructive'
      ? colors.feedback.error
      : 'transparent';
  const textColor =
    variant === 'primary' || variant === 'destructive'
      ? colors.text.inverse
      : colors.accent.primary;
  const borderColor = variant === 'secondary' ? colors.accent.primary : 'transparent';

  const containerStyle: ViewStyle = {
    backgroundColor: bg,
    borderColor,
    borderWidth: variant === 'secondary' ? 1 : 0,
    opacity: disabled ? 0.5 : 1,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radii.md,
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, containerStyle, style]}>  
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        android_ripple={{ color: colors.text.inverse }}
        disabled={disabled || loading}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.base, { borderRadius: radii.md }]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Text style={[styles.label, { color: textColor }]}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
  },
});

export default Button;
