import React, { createContext, useContext, ReactNode } from 'react';
import { safeFreeze } from './safety';
import { motion as motionDefs } from './motion';

export type Theme = {
  colors: {
    background: { app: string; surface: string; elevated: string };
    text: { primary: string; secondary: string; tertiary: string; inverse: string };
    accent: { primary: string; secondary: string; tertiary: string };
    feedback: { success: string; warning: string; error: string; info: string };
    decorative: { hero_a: string; hero_b: string };
    backdrop?: string;
  };
  spacing: { xs: number; s: number; m: number; l: number; xl: number };
  radii: { sm: number; md: number; lg: number; full: number };
  elevation: { none: number; low: number; mid: number; high: number };
  shadows?: {
    small: { shadowColor: string; shadowOpacity: number; shadowRadius: number; shadowOffset: { width: number; height: number }; elevation: number };
    card: { shadowColor: string; shadowOpacity: number; shadowRadius: number; shadowOffset: { width: number; height: number }; elevation: number };
    card308: { shadowColor: string; shadowOpacity: number; shadowRadius: number; shadowOffset: { width: number; height: number }; elevation: number };
  };
  typography: {
    h1: { fontSize: number; fontWeight: '600' | '700' | '800' | '900'; lineHeight: number };
    h2: { fontSize: number; fontWeight: '600' | '700' | '800' | '900'; lineHeight: number };
    subtitle: { fontSize: number; fontWeight: '500' | '600'; lineHeight: number };
    body: { fontSize: number; fontWeight: '400' | '500'; lineHeight: number };
    label: { fontSize: number; fontWeight: '500' | '600' | '700'; lineHeight: number };
  };
  motion: {
    durations: { fast: number; base: number; slow: number };
    easing: { standard: (t: number) => number; emphasized: (t: number) => number };
    springs: {
      soft: { stiffness: number; damping: number };
      firm: { stiffness: number; damping: number };
    };
  };
  reducedMotion: boolean;
};

const baseMotion = safeFreeze({
  durations: motionDefs.durations,
  easing: {
    standard: motionDefs.easing.standard,
    emphasized: motionDefs.easing.standard, // placeholder emphasized curve
  },
  springs: {
    soft: { stiffness: 150, damping: 20 },
    firm: { stiffness: 250, damping: 30 },
  },
});

// Light theme values mapped to provided spec
// Typography mapping:
//   h1 => display 28/34 semi-bold(600)
//   h2 => title 22/28 semi-bold(600)
//   subtitle => section 18/24 medium(500)
//   body => body 16/22 regular(400)
//   label => caption 13/18 medium(500)
const light: Theme = safeFreeze({
  colors: {
    // backgrounds: offWhite/creamBeige as surface tiers
    background: { app: '#FAFAFA', surface: '#F6F6F6', elevated: '#FFFFFF' },
    // text tokens
    text: { primary: '#22346C', secondary: '#4A4A4A', tertiary: '#B8B8B8', inverse: '#FFFFFF' },
    // accent palette (primary blue per spec)
    accent: { primary: '#22346C', secondary: '#FF7C7C', tertiary: '#4FB7B5' },
    // feedback
    feedback: { success: '#4CAF50', warning: '#FFA726', error: '#E57373', info: '#768FFF' },
    // decorative examples
    decorative: { hero_a: '#FFD9C7', hero_b: '#9B6FFF' },
    // modal backdrop per spec
    backdrop: 'rgba(0,0,0,0.5)',
  },
  // spacing tokens closest to spec: 4,8,12,16,24 (20 available via component overrides)
  spacing: { xs: 4, s: 8, m: 12, l: 16, xl: 24 },
  // radii per spec: sm=8, md=12, lg=16, full≈pill
  radii: { sm: 8, md: 12, lg: 16, full: 9999 },
  elevation: { none: 0, low: 2, mid: 4, high: 8 },
  // shadow tokens
  shadows: {
    small: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    card: { shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    // approx 308°: x=4, y=-5 with slightly stronger opacity
    card308: { shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 4, height: -5 }, elevation: 6 },
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '600', lineHeight: 34 },
    h2: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
    subtitle: { fontSize: 18, fontWeight: '500', lineHeight: 24 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
    label: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  },
  motion: baseMotion,
  reducedMotion: false,
});

const dark: Theme = safeFreeze({
  colors: {
    background: { app: '#000000', surface: '#121212', elevated: '#1e1e1e' },
    text: { primary: '#FFFFFF', secondary: '#D1D1D1', tertiary: '#A1A1A1', inverse: '#000000' },
    accent: { primary: '#22346C', secondary: '#FF7C7C', tertiary: '#4FB7B5' },
    feedback: { success: '#4CAF50', warning: '#FFA726', error: '#E57373', info: '#768FFF' },
    decorative: { hero_a: '#3d3d3d', hero_b: '#2d2d2d' },
    backdrop: 'rgba(0,0,0,0.5)',
  },
  spacing: { xs: 4, s: 8, m: 12, l: 16, xl: 24 },
  radii: { sm: 8, md: 12, lg: 16, full: 9999 },
  elevation: { none: 0, low: 2, mid: 4, high: 8 },
  shadows: {
    small: { shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    card: { shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    card308: { shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 4, height: -5 }, elevation: 6 },
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '600', lineHeight: 34 },
    h2: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
    subtitle: { fontSize: 18, fontWeight: '500', lineHeight: 24 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
    label: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  },
  motion: baseMotion,
  reducedMotion: false,
});

const ThemeContext = createContext<Theme>(light);

export function ThemeProvider({ children, mode = 'light' }: { children: ReactNode; mode?: 'light' | 'dark' }) {
  const value = mode === 'dark' ? dark : light;
  return React.createElement(ThemeContext.Provider, { value }, children);
}

export const useTheme = () => useContext(ThemeContext);

export const themes = { light, dark };
