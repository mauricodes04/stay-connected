import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useTheme } from '@/theme';
import Button from '@/ui/Button';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignInScreen() {
  const { spacing, colors, typography, radii } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.includes('@') && password.length >= 6 && !loading, [email, password, loading]);

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (e: any) {
      setError(e?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.app, padding: spacing.l, gap: spacing.m, justifyContent: 'center' }}>
      <Text style={{ color: colors.text.primary, fontSize: typography.h2.fontSize, fontFamily: 'Poppins_600SemiBold', textAlign: 'center', marginBottom: spacing.s }}>
        {mode === 'signin' ? 'Sign in to continue' : 'Create your account'}
      </Text>
      {!!error && (
        <Text accessibilityLiveRegion="polite" style={{ color: '#EF4444', textAlign: 'center' }}>{error}</Text>
      )}
      <View style={{ gap: spacing.s }}>
        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.text.tertiary}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
          style={{
            backgroundColor: colors.background.surface,
            color: colors.text.primary,
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.s,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.text.tertiary,
          }}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.text.tertiary}
          autoCapitalize="none"
          textContentType="password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{
            backgroundColor: colors.background.surface,
            color: colors.text.primary,
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.s,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.text.tertiary,
          }}
        />
      </View>
      <Button title={mode === 'signin' ? 'Sign In' : 'Create Account'} onPress={submit} disabled={!canSubmit} loading={loading} />
      <Pressable onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        <Text style={{ color: colors.accent.primary, textAlign: 'center' }}>
          {mode === 'signin' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
        </Text>
      </Pressable>
    </View>
  );
}
