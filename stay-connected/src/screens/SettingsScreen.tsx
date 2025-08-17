import React from 'react';
import { Text, Switch } from 'react-native';
import { Section } from '../components/Section';
import { useStore } from '../state/store';

export default function SettingsScreen() {
  const { darkMode, toggleDarkMode } = useStore();
  return (
    <Section title="Settings">
      <Text>Dark Mode</Text>
      <Switch value={darkMode} onValueChange={toggleDarkMode} />
    </Section>
  );
}
