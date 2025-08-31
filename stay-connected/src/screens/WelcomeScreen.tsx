import React from 'react';
import { View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import Button from '@/ui/Button';

export default function WelcomeScreen() {
  const nav = useNavigation();
  const { spacing, colors, typography } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.app, alignItems: 'center', justifyContent: 'center', padding: spacing.l }}>
      <Image
        accessibilityIgnoresInvertColors
        source={{ uri: 'https://images.unsplash.com/photo-1520975922284-5b6cda53d927?w=640&q=60&auto=format&fit=crop' }}
        style={{ width: 160, height: 160, borderRadius: 80, marginBottom: spacing.l }}
      />
      <Text style={{ color: colors.text.primary, fontSize: typography.h2.fontSize, fontFamily: 'Poppins_700Bold', textAlign: 'center', marginBottom: spacing.s }}>
        Welcome to Stay Connected
      </Text>
      <Text style={{ color: colors.text.secondary, fontSize: typography.body.fontSize, textAlign: 'center', marginBottom: spacing.xl }}>
        Plan time with your favorite people and never lose touch.
      </Text>

      <Button title="Get Started" onPress={() => nav.navigate('SignIn' as never)} style={{ width: '100%' }} />
    </View>
  );
}
