// screens/PlanScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  SafeAreaView,
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  Share,
  Linking,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Calendar from "expo-calendar";
// @ts-ignore - may be unavailable during development
import * as FileSystem from "expo-file-system";
// @ts-ignore - may be unavailable during development
import * as Sharing from "expo-sharing";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore"; // ⬅️ add Timestamp
import { db } from "@/lib/firebase";
import { ensureSignedIn } from "@/lib/ensureAuth";
import { usePeople } from "@/hooks/usePeople";
import { useTheme } from "@/theme";
import Button from "@/ui/Button";
import ModalSheet from "@/ui/ModalSheet";

const IOS_WHEEL_HEIGHT = 220;
const iosWheelProps =
  Platform.OS === "ios"
    ? ({ themeVariant: "light", textColor: "#111827" } as const)
    : ({} as const);

const toStartEnd = (date: Date, time: Date, durationMin: number) => {
  const start = new Date(date);
  start.setHours(time.getHours(), time.getMinutes(), 0, 0);
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  return { start, end };
};

const fmtDate = (d: Date) => d.toLocaleDateString();
const fmtTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const fmtWeekday = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

// Seconds between Unix epoch (1970-01-01) and Cocoa epoch (2001-01-01)
const COCOA_UNIX_OFFSET_SEC = 978307200; // 31 years in seconds, incl. leap years

const openNativeCalendarAt = async (when: Date) => {
  const ms = when.getTime();
  if (Platform.OS === "ios") {
    // calshow expects seconds since 2001-01-01 00:00:00 GMT
    const secsSinceUnix = Math.floor(ms / 1000);
    const cocoaSecs = secsSinceUnix - COCOA_UNIX_OFFSET_SEC;
    await Linking.openURL(`calshow:${cocoaSecs}`);
  } else {
    await Linking.openURL(`content://com.android.calendar/time/${ms}`);
  }
};

function buildInviteMessage({
  personName,
  start,
  end,
  includeAppTag = true,
}: {
  personName: string;
  start: Date;
  end: Date;
  includeAppTag?: boolean;
}) {
  const dateStr = fmtDate(start);
  const timeStr = fmtTime(start);
  const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);
  const lines = [
    `Hey ${personName}, want to meet up?`,
    `🗓️ ${dateStr} at ${timeStr} (${durationMin} min)`,
    includeAppTag ? `— sent via Stay Connected` : undefined,
  ].filter(Boolean);
  return lines.join("\n");
}

