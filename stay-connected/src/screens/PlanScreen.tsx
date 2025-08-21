// screens/PlanScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  SafeAreaView,
  View,
  Text,
  Modal,
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
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>{label}</Text>
      <Pressable
        onPress={onPress}
        style={{
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#e5e7eb",
          paddingVertical: 16,
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ fontSize: 16 }}>{value}</Text>
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
  return Platform.OS === "ios" ? (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" }}
      >
        <View
          style={{ backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        >
          <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: 12 }}>
            <Pressable onPress={onClose}>
              <Text style={{ fontSize: 16 }}>{title}</Text>
            </Pressable>
          </View>
          <Picker
            selectedValue={selectedValue}
            onValueChange={(v: any) => onChange(v as T)}
            style={{ height: IOS_WHEEL_HEIGHT, backgroundColor: "white" }}
            itemStyle={{ fontSize: 22, color: "#111827" }}
          >
            {children}
          </Picker>
        </View>
      </View>
    </Modal>
  ) : visible ? (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
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
      console.log("[plans] collection =", col.path); // TODO: remove debug logs
      const ref = await addDoc(col, {
        personId,
        personName,
        startAt: Timestamp.fromDate(start), // ✅ use Firestore Timestamp
        endAt: Timestamp.fromDate(end),     // ✅ use Firestore Timestamp
        durationMin,
        createdAt: serverTimestamp(),
        status: "scheduled",
      });
      console.log("[plans] created ref =", ref.path); // TODO: remove debug logs

      Alert.alert("Plan created");
    } catch (e: any) {
      console.warn("Create plan failed", { code: e.code, msg: e.message, stack: e.stack }); // TODO: remove debug logs
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <Text style={{ fontSize: 32, fontWeight: "800", marginBottom: 10 }}>Plan</Text>

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
        <Text style={{ marginTop: 6, marginBottom: 18, color: "#6b7280" }}>
          {fmtWeekday(date)}
        </Text>
        {Platform.OS === "ios" ? (
          <Modal visible={showDate} animationType="slide" transparent>
            <View
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" }}
            >
              <View
                style={{ backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
              >
                <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: 12 }}>
                  <Pressable onPress={() => setShowDate(false)}>
                    <Text style={{ fontSize: 16 }}>Done</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={(_: any, d?: Date) => d && setDate(d)}
                  style={{ height: IOS_WHEEL_HEIGHT, backgroundColor: "white" }}
                  {...iosWheelProps}
                />
              </View>
            </View>
          </Modal>
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
          <Modal visible={showTime} animationType="slide" transparent>
            <View
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" }}
            >
              <View
                style={{ backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
              >
                <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: 12 }}>
                  <Pressable onPress={() => setShowTime(false)}>
                    <Text style={{ fontSize: 16 }}>Done</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="spinner"
                  onChange={(_: any, d?: Date) => d && setTime(d)}
                  style={{ height: IOS_WHEEL_HEIGHT, backgroundColor: "white" }}
                  {...iosWheelProps}
                />
              </View>
            </View>
          </Modal>
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

        <Pressable
          onPress={onCreatePlan}
          disabled={saving}
          style={{
            backgroundColor: saving ? "#9ca3af" : "#2563eb",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              Create Plan
            </Text>
          )}
        </Pressable>

        <View style={{ gap: 10, marginTop: 12 }}>
          <Pressable
            onPress={onRequestAddToCalendar}
            accessibilityRole="button"
            accessibilityLabel="Add to Calendar"
            style={{
              backgroundColor: "#16a34a",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              Add to Calendar
            </Text>
          </Pressable>

          <Pressable
            onPress={onShareInvite}
            accessibilityRole="button"
            accessibilityLabel="Share Invite (Text)"
            style={{
              backgroundColor: "#2563eb",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              Share Invite (Text)
            </Text>
          </Pressable>

          <Pressable
            onPress={onShareInviteWithICS}
            accessibilityRole="button"
            accessibilityLabel="Share Invite with ICS"
            style={{
              backgroundColor: "#334155",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              Share Invite (.ics)
            </Text>
          </Pressable>
        </View>

        <Modal visible={confirmCalVisible} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.35)",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <View style={{ backgroundColor: "white", borderRadius: 16, padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
                Add to Calendar?
              </Text>
              <Text style={{ marginBottom: 4 }}>Person: {personName}</Text>
              <Text style={{ marginBottom: 4 }}>Date: {date.toLocaleDateString()}</Text>
              <Text style={{ marginBottom: 12 }}>
                Time: {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {durationMin} min
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
                <Pressable onPress={() => setConfirmCalVisible(false)}>
                  <Text style={{ fontSize: 16 }}>Cancel</Text>
                </Pressable>
                <Pressable onPress={onConfirmAddToCalendar}>
                  <Text style={{ fontSize: 16, color: "#2563eb", fontWeight: "600" }}>Add</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
