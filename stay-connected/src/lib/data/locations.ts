import { z } from 'zod';

// Schema
export const LocationSchema = z.object({
  name: z.string(),
  type: z.array(z.string()).default([]),
  budget_range: z.enum(['free', 'low', 'moderate', 'splurge']),
  suitable_for: z.array(z.string()).default([]),
  indoor_outdoor: z.enum(['indoor', 'outdoor', 'either']).or(z.string()),
  inferred_excitement: z.number().int().min(1).max(4),
  description: z.string(),
  weather_suitability: z.string().optional().default('any_weather'),
  google_maps_url: z.string().url(),
  price_signal: z.string().optional().default(''),
  evidence_snippets: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).optional().default(0.5),
});

export type Location = z.infer<typeof LocationSchema> & { slug: string };

// Helpers
export function budgetToIcons(b: Location['budget_range']): string {
  switch (b) {
    case 'free':
      return '$';
    case 'low':
      return '$$';
    case 'moderate':
      return '$$$';
    case 'splurge':
      return '$$$$';
    default:
      return '';
  }
}

export function excitementToPct(value: number): number {
  const v = Math.max(0, Math.min(4, value));
  return v / 4;
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Loader
// eslint-disable-next-line @typescript-eslint/no-var-requires
const raw: unknown = require('../../../McAllen_Locations.json');

export function loadLocations(): Location[] {
  try {
    const arr = z.array(LocationSchema).parse(raw);
    const seen = new Set<string>();
    const withSlugs: Location[] = arr.map((item) => {
      let base = toSlug(item.name || 'location');
      if (!base) base = 'location';
      let slug = base;
      let i = 2;
      while (seen.has(slug)) {
        slug = `${base}-${i++}`;
      }
      seen.add(slug);
      return { ...item, slug };
    });
    return withSlugs;
  } catch (e) {
    console.error('[locations] Failed to parse locations JSON', e);
    return [];
  }
}
