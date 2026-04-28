import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import type { LeagueTier } from '../../types';
import { colors, radius, spacing } from '../../theme';
import { TIER_COLOR, TIER_LABEL } from '../../modules/league';

const { width: SCREEN_W } = Dimensions.get('window');
const CONFETTI_COUNT = 24;

type Props = {
  visible: boolean;
  fromTier: LeagueTier;
  toTier: LeagueTier;
  onDismiss: () => void;
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const buildConfetti = (accent: string) =>
  Array.from({ length: CONFETTI_COUNT }, () => ({
    translateX: new Animated.Value(rand(-SCREEN_W / 2, SCREEN_W / 2)),
    translateY: new Animated.Value(-100),
    rotate: new Animated.Value(0),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(rand(0.5, 1.2)),
    color: Math.random() > 0.5 ? accent : '#F4B544',
    width: rand(6, 12),
    height: rand(12, 24),
  }));

export const LeaguePromotionModal = ({
  visible,
  fromTier,
  toTier,
  onDismiss,
}: Props) => {
  const accent = TIER_COLOR[toTier];

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgeRotate = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.5)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const tierScale = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(20)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;

  const confetti = useRef(buildConfetti(accent)).current;

  useEffect(() => {
    if (!visible) {
      backdropOpacity.setValue(0);
      badgeScale.setValue(0);
      badgeRotate.setValue(0);
      glowScale.setValue(0.5);
      glowOpacity.setValue(0);
      titleOpacity.setValue(0);
      titleTranslateY.setValue(30);
      tierScale.setValue(0);
      subtitleOpacity.setValue(0);
      buttonOpacity.setValue(0);
      buttonTranslateY.setValue(20);
      pulseScale.setValue(1);
      pulseOpacity.setValue(0);
      confetti.forEach((c) => {
        c.translateY.setValue(-100);
        c.opacity.setValue(0);
        c.rotate.setValue(0);
      });
      return;
    }

    const backdrop = Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    });

    const glow = Animated.parallel([
      Animated.spring(glowScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 5,
      }),
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.35,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]);

    const badge = Animated.parallel([
      Animated.spring(badgeScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 4,
        delay: 200,
      }),
      Animated.sequence([
        Animated.timing(badgeRotate, {
          toValue: -10,
          duration: 200,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.spring(badgeRotate, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 5,
        }),
      ]),
    ]);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.4,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(pulseOpacity, {
              toValue: 0.4,
              duration: 200,
              delay: 600,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    const title = Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 400,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.spring(titleTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
        delay: 500,
      }),
    ]);

    const tier = Animated.spring(tierScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 4,
      delay: 700,
    });

    const subtitle = Animated.timing(subtitleOpacity, {
      toValue: 1,
      duration: 400,
      delay: 900,
      useNativeDriver: true,
    });

    const button = Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 400,
        delay: 1100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
        delay: 1100,
      }),
    ]);

    const confettiAnims = confetti.map((c, i) =>
      Animated.parallel([
        Animated.timing(c.opacity, {
          toValue: 1,
          duration: 200,
          delay: 400 + i * 40,
          useNativeDriver: true,
        }),
        Animated.timing(c.translateY, {
          toValue: rand(200, 500),
          duration: rand(1800, 3000),
          delay: 400 + i * 40,
          useNativeDriver: true,
        }),
        Animated.timing(c.rotate, {
          toValue: rand(-360, 360),
          duration: rand(1800, 3000),
          delay: 400 + i * 40,
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.parallel([
      backdrop,
      glow,
      badge,
      pulse,
      title,
      tier,
      subtitle,
      button,
      ...confettiAnims,
    ]).start();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
        >
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.backdropTint} />
        </Animated.View>

        {confetti.map((c, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confettiPiece,
              {
                width: c.width,
                height: c.height,
                backgroundColor: c.color,
                borderRadius: c.width / 4,
                opacity: c.opacity,
                transform: [
                  { translateX: c.translateX },
                  { translateY: c.translateY },
                  {
                    rotate: c.rotate.interpolate({
                      inputRange: [-360, 360],
                      outputRange: ['-360deg', '360deg'],
                    }),
                  },
                  { scale: c.scale },
                ],
              },
            ]}
          />
        ))}

        <View style={styles.center}>
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
                borderColor: `${accent}80`,
                shadowColor: accent,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.pulseRing,
              {
                opacity: pulseOpacity,
                transform: [{ scale: pulseScale }],
                borderColor: `${accent}50`,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.badge,
              {
                backgroundColor: `${accent}26`,
                borderColor: `${accent}66`,
                shadowColor: accent,
                transform: [
                  { scale: badgeScale },
                  {
                    rotate: badgeRotate.interpolate({
                      inputRange: [-10, 0],
                      outputRange: ['-10deg', '0deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.badgeInner,
                {
                  backgroundColor: `${accent}33`,
                  borderColor: `${accent}55`,
                },
              ]}
            >
              <Text style={[styles.badgeInitials, { color: accent }]}>
                {TIER_LABEL[toTier].slice(0, 2).toUpperCase()}
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            }}
          >
            <Text style={[styles.titleText, { color: accent }]}>
              BİR TIER YÜKSELDİN!
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.tierWrap,
              { transform: [{ scale: tierScale }] },
            ]}
          >
            <Text style={styles.fromTier}>
              {TIER_LABEL[fromTier]} →
            </Text>
            <Text
              style={[
                styles.toTier,
                {
                  color: colors.text,
                  textShadowColor: `${accent}88`,
                },
              ]}
            >
              {TIER_LABEL[toTier]}
            </Text>
          </Animated.View>

          <Animated.View style={{ opacity: subtitleOpacity }}>
            <Text style={styles.subtitle}>
              Yeni hafta, yeni rakipler. Tempo bozulmasın!
            </Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            }}
          >
            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: accent }]}
              onPress={onDismiss}
              activeOpacity={0.85}
            >
              <Text style={styles.continueText}>Devam Et</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdropTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,15,20,0.82)',
  },
  confettiPiece: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
  },
  center: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  glowRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    shadowOpacity: 0.8,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    top: -40,
  },
  pulseRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    top: -40,
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  badgeInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInitials: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 5,
    textAlign: 'center',
  },
  tierWrap: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  fromTier: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  toTier: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  continueButton: {
    marginTop: spacing.md,
    minWidth: 200,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  continueText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
