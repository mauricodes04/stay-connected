import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import WheelPickerColumn from './shared/WheelPickerColumn';

export type DatePickerWheelProps = {
  date: Date;
  onChange: (d: Date) => void;
};

const months = Array.from({ length: 12 }, (_, i) => i);

export default function DatePickerWheel({ date, onChange }: DatePickerWheelProps) {
  const insets = useSafeAreaInsets();
  const { spacing } = useTheme();
  const [current, setCurrent] = useState<Date>(date);

  const daysInMonth = useMemo(() => new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate(), [current]);
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);
  const years = useMemo(() => {
    const base = current.getFullYear();
    return Array.from({ length: 201 }, (_, i) => base - 100 + i);
  }, [current]);

  const setMonth = (m: number) => {
    const d = new Date(current);
    d.setMonth(m);
    setCurrent(d);
    onChange(d);
  };
  const setDay = (day: number) => {
    const d = new Date(current);
    d.setDate(day);
    setCurrent(d);
    onChange(d);
  };
  const setYear = (y: number) => {
    const d = new Date(current);
    d.setFullYear(y);
    setCurrent(d);
    onChange(d);
  };

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: spacing.s, paddingRight: Math.max(0, insets.right), gap: spacing.s }}>
      <WheelPickerColumn<number>
        data={months}
        keyExtractor={(m) => String(m)}
        renderLabel={(m) => new Date(2000, m, 1).toLocaleString(undefined, { month: 'short' })}
        value={current.getMonth()}
        onChange={(m) => setMonth(m)}
        align="left"
      />
      <WheelPickerColumn<number>
        data={days}
        keyExtractor={(d) => String(d)}
        renderLabel={(d) => String(d)}
        value={current.getDate()}
        onChange={(d) => setDay(d)}
        align="center"
      />
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <WheelPickerColumn<number>
          data={years}
          keyExtractor={(y) => String(y)}
          renderLabel={(y) => String(y)}
          value={current.getFullYear()}
          onChange={(y) => setYear(y)}
          align="right"
        />
      </View>
    </View>
  );
}
