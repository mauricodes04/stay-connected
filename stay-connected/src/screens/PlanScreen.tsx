import React, { useState } from 'react';
import { Text, Button, Alert } from 'react-native';
import { Section } from '../components/Section';
import { spacing } from '../theme/spacing';

const people = ['Alice', 'Bob', 'Charlie'];
const times = ['09:00', '12:00', '15:00'];

export default function PlanScreen() {
  const [person, setPerson] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  return (
    <Section title="Plan">
      <Text>Select Person:</Text>
      {people.map(p => (
        <Button key={p} title={p} onPress={() => setPerson(p)} />
      ))}
      <Text style={{ marginTop: spacing.md }}>Select Time:</Text>
      {times.map(t => (
        <Button key={t} title={t} onPress={() => setTime(t)} />
      ))}
      {person && time && (
        <Button
          title="Preview Invite"
          onPress={() =>
            Alert.alert('Invite', `${person} at ${time}`, [{ text: 'OK' }])
          }
        />
      )}
    </Section>
  );
}
