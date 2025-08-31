import React, { useEffect, useRef } from 'react';
import { Pressable, View, Text, Animated } from 'react-native';
import { useTheme } from '@/theme';

export type SelectableChipProps = {
  label: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  // optional sizing to allow custom widths per design needs
  minWidth?: number;
  height?: number;
  paddingHorizontal?: number;
};

// Centered content with crossfade between label and checkmark
export default function SelectableChip({ label, selected, onToggle, disabled, minWidth, height = 44, paddingHorizontal = 18 }: SelectableChipProps) {
  const { colors } = useTheme();
  const sel = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(sel, { toValue: selected ? 1 : 0, duration: 220, useNativeDriver: false }).start();
  }, [selected, sel]);

  const bg = sel.interpolate({ inputRange: [0, 1], outputRange: ['transparent', colors.feedback.success] });
  const border = sel.interpolate({ inputRange: [0, 1], outputRange: [colors.text.secondary + '66', colors.feedback.success] });
  const labelOpacity = sel.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const checkOpacity = sel.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const textColor = sel.interpolate({ inputRange: [0, 1], outputRange: [colors.text.primary, '#FFFFFF'] });
  const scale = sel.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={selected ? 'Selected' : 'Not selected'}
      onPress={onToggle}
      disabled={disabled}
      style={{ paddingHorizontal: 12, height, borderRadius: 999, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.6 : 1 }}
    >
      <Animated.View style={{ paddingHorizontal, minWidth, height, borderRadius: 999, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', backgroundColor: bg, borderColor: border, transform: [{ scale }] }}>
        <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <Animated.Text style={{ position: 'absolute', fontFamily: 'Poppins_500Medium', color: textColor, opacity: labelOpacity }}>{label}</Animated.Text>
          <Animated.Text style={{ position: 'absolute', color: '#FFFFFF', opacity: checkOpacity }}>✓</Animated.Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}
