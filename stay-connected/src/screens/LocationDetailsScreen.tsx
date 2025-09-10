import React, { useMemo, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTheme } from '@/theme';
import { Location, loadLocations, budgetToIcons, excitementToPct } from '@/lib/data/locations';
import GradientBar from '@/components/GradientBar';
import TagChip from '@/components/TagChip';
import Button from '@/ui/Button';
import { RootStackParamList } from '@/navigation/types';

export default function LocationDetailsScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'LocationDetails'>>();
  const { colors, spacing, radii, typography } = useTheme();
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const data = useMemo(() => loadLocations(), []);
  const item: Location | undefined = data.find((l) => l.slug === params.slug);

  if (!item) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.text.primary }}>Location not found.</Text>
      </View>
    );
  }

  const chips: string[] = [
    ...item.type,
    ...item.suitable_for,
    item.indoor_outdoor,
    item.weather_suitability ?? '',
    item.price_signal ?? '',
  ].filter(Boolean);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background.app }} contentContainerStyle={{ padding: spacing.l }}>
      {/* Title */}
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.h1.fontSize,
          fontWeight: typography.h1.fontWeight,
          lineHeight: typography.h1.lineHeight,
          marginBottom: spacing.s,
        }}
        accessibilityRole="header"
      >
        {item.name}
      </Text>

      {/* Budget */}
      <View style={{ marginBottom: spacing.m }}>
        <Text style={{ color: colors.text.secondary, marginBottom: spacing.xs }}>Budget</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: spacing.m }}>
            <GradientBar variant="budget" valuePct={1} height={10} />
          </View>
          <Text style={{ color: colors.text.secondary }}>{budgetToIcons(item.budget_range)}</Text>
        </View>
      </View>

      {/* Excitement */}
      <View style={{ marginBottom: spacing.m }}>
        <Text style={{ color: colors.text.secondary, marginBottom: spacing.xs }}>Excitement</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: spacing.m }}>
            <GradientBar variant="excitement" valuePct={excitementToPct(item.inferred_excitement)} height={10} marker />
          </View>
          <Text style={{ color: colors.text.secondary }}>{item.inferred_excitement}/4</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={{ color: colors.text.primary, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight, marginBottom: spacing.m }}>
        {item.description}
      </Text>

      {/* Chips */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.l }}>
        {chips.map((c, i) => (
          <TagChip key={`${item.slug}-dchip-${i}`} label={c} />
        ))}
      </View>

      {/* Confidence */}
      <Text style={{ color: colors.text.secondary, marginBottom: spacing.m }}>Confidence: {Math.round((item.confidence ?? 0.5) * 100)}%</Text>

      {/* Evidence snippets */}
      {item.evidence_snippets?.length ? (
        <View style={{ marginBottom: spacing.l }}>
          <Button
            label={evidenceOpen ? 'Hide Evidence' : 'Show Evidence'}
            onPress={() => setEvidenceOpen((v) => !v)}
            accessibilityRole="button"
          />
          {evidenceOpen && (
            <View style={{ backgroundColor: colors.background.elevated, borderRadius: radii.md, padding: spacing.m, marginTop: spacing.s }}>
              {item.evidence_snippets.map((snip, idx) => (
                <Text key={idx} style={{ color: colors.text.secondary, marginBottom: spacing.s }}>
                  • {snip}
                </Text>
              ))}
            </View>
          )}
        </View>
      ) : null}

      {/* Open in Maps */}
      <Button
        label="Open in Maps"
        onPress={() => Linking.openURL(item.google_maps_url)}
        accessibilityRole="button"
      />
    </ScrollView>
  );
}
