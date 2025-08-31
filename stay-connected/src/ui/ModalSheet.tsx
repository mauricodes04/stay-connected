import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Modal, Pressable, View, AccessibilityInfo, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

export type ModalSheetProps = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children?: React.ReactNode;
};

export const ModalSheet: React.FC<ModalSheetProps> = ({ visible, title, onClose, footer, children }) => {
  const { colors, radii, spacing, motion, reducedMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const backdrop = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(1)).current; // 1 -> offscreen, 0 -> onscreen
  const dragY = useRef(new Animated.Value(0)).current; // gesture offset

  useEffect(() => {
    if (visible) {
      if (reducedMotion) {
        backdrop.setValue(1);
        translateY.setValue(0);
        dragY.setValue(0);
      } else {
        Animated.parallel([
          Animated.timing(backdrop, { toValue: 1, duration: motion.durations.base, useNativeDriver: true }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            ...{ bounciness: 6 },
          }),
        ]).start();
      }
      AccessibilityInfo.announceForAccessibility?.(title || 'Sheet opened');
    } else {
      if (reducedMotion) {
        backdrop.setValue(0);
        translateY.setValue(1);
        dragY.setValue(0);
      } else {
        Animated.parallel([
          Animated.timing(backdrop, { toValue: 0, duration: motion.durations.fast, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 1, duration: motion.durations.fast, useNativeDriver: true }),
        ]).start();
      }
    }
  }, [visible, reducedMotion, backdrop, translateY, dragY, motion.durations]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Only start a dismiss pan on more intentional drags to avoid stealing ScrollView gestures
        onMoveShouldSetPanResponder: (_e, g) => g.dy > 12 && Math.abs(g.vy) > 0.3,
        onPanResponderMove: Animated.event([null, { dy: dragY }], { useNativeDriver: false }),
        onPanResponderRelease: (_e, g) => {
          if (g.dy > 120) {
            Animated.parallel([
              Animated.timing(backdrop, { toValue: 0, duration: motion.durations.fast, useNativeDriver: true }),
              Animated.timing(translateY, { toValue: 1, duration: motion.durations.fast, useNativeDriver: true }),
            ]).start(onClose);
          } else {
            Animated.timing(dragY, { toValue: 0, duration: motion.durations.fast, useNativeDriver: false }).start();
          }
        },
      }),
    [backdrop, dragY, motion.durations.fast, onClose, translateY]
  );

  const interpolatedY = translateY.interpolate({ inputRange: [0, 1], outputRange: [0, 400] });
  const sheetStyle = {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingBottom: spacing.m + Math.max(0, insets.bottom - 8),
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    maxHeight: 360,
    ...(useTheme().shadows?.card ?? { shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 }),
    transform: [{ translateY: Animated.add(interpolatedY, dragY) }],
  } as const;

  return (
    <Modal visible={visible} transparent onRequestClose={onClose} animationType="none">
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: backdrop.interpolate({ inputRange: [0, 1], outputRange: ['rgba(0,0,0,0)', colors.backdrop || 'rgba(0,0,0,0.5)'] }),
          justifyContent: 'flex-end',
        }}
      >
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={{ flex: 1 }} />
        <Animated.View style={sheetStyle} {...panResponder.panHandlers}>
          {title && (
            <View accessible accessibilityRole="header" style={{ marginBottom: spacing.xs, flexDirection: 'row', alignItems: 'center' }}>
              {/* eslint-disable-next-line react-native/no-raw-text */}
              <Animated.Text style={{ flex: 1, fontSize: 18, lineHeight: 24, fontWeight: '600', color: colors.text.primary, fontFamily: 'Poppins_600SemiBold' }}>{title}</Animated.Text>
              {/* Replace close icon with a right-aligned Done button */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Done"
                onPress={onClose}
                style={{
                  paddingHorizontal: 14,
                  height: 40,
                  minWidth: 72,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.text.secondary + '33',
                }}
              >
                {/* eslint-disable-next-line react-native/no-raw-text */}
                <Animated.Text style={{ color: colors.text.primary, fontFamily: 'Poppins_600SemiBold' }}>Done</Animated.Text>
              </Pressable>
            </View>
          )}
          <View style={{ flexShrink: 1 }}>
            {children}
          </View>
          {footer && <View style={{ marginTop: spacing.m }}>{footer}</View>}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default ModalSheet;
