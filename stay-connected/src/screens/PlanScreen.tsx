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
  Animated,
  KeyboardAvoidingView,
  ScrollView,
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
import Header from "@/ui/Header";
import ModalSheet from "@/ui/ModalSheet";
import Dialog from "@/ui/Dialog";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import PlanCard from '@/ui/PlanCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

// Small pill component with success animation (green bg + check)
function Chip({ label, onPress }: { label: string; onPress: () => void | Promise<void>; }) {
  const { colors } = useTheme();
  const bg = React.useRef(new Animated.Value(0)).current; // 0=normal,1=success
  const checkOpacity = React.useRef(new Animated.Value(0)).current;
  const runSuccess = () => {
    Animated.parallel([
      Animated.timing(bg, { toValue: 1, duration: 150, useNativeDriver: false }),
      Animated.timing(checkOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(bg, { toValue: 0, duration: 180, useNativeDriver: false }),
          Animated.timing(checkOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]).start();
      }, 600);
    });
  };
  const backgroundColor = bg.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#10B981'], // emerald-500
  });
  const borderColor = bg.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.text.primary + '66', '#10B981'],
  });
  const textColor = bg.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.text.primary, '#FFFFFF'],
  });
  return (
    <Pressable
      onPress={async () => {
        try {
          await onPress();
        } finally {
          runSuccess();
        }
      }}
      style={{ paddingHorizontal: 12, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={{ paddingHorizontal: 12, height: 36, borderRadius: 999, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, backgroundColor, borderColor }}>
        <Animated.Text style={{ fontFamily: 'Poppins_500Medium', color: textColor }}>{label}</Animated.Text>
        <Animated.Text style={{ color: '#FFFFFF', opacity: checkOpacity }}>✓</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

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
  placeholder,
}: {
  label: string;
  value: string;
  onPress: () => void;
  placeholder?: boolean;
}) {
  const { colors, spacing, radii, typography } = useTheme();
  return (
    <View style={{ marginBottom: spacing.s }}>
      <Text style={{ fontSize: 13, lineHeight: 18, fontFamily: 'Poppins_500Medium', color: colors.text.secondary, marginBottom: spacing.xs }}>{label}</Text>
      <Pressable
        onPress={onPress}
        style={{
          borderRadius: radii.lg,
          backgroundColor: '#FFFFFF',
          // shadow.sm
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
          paddingHorizontal: 16,
          minHeight: 48,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 16, lineHeight: 22, fontFamily: 'Poppins_500Medium', color: placeholder ? colors.text.tertiary : colors.text.primary }}>{value}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      </Pressable>
    </View>
  );
}

function PickerModal<T extends string | number>({
  title = "Select",
  visible,
  onClose,
  selectedValue,
  onChange,
  children,
}: {
  title?: string;
  visible: boolean;
  onClose: () => void;
  selectedValue: T | undefined;
  onChange: (v: T) => void;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <ModalSheet visible={visible} onClose={onClose} title={title}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 9999, borderWidth: 1, borderColor: colors.text.secondary + '33', alignSelf: "flex-end" }}
        >
          <Text style={{ color: colors.text.primary, fontFamily: "Poppins_500Medium" }}>Done</Text>
        </Pressable>
      </View>
      <Picker
        selectedValue={selectedValue}
        onValueChange={(v: any) => onChange(v as T)}
        style={{ height: IOS_WHEEL_HEIGHT }}
        itemStyle={{ fontSize: 22, color: colors.text.primary, fontFamily: 'Poppins_500Medium' }}
      >
        {children}
      </Picker>
    </ModalSheet>
  );
}

