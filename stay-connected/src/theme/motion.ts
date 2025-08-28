import { Animated } from 'react-native';

// Export motion roles and factories (no live instances)
export const motion = {
  durations: { fast: 150, base: 220, slow: 300 },
  easing: {
    standard: (t: number) => t, // placeholder; replace with Easing.out(Easing.cubic) in code if using RN Easing
  },
  createOpacity: () => new Animated.Value(0),
  createScale: (start: number = 1) => new Animated.Value(start),
};
