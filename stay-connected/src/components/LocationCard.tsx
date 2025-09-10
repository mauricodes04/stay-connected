import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/theme';
import { GradientBar } from '@/components/GradientBar';
import { TagChip } from '@/components/TagChip';
import { Location, budgetToIcons, excitementToPct } from '@/lib/data/locations';

type Props = {
  item: Location;
  onPress: () => void;
  onViewed?: (slug: string) => void;
};

export const LocationCard: React.FC<Props> = ({ item, onPress, onViewed }) => {
  const { colors, spacing, radii, shadows, typography } = useTheme();

  useEffect(() => {
    // Lightweight analytics hook on mount
    onViewed?.(item.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chipValues: string[] = [
    ...item.type,
    ...item.suitable_for,
    item.indoor_outdoor,
    item.weather_suitability ?? '',
    item.price_signal ?? '',
  ].filter(Boolean);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.background.elevated,
        borderRadius: radii.lg,
        padding: spacing.l,
        marginHorizontal: spacing.l,
        marginVertical: spacing.m,
        opacity: pressed ? 0.96 : 1,
        ...(shadows?.card ?? {}),
      })}
    >
      {/* Placeholder image area 16:9 */}
      <View
        style={{
          width: '100%',
          aspectRatio: 16 / 9,
          borderRadius: radii.md,
          overflow: 'hidden',
          backgroundColor: colors.background.surface,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.m,
        }}
      >
        <Ionicons name="location-outline" size={40} color={colors.text.tertiary} />
      </View>

      {/* Title */}
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.h2.fontSize,
          fontWeight: typography.h2.fontWeight,
          lineHeight: typography.h2.lineHeight,
          marginBottom: spacing.s,
        }}
        numberOfLines={2}
      >
        {item.name}
      </Text>

      {/* Budget row */}
      <View style={{ marginBottom: spacing.s }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.m }}>
          <View style={{ flex: 1 }}>
            <GradientBar variant="budget" valuePct={1} height={10} />
          </View>
          <Text style={{ color: colors.text.secondary }}>{budgetToIcons(item.budget_range)}</Text>
        </View>
      </View>

      {/* Excitement row */}
      <View style={{ marginBottom: spacing.m }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.m }}>
          <View style={{ flex: 1 }}>
            <GradientBar variant="excitement" valuePct={excitementToPct(item.inferred_excitement)} height={10} marker />
          </View>
          <Text style={{ color: colors.text.secondary }}>{item.inferred_excitement}/4</Text>
        </View>
      </View>

      {/* Chips */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {chipValues.map((c, idx) => (
          <TagChip key={`${item.slug}-chip-${idx}`} label={c} />
        ))}
      </View>
    </Pressable>
  );
};

export default LocationCard;
