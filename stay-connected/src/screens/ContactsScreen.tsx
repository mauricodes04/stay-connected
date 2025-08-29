/* eslint-disable react-native/no-unused-styles */
import React, { useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Section } from '../components/Section';
import { useTheme } from '../theme';
import { requestContactsPermission, pickContacts } from '../services/contacts';
import type { Goober } from '../state/store';
import { usePeople } from '@/hooks/usePeople';
import { Field } from '@/ui/Field';
import { ListItem } from '@/ui/ListItem';
import { Avatar } from '@/ui/Avatar';
import Banner from '@/ui/Banner';

type Nav = NavigationProp<{ GooberDetail: { gooberId: string } }>;

export default function ContactsScreen() {
  const navigation = useNavigation<Nav>();
  const { people, upsertPerson } = usePeople();
  const { spacing } = useTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        buttons: { flexDirection: 'row', justifyContent: 'space-between' },
        input: { borderWidth: 1, padding: spacing.s, marginVertical: spacing.m },
        item: { paddingVertical: spacing.s },
        listTitle: { marginTop: spacing.l, fontWeight: 'bold' },
        denied: { marginVertical: spacing.m },
        info: { marginVertical: spacing.s },
      }),
    [spacing]
  );

  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState<Goober[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [denied, setDenied] = useState(false);
  const [info, setInfo] = useState<{ added: number; skipped: number } | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

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

  const normEmail = (e?: string) => e?.trim().toLowerCase() || undefined;
  const normPhone = (p?: string) => (p ? p.replace(/\D+/g, '') : undefined);
  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h).toString(36);
  };
  const stableIdFor = (c: { id?: string; email?: string; phone?: string; name: string }) => {
    const e = normEmail(c.email);
    const ph = normPhone(c.phone);
    if (c.id && c.id.trim()) return c.id.trim();
    if (e) return `email:${e}`;
    if (ph) return `phone:${ph}`;
    return `name:${hash(c.name.trim())}`;
  };

  const addSelected = async () => {
    const chosen = contacts.filter((c) => selected.has(c.id));
    if (!chosen.length) return;
    let added = 0;
    let skipped = 0;
    const existingIds = new Set(people.map((p) => p.id));
    const ops: Promise<void>[] = [];
    for (const c of chosen) {
      const contactId = stableIdFor({ email: c.email, phone: c.phone, name: c.name });
      if (existingIds.has(contactId)) {
        skipped++;
      } else {
        added++;
      }
      existingIds.add(contactId);
      ops.push(
        upsertPerson({
          id: contactId,
          name: c.name,
          nickname: c.nickname,
          phone: c.phone,
          email: c.email,
        })
      );
    }
    try {
      await Promise.all(ops);
      setInfo({ added, skipped });
      setContacts([]);
      setSelected(new Set());
    } catch (e: any) {
      console.warn('Add selected failed:', e);
      setAddError(e?.message || 'Could not add selected contacts');
    }
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Section title="Contacts">
      <Banner
        visible={denied}
        message="Contacts permission denied. Tap to try again."
        variant="warning"
        onDismiss={() => setDenied(false)}
      />
      <Banner
        visible={!!addError}
        message={addError || ''}
        variant="error"
        onDismiss={() => setAddError(null)}
      />
      <View style={styles.buttons}>
        <Button title="Import from device" onPress={importContacts} />
      </View>
      {info && (info.added > 0 || info.skipped > 0) && (
        <Text style={styles.info}>
          Imported {info.added}, skipped {info.skipped} duplicates
        </Text>
      )}
      {/* Banner handles denied messaging; keep retry button for redundancy */}
      {denied && (
        <View style={styles.denied}>
          <Button title="Try again" onPress={importContacts} />
        </View>
      )}
      {contacts.length > 0 && (
        <>
          <View style={{ alignSelf: 'center', width: '100%', maxWidth: 360 }}>
            <Field label="Search" value={query} onChangeText={setQuery} />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ListItem
                leading={<Avatar name={item.name} />}
                title={item.name}
                subtitle={item.email || item.phone}
                onPress={() => toggle(item.id)}
                meta={<Text>{selected.has(item.id) ? 'Selected' : 'Tap to select'}</Text>}
                style={styles.item}
              />
            )}
            nestedScrollEnabled
            style={{ maxHeight: 360 }}
          />
          <Button title="Add selected" onPress={addSelected} />
        </>
      )}
      <FlatList
        data={people}
        keyExtractor={g => g.id}
        renderItem={({ item }) => (
          <ListItem
            leading={<Avatar name={item.displayName} />}
            title={item.displayName}
            subtitle={item.email || item.phone}
            onPress={() => navigation.navigate('GooberDetail', { gooberId: item.id })}
            style={styles.item}
          />
        )}
        ListHeaderComponent={<Text style={styles.listTitle}>Stored Goobers</Text>}
        nestedScrollEnabled
      />
    </Section>
  );
}

