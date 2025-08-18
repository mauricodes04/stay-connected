import React, { useState } from 'react';
import {
  Text,
  Button,
  TextInput,
  Alert,
  Share,
  StyleSheet,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
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

function roundToNext30(d: Date = new Date()) {
  const date = new Date(d);
  date.setMinutes(date.getMinutes() + 30 - (date.getMinutes() % 30), 0, 0);
  return date;
}

export default function PlanScreen() {
  const { goobers, addOrUpdateEvent, events } = useStore(s => ({
    goobers: s.goobers,
    addOrUpdateEvent: s.addOrUpdateEvent,
    events: s.events,
  }));

  const [gooberId, setGooberId] = useState<string | undefined>();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(roundToNext30());
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState(60);
  const [eventId, setEventId] = useState<string | null>(null);

  const goober = goobers.find(g => g.id === gooberId);
  const gooberName = goober?.nickname || goober?.name || '';

  const buildTitle = () => `${gooberName} — ${activity || 'Meetup'}`;
  const buildStart = () => {
    const start = new Date(date);
    start.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return start;
  };
  const inviteText = () => {
    const start = buildStart();
    const when = start.toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    return `${buildTitle()} at ${when}${location ? ' @ ' + location : ''}`;
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
      gooberId: gooberId!,
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
    if (!goober) return;
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

  const onDateChange = (_: DateTimePickerEvent, d?: Date) => {
    if (d) setDate(d);
  };
  const onTimeChange = (_: DateTimePickerEvent, d?: Date) => {
    if (d) setTime(d);
  };
  const onGooberChange = (v: string) => {
    setGooberId(v || undefined);
  };

  return (
    <Section title="Plan">
      <Text>Person</Text>
      <Picker
        selectedValue={gooberId ?? ''}
        onValueChange={onGooberChange}
        enabled={goobers.length > 0}
      >
        {goobers.length === 0 ? (
          <Picker.Item label="Add contacts first" value="" />
        ) : (
          <>
            <Picker.Item label="Select person" value="" />
            {goobers.map(g => (
              <Picker.Item
                key={g.id}
                label={g.nickname || g.name}
                value={g.id}
              />
            ))}
          </>
        )}
      </Picker>

      <Text>Date</Text>
      <DateTimePicker
        value={date}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={onDateChange}
      />

      <Text>Time</Text>
      <DateTimePicker
        value={time}
        mode="time"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={onTimeChange}
      />

      <Text>Duration (min)</Text>
      <Picker selectedValue={duration} onValueChange={setDuration}>
        {[30, 60, 90, 120].map(dur => (
          <Picker.Item key={dur} label={`${dur}`} value={dur} />
        ))}
      </Picker>

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

      {!goober && (
        <Text style={styles.hint}>Select a person to enable actions</Text>
      )}

      <Button
        title="Preview Invite"
        onPress={() => Alert.alert('Invite', inviteText())}
        disabled={!goober}
      />
      <Button
        title="Share Invite"
        onPress={() => Share.share({ message: inviteText() })}
        disabled={!goober}
      />
      <Button
        title="Add to Calendar"
        onPress={() => runFlow(false)}
        disabled={!goober}
      />
      <Button
        title="Update Calendar"
        onPress={() => runFlow(true)}
        disabled={!goober}
      />
    </Section>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: spacing.sm,
    marginVertical: spacing.sm,
  },
  hint: { marginVertical: spacing.sm },
});

