import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import LocationCard from '@/components/LocationCard';
import { Location } from '@/lib/data/locations';

describe('LocationCard', () => {
  const base: Location = {
    slug: 'algo-dulce',
    name: 'Algo Dulce',
    type: ['study', 'shopping'],
    budget_range: 'low',
    suitable_for: ['two', 'small_group'],
    indoor_outdoor: 'indoor',
    inferred_excitement: 2,
    description: 'Artisan bakery offering Japanese cheesecakes and baked goods.',
    weather_suitability: 'any_weather',
    google_maps_url: 'https://maps.google.com/?q=Algo+Dulce+McAllen+TX',
    price_signal: 'Pastries and coffee under $10',
    evidence_snippets: ['Sample evidence'],
    confidence: 0.7,
  };

  it('renders header and bars', () => {
    const tree = render(
      <ThemeProvider>
        <LocationCard item={base} onPress={() => {}} />
      </ThemeProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
