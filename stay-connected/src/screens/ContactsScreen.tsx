import React, { useState } from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import { Section } from '../components/Section';
import { spacing } from '../theme/spacing';

const names = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve'];

export default function ContactsScreen() {
  const [query, setQuery] = useState('');
  const filtered = names.filter(n => n.toLowerCase().includes(query.toLowerCase()));
  return (
    <Section title="Contacts">
      <TextInput
        placeholder="Search"
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />
      {filtered.map(name => (
        <Text key={name}>{name}</Text>
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
});
