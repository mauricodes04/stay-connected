/*
If missing, add dependencies:
- pnpm add moti react-native-reanimated expo-image expo-linear-gradient
*/

import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Switch, Platform } from 'react-native';
import AnimatedWelcomeBackground from '../src/components/AnimatedWelcomeBackground';

export default function WelcomePreview() {
  const [durationMs, setDurationMs] = useState(8000);
  const [sky, setSky] = useState(0.2);
  const [mid, setMid] = useState(0.6);
  const [fg, setFg] = useState(1.0);
  const [speed, setSpeed] = useState(60);
  const [reduced, setReduced] = useState(false);

  const parallax = useMemo(() => ({ sky, mid, fg }), [sky, mid, fg]);

  // Example uses gradient fallback (no assets). Provide your own for full visual.
  const assets = useMemo(() => ({
    // sky: { uri: 'https://example.com/sky.png' },
    // mid: { uri: 'https://example.com/mid.png' },
    // fg: { uri: 'https://example.com/fg.png' },
    // character: { uri: 'https://example.com/character.png' },
  }), []);

  const numberInput = (label: string, value: number, set: (n: number) => void, props?: { min?: number; max?: number; step?: number }) => (
    <View style={{ marginRight: 12, marginBottom: 8 }}>
      <Text style={{ fontWeight: '600', marginBottom: 4 }}>{label}</Text>
      <TextInput
        style={{ paddingHorizontal: 10, paddingVertical: Platform.OS === 'ios' ? 10 : 6, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', minWidth: 90 }}
        keyboardType="numeric"
        value={String(value)}
        onChangeText={(t) => {
          const n = Number(t.replace(/[^0-9.\-]/g, ''));
          if (!Number.isFinite(n)) return;
          if (props?.min !== undefined && n < props.min) return;
          if (props?.max !== undefined && n > props.max) return;
          set(n);
        }}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#eef6fb' }}>
      {/* Background fills */}
      <AnimatedWelcomeBackground
        durationMs={durationMs}
        parallax={parallax}
        characterSpeed={speed}
        assets={assets as any}
        reducedMotion={reduced}
      />

      {/* Controls overlay */}
      <View style={{ position: 'absolute', left: 12, right: 12, top: 12, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.9)' }}>
        <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>AnimatedWelcomeBackground — Controls</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {numberInput('Duration (ms)', durationMs, setDurationMs, { min: 3000, max: 15000 })}
          {numberInput('Parallax sky', sky, setSky, { min: 0.05, max: 0.5 })}
          {numberInput('Parallax mid', mid, setMid, { min: 0.2, max: 1.0 })}
          {numberInput('Parallax fg', fg, setFg, { min: 0.5, max: 1.5 })}
          {numberInput('Speed (px/s)', speed, setSpeed, { min: 20, max: 160 })}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Switch value={reduced} onValueChange={setReduced} />
          <Text style={{ marginLeft: 8 }}>Reduced Motion</Text>
        </View>
        <Text style={{ marginTop: 8, color: '#666' }}>Tip: Add your own assets to see full parallax (sky/mid/fg/character).</Text>
      </View>
    </SafeAreaView>
  );
}
