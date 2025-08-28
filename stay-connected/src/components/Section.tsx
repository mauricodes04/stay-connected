/* eslint-disable react-native/no-unused-styles */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

type Props = {
  title?: string;
  children: React.ReactNode;
};

export function Section({ title, children }: Props) {
  const { colors, spacing } = useTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          padding: spacing.m,
          flex: 1,
          backgroundColor: colors.background.app,
        },
        title: {
          fontSize: 18,
          fontWeight: '600',
          marginBottom: spacing.s,
          color: colors.text.primary,
        },
      }),
    [colors, spacing]
  );

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}

