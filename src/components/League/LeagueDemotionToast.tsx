import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import type { LeagueTier } from '../../types';
import { colors, radius, spacing } from '../../theme';
import { TIER_COLOR, TIER_LABEL } from '../../modules/league';

const AUTO_DISMISS_MS = 3600;

type Props = {
  visible: boolean;
  fromTier: LeagueTier;
  toTier: LeagueTier;
  onDismiss: () => void;
};

export const LeagueDemotionToast = ({
  visible,
  fromTier,
  toTier,
  onDismiss,
}: Props) => {
  const accent = TIER_COLOR[toTier];

  const translateY = useRef(new Animated.Value(-160)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!visible) {
      translateY.setValue(-160);
      opacity.setValue(0);
      iconScale.setValue(0);
      glowOpacity.setValue(0);
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
        duration: 320,
        useNativeDriver: true,
      }),
    ]);

    const iconBounce = Animated.spring(iconScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 70,
      friction: 5,
      delay: 200,
    });

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.45,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.15,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    const slideOut = Animated.parallel([
      Animated.timing(translateY, {
        toValue: -160,
        duration: 400,
        delay: AUTO_DISMISS_MS,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        delay: AUTO_DISMISS_MS,
        useNativeDriver: true,
      }),
    ]);

    Animated.parallel([slideIn, iconBounce, glow, slideOut]).start();

    dismissTimer.current = setTimeout(onDismiss, AUTO_DISMISS_MS + 400);

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

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

        <Animated.View
          style={[
            styles.accentGlow,
            { opacity: glowOpacity, backgroundColor: accent },
          ]}
        />

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconWrap,
              { transform: [{ scale: iconScale }], shadowColor: accent },
            ]}
          >
            <Ionicons name="trending-down" size={22} color={accent} />
          </Animated.View>

          <View style={styles.textWrap}>
            <Text style={styles.title}>Bu hafta tempo düştü</Text>
            <Text style={styles.subtitle}>
              Yarın yeni başlangıç • {TIER_LABEL[fromTier]} → {TIER_LABEL[toTier]}
            </Text>
          </View>
        </View>

        <View style={[styles.accentLine, { backgroundColor: accent }]} />
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
    borderColor: 'rgba(255,255,255,0.08)',
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
  accentGlow: {
    position: 'absolute',
    top: -40,
    left: '20%',
    width: '60%',
    height: 80,
    borderRadius: 40,
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
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
