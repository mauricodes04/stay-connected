import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import Navigation from './src/navigation';
import { useStore } from './src/state/store';

// Surface Firebase config errors early
try {
  // Lazy import to avoid tree-shaking removing the check
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@/lib/firebase');
} catch (e) {
  console.warn(String(e));
}

if (__DEV__) {
  import('@/lib/debugAuth').then(m => m.logAuthPersistence());
}

export default function App() {
  const darkMode = useStore(state => state.darkMode);
  return (
    <NavigationContainer theme={darkMode ? DarkTheme : DefaultTheme}>
      <Navigation />
    </NavigationContainer>
  );
}
