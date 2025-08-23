/* eslint-disable react-native/no-unused-styles */
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { usePeople } from '@/hooks/usePeople';
import { ensureSignedIn } from '@/lib/ensureAuth';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useTheme } from '@/theme';
import { Button } from '@/ui/Button';
import EditGooberForm from './components/EditGooberForm';

import { RELATIONSHIPS } from '@/types';

type RouteParams = { GooberDetail: { gooberId: string } };

export default function GooberDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RouteParams, 'GooberDetail'>>();
  const { people, upsertPerson } = usePeople();
  const { colors, spacing, radii } = useTheme();

  const [nickname, setNickname] = useState('');
  const [relationship, setRelationship] = useState<string>(RELATIONSHIPS[0]);
  const [notes, setNotes] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const goober = people.find(p => p.id === params.gooberId);

  useEffect(() => {
    if (goober) {
      setNickname(goober.nickname ?? '');
      setRelationship(goober.relationship_type);
      setNotes(goober.notes ?? '');
    }
  }, [goober]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          padding: spacing.m,
          backgroundColor: colors.background.app,
          flexGrow: 1,
        },
        label: { marginTop: spacing.m, fontWeight: 'bold', color: colors.text.secondary },
        value: { marginTop: spacing.s / 2, color: colors.text.primary },
        card: {
          backgroundColor: colors.background.surface,
          borderRadius: radii.md,
          padding: spacing.m,
        },
        center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        editBtn: { marginTop: spacing.l },
        modalBackdrop: {
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: `${colors.text.primary}88`,
        },
        modalSheet: {
          backgroundColor: colors.background.surface,
          padding: spacing.m,
          borderTopLeftRadius: radii.lg,
          borderTopRightRadius: radii.lg,
        },
        modalActions: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginTop: spacing.m,
        },
      }),
    [colors, spacing, radii]
  );

  const save = async () => {
    if (!goober?.name) return;
    if (notes.length > 1000) return;
    await upsertPerson({
      id: goober.id,
      name: goober.name,
      nickname,
      relationship_type: relationship,
      notes,
      phone: goober.phone,
      email: goober.email,
    });
    setEditMode(false);
  };

  const confirmDelete = async () => {
    try {
      const uid = await ensureSignedIn();
      await deleteDoc(doc(db, 'users', uid, 'contacts', params.gooberId));
    } catch (e) {
      console.warn('delete failed', e);
    }
    setShowDelete(false);
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!goober && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent.primary} />
        </View>
      )}
      {goober && !editMode && (
        <View style={styles.card}>
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
          <Button title="Edit" onPress={() => setEditMode(true)} style={styles.editBtn} />
        </View>
      )}
      {goober && editMode && (
        <EditGooberForm
          nickname={nickname}
          relationship={relationship}
          notes={notes}
          onChangeNickname={setNickname}
          onChangeRelationship={setRelationship}
          onChangeNotes={setNotes}
          onSave={save}
          onCancel={() => setEditMode(false)}
          onDelete={() => setShowDelete(true)}
        />
      )}
      <Modal
        visible={showDelete}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDelete(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.label}>Delete Goober?</Text>
            <Text style={styles.value}>This cannot be undone.</Text>
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="secondary" onPress={() => setShowDelete(false)} />
              <View style={{ width: spacing.m }} />
              <Button title="Delete" variant="destructive" onPress={confirmDelete} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

