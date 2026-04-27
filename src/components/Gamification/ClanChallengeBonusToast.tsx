import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, spacing } from '../../theme';

const d = colors;
const AUTO_DISMISS_MS = 3400;
const ACCENT = '#8B5CF6';

type Props = {
  visible: boolean;
  challengeTitle: string;
  bonusXP: number;
  onDismiss: () => void;
};

export const ClanChallengeBonusToast = ({
  visible,
  challengeTitle,
  bonusXP,
  onDismiss,
}: Props) => {
  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const bonusScale = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!visible) {
      translateY.setValue(-140);
      opacity.setValue(0);
      iconScale.setValue(0);
      glowOpacity.setValue(0);
      bonusScale.setValue(0);
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
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.2,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    const bonusPop = Animated.spring(bonusScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 5,
      delay: 400,
    });

    const slideOut = Animated.parallel([
      Animated.timing(translateY, {
        toValue: -140,
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

    Animated.parallel([slideIn, iconBounce, glow, bonusPop, slideOut]).start();

    dismissTimer.current = setTimeout(onDismiss, AUTO_DISMISS_MS + 400);

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
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
            <Text style={styles.icon}>🛡️</Text>
          </Animated.View>

          <View style={styles.textWrap}>
            <Text style={styles.title} numberOfLines={1}>
              Klan Challenge Tamamlandı!
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {challengeTitle}
            </Text>
          </View>

          <Animated.View
            style={[
              styles.bonusBadge,
              {
                transform: [{ scale: bonusScale }],
                borderColor: `${ACCENT}40`,
                backgroundColor: `${ACCENT}15`,
              },
            ]}
          >
            <Text style={[styles.bonusText, { color: ACCENT }]}>
              +{bonusXP}
            </Text>
            <Text style={[styles.bonusLabel, { color: `${ACCENT}CC` }]}>
              XP
            </Text>
          </Animated.View>
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
    opacity: 0.15,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  icon: {
    fontSize: 24,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: d.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C4B5FD',
  },
  bonusBadge: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 1,
  },
  bonusText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  bonusLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  accentLine: {
    height: 2,
    width: '100%',
  },
});
