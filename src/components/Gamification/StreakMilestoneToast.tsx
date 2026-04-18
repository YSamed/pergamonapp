import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, spacing } from '../../theme';

const d = colors;
const AUTO_DISMISS_MS = 3200;

const MILESTONE_DATA: Record<number, { emoji: string; title: string; color: string }> = {
  3:   { emoji: '🔥', title: '3 Gün Serisi!',   color: '#F97316' },
  7:   { emoji: '⚡', title: '7 Gün Serisi!',   color: '#EAB308' },
  14:  { emoji: '💫', title: '14 Gün Serisi!',  color: '#A855F7' },
  30:  { emoji: '🏆', title: '30 Gün Serisi!',  color: '#3B82F6' },
  60:  { emoji: '💎', title: '60 Gün Serisi!',  color: '#06B6D4' },
  100: { emoji: '👑', title: '100 Gün Serisi!', color: '#F59E0B' },
};

type Props = {
  visible: boolean;
  streakCount: number;
  bonusXP: number;
  onDismiss: () => void;
};

export const StreakMilestoneToast = ({
  visible,
  streakCount,
  bonusXP,
  onDismiss,
}: Props) => {
  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const bonusScale = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const milestone = MILESTONE_DATA[streakCount] ?? {
    emoji: '🔥',
    title: `${streakCount} Gün Serisi!`,
    color: '#EF4444',
  };

  useEffect(() => {
    if (!visible) {
      translateY.setValue(-140);
      opacity.setValue(0);
      emojiScale.setValue(0);
      glowOpacity.setValue(0);
      bonusScale.setValue(0);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      return;
    }

    // Slide in
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

    // Emoji bounce
    const emojiBounce = Animated.spring(emojiScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 4,
      delay: 200,
    });

    // Glow pulse
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

    // Bonus XP pop
    const bonusPop = Animated.spring(bonusScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 5,
      delay: 400,
    });

    // Slide out
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

    Animated.parallel([slideIn, emojiBounce, glow, bonusPop, slideOut]).start();

    dismissTimer.current = setTimeout(
      onDismiss,
      AUTO_DISMISS_MS + 400,
    );

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
        {/* Background blur */}
        <View style={styles.blurWrap}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.blurOverlay} />
        </View>

        {/* Glow accent */}
        <Animated.View
          style={[
            styles.accentGlow,
            {
              opacity: glowOpacity,
              backgroundColor: milestone.color,
            },
          ]}
        />

        {/* Content */}
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.emojiWrap,
              {
                transform: [{ scale: emojiScale }],
                shadowColor: milestone.color,
              },
            ]}
          >
            <Text style={styles.emoji}>{milestone.emoji}</Text>
          </Animated.View>

          <View style={styles.textWrap}>
            <Text style={styles.title}>{milestone.title}</Text>
            <Text style={[styles.subtitle, { color: milestone.color }]}>
              Harika gidiyorsun, devam et!
            </Text>
          </View>

          <Animated.View
            style={[
              styles.bonusBadge,
              {
                transform: [{ scale: bonusScale }],
                borderColor: `${milestone.color}40`,
                backgroundColor: `${milestone.color}15`,
              },
            ]}
          >
            <Text style={[styles.bonusText, { color: milestone.color }]}>
              +{bonusXP}
            </Text>
            <Text style={[styles.bonusLabel, { color: `${milestone.color}CC` }]}>
              XP
            </Text>
          </Animated.View>
        </View>

        {/* Bottom accent line */}
        <View
          style={[styles.accentLine, { backgroundColor: milestone.color }]}
        />
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
  emojiWrap: {
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
  emoji: {
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
