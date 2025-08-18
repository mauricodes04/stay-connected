import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  Alert,
  Share,
  StyleSheet,
} from 'react-native';
import { Section } from '../components/Section';
import { spacing } from '../theme/spacing';
import {
  requestCalendarPermissions,
  getDefaultCalendarId,
  findConflicts,
  createEventInDefaultCalendar,
  deleteEventById as deleteCalendarEvent,
} from '../services/calendar';
import { useStore } from '../state/store';

const people = ['Alice', 'Bob', 'Charlie'];
const times = ['09:00', '12:00', '15:00'];

export default function PlanScreen() {
  const { addOrUpdateEvent, events } = useStore(s => ({
    addOrUpdateEvent: s.addOrUpdateEvent,
    events: s.events,
  }));
  const [person, setPerson] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState(60);
  const [eventId, setEventId] = useState<string | null>(null);

  const buildTitle = () => `${person} — ${activity || 'Meetup'}`;
  const inviteText = () =>
    `${buildTitle()} at ${time}${location ? ' @ ' + location : ''}`;

  const buildStart = () => {
    const [h, m] = (time ?? '00:00').split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const planEvent = async (overwrite: boolean, start: Date, end: Date) => {
    if (overwrite && eventId) {
      const existing = events.find(e => e.id === eventId);
      if (existing?.calendarEventId) {
        await deleteCalendarEvent(existing.calendarEventId);
      }
    }
    const calendarEventId = await createEventInDefaultCalendar({
      title: buildTitle(),
      startDate: start,
      endDate: end,
      location: location || undefined,
    });
    const id = eventId ?? Date.now().toString();
    addOrUpdateEvent({
      id,
      gooberId: person!,
      title: buildTitle(),
      start: start.toISOString(),
      end: end.toISOString(),
      location: location || undefined,
      calendarEventId,
    });
    setEventId(id);
    Alert.alert('Success', `Event ${calendarEventId}`);
  };

  const suggestTimes = (overwrite: boolean, base: Date) => {
    Alert.alert('Choose time', '', [
      { text: '+30m', onPress: () => tryOffset(30) },
      { text: '+60m', onPress: () => tryOffset(60) },
      { text: '+90m', onPress: () => tryOffset(90) },
      { text: 'Cancel', style: 'cancel' },
    ]);

    async function tryOffset(off: number) {
      const s = new Date(base.getTime() + off * 60000);
      const e = new Date(s.getTime() + duration * 60000);
      if (await findConflicts(s, e)) {
        Alert.alert('Conflict still', 'Pick another time');
      } else {
        planEvent(overwrite, s, e);
      }
    }
  };

  const runFlow = async (overwrite: boolean) => {
    if (!person || !time) return;
    const granted = await requestCalendarPermissions();
    if (!granted) {
      Alert.alert('Permission denied');
      return;
    }
    const calId = await getDefaultCalendarId();
    if (!calId) {
      Alert.alert('No calendar found', 'Enable a calendar account');
      return;
    }
    const start = buildStart();
    const end = new Date(start.getTime() + duration * 60000);
    if (await findConflicts(start, end)) {
      Alert.alert('Conflict', 'Event overlaps', [
        { text: 'Overwrite', onPress: () => planEvent(true, start, end) },
        {
          text: 'Choose different time',
          onPress: () => suggestTimes(overwrite, start),
        },
        { text: 'Keep both', onPress: () => planEvent(false, start, end) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      planEvent(overwrite, start, end);
    }
  };

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
      <TextInput
        placeholder="Activity/Place"
        value={activity}
        onChangeText={setActivity}
        style={styles.input}
      />
      <TextInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      <View style={styles.row}>
        {[30, 60, 90].map(d => (
          <Button key={d} title={`${d}`} onPress={() => setDuration(d)} />
        ))}
      </View>
      {person && time && (
        <>
          <Button
            title="Preview Invite"
            onPress={() => Alert.alert('Invite', inviteText())}
          />
          <Button
            title="Share Invite"
            onPress={() => Share.share({ message: inviteText() })}
          />
          <Button
            title="Add to Calendar"
            onPress={() => runFlow(false)}
          />
          <Button
            title="Update Calendar"
            onPress={() => runFlow(true)}
          />
        </>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: spacing.sm,
    marginVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.sm,
  },
});
