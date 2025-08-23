import React from 'react';
import { View } from 'react-native';
import { RELATIONSHIPS } from '../../types';
import { useTheme } from '@/theme';
import { Field } from '@/ui/Field';
import { Chip } from '@/ui/Chip';
import { Button } from '@/ui/Button';

type Props = {
  nickname: string;
  relationship: string;
  notes: string;
  onChangeNickname: (s: string) => void;
  onChangeRelationship: (s: string) => void;
  onChangeNotes: (s: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
};

export const EditGooberForm: React.FC<Props> = ({
  nickname,
  relationship,
  notes,
  onChangeNickname,
  onChangeRelationship,
  onChangeNotes,
  onSave,
  onCancel,
  onDelete,
}) => {
  const { spacing } = useTheme();
  return (
    <View>
      <Field label="Nickname" value={nickname} onChangeText={onChangeNickname} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: spacing.s }}>
        {RELATIONSHIPS.map(r => (
          <Chip key={r} label={r} selected={relationship === r} onPress={() => onChangeRelationship(r)} />
        ))}
      </View>
      <Field label="Notes" value={notes} onChangeText={onChangeNotes} multiline />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.m }}>
        <Button title="Cancel" variant="secondary" onPress={onCancel} />
        <Button title="Save" onPress={onSave} />
      </View>
      <View style={{ marginTop: spacing.m }}>
        <Button title="Delete" variant="destructive" onPress={onDelete} />
      </View>
    </View>
  );
};

export default EditGooberForm;

