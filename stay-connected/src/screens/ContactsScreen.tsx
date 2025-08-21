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
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Section } from '../components/Section';
import { spacing } from '../theme/spacing';
import { requestContactsPermission, pickContacts } from '../services/contacts';
import type { Goober } from '../state/store';
import { usePeople } from '@/hooks/usePeople';

type Nav = NavigationProp<{ GooberDetail: { gooberId: string } }>;

export default function ContactsScreen() {
  const navigation = useNavigation<Nav>();
  const { people, upsertPerson } = usePeople();

  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState<Goober[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [denied, setDenied] = useState(false);
  const [info, setInfo] = useState<{ added: number; skipped: number } | null>(null);

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

  const addSelected = async () => {
    const chosen = contacts.filter(c => selected.has(c.id));
    let added = 0;
    let skipped = 0;
    const existingIds = new Set(people.map(p => p.id));
    for (const c of chosen) {
      const key =
        c.email?.toLowerCase() ||
        c.phone?.replace(/\D+/g, "") ||
        c.name;
      if (existingIds.has(key)) {
        skipped++;
      } else {
        added++;
      }
      existingIds.add(key);
      await upsertPerson({
        name: c.name,
        nickname: c.nickname,
        phone: c.phone,
        email: c.email,
      });
    }
    setInfo({ added, skipped });
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
      </View>
      {info && (info.added > 0 || info.skipped > 0) && (
        <Text style={styles.info}>
          Imported {info.added}, skipped {info.skipped} duplicates
        </Text>
      )}
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
        data={people}
        keyExtractor={g => g.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('GooberDetail', { gooberId: item.id })}
            style={styles.item}
          >
            <Text>{item.displayName}</Text>
          </Pressable>
        )}
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
  info: { marginVertical: spacing.sm },
});
