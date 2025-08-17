import React from 'react';
import { Text, Button, View } from 'react-native';
import { Section } from '../components/Section';
import { spacing } from '../theme/spacing';

const history = [
  { id: '1', title: 'Coffee with Alice', date: '2024-01-01' },
  { id: '2', title: 'Lunch with Bob', date: '2024-02-10' },
  { id: '3', title: 'Call with Charlie', date: '2024-03-15' },
];

export default function HistoryScreen() {
  return (
    <Section title="History">
      {history.map(item => (
        <Text key={item.id}>{`${item.title} - ${item.date}`}</Text>
      ))}
      <View style={{ marginTop: spacing.md }}>
        <Button title="Refresh" onPress={() => {}} />
      </View>
    </Section>
  );
}
