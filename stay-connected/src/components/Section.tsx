import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '../state/store';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  title?: string;
  children: React.ReactNode;
};

export function Section({ title, children }: Props) {
  const darkMode = useStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      {title && <Text style={[styles.title, { color: theme.text }]}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
});
