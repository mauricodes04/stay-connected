import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

export type DialogProps = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Dialog({ visible, title, onClose, children, footer }: DialogProps) {
  const { colors, radii, spacing, motion, reducedMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const backdrop = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (reducedMotion) {
        backdrop.setValue(1);
        scale.setValue(1);
        opacity.setValue(1);
      } else {
        Animated.parallel([
          Animated.timing(backdrop, { toValue: 1, duration: 240, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 6 }),
          Animated.timing(opacity, { toValue: 1, duration: 240, useNativeDriver: true }),
        ]).start();
      }
    } else {
      if (reducedMotion) {
        backdrop.setValue(0);
        scale.setValue(0.95);
        opacity.setValue(0);
      } else {
        Animated.parallel([
          Animated.timing(backdrop, { toValue: 0, duration: 240, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.95, duration: 240, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: true }),
        ]).start();
      }
    }
  }, [visible, reducedMotion, backdrop, scale, opacity, motion]);

  const cardShadow = {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  } as const;

  return (
    <Modal visible={visible} transparent onRequestClose={onClose} animationType="none">
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: backdrop.interpolate({ inputRange: [0, 1], outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)'] }),
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 12,
          paddingHorizontal: spacing.m,
        }}
      >
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
        <Animated.View
          style={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: colors.background.surface,
            borderRadius: radii.lg,
            padding: 20,
            transform: [{ scale }],
            opacity,
            ...cardShadow,
          }}
        >
          {/* Top-right close control */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close dialog"
            onPress={onClose}
            style={{ position: 'absolute', top: 8, right: 8, padding: 10, borderRadius: 999 }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </Pressable>
          {title ? (
            <View style={{ marginBottom: spacing.s }} accessibilityRole="header">
              {/* eslint-disable-next-line react-native/no-raw-text */}
              <Animated.Text style={{ fontSize: 18, lineHeight: 24, fontWeight: '600', color: colors.text.primary, fontFamily: 'Poppins_600SemiBold' }}>{title}</Animated.Text>
            </View>
          ) : null}
          <View>{children}</View>
          {footer ? <View style={{ marginTop: spacing.m }}>{footer}</View> : null}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
