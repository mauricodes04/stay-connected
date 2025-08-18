import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useStore } from '../state/store';
import { RELATIONSHIPS } from '../types';
import { spacing } from '../theme/spacing';

type RouteParams = { GooberDetail: { gooberId: string } };

export default function GooberDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RouteParams, 'GooberDetail'>>();
  const goober = useStore(s => s.getGooberById(params.gooberId));
  const updateGoober = useStore(s => s.updateGoober);
  const deleteGoober = useStore(s => s.deleteGoober);

  if (!goober) {
    return (
      <View style={styles.center}> 
        <Text>Goober not found</Text>
      </View>
    );
  }

  const [nickname, setNickname] = useState(goober.nickname ?? '');
  const [relationship, setRelationship] = useState(goober.relationship_type);
  const [notes, setNotes] = useState(goober.notes ?? '');

  const save = () => {
    if (!goober.name) {
      Alert.alert('Name is required');
      return;
    }
    if (notes.length > 1000) {
      Alert.alert('Notes too long');
      return;
    }
    updateGoober(goober.id, {
      nickname,
      relationship_type: relationship,
      notes,
    });
    navigation.goBack();
  };

  const del = () => {
    Alert.alert('Delete Goober?', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteGoober(goober.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{goober.name}</Text>
      {goober.birthday && (
        <Text style={styles.value}>Birthday: {goober.birthday}</Text>
      )}
      {goober.phone && (
        <Text style={styles.value}>Phone: {goober.phone}</Text>
      )}
      {goober.email && (
        <Text style={styles.value}>Email: {goober.email}</Text>
      )}

      <Text style={styles.label}>Nickname</Text>
      <TextInput
        value={nickname}
        onChangeText={setNickname}
        style={styles.input}
      />

      <Text style={styles.label}>Relationship</Text>
      <View style={styles.rels}>
        {RELATIONSHIPS.map(r => (
          <Pressable
            key={r}
            onPress={() => setRelationship(r)}
            style={[styles.rel, relationship === r && styles.relActive]}
          >
            <Text>{r}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        style={[styles.input, styles.notes]}
        multiline
      />

      <Button title="Save" onPress={save} />
      <Button title="Delete" onPress={del} color="red" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  label: { marginTop: spacing.md, fontWeight: 'bold' },
  value: { marginTop: spacing.sm / 2 },
  input: {
    borderWidth: 1,
    padding: spacing.sm,
    marginTop: spacing.sm / 2,
  },
  notes: { height: 100 },
  rels: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: spacing.sm },
  rel: {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm / 2,
    borderRadius: 4,
    margin: spacing.sm / 2,
  },
  relActive: { backgroundColor: '#ddd' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
