import React from 'react';
import { Switch } from 'react-native';
import { useTheme } from '@/theme';

export type ToggleProps = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
};

export const Toggle: React.FC<ToggleProps> = ({ value, onValueChange, disabled }) => {
  const { colors } = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: colors.text.tertiary + '55', true: colors.accent.primary + '66' }}
      thumbColor={value ? colors.accent.primary : colors.background.elevated}
    />
  );
};

export default Toggle;
