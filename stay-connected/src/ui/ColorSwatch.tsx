import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme';

export type ColorSwatchProps = {
  color: string;
  selected?: boolean;
  onPress?: () => void;
  size?: number;
};

export const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, selected = false, onPress, size = 32 }) => {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Select color ${color}`}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderWidth: selected ? 3 : 1,
          borderColor: selected ? colors.accent.primary : colors.background.elevated,
        }}
      />
    </Pressable>
  );
};

export default ColorSwatch;
