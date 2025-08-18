import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Section } from '../components/Section';
import { spacing } from '../theme/spacing';
import { requestContactsPermission, pickContacts } from '../services/contacts';
import { useStore, Goober } from '../state/store';

export default function ContactsScreen() {
  const goobers = useStore(s => s.goobers);
  const addGoobers = useStore(s => s.addGoobers);
  const clearGoobers = useStore(s => s.clearGoobers);

  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState<Goober[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [denied, setDenied] = useState(false);

  const importContacts = async () => {
    const granted = await requestContactsPermission();
    if (!granted) {
      setDenied(true);
      return;
    }
    setDenied(false);
    const picked = await pickContacts();
    setContacts(picked);
  };

  const toggle = (id: string) => {
    setSelected(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addSelected = () => {
    const chosen = contacts.filter(c => selected.has(c.id));
    addGoobers(chosen);
    setContacts([]);
    setSelected(new Set());
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Section title="Contacts">
      <View style={styles.buttons}>
        <Button title="Import from device" onPress={importContacts} />
        <Button title="Clear imported" onPress={clearGoobers} />
      </View>
      {denied && (
        <View style={styles.denied}>
          <Text>Permission denied.</Text>
          <Button title="Try again" onPress={importContacts} />
        </View>
      )}
      {contacts.length > 0 && (
        <>
          <TextInput
            placeholder="Search"
            value={query}
            onChangeText={setQuery}
            style={styles.input}
          />
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Pressable onPress={() => toggle(item.id)} style={styles.item}>
                <Text>{selected.has(item.id) ? '☑' : '☐'} {item.name}</Text>
              </Pressable>
            )}
          />
          <Button title="Add selected" onPress={addSelected} />
        </>
      )}
      <FlatList
        data={goobers}
        keyExtractor={g => g.id}
        renderItem={({ item }) => <Text>{item.name}</Text>}
        ListHeaderComponent={<Text style={styles.listTitle}>Stored Goobers</Text>}
      />
    </Section>
  );
}

const styles = StyleSheet.create({
  buttons: { flexDirection: 'row', justifyContent: 'space-between' },
  input: {
    borderWidth: 1,
    padding: spacing.sm,
    marginVertical: spacing.md,
  },
  item: { paddingVertical: spacing.sm },
  listTitle: { marginTop: spacing.lg, fontWeight: 'bold' },
  denied: { marginVertical: spacing.md },
});
