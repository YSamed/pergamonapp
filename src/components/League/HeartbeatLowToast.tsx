import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

const AUTO_DISMISS_MS = 3200;
const ACCENT = '#FF6B6B';

type Props = {
  visible: boolean;
  bank: number;
  onDismiss: () => void;
};

export const HeartbeatLowToast = ({ visible, bank, onDismiss }: Props) => {
  const translateY = useRef(new Animated.Value(-160)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!visible) {
      translateY.setValue(-160);
      opacity.setValue(0);
      heartScale.setValue(0);
      pulse.setValue(0);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      return;
    }

    const slideIn = Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]);

    const heartBounce = Animated.spring(heartScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 4,
      delay: 180,
    });

    const heartPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    const slideOut = Animated.parallel([
      Animated.timing(translateY, {
        toValue: -160,
        duration: 380,
        delay: AUTO_DISMISS_MS,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 380,
        delay: AUTO_DISMISS_MS,
        useNativeDriver: true,
      }),
    ]);

    Animated.parallel([slideIn, heartBounce, heartPulse, slideOut]).start();

    dismissTimer.current = setTimeout(onDismiss, AUTO_DISMISS_MS + 380);

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });

  return (
    <Animated.View
      style={[styles.container, { opacity, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <View style={styles.card}>
        <View style={styles.blurWrap}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.blurOverlay} />
        </View>

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconWrap,
              {
                transform: [{ scale: heartScale }, { scale: pulseScale }],
              },
            ]}
          >
            <Ionicons name="heart" size={22} color={ACCENT} />
          </Animated.View>

          <View style={styles.textWrap}>
            <Text style={styles.title}>
              Kalbini koruyalım
            </Text>
            <Text style={styles.subtitle}>
              Bugün bir habit yap • {bank}/7 kalp kaldı
            </Text>
          </View>
        </View>

        <View style={[styles.accentLine, { backgroundColor: ACCENT }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.md,
    right: spacing.md,
    zIndex: 10000,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.25)',
  },
  blurWrap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,36,0.85)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,107,107,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  textWrap: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  accentLine: {
    height: 2,
    width: '100%',
    opacity: 0.7,
  },
});
