// app/screens/PlanScreen.tsx
import React, { useMemo, useState } from "react";
import { Platform, SafeAreaView, View, Text, Modal, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

type Person = { id: string; name: string };

// TODO: replace with your contacts data
const MOCK_PEOPLE: Person[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Brandon" },
  { id: "3", name: "Carla" },
];

export default function PlanScreen() {
  const [personId, setPersonId] = useState<string>(MOCK_PEOPLE[0]?.id ?? "");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  const [durationMin, setDurationMin] = useState<number>(60);

  // UI state for iOS modals
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const durationOptions = useMemo(() => {
    // 15–240 minutes, step 15
    return Array.from({ length: 16 }, (_, i) => (i + 1) * 15);
  }, []);

  const selectedPerson = useMemo(
    () => MOCK_PEOPLE.find(p => p.id === personId)?.name ?? "Select",
    [personId]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 10 }}>Plan</Text>

        {/* Person (wheel on iOS, dropdown on Android) */}
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Person</Text>
        <View
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            overflow: "hidden",
            marginBottom: 24,
            height: Platform.OS === "ios" ? 180 : undefined,
            justifyContent: "center",
          }}
        >
          <Picker
            selectedValue={personId}
            onValueChange={v => setPersonId(String(v))}
            itemStyle={{ fontSize: 18 }}
          >
            {MOCK_PEOPLE.map(p => (
              <Picker.Item key={p.id} label={p.name} value={p.id} />
            ))}
          </Picker>
        </View>

        {/* Date (spinner wheel on iOS; native calendar on Android) */}
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Date</Text>
        {Platform.OS === "ios" ? (
          <>
            <Pressable
              onPress={() => setShowDate(true)}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                padding: 16,
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 16 }}>
                {date.toLocaleDateString()}
              </Text>
            </Pressable>
            <Modal visible={showDate} animationType="slide" transparent>
              <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" }}>
                <View style={{ backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 16 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 12 }}>
                    <Pressable onPress={() => setShowDate(false)}><Text style={{ fontSize: 16 }}>Done</Text></Pressable>
                  </View>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    onChange={(_, d) => d && setDate(d)}
                    style={{ height: 200 }}
                  />
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <View style={{ marginBottom: 24 }}>
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(_, d) => d && setDate(d)}
            />
          </View>
        )}

        {/* Time */}
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Time</Text>
        {Platform.OS === "ios" ? (
          <>
            <Pressable
              onPress={() => setShowTime(true)}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                padding: 16,
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 16 }}>
                {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </Pressable>
            <Modal visible={showTime} animationType="slide" transparent>
              <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" }}>
                <View style={{ backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 16 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 12 }}>
                    <Pressable onPress={() => setShowTime(false)}><Text style={{ fontSize: 16 }}>Done</Text></Pressable>
                  </View>
                  <DateTimePicker
                    value={time}
                    mode="time"
                    display="spinner"
                    onChange={(_, d) => d && setTime(d)}
                    style={{ height: 200 }}
                  />
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <View style={{ marginBottom: 24 }}>
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={(_, d) => d && setTime(d)}
            />
          </View>
        )}

        {/* Duration (wheel) */}
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Duration (min)</Text>
        <View
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            overflow: "hidden",
            marginBottom: 40,
            height: Platform.OS === "ios" ? 180 : undefined,
            justifyContent: "center",
          }}
        >
          <Picker
            selectedValue={durationMin}
            onValueChange={(v) => setDurationMin(Number(v))}
            itemStyle={{ fontSize: 18 }}
          >
            {durationOptions.map(m => (
              <Picker.Item key={m} label={`${m}`} value={m} />
            ))}
          </Picker>
        </View>
      </View>
    </SafeAreaView>
  );
}
