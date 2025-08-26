import React, { createContext, useContext, ReactNode } from 'react';
import { safeFreeze } from './safety';
import { motion as motionDefs } from './motion';

export type Theme = {
  colors: {
    background: { app: string; surface: string; elevated: string };
    text: { primary: string; secondary: string; inverse: string };
    accent: { primary: string; secondary: string; tertiary: string };
    feedback: { success: string; warning: string; error: string; info: string };
    decorative: { hero_a: string; hero_b: string };
  };
  spacing: { xs: number; s: number; m: number; l: number; xl: number };
  radii: { sm: number; md: number; lg: number; full: number };
  motion: {
    durations: { fast: number; base: number; slow: number };
    easing: { standard: (t: number) => number };
    springs: {
      soft: { stiffness: number; damping: number };
      firm: { stiffness: number; damping: number };
    };
  };
};

const baseMotion = safeFreeze({
  durations: motionDefs.durations,
  easing: motionDefs.easing,
  springs: {
    soft: { stiffness: 150, damping: 20 },
    firm: { stiffness: 250, damping: 30 },
  },
});

const light: Theme = safeFreeze({
  colors: {
    background: { app: '#ffffff', surface: '#f8f9fa', elevated: '#ffffff' },
    text: { primary: '#1a1a1a', secondary: '#4d4d4d', inverse: '#ffffff' },
    accent: { primary: '#1e90ff', secondary: '#ff6b81', tertiary: '#4cd137' },
    feedback: { success: '#2ecc71', warning: '#fbc531', error: '#e74c3c', info: '#00a8ff' },
    decorative: { hero_a: '#f5deb3', hero_b: '#ffe4e1' },
  },
  spacing: { xs: 4, s: 8, m: 16, l: 24, xl: 32 },
  radii: { sm: 4, md: 8, lg: 16, full: 9999 },
  motion: baseMotion,
});

const dark: Theme = safeFreeze({
  colors: {
    background: { app: '#000000', surface: '#121212', elevated: '#1e1e1e' },
    text: { primary: '#ffffff', secondary: '#d1d1d1', inverse: '#000000' },
    accent: { primary: '#1e90ff', secondary: '#ff6b81', tertiary: '#4cd137' },
    feedback: { success: '#2ecc71', warning: '#fbc531', error: '#e74c3c', info: '#00a8ff' },
    decorative: { hero_a: '#3d3d3d', hero_b: '#2d2d2d' },
  },
  spacing: { xs: 4, s: 8, m: 16, l: 24, xl: 32 },
  radii: { sm: 4, md: 8, lg: 16, full: 9999 },
  motion: baseMotion,
});

const ThemeContext = createContext<Theme>(light);

export function ThemeProvider({ children, mode = 'light' }: { children: ReactNode; mode?: 'light' | 'dark' }) {
  const value = mode === 'dark' ? dark : light;
  return React.createElement(ThemeContext.Provider, { value }, children);
}

export const useTheme = () => useContext(ThemeContext);

export const themes = { light, dark };
