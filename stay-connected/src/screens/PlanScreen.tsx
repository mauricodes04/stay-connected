import React, { useMemo, useState } from "react";
import { Platform, SafeAreaView, View, Text, Modal, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

type Person = { id: string; name: string };

// TODO: replace with real contacts from your store if present.
const MOCK_PEOPLE: Person[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Brandon" },
  { id: "3", name: "Carla" },
];

function FieldButton({
  label,
  value,
  onPress,
}: { label: string; value: string; onPress: () => void }) {
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
  children: React.ReactNode; // Picker.Item elements
}) {
  return Platform.OS === "ios" ? (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: 12 }}>
            <Pressable onPress={onClose}><Text style={{ fontSize: 16 }}>{title}</Text></Pressable>
          </View>
          <Picker
            selectedValue={selectedValue}
            onValueChange={(v: any) => onChange(v as T)}
            style={{ height: 220, backgroundColor: "white" }}
            itemStyle={{ fontSize: 22, color: "#111827" }}
          >
            {children}
          </Picker>
        </View>
      </View>
    </Modal>
  ) : (
    // On Android we can just render an inline Picker when "visible" is true.
    visible ? (
      <View style={{ borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 12 }}>
        <Picker selectedValue={selectedValue} onValueChange={(v: any) => onChange(v as T)}>
          {children}
        </Picker>
      </View>
    ) : null
  );
}

export default function PlanScreen() {
  // Wire to your contacts if available; otherwise use mock.
  const people: Person[] = MOCK_PEOPLE;

  const [personId, setPersonId] = useState<string>(people[0]?.id ?? "");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  const [durationMin, setDurationMin] = useState<number>(60);

  const [showPerson, setShowPerson] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const durationOptions = useMemo(
    () => Array.from({ length: 16 }, (_, i) => (i + 1) * 15), // 15..240
    []
  );

  const personName = people.find(p => p.id === personId)?.name ?? "Select person";

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
          onChange={(v) => setPersonId(String(v))}
        >
          {people.length === 0
            ? <Picker.Item label="No contacts found" value="" color="#6b7280" />
            : people.map(p => <Picker.Item key={p.id} label={p.name} value={p.id} />)}
        </PickerModal>

        {/* Date */}
        <FieldButton label="Date" value={date.toLocaleDateString()} onPress={() => setShowDate(true)} />
        {Platform.OS === "ios" ? (
          <Modal visible={showDate} animationType="slide" transparent>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" }}>
              <View style={{ backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: 12 }}>
                  <Pressable onPress={() => setShowDate(false)}><Text style={{ fontSize: 16 }}>Done</Text></Pressable>
                </View>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={(_: any, d?: Date) => d && setDate(d)}
                  style={{ height: 220 }}
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
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" }}>
              <View style={{ backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: 12 }}>
                  <Pressable onPress={() => setShowTime(false)}><Text style={{ fontSize: 16 }}>Done</Text></Pressable>
                </View>
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="spinner"
                  onChange={(_: any, d?: Date) => d && setTime(d)}
                  style={{ height: 220 }}
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
        <FieldButton label="Duration (min)" value={`${durationMin}`} onPress={() => setShowDuration(true)} />
        <PickerModal
          visible={showDuration}
          onClose={() => setShowDuration(false)}
          selectedValue={durationMin}
          onChange={(v) => setDurationMin(Number(v))}
        >
          {durationOptions.map(m => <Picker.Item key={m} label={`${m}`} value={m} />)}
        </PickerModal>
      </View>
    </SafeAreaView>
  );
}

