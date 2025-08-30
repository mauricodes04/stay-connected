import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './src/navigation';
import { useStore } from './src/state/store';
import { ThemeProvider } from './src/theme';
import { Text as RNText } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

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
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Set default Text font to Poppins Regular
      // Ensure existing defaultProps are preserved
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyText: any = RNText as any;
      anyText.defaultProps = anyText.defaultProps || {};
      anyText.defaultProps.style = [anyText.defaultProps.style, { fontFamily: 'Poppins_400Regular' }];
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider mode={darkMode ? 'dark' : 'light'}>
        <NavigationContainer theme={darkMode ? DarkTheme : DefaultTheme}>
          <Navigation />
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
