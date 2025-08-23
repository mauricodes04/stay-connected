import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '@/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  caption?: string;
  error?: string;
  multiline?: boolean;
};

export const Field: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  placeholder,
  caption,
  error,
  multiline = false,
}) => {
  const { colors, spacing, radii } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? colors.feedback.error
    : focused
    ? colors.accent.primary
    : colors.text.secondary;

  return (
    <View style={{ marginBottom: spacing.m }}>
      <Text style={{ color: colors.text.primary, marginBottom: spacing.xs }}>{label}</Text>
      <View
        style={{
          borderWidth: 1,
          borderColor,
          borderRadius: radii.md,
          paddingHorizontal: spacing.s,
          paddingVertical: spacing.xs,
          backgroundColor: colors.background.surface,
          elevation: focused ? 2 : 0,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ color: colors.text.primary, minHeight: 44 }}
        />
      </View>
      {caption && !error && (
        <Text style={{ color: colors.text.secondary, marginTop: spacing.xs }}>{caption}</Text>
      )}
      {error && (
        <Text style={{ color: colors.feedback.error, marginTop: spacing.xs }}>{error}</Text>
      )}
    </View>
  );
};

export default Field;