function toICS({
  title,
  start,
  end,
  description,
}: {
  title: string;
  start: Date;
  end: Date;
  description?: string;
}) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const toUTC = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
      d.getUTCHours()
    )}${pad(d.getUTCMinutes())}00Z`;
  const dtStart = toUTC(start);
  const dtEnd = toUTC(end);
  const uid = `${Date.now()}@stayconnected`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Stay Connected//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    description ? `DESCRIPTION:${description.replace(/\n/g, "\\n")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

function FieldButton({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  const { colors, spacing, radii, typography } = useTheme();
  return (
    <View style={{ marginBottom: spacing.m }}>
      <Text style={{ fontSize: typography.label.fontSize, fontWeight: typography.label.fontWeight, color: colors.text.secondary, marginBottom: spacing.xs }}>{label}</Text>
      <Pressable
        onPress={onPress}
        style={{
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.background.elevated,
          paddingVertical: spacing.m,
          paddingHorizontal: spacing.m,
        }}
      >
        <Text style={{ fontSize: typography.body.fontSize, color: colors.text.primary }}>{value}</Text>
      </Pressable>
    </View>
  );
}

function PickerModal<T extends string | number>({
  title = "Done",
  visible,
  onClose,
  selectedValue,
  onChange,
  children,
}: {
  title?: string;
  visible: boolean;
  onClose: () => void;
  selectedValue: T;
  onChange: (v: T) => void;
  children: React.ReactNode;
}) {
  const { colors, radii } = useTheme();
  return Platform.OS === "ios" ? (
    <ModalSheet visible={visible} onClose={onClose} title={title}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={(v: any) => onChange(v as T)}
        style={{ height: IOS_WHEEL_HEIGHT }}
        itemStyle={{ fontSize: 22 }}
      >
        {children}
      </Picker>
    </ModalSheet>
  ) : visible ? (
    <View
      style={{
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.background.elevated,
        marginBottom: 12,
      }}
    >
      <Picker selectedValue={selectedValue} onValueChange={(v: any) => onChange(v as T)}>
        {children}
      </Picker>
    </View>
  ) : null;
}

export default function PlanScreen() {
  const { people } = usePeople();
  const { colors, spacing, typography } = useTheme();

  const [personId, setPersonId] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  const [durationMin, setDurationMin] = useState<number>(60);
  const [saving, setSaving] = useState(false);

  const [showPerson, setShowPerson] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [confirmCalVisible, setConfirmCalVisible] = useState(false);

  useEffect(() => {
    if (!personId && people.length) setPersonId(people[0].id);
  }, [people, personId]);

  const durationOptions = useMemo(
    () => Array.from({ length: 16 }, (_, i) => (i + 1) * 15),
    []
  );

  const personName =
    people.find(p => p.id === personId)?.displayName ?? "Select person";

  const onCreatePlan = useCallback(async () => {
    try {
      setSaving(true);
      const uid = await ensureSignedIn(); // 🔒 ensure auth first

      if (!personId) return Alert.alert("Pick a person");
      if (!durationMin) return Alert.alert("Pick a duration");
      const { start, end } = toStartEnd(date, time, durationMin);

      const col = collection(db, "users", uid, "plans");
      await addDoc(col, {
        personId,
        personName,
        startAt: Timestamp.fromDate(start), // ✅ use Firestore Timestamp
        endAt: Timestamp.fromDate(end),     // ✅ use Firestore Timestamp
        durationMin,
        createdAt: serverTimestamp(),
        status: "scheduled",
      });

      Alert.alert("Plan created");
    } catch (e: any) {
      Alert.alert("Could not create plan", e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }, [personId, personName, date, time, durationMin]);

  const onRequestAddToCalendar = () => setConfirmCalVisible(true);

  const onConfirmAddToCalendar = async () => {
    try {
      setConfirmCalVisible(false);
      const { start, end } = toStartEnd(date, time, durationMin);
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Calendar permission denied");
        return;
      }
      const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const calId = cals.find(c => c.allowsModifications)?.id ?? cals[0]?.id;
      if (!calId) {
        Alert.alert("No calendar found");
        return;
      }
      await Calendar.createEventAsync(calId, {
        title: `Plan with ${personName}`,
        startDate: start,
        endDate: end,
        notes: "Created from Stay Connected",
      });
      await openNativeCalendarAt(start);
    } catch (e: any) {
      Alert.alert("Could not add calendar event", e?.message ?? String(e));
    }
  };

  const onShareInvite = async () => {
    const { start, end } = toStartEnd(date, time, durationMin);
    const message = buildInviteMessage({ personName, start, end });
    try {
      await Share.share({ message });
    } catch {
      Alert.alert("Could not open share sheet");
    }
  };

  const onShareInviteWithICS = async () => {
    try {
      const { start, end } = toStartEnd(date, time, durationMin);
      const title = `Plan with ${personName}`;
      const message = buildInviteMessage({ personName, start, end });
      const ics = toICS({ title, start, end, description: message });
      const path = `${FileSystem.cacheDirectory}invite-${Date.now()}.ics`;
      await FileSystem.writeAsStringAsync(path, ics, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, {
          mimeType: "text/calendar",
          dialogTitle: "Share invite",
          UTI: "public.ics",
        });
      } else {
        await Share.share({ message });
      }
    } catch {
      Alert.alert("Could not share invite");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <View style={{ paddingHorizontal: spacing.m, paddingTop: spacing.s }}>
        <Text style={{ fontSize: typography.h1.fontSize, fontWeight: typography.h1.fontWeight as any, marginBottom: spacing.s, color: colors.text.primary }}>Plan</Text>

        {/* Person */}
        <FieldButton label="Person" value={personName} onPress={() => setShowPerson(true)} />
        <PickerModal
          visible={showPerson}
          onClose={() => setShowPerson(false)}
          selectedValue={personId}
          onChange={v => setPersonId(String(v))}
        >
          {people.length === 0 ? (
            <Picker.Item label="No contacts found" value="" color="#6b7280" />
          ) : (
            people.map(p => <Picker.Item key={p.id} label={p.displayName} value={p.id} />)
          )}
        </PickerModal>

        {/* Date */}
        <FieldButton
          label="Date"
          value={date.toLocaleDateString()}
          onPress={() => setShowDate(true)}
        />
        <Text style={{ marginTop: 6, marginBottom: 18, color: colors.text.secondary }}>
          {fmtWeekday(date)}
        </Text>
        {Platform.OS === "ios" ? (
          <ModalSheet visible={showDate} onClose={() => setShowDate(false)} title="Done">
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={(_: any, d?: Date) => d && setDate(d)}
              style={{ height: IOS_WHEEL_HEIGHT }}
              {...iosWheelProps}
            />
          </ModalSheet>
        ) : (
          showDate && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(_: any, d?: Date) => {
                setShowDate(false);
                if (d) setDate(d);
              }}
            />
          )
        )}

        {/* Time */}
        <FieldButton
          label="Time"
          value={time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          onPress={() => setShowTime(true)}
        />
        {Platform.OS === "ios" ? (
          <ModalSheet visible={showTime} onClose={() => setShowTime(false)} title="Done">
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              onChange={(_: any, d?: Date) => d && setTime(d)}
              style={{ height: IOS_WHEEL_HEIGHT }}
              {...iosWheelProps}
            />
          </ModalSheet>
        ) : (
          showTime && (
            <DateTimePicker
              value={time}
              mode="time"
              onChange={(_: any, d?: Date) => {
                setShowTime(false);
                if (d) setTime(d);
              }}
            />
          )
        )}

        {/* Duration */}
        <FieldButton
          label="Duration (min)"
          value={`${durationMin}`}
          onPress={() => setShowDuration(true)}
        />
        <PickerModal
          visible={showDuration}
          onClose={() => setShowDuration(false)}
          selectedValue={durationMin}
          onChange={v => setDurationMin(Number(v))}
        >
          {durationOptions.map(m => (
            <Picker.Item key={m} label={`${m}`} value={m} />
          ))}
        </PickerModal>

        <Button
          title={saving ? "Creating..." : "Create Plan"}
          onPress={onCreatePlan}
          disabled={saving}
          loading={saving}
          style={{ marginTop: spacing.s }}
        />

        <View style={{ gap: 10, marginTop: 12 }}>
          <Button title="Add to Calendar" onPress={onRequestAddToCalendar} />

          <Button title="Share Invite (Text)" onPress={onShareInvite} />

          <Button title="Share Invite (.ics)" onPress={onShareInviteWithICS} variant="secondary" />
        </View>

        <ModalSheet visible={confirmCalVisible} onClose={() => setConfirmCalVisible(false)} title="Add to Calendar?"
          footer={
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.s }}>
              <Button title="Cancel" variant="secondary" onPress={() => setConfirmCalVisible(false)} />
              <Button title="Add" onPress={onConfirmAddToCalendar} />
            </View>
          }
        >
          <Text style={{ marginBottom: spacing.xs, color: colors.text.primary }}>Person: {personName}</Text>
          <Text style={{ marginBottom: spacing.xs, color: colors.text.primary }}>Date: {date.toLocaleDateString()}</Text>
          <Text style={{ color: colors.text.secondary }}>
            Time: {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {durationMin} min
          </Text>
        </ModalSheet>
      </View>
    </SafeAreaView>
  );
}
