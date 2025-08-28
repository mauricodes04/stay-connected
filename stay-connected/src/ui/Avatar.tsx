import React from 'react';
import { Image, Text, View } from 'react-native';
import { useTheme } from '@/theme';

export type AvatarProps = {
  size?: number;
  name?: string; // used for initials
  uri?: string | null;
};

function initialsFrom(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase()).join('');
}

function colorFor(name?: string, fallback: string = '#888888') {
  if (!name) return fallback;
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

export const Avatar: React.FC<AvatarProps> = ({ size = 40, name, uri }) => {
  const { colors, radii, typography } = useTheme();
  const bg = uri ? colors.background.elevated : colorFor(name, colors.accent.primary);
  const text = colors.background.app;
  const borderRadius = size / 2;

  return uri ? (
    <Image
      accessibilityLabel={name || 'avatar'}
      source={{ uri }}
      style={{ width: size, height: size, borderRadius }}
    />
  ) : (
    <View
      accessibilityLabel={name || 'avatar'}
      accessibilityRole="image"
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: text, fontSize: Math.max(12, size * 0.42), fontWeight: typography.label.fontWeight }}>
        {initialsFrom(name)}
      </Text>
    </View>
  );
};

export default Avatar;
