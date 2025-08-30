import React from 'react';
import { View, Pressable, Animated } from 'react-native';
import { useTheme } from '@/theme';

export type ModalSheetHeaderProps = {
  title?: string;
  subtitle?: string;
  onDone: () => void;
};

export default function ModalSheetHeader({ title, subtitle, onDone }: ModalSheetHeaderProps) {
  const { colors, spacing } = useTheme();
  return (
    <View accessible accessibilityRole="header" style={{ marginBottom: spacing.s, flexDirection: 'row', alignItems: 'center' }}>
      {/* eslint-disable-next-line react-native/no-raw-text */}
      <View style={{ flex: 1 }}>
        {title ? (
          <Animated.Text style={{ fontSize: 18, lineHeight: 24, fontWeight: '600', color: colors.text.primary, fontFamily: 'Poppins_600SemiBold' }}>{title}</Animated.Text>
        ) : null}
        {subtitle ? (
          // eslint-disable-next-line react-native/no-raw-text
          <Animated.Text style={{ marginTop: 2, fontSize: 12, color: colors.text.secondary }}>{subtitle}</Animated.Text>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Done"
        onPress={onDone}
        style={{
          paddingHorizontal: 14,
          height: 44,
          minWidth: 64,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          borderWidth: 1,
          borderColor: colors.text.secondary + '33',
        }}
      >
        {/* eslint-disable-next-line react-native/no-raw-text */}
        <Animated.Text style={{ color: colors.text.primary, fontFamily: 'Poppins_500Medium' }}>Done</Animated.Text>
      </Pressable>
    </View>
  );
}
