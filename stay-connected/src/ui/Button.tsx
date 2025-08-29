import React, { useRef, useState } from 'react';
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

type Variant = 'primary' | 'secondary' | 'tertiary' | 'destructive';

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
  const { colors, spacing, radii } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const handlePressIn = () => {
    setPressed(true);
    if (Platform.OS !== 'android') {
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };
  const handlePressOut = () => {
    setPressed(false);
    if (Platform.OS !== 'android') {
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const isOutline = variant === 'secondary' || variant === 'destructive';
  const bg =
    variant === 'primary'
      ? colors.accent.primary // skyBlue CTA
      : 'transparent';
  const textColor =
    variant === 'primary'
      ? colors.text.inverse
      : variant === 'destructive'
      ? colors.feedback.error
      : colors.accent.primary; // secondary/tertiary default to accent
  const borderColor =
    variant === 'secondary'
      ? colors.text.primary // outlined secondary uses text.primary per spec
      : variant === 'destructive'
      ? colors.feedback.error
      : 'transparent';

  const containerStyle: ViewStyle = {
    backgroundColor: bg,
    borderColor,
    borderWidth: isOutline ? 1.5 : 0,
    opacity: disabled ? 0.3 : 1,
    paddingVertical: variant === 'tertiary' ? 0 : 12, // link has no container padding
    paddingHorizontal: variant === 'tertiary' ? 0 : 24,
    borderRadius: variant === 'primary' ? radii.full : radii.md,
  };

  // Shadow system per spec
  const shadowLg = {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  } as ViewStyle;
  const shadowMd = {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  } as ViewStyle;
  const interactive = !(disabled || loading);
  const primaryShadow = variant === 'primary' && interactive ? (pressed ? shadowMd : shadowLg) : ({} as ViewStyle);

  const pressedOpacity = variant !== 'tertiary' && interactive && pressed ? 0.96 : 1;
  return (
    <Animated.View style={[{ transform: [{ scale }], opacity: pressedOpacity }, containerStyle, primaryShadow, style]}>  
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        android_ripple={{ color: variant === 'primary' ? '#FFFFFF1A' : '#0000001A' }}
        disabled={disabled || loading}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.base, { borderRadius: variant === 'primary' ? radii.full : radii.md }]}
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
    minHeight: 56,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default Button;
