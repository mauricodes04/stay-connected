import React from 'react';
import { Text, Button, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Section } from '../components/Section';

const plans = [
  { id: '1', title: 'Coffee with Alice' },
  { id: '2', title: 'Lunch with Bob' },
  { id: '3', title: 'Call with Charlie' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <Section title="Home">
      <Text>Today: {new Date().toDateString()}</Text>
      <Button title="Plan 1:1" onPress={() => navigation.navigate('Plan' as never)} />
      <FlatList
        data={plans}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Text>{item.title}</Text>}
      />
    </Section>
  );
}
