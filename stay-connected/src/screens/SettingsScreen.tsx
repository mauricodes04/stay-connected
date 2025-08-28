import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Section } from '../components/Section';
import { useStore } from '../state/store';
import { useTheme } from '@/theme';
import Toggle from '@/ui/Toggle';
import ColorSwatch from '@/ui/ColorSwatch';

export default function SettingsScreen() {
  const { darkMode, toggleDarkMode } = useStore();
  const { colors, spacing, typography } = useTheme();
  const [palette, setPalette] = useState<string>('blue');

  const swatches = [
    '#3b82f6',
    '#06b6d4',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
  ];

  return (
    <Section title="Settings">
      <View style={{ paddingHorizontal: spacing.m, paddingTop: spacing.m }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.m }}>
          <Text style={{ color: colors.text.primary, fontSize: typography.body.fontSize }}>Dark Mode</Text>
          <Toggle value={darkMode} onValueChange={toggleDarkMode} />
        </View>

        <Text style={{ color: colors.text.secondary, fontSize: typography.label.fontSize, marginBottom: spacing.s }}>Color Palette</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s, marginBottom: spacing.l }}>
          {swatches.map((c) => (
            <ColorSwatch key={c} color={c} selected={palette === c} onPress={() => setPalette(c)} />
          ))}
        </View>

        <View style={{ alignItems: 'center', paddingVertical: spacing.m }}>
          <Text style={{ color: colors.text.tertiary, fontSize: typography.label.fontSize }}>v1.0.0</Text>
        </View>
      </View>
    </Section>
  );
}
