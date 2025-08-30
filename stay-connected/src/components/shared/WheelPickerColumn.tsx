import React, { useMemo, useRef } from 'react';
import { View, FlatList, NativeScrollEvent, NativeSyntheticEvent, Text } from 'react-native';
import { Animated } from 'react-native';
import { useTheme } from '@/theme';

export type WheelPickerColumnProps<T> = {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderLabel: (item: T, index: number) => string;
  itemHeight?: number;
  value: T;
  onChange: (item: T, index: number) => void;
  align?: 'left' | 'center' | 'right';
};

export default function WheelPickerColumn<T>({ data, keyExtractor, renderLabel, itemHeight = 44, value, onChange, align = 'center' }: WheelPickerColumnProps<T>) {
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const initialIndex = useMemo(() => Math.max(0, data.findIndex((d) => d === value)), [data, value]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / itemHeight);
    const clamped = Math.min(Math.max(index, 0), data.length - 1);
    const item = data[clamped];
    if (item !== undefined) onChange(item, clamped);
  };

  const textAlign: 'left' | 'center' | 'right' = align;
  const alignItems = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

  return (
    <View style={{ flex: 1, alignItems }}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => (
          // eslint-disable-next-line react-native/no-raw-text
          <View style={{ height: itemHeight, justifyContent: 'center', width: '100%' }}>
            <Text style={{ textAlign, fontFamily: 'Poppins_500Medium', color: colors.text.primary }}>
              {renderLabel(item, index)}
            </Text>
          </View>
        )}
        initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
        getItemLayout={(_d, i) => ({ length: itemHeight, offset: i * itemHeight, index: i })}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumEnd}
        onScroll={(e) => {
          // keep for potential highlight effects in future
          scrollY.setValue(e.nativeEvent.contentOffset.y);
        }}
      />
    </View>
  );
}
