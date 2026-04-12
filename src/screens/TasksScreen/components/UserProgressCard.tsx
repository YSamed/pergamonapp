import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../theme';
import type { UserProgress, User } from '../../../types';

type Props = {
  user: User;
  progress: UserProgress;
};

const d = colors.dark;

export const UserProgressCard = ({ user, progress }: Props) => {
  const xpPercent = Math.min(
    ((progress.user.totalXP % 100) / 100) * 100,
    100,
  );
  const streakPercent = Math.min((progress.streak.currentStreak / 100) * 100, 100);

  return (
    <View style={styles.card}>
      {/* Sol: Avatar + İsim */}
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🧑‍💻</Text>
        </View>
        <View style={styles.nameBlock}>
          <Text style={styles.displayName}>{user.displayName}</Text>
          <View style={styles.heartRow}>
            <Text style={styles.heartIcon}>❤️</Text>
            <Text style={styles.heartValue}>100/100</Text>
          </View>
        </View>
      </View>

      {/* Sağ: Level + Barlar */}
      <View style={styles.right}>
        {/* Level satırı */}
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Lvl {user.level}</Text>
          <Text style={styles.levelIcon}>🛡️</Text>
          <Text style={styles.levelArrow}>→</Text>
          <Text style={styles.levelLabel}>Lvl {user.level + 1}</Text>
          <Text style={styles.levelIcon}>🛡️</Text>
        </View>

        {/* XP Bar */}
        <View style={styles.barRow}>
          <Text style={styles.barIcon}>⚡</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, styles.xpFill, { width: `${xpPercent}%` }]} />
          </View>
          <Text style={styles.barPercent}>{Math.round(xpPercent)}%</Text>
        </View>

        {/* Streak Bar */}
        <View style={styles.barRow}>
          <Text style={styles.barIcon}>⚡</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, styles.streakFill, { width: `${streakPercent}%` }]} />
          </View>
          <Text style={styles.barPercent}>{streakPercent.toFixed(0)}%</Text>
        </View>

        {/* Settings icon */}
        <Text style={styles.settingsIcon}>⚙️</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: d.cardBorder,
    gap: spacing.md,
  },
  left: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: d.primary,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  nameBlock: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  displayName: {
    color: d.text,
    fontSize: 13,
    fontWeight: '600',
  },
  heartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  heartIcon: {
    fontSize: 11,
  },
  heartValue: {
    color: d.textSecondary,
    fontSize: 11,
  },
  right: {
    flex: 1,
    gap: spacing.xs,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  levelLabel: {
    color: d.text,
    fontSize: 13,
    fontWeight: '600',
  },
  levelIcon: {
    fontSize: 13,
  },
  levelArrow: {
    color: d.textSecondary,
    fontSize: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  barIcon: {
    fontSize: 12,
    width: 16,
    textAlign: 'center',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: d.surfaceElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  xpFill: {
    backgroundColor: d.xpBar,
  },
  streakFill: {
    backgroundColor: d.streakBar,
  },
  barPercent: {
    color: d.textSecondary,
    fontSize: 11,
    width: 30,
    textAlign: 'right',
  },
  settingsIcon: {
    alignSelf: 'flex-end',
    fontSize: 14,
    marginTop: spacing.xs,
  },
});
