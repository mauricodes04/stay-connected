import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

export type TabItem = { key: string; label: string; disabled?: boolean };

export type TabsProps = {
  items: TabItem[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: ViewStyle | ViewStyle[];
};

export const Tabs: React.FC<TabsProps> = ({ items, selectedIndex, onChange, style }) => {
  const { colors, spacing, radii, motion, reducedMotion } = useTheme();
  const indicator = useRef(new Animated.Value(selectedIndex)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      indicator.setValue(selectedIndex);
      return;
    }
    Animated.timing(indicator, {
      toValue: selectedIndex,
      duration: motion.durations.base,
      useNativeDriver: false,
    }).start();
  }, [selectedIndex, reducedMotion, indicator, motion.durations.base]);

  const count = items.length || 1;
  const innerHorizontalPadding = spacing.xs * 2; // left+right paddings of container
  const trackWidth = Math.max(0, containerWidth - innerHorizontalPadding);
  const tabWidthPx = count > 0 ? trackWidth / count : 0;

  const containerStyle = useMemo<ViewStyle>(() => ({
    backgroundColor: colors.background.surface,
    borderRadius: radii.full,
    padding: spacing.xs,
    flexDirection: 'row',
  }), [colors.background.surface, radii.full, spacing.xs]);

  return (
    <View style={[containerStyle, style]} onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
      {items.map((t, i) => {
        const isSelected = selectedIndex === i;
        return (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected, disabled: !!t.disabled }}
            disabled={t.disabled}
            onPress={() => onChange(i)}
            style={{
              width: count > 0 ? tabWidthPx : undefined,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: spacing.s,
              borderRadius: radii.full,
            }}
          >
            {/* eslint-disable-next-line react-native/no-raw-text */}
            <Animated.Text style={{ color: isSelected ? colors.text.inverse : colors.text.primary }}>
              {t.label}
            </Animated.Text>
          </Pressable>
        );
      })}
      {/* Indicator overlay */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: spacing.xs,
          bottom: spacing.xs,
          left: spacing.xs,
          width: tabWidthPx,
          borderRadius: radii.full,
          backgroundColor: colors.accent.primary,
          transform: [
            {
              translateX: indicator.interpolate({
                inputRange: [0, count - 1],
                outputRange: [0, (count - 1) * (tabWidthPx || 0)],
              }),
            },
          ],
        }}
      />
    </View>
  );
};

export default Tabs;
