import React, { useMemo, useRef, useState } from 'react';
import { FlatList, ListRenderItemInfo, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { Location, loadLocations, budgetToIcons } from '@/lib/data/locations';
import LocationCard from '@/components/LocationCard';
import Chip from '@/ui/Chip';
import { useNavigation } from '@react-navigation/native';

// Simple analytics shim
function logEvent(name: string, params?: Record<string, unknown>) {
  // Replace with real analytics as needed
  console.log(`[analytics] ${name}`, params ?? {});
}

type Budget = 'free' | 'low' | 'moderate' | 'splurge' | 'all';
type InOut = 'indoor' | 'outdoor' | 'either' | 'all';

const budgetOrder: Budget[] = ['free', 'low', 'moderate', 'splurge'];

export default function LocationsScreen() {
  const { colors, spacing, typography } = useTheme();
  const navigation = useNavigation();

  const data = useMemo(() => loadLocations(), []);

  const [budget, setBudget] = useState<Budget>('all');
  const [inout, setInout] = useState<InOut>('all');

  const viewLogged = useRef<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const out = data
      .filter((item) => (budget === 'all' ? true : item.budget_range === budget))
      .filter((item) => (inout === 'all' ? true : item.indoor_outdoor === inout));
    // Default sort: excitement desc, then budget asc
    return out.sort((a, b) => {
      if (b.inferred_excitement !== a.inferred_excitement) {
        return b.inferred_excitement - a.inferred_excitement;
      }
      const ai = budgetOrder.indexOf(a.budget_range as Budget);
      const bi = budgetOrder.indexOf(b.budget_range as Budget);
      return ai - bi;
    });
  }, [data, budget, inout]);

  const renderItem = ({ item }: ListRenderItemInfo<Location>) => (
    <LocationCard
      item={item}
      onPress={() => {
        logEvent('locations_open_details', { slug: item.slug });
        // @ts-expect-error - we haven't wired typed params here
        navigation.navigate('LocationDetails', { slug: item.slug });
      }}
      onViewed={(slug) => {
        if (!viewLogged.current.has(slug)) {
          viewLogged.current.add(slug);
          logEvent('locations_card_view', { slug });
        }
      }}
    />
  );

  const keyExtractor = (it: Location) => it.slug;

  // Segmented controls using Chip primitives
  const budgets: Budget[] = ['all', 'free', 'low', 'moderate', 'splurge'];
  const inouts: InOut[] = ['all', 'indoor', 'outdoor', 'either'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.app }}>
      {/* Filters */}
      <View style={{ paddingHorizontal: spacing.l, paddingTop: spacing.l }}>
        <Text style={{ color: colors.text.primary, fontSize: typography.subtitle.fontSize, marginBottom: spacing.s }}>
          Budget
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {budgets.map((b) => (
            <Chip
              key={`b-${b}`}
              label={b === 'all' ? 'All' : budgetToIcons(b as any)}
              selected={budget === b}
              onPress={() => {
                setBudget(b);
                logEvent('locations_filter_change', { key: 'budget', value: b });
              }}
            />
          ))}
        </View>

        <Text style={{ color: colors.text.primary, fontSize: typography.subtitle.fontSize, marginVertical: spacing.s }}>
          Indoor/Outdoor
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.m }}>
          {inouts.map((io) => (
            <Chip
              key={`io-${io}`}
              label={io === 'all' ? 'All' : io[0].toUpperCase() + io.slice(1)}
              selected={inout === io}
              onPress={() => {
                setInout(io);
                logEvent('locations_filter_change', { key: 'indoor_outdoor', value: io });
              }}
            />
          ))}
        </View>
      </View>

      {/* Feed */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
      />
    </View>
  );
}