export default function PlanScreen() {
  const { people } = usePeople();
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [personId, setPersonId] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  const [durationMin, setDurationMin] = useState<number>(60);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const shakeX = React.useRef(new Animated.Value(0)).current; // -1..1
  const successScale = React.useRef(new Animated.Value(1)).current;
  const successOpacity = React.useRef(new Animated.Value(0)).current;

  const [showPerson, setShowPerson] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [timeGridVisible, setTimeGridVisible] = useState(false);
  const [confirmCalVisible, setConfirmCalVisible] = useState(false);
  // Inline success preview inside Confirm dialog
  const [showPreview, setShowPreview] = useState(false);
  const previewOpacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!personId && people.length) setPersonId(people[0].id);
  }, [people, personId]);

  const durationOptions = useMemo(
    () => Array.from({ length: 16 }, (_, i) => (i + 1) * 15),
    []
  );

  const personName =
    people.find(p => p.id === personId)?.displayName ?? "Select person";

  const onCreatePlan = useCallback(async (): Promise<boolean> => {
    try {
      setSaving(true);
      const uid = await ensureSignedIn(); // 🔒 ensure auth first

      if (!personId || !durationMin) {
        // error shake
        Animated.sequence([
          Animated.timing(shakeX, { toValue: 1, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: -1, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
        return false;
      }
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

      // success morph: show checkmark pulse then revert
      setSavedOk(true);
      successOpacity.setValue(0);
      successScale.setValue(0.8);
      Animated.parallel([
        Animated.timing(successOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(successScale, { toValue: 1, useNativeDriver: true, bounciness: 10 }),
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(successOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setSavedOk(false));
        }, 800);
      });
      return true;
    } catch (e: any) {
      Alert.alert("Could not create plan", e?.message ?? String(e));
      return false;
    } finally {
      setSaving(false);
    }
  }, [personId, personName, date, time, durationMin, shakeX, successOpacity, successScale]);

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

  // Direct calendar flow used from Confirm dialog without stacking another modal
  const onCalendarChip = async () => {
    try {
      const { start, end } = toStartEnd(date, time, durationMin);
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Calendar permission denied');
        return;
      }
      const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const calId = cals.find(c => c.allowsModifications)?.id ?? cals[0]?.id;
      if (!calId) {
        Alert.alert('No calendar found');
        return;
      }
      await Calendar.createEventAsync(calId, {
        title: `Plan with ${personName}`,
        startDate: start,
        endDate: end,
        notes: 'Created from Stay Connected',
      });
      // Small success animation: show a preview PlanCard fade-in
      setShowPreview(true);
      previewOpacity.setValue(0);
      Animated.timing(previewOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start(() => {
        setTimeout(() => {
          Animated.timing(previewOpacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setShowPreview(false));
        }, 900);
      });
    } catch (e: any) {
      Alert.alert('Could not add calendar event', e?.message ?? String(e));
    }
  };

  // Build a 3-column time grid (every 30 minutes) for the current day
  const gridTimes = useMemo(() => {
    const arr: Date[] = [];
    const base = new Date();
    base.setHours(0,0,0,0);
    for (let i = 0; i < 48; i++) {
      const d = new Date(base.getTime() + i * 30 * 60000);
      arr.push(d);
    }
    return arr;
  }, []);

  const TimeGridDialog = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
    const { colors, radii, spacing } = useTheme();
    return (
      <Dialog visible={visible} onClose={onClose} title="Select Time">
        <View style={{ width: 320, maxWidth: '100%', maxHeight: 420 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
              {gridTimes.map((d) => {
                const isSel = time.getHours() === d.getHours() && time.getMinutes() === d.getMinutes();
                return (
                  <Pressable
                    key={d.getTime()}
                    accessibilityRole="button"
                    onPress={() => { setTime(d); onClose(); }}
                    style={{
                      width: '33.3333%',
                      paddingHorizontal: 6,
                      paddingVertical: 6,
                    }}
                  >
                    <View
                      style={{
                        height: 48,
                        borderRadius: radii.full,
                        borderWidth: isSel ? 0 : 1.5,
                        borderColor: colors.text.secondary + '33',
                        backgroundColor: isSel ? colors.accent.primary : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{
                        color: isSel ? '#FFFFFF' : colors.text.primary,
                        fontFamily: isSel ? 'Poppins_600SemiBold' : 'Poppins_500Medium',
                      }}>
                        {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </Dialog>
    );
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
      <Header title="Plan" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={insets.top + 56} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: insets.bottom + 24 + 83,
            minHeight: '100%',
            paddingHorizontal: spacing.m,
          }}
        >
        <Text style={{ textAlign: 'center', color: colors.text.secondary, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight, marginBottom: spacing.m, fontFamily: 'Poppins_400Regular' }}>
          Build your plan by choosing a person, date, time, and duration.
        </Text>

        {/* Person */}
        <FieldButton label="Person" value={personName} onPress={() => setShowPerson(true)} placeholder={!personId} />
        <PickerModal
          visible={showPerson}
          onClose={() => setShowPerson(false)}
          selectedValue={personId}
          onChange={v => setPersonId(String(v))}
        >
          {people.length === 0 ? (
            <Picker.Item label="No contacts found" value="" color="#6b7280" />
          ) : (
            people.map(p => (
              <Picker.Item key={p.id} label={p.displayName} value={p.id} color={colors.text.primary} />
            ))
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
        {showDate && (
          <ModalSheet visible={showDate} onClose={() => setShowDate(false)} title="Select Date">
            <View style={{ paddingHorizontal: 4, paddingBottom: 8 }}>
              <View style={{ alignItems: 'flex-end' }}>
                <Pressable onPress={() => setShowDate(false)} style={{ paddingHorizontal: 14, height: 36, borderRadius: 999, borderWidth: 1.5, borderColor: '#00000022', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: 'Poppins_500Medium' }}>Done</Text>
                </Pressable>
              </View>
            </View>
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={(_: any, d?: Date) => d && setDate(d)}
              style={{ height: IOS_WHEEL_HEIGHT }}
              {...iosWheelProps}
            />
          </ModalSheet>
        )}

        {/* Time */}
        <FieldButton
          label="Time"
          value={time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          onPress={() => setTimeGridVisible(true)}
        />
        <TimeGridDialog visible={timeGridVisible} onClose={() => setTimeGridVisible(false)} />

        {/* Duration */}
        <FieldButton
          label="Duration (min)"
          value={`${durationMin}`}
          onPress={() => setShowDuration(true)}
        />
        <PickerModal
          title="Select Duration"
          visible={showDuration}
          onClose={() => setShowDuration(false)}
          selectedValue={durationMin}
          onChange={v => setDurationMin(Number(v))}
        >
          {durationOptions.map(m => (
            <Picker.Item key={m} label={`${m}`} value={m} color={colors.text.primary} />
          ))}
        </PickerModal>

        <Animated.View
          style={{
            marginTop: spacing.s,
            transform: [{ translateX: shakeX.interpolate({ inputRange: [-1, 1], outputRange: [-20, 20] }) }],
          }}
        >
          <Button
            title={saving ? "Creating..." : "Create Plan"}
            onPress={() => {
              if (!personId || !durationMin) {
                Animated.sequence([
                  Animated.timing(shakeX, { toValue: 1, duration: 50, useNativeDriver: true }),
                  Animated.timing(shakeX, { toValue: -1, duration: 100, useNativeDriver: true }),
                  Animated.timing(shakeX, { toValue: 1, duration: 100, useNativeDriver: true }),
                  Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
                ]).start();
                return;
              }
              setConfirmVisible(true);
            }}
            disabled={saving}
            loading={saving}
          />
          {savedOk && (
            <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', opacity: successOpacity, transform: [{ scale: successScale }] }}>
              <Text style={{ fontSize: 22, color: colors.text.inverse }}>✓</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Removed extra action buttons; these live in the confirm dialog */}

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

        {/* Confirm Plan Dialog */
        }
        <Dialog
          visible={confirmVisible}
          onClose={() => setConfirmVisible(false)}
          title="Confirm Plan"
          footer={
            <View style={{ gap: spacing.m }}>
              {/* Primary CTA first */}
              <Button
                title="+ Create Plan"
                onPress={async () => {
                  // Close dialog immediately so label doesn't show during checkmark animation
                  setConfirmVisible(false);
                  const ok = await onCreatePlan();
                  if (ok) {
                    // Give the checkmark animation a moment before navigating
                    setTimeout(() => {
                      navigation.navigate('History');
                    }, 650);
                    // ensure state is clean
                    setTimeout(() => {
                      setSaving(false);
                      setConfirmCalVisible(false);
                      setShowPreview(false);
                    }, 0);
                  }
                }}
              />
              {/* Secondary options under primary, centered; tapping these should NOT close the dialog */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.s, flexWrap: 'wrap' }}>
                <Chip label="Calendar" onPress={onCalendarChip} />
                <Chip label="Text" onPress={onShareInvite} />
                <Chip label="ICS" onPress={onShareInviteWithICS} />
              </View>
              {showPreview ? (
                <Animated.View style={{ opacity: previewOpacity }}>
                  <View style={{ marginTop: spacing.s }}>
                    <PlanCard
                      title={`Plan with ${personName}`}
                      personName={personName}
                      dateLabel={`${fmtDate(date)} • ${fmtTime(time)}`}
                      durationMin={durationMin}
                      status={'scheduled'}
                    />
                  </View>
                </Animated.View>
              ) : null}
            </View>
          }
        >
          <View style={{ alignItems: 'center', marginBottom: spacing.s }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent.primary + '22', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.s }}>
              <Ionicons name="calendar" size={28} color={colors.accent.primary} />
            </View>
            <Text style={{ color: colors.text.secondary, textAlign: 'center' }}>
              {fmtDate(date)} • {fmtTime(time)} • {durationMin} min
            </Text>
          </View>
        </Dialog>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
