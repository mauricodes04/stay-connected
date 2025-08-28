import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, View, AccessibilityInfo } from 'react-native';
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
  const backdrop = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(1)).current; // 1 -> offscreen, 0 -> onscreen

  useEffect(() => {
    if (visible) {
      if (reducedMotion) {
        backdrop.setValue(1);
        translateY.setValue(0);
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
      } else {
        Animated.parallel([
          Animated.timing(backdrop, { toValue: 0, duration: motion.durations.fast, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 1, duration: motion.durations.fast, useNativeDriver: true }),
        ]).start();
      }
    }
  }, [visible, reducedMotion, backdrop, translateY, motion.durations]);

  const sheetStyle = {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.m,
    transform: [{ translateY: translateY.interpolate({ inputRange: [0, 1], outputRange: [0, 400] }) }],
  } as const;

  return (
    <Modal visible={visible} transparent onRequestClose={onClose} animationType="none">
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: backdrop.interpolate({ inputRange: [0, 1], outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)'] }),
          justifyContent: 'flex-end',
        }}
      >
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={{ flex: 1 }} />
        <Animated.View style={sheetStyle}>
          {title && (
            <View accessible accessibilityRole="header" style={{ marginBottom: spacing.s }}>
              {/* Using Text without importing type to keep file focused */}
              {/* eslint-disable-next-line react-native/no-raw-text */}
              <Animated.Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary }}>{title}</Animated.Text>
            </View>
          )}
          <View>{children}</View>
          {footer && <View style={{ marginTop: spacing.m }}>{footer}</View>}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default ModalSheet;
