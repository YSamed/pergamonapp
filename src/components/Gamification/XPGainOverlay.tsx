import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';

const d = colors.dark;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const PARTICLE_COUNT = 12;
const AUTO_DISMISS_MS = 2400;

type SkillGain = { icon: string; label: string; xp: number };

type Props = {
  visible: boolean;
  xpAmount: number;
  skillGains?: SkillGain[];
  levelProgress?: { from: number; to: number }; // 0-1
  streakCount?: number;
  onDismiss: () => void;
};

/** Generates a random number between min and max */
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export const XPGainOverlay = ({
  visible,
  xpAmount,
  skillGains = [],
  levelProgress,
  streakCount,
  onDismiss,
}: Props) => {
  // Master opacity
  const masterOpacity = useRef(new Animated.Value(0)).current;
  // XP text
  const xpScale = useRef(new Animated.Value(0)).current;
  const xpTranslateY = useRef(new Animated.Value(20)).current;
  const xpOpacity = useRef(new Animated.Value(0)).current;
  // Flash
  const flashOpacity = useRef(new Animated.Value(0)).current;
  // Ring
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  // Particles
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      angle: rand(0, Math.PI * 2),
      distance: rand(60, 140),
      size: rand(4, 10),
      color: ['#F59E0B', '#FBBF24', '#FDE68A', '#F97316', '#FCD34D'][
        Math.floor(rand(0, 5))
      ],
    })),
  ).current;
  // Progress bar
  const progressWidth = useRef(new Animated.Value(0)).current;
  // Skill badges
  const skillAnims = useRef(
    Array.from({ length: 6 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
      scale: new Animated.Value(0.5),
    })),
  ).current;
  // Streak
  const streakScale = useRef(new Animated.Value(0)).current;
  const streakOpacity = useRef(new Animated.Value(0)).current;

  const dismissTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const resetAll = useCallback(() => {
    masterOpacity.setValue(0);
    xpScale.setValue(0);
    xpTranslateY.setValue(20);
    xpOpacity.setValue(0);
    flashOpacity.setValue(0);
    ringScale.setValue(0.6);
    ringOpacity.setValue(0);
    progressWidth.setValue(levelProgress?.from ?? 0);
    streakScale.setValue(0);
    streakOpacity.setValue(0);
    particles.forEach((p) => {
      p.translateX.setValue(0);
      p.translateY.setValue(0);
      p.scale.setValue(0);
      p.opacity.setValue(0);
    });
    skillAnims.forEach((s) => {
      s.opacity.setValue(0);
      s.translateY.setValue(30);
      s.scale.setValue(0.5);
    });
  }, [
    masterOpacity,
    xpScale,
    xpTranslateY,
    xpOpacity,
    flashOpacity,
    ringScale,
    ringOpacity,
    progressWidth,
    streakScale,
    streakOpacity,
    particles,
    skillAnims,
    levelProgress,
  ]);

  useEffect(() => {
    if (!visible) {
      resetAll();
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      return;
    }

    // Phase 1: Flash + master fade in
    const flashAnim = Animated.sequence([
      Animated.timing(flashOpacity, {
        toValue: 0.35,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    const masterIn = Animated.timing(masterOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    });

    // Phase 2: Ring burst
    const ringAnim = Animated.parallel([
      Animated.spring(ringScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 6,
      }),
      Animated.sequence([
        Animated.timing(ringOpacity, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Phase 3: XP number pop
    const xpAnim = Animated.parallel([
      Animated.spring(xpScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 5,
      }),
      Animated.timing(xpTranslateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(xpOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);

    // Phase 4: Particle burst
    const particleAnims = particles.map((p) => {
      const dx = Math.cos(p.angle) * p.distance;
      const dy = Math.sin(p.angle) * p.distance;
      return Animated.parallel([
        Animated.timing(p.translateX, {
          toValue: dx,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(p.translateY, {
          toValue: dy,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.spring(p.scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 120,
            friction: 6,
          }),
          Animated.timing(p.scale, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(p.opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: 600,
            delay: 100,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    // Phase 5: Skill badges stagger
    const skillBadgeAnims = skillGains.slice(0, 6).map((_, i) => {
      const sa = skillAnims[i];
      return Animated.parallel([
        Animated.timing(sa.opacity, {
          toValue: 1,
          duration: 300,
          delay: i * 100,
          useNativeDriver: true,
        }),
        Animated.spring(sa.translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
          delay: i * 100,
        }),
        Animated.spring(sa.scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
          delay: i * 100,
        }),
      ]);
    });

    // Phase 6: Progress bar
    const progressAnim = levelProgress
      ? Animated.timing(progressWidth, {
          toValue: levelProgress.to,
          duration: 800,
          delay: 400,
          useNativeDriver: false,
        })
      : Animated.delay(0);

    // Phase 7: Streak
    const streakAnim = streakCount
      ? Animated.parallel([
          Animated.spring(streakScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 60,
            friction: 5,
            delay: 600,
          }),
          Animated.timing(streakOpacity, {
            toValue: 1,
            duration: 300,
            delay: 600,
            useNativeDriver: true,
          }),
        ])
      : Animated.delay(0);

    // Phase 8: Fade out
    const fadeOut = Animated.parallel([
      Animated.timing(masterOpacity, {
        toValue: 0,
        duration: 400,
        delay: AUTO_DISMISS_MS - 400,
        useNativeDriver: true,
      }),
      Animated.timing(xpOpacity, {
        toValue: 0,
        duration: 400,
        delay: AUTO_DISMISS_MS - 400,
        useNativeDriver: true,
      }),
    ]);

    // Orchestrate
    Animated.parallel([
      flashAnim,
      masterIn,
      ringAnim,
      Animated.stagger(50, [xpAnim, ...particleAnims]),
      Animated.parallel(skillBadgeAnims),
      progressAnim,
      streakAnim,
      fadeOut,
    ]).start();

    dismissTimer.current = setTimeout(onDismiss, AUTO_DISMISS_MS);

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Screen flash */}
      <Animated.View style={[styles.flash, { opacity: flashOpacity }]} />

      {/* Main content */}
      <Animated.View style={[styles.content, { opacity: masterOpacity }]}>
        {/* Ring burst */}
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />

        {/* Particles */}
        {particles.map((p, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
                backgroundColor: p.color,
                opacity: p.opacity,
                transform: [
                  { translateX: p.translateX },
                  { translateY: p.translateY },
                  { scale: p.scale },
                ],
              },
            ]}
          />
        ))}

        {/* XP amount */}
        <Animated.View
          style={[
            styles.xpWrap,
            {
              opacity: xpOpacity,
              transform: [{ scale: xpScale }, { translateY: xpTranslateY }],
            },
          ]}
        >
          <Text style={styles.xpPlus}>+</Text>
          <Text style={styles.xpNumber}>{xpAmount}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </Animated.View>

        {/* Skill gains */}
        {skillGains.length > 0 && (
          <View style={styles.skillRow}>
            {skillGains.slice(0, 6).map((skill, i) => {
              const sa = skillAnims[i];
              return (
                <Animated.View
                  key={skill.label}
                  style={[
                    styles.skillBadge,
                    {
                      opacity: sa.opacity,
                      transform: [
                        { translateY: sa.translateY },
                        { scale: sa.scale },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.skillIcon}>{skill.icon}</Text>
                  <Text style={styles.skillXP}>+{skill.xp}</Text>
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* Streak */}
        {streakCount ? (
          <Animated.View
            style={[
              styles.streakWrap,
              {
                opacity: streakOpacity,
                transform: [{ scale: streakScale }],
              },
            ]}
          >
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>{streakCount} gün seri</Text>
          </Animated.View>
        ) : null}

        {/* Level progress bar */}
        {levelProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressWidth.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
              {/* Glow on the fill edge */}
              <Animated.View
                style={[
                  styles.progressGlow,
                  {
                    left: progressWidth.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F59E0B',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  particle: {
    position: 'absolute',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  xpWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  xpPlus: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FBBF24',
    textShadowColor: 'rgba(245,158,11,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  xpNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FDE68A',
    letterSpacing: -2,
    textShadowColor: 'rgba(245,158,11,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  xpLabel: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F59E0B',
    marginLeft: 2,
    textShadowColor: 'rgba(245,158,11,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  skillRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  skillBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  skillIcon: {
    fontSize: 22,
  },
  skillXP: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FBBF24',
  },
  streakWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  streakIcon: {
    fontSize: 20,
  },
  streakText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FCA5A5',
  },
  progressContainer: {
    width: SCREEN_W * 0.7,
    marginTop: spacing.xxl,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: '#F59E0B',
  },
  progressGlow: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FBBF24',
    shadowColor: '#F59E0B',
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    marginLeft: -8,
  },
});
