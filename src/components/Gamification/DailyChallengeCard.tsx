import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../../theme';
import type { DailyChallenge } from '../../mock';

const d = colors;

type Props = {
  challenges: DailyChallenge[];
  onViewAll?: () => void;
};

export const DailyChallengeCard = ({ challenges, onViewAll }: Props) => {
  const active = challenges.filter((c) => !c.isCompleted);
  const completed = challenges.filter((c) => c.isCompleted);
  const totalXP = challenges.reduce((sum, c) => sum + c.xpReward, 0);
  const earnedXP = completed.reduce((sum, c) => sum + c.xpReward, 0);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerEmoji}>⚡</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Günlük Görevler</Text>
            <Text style={styles.headerSub}>
              {completed.length}/{challenges.length} tamamlandı
            </Text>
          </View>
        </View>
        <View style={styles.xpPill}>
          <Text style={styles.xpPillText}>
            {earnedXP}/{totalXP} XP
          </Text>
        </View>
      </View>

      {/* Challenge rows */}
      <View style={styles.list}>
        {challenges.map((challenge) => (
          <ChallengeRow key={challenge.id} challenge={challenge} />
        ))}
      </View>

      {/* Countdown + View All */}
      <View style={styles.footer}>
        <CountdownTimer />
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>Tümünü Gör →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const ChallengeRow = ({ challenge }: { challenge: DailyChallenge }) => {
  const progress = challenge.target > 0
    ? Math.min(1, challenge.current / challenge.target)
    : 0;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      delay: 200,
      useNativeDriver: false,
    }).start();

    if (challenge.isCompleted) {
      Animated.spring(checkScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 5,
        delay: 400,
      }).start();
    }
  }, [progress, challenge.isCompleted]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View
      style={[
        styles.challengeRow,
        challenge.isCompleted && styles.challengeRowCompleted,
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.challengeIcon,
          challenge.isCompleted && styles.challengeIconCompleted,
        ]}
      >
        {challenge.isCompleted ? (
          <Animated.View
            style={[
              styles.checkMark,
              { transform: [{ scale: checkScale }] },
            ]}
          >
            <Text style={styles.checkText}>✓</Text>
          </Animated.View>
        ) : (
          <Text style={styles.challengeEmoji}>{challenge.icon}</Text>
        )}
      </View>

      {/* Text + progress */}
      <View style={styles.challengeContent}>
        <Text
          style={[
            styles.challengeTitle,
            challenge.isCompleted && styles.challengeTitleCompleted,
          ]}
        >
          {challenge.title}
        </Text>

        {/* Progress bar */}
        <View style={styles.challengeProgressTrack}>
          <Animated.View
            style={[
              styles.challengeProgressFill,
              challenge.isCompleted && styles.challengeProgressFillDone,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <Text style={styles.challengeProgressText}>
          {challenge.current}/{challenge.target}
        </Text>
      </View>

      {/* XP reward */}
      <View
        style={[
          styles.challengeXP,
          challenge.isCompleted && styles.challengeXPCompleted,
        ]}
      >
        <Text
          style={[
            styles.challengeXPText,
            challenge.isCompleted && styles.challengeXPTextCompleted,
          ]}
        >
          +{challenge.xpReward}
        </Text>
      </View>
    </View>
  );
};

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}sa ${m}dk kaldı`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.countdown}>
      <Text style={styles.countdownIcon}>⏳</Text>
      <Text style={styles.countdownText}>{timeLeft}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: d.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: d.cardBorder,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: d.text,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '600',
    color: d.textMuted,
    marginTop: 1,
  },
  xpPill: {
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  xpPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FBBF24',
  },
  list: {
    gap: spacing.sm,
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: d.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: d.cardBorder,
  },
  challengeRowCompleted: {
    borderColor: 'rgba(34,197,94,0.2)',
    backgroundColor: 'rgba(34,197,94,0.05)',
  },
  challengeIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeIconCompleted: {
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  challengeEmoji: {
    fontSize: 20,
  },
  checkMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  challengeContent: {
    flex: 1,
    gap: 4,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: d.text,
  },
  challengeTitleCompleted: {
    color: d.textSecondary,
    textDecorationLine: 'line-through',
  },
  challengeProgressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: '#F59E0B',
  },
  challengeProgressFillDone: {
    backgroundColor: colors.success,
  },
  challengeProgressText: {
    fontSize: 11,
    fontWeight: '700',
    color: d.textMuted,
  },
  challengeXP: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  challengeXPCompleted: {
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  challengeXPText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FBBF24',
  },
  challengeXPTextCompleted: {
    color: colors.success,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  countdownIcon: {
    fontSize: 14,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '700',
    color: d.textMuted,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.level,
  },
});
