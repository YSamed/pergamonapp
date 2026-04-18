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
import { colors, radius, spacing } from '../../theme';

const d = colors.dark;
const { width: SCREEN_W } = Dimensions.get('window');
const CONFETTI_COUNT = 24;

type Props = {
  visible: boolean;
  newLevel: number;
  onDismiss: () => void;
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const CONFETTI_COLORS = [
  '#8B5CF6', '#A78BFA', '#C4B5FD', // violet
  '#F59E0B', '#FBBF24', '#FDE68A', // amber
  '#EC4899', '#F472B6',            // pink
  '#22C55E', '#4ADE80',            // green
  '#3B82F6', '#60A5FA',            // blue
];

export const LevelUpModal = ({ visible, newLevel, onDismiss }: Props) => {
  // Backdrop
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  // Badge
  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgeRotate = useRef(new Animated.Value(0)).current;
  // Glow ring
  const glowScale = useRef(new Animated.Value(0.5)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  // Title
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  // Level number
  const levelScale = useRef(new Animated.Value(0)).current;
  // Subtitle
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  // Button
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(20)).current;
  // Confetti
  const confetti = useRef(
    Array.from({ length: CONFETTI_COUNT }, () => ({
      translateX: new Animated.Value(rand(-SCREEN_W / 2, SCREEN_W / 2)),
      translateY: new Animated.Value(-100),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(rand(0.5, 1.2)),
      color:
        CONFETTI_COLORS[Math.floor(rand(0, CONFETTI_COLORS.length))],
      width: rand(6, 12),
      height: rand(12, 24),
    })),
  ).current;
  // Second glow ring pulse
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      backdropOpacity.setValue(0);
      badgeScale.setValue(0);
      badgeRotate.setValue(0);
      glowScale.setValue(0.5);
      glowOpacity.setValue(0);
      titleOpacity.setValue(0);
      titleTranslateY.setValue(30);
      levelScale.setValue(0);
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

    // Backdrop fade
    const backdrop = Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    });

    // Glow ring
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
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Badge bounce in with slight rotation
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

    // Pulse ring
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

    // Title slide up
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

    // Level number pop
    const level = Animated.spring(levelScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 4,
      delay: 700,
    });

    // Subtitle
    const subtitle = Animated.timing(subtitleOpacity, {
      toValue: 1,
      duration: 400,
      delay: 900,
      useNativeDriver: true,
    });

    // Button
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

    // Confetti cascade
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
      level,
      subtitle,
      button,
      ...confettiAnims,
    ]).start();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        {/* Backdrop blur */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
        >
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.backdropTint} />
        </Animated.View>

        {/* Confetti */}
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

        {/* Center content */}
        <View style={styles.center}>
          {/* Glow ring */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />

          {/* Pulse ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                opacity: pulseOpacity,
                transform: [{ scale: pulseScale }],
              },
            ]}
          />

          {/* Badge */}
          <Animated.View
            style={[
              styles.badge,
              {
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
            <View style={styles.badgeInner}>
              <Text style={styles.badgeEmoji}>⭐</Text>
            </View>
          </Animated.View>

          {/* "LEVEL UP" title */}
          <Animated.View
            style={{
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            }}
          >
            <Text style={styles.titleText}>SEVİYE ATLADIN!</Text>
          </Animated.View>

          {/* Level number */}
          <Animated.View
            style={[
              styles.levelWrap,
              { transform: [{ scale: levelScale }] },
            ]}
          >
            <Text style={styles.levelLabel}>Level</Text>
            <Text style={styles.levelNumber}>{newLevel}</Text>
          </Animated.View>

          {/* Subtitle */}
          <Animated.View style={{ opacity: subtitleOpacity }}>
            <Text style={styles.subtitle}>
              Yeni yetenekler açıldı. Devam et!
            </Text>
          </Animated.View>

          {/* Continue button */}
          <Animated.View
            style={{
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            }}
          >
            <TouchableOpacity
              style={styles.continueButton}
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
    borderColor: 'rgba(139,92,246,0.5)',
    shadowColor: '#8B5CF6',
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
    borderColor: 'rgba(139,92,246,0.3)',
    top: -40,
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(139,92,246,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  badgeInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: {
    fontSize: 44,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#C4B5FD',
    letterSpacing: 6,
    textAlign: 'center',
  },
  levelWrap: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: d.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  levelNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: d.text,
    letterSpacing: -3,
    textShadowColor: 'rgba(139,92,246,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: d.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 260,
  },
  continueButton: {
    marginTop: spacing.md,
    minWidth: 200,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
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
