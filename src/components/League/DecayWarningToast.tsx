import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import type { LeagueTier } from '../../types';
import { colors, radius, spacing } from '../../theme';
import { TIER_LABEL } from '../../modules/league';

const AUTO_DISMISS_MS = 3800;
const ACCENT = '#F59E0B';

type Props = {
  visible: boolean;
  tier: LeagueTier;
  xpAtRisk: number;
  onDismiss: () => void;
};

export const DecayWarningToast = ({
  visible,
  tier,
  xpAtRisk,
  onDismiss,
}: Props) => {
  const translateY = useRef(new Animated.Value(-160)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const xpScale = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!visible) {
      translateY.setValue(-160);
      opacity.setValue(0);
      iconScale.setValue(0);
      glowOpacity.setValue(0);
      xpScale.setValue(0);
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
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    const iconBounce = Animated.spring(iconScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 4,
      delay: 200,
    });

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.2,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    const xpPop = Animated.spring(xpScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 5,
      delay: 380,
    });

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

    Animated.parallel([slideIn, iconBounce, glow, xpPop, slideOut]).start();

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
            { opacity: glowOpacity, backgroundColor: ACCENT },
          ]}
        />

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconWrap,
              { transform: [{ scale: iconScale }], shadowColor: ACCENT },
            ]}
          >
            <Ionicons name="warning" size={22} color={ACCENT} />
          </Animated.View>

          <View style={styles.textWrap}>
            <Text style={styles.title}>
              Lig XP&apos;in azalmak üzere
            </Text>
            <Text style={styles.subtitle}>
              {TIER_LABEL[tier]} • Bugün bir habit yap
            </Text>
          </View>

          {xpAtRisk > 0 ? (
            <Animated.View
              style={[
                styles.xpBadge,
                { transform: [{ scale: xpScale }] },
              ]}
            >
              <Text style={styles.xpValue}>−{xpAtRisk}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </Animated.View>
          ) : null}
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
    borderColor: 'rgba(245,158,11,0.25)',
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
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
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
  xpBadge: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.4)',
    backgroundColor: 'rgba(245,158,11,0.12)',
  },
  xpValue: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  xpLabel: {
    color: 'rgba(245,158,11,0.85)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  accentLine: {
    height: 2,
    width: '100%',
  },
});
