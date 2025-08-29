import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

type Props = {
  title?: string;
  right?: React.ReactNode;
  left?: React.ReactNode;
};

export default function Header({ title, right, left }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, backgroundColor: colors.background.app }]}> 
      <View style={styles.bar}> 
        <View style={styles.side}>{left}</View>
        <Text style={[styles.title, { color: colors.text.primary }]} accessibilityRole="header">
          {title}
        </Text>
        <View style={styles.side}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  side: { minWidth: 40, alignItems: 'center', justifyContent: 'center' },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
});
