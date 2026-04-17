import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, spacing, radius } from '../../theme';
import type { UserProgress, User, Habit, Todo } from '../../types';

type Props = {
  user: User;
  progress: UserProgress;
  habits: Habit[];
  todos: Todo[];
};

const d = colors.dark;
const avatarImage = require('../../assets/icons/iconn.png');
const DISPLAY_MAX = 50;
const HEALTH_MAX = 100;

export const UserProgressCard = ({ user, progress, habits, todos }: Props) => {
  const completedHabits = habits.filter((habit) => !!habit.completedTodayAt).length;
  const totalHabits = habits.length;
  const completedTodos = todos.filter((todo) => !!todo.completedAt).length;
  const totalTodos = todos.length;
  const completedTotal = completedHabits + completedTodos;
  const totalTasks = totalHabits + totalTodos;

  const habitsPercent = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
  const todosPercent = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;
  const totalPercent = totalTasks > 0 ? (completedTotal / totalTasks) * 100 : 0;

  const habitsDisplayValue = Math.round((habitsPercent / 100) * DISPLAY_MAX);
  const todosDisplayValue = Math.round((todosPercent / 100) * DISPLAY_MAX);
  const healthDisplayValue = Math.round((totalPercent / 100) * HEALTH_MAX);

  return (
    <View style={styles.card}>
      <View style={styles.leftColumn}>
        <View style={styles.avatarCard}>
          <View style={styles.avatarHorizon} />
          <Image source={avatarImage} style={styles.avatarImage} resizeMode="contain" />
        </View>
        <View style={styles.levelPill}>
          <Text style={styles.levelPillText}>Lvl {user.level}</Text>
        </View>
      </View>

      <View style={styles.statsColumn}>
        <View style={styles.statRow}>
          <View style={[styles.statIcon, styles.hpIcon]}>
            <View style={styles.statIconInner} />
          </View>
          <View style={styles.statContent}>
            <View style={styles.statTrack}>
              <View style={[styles.statFill, styles.hpFill, { width: `${habitsPercent}%` }]} />
            </View>
            <View style={styles.statMetaRow}>
              <Text style={styles.hpLabel}>HT</Text>
              <Text style={styles.hpValue}>{habitsDisplayValue} / {DISPLAY_MAX}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={[styles.statIcon, styles.expIcon]}>
            <View style={styles.statIconInner} />
          </View>
          <View style={styles.statContent}>
            <View style={styles.statTrack}>
              <View style={[styles.statFill, styles.expFill, { width: `${todosPercent}%` }]} />
            </View>
            <View style={styles.statMetaRow}>
              <Text style={styles.expLabel}>TD</Text>
              <Text style={styles.expValue}>{todosDisplayValue} / {DISPLAY_MAX}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={[styles.statIcon, styles.mpIcon]}>
            <View style={styles.statIconInner} />
          </View>
          <View style={styles.statContent}>
            <View style={styles.statTrack}>
              <View style={[styles.statFill, styles.mpFill, { width: `${totalPercent}%` }]} />
            </View>
            <View style={styles.statMetaRow}>
              <Text style={styles.mpLabel}>Health</Text>
              <Text style={styles.mpValue}>{healthDisplayValue} / {HEALTH_MAX}</Text>
            </View>
          </View>
        </View>

        <View style={styles.currencyPill}>
          <View style={styles.currencyItem}>
            <Text style={styles.gemIcon}>💎</Text>
            <Text style={styles.gemValue}>0</Text>
          </View>
          <View style={styles.currencyItem}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.coinValue}>0</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: d.background,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  leftColumn: {
    width: 98,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  avatarCard: {
    width: 92,
    height: 92,
    borderRadius: 20,
    backgroundColor: '#B9AAEA',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarHorizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 30,
    backgroundColor: '#A48DE8',
  },
  avatarImage: {
    width: 72,
    height: 72,
  },
  levelPill: {
    marginTop: spacing.sm,
    minWidth: 66,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: d.surfaceElevated,
  },
  levelPillText: {
    color: '#F1F0FA',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  statsColumn: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: spacing.xxs,
    minWidth: 0,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statIcon: {
    width: 13,
    height: 13,
    marginTop: 2,
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconInner: {
    width: 6,
    height: 6,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  hpIcon: {
    backgroundColor: '#184769',
    shadowColor: '#3099D1',
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  expIcon: {
    backgroundColor: '#A8650B',
    shadowColor: '#F5B240',
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  mpIcon: {
    backgroundColor: '#8F2F48',
    shadowColor: '#FF5965',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statContent: {
    flex: 1,
  },
  statTrack: {
    height: 11,
    backgroundColor: '#201C28',
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: 6,
  },
  statFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  hpFill: {
    backgroundColor: '#2976AA',
  },
  expFill: {
    backgroundColor: '#F0C674',
  },
  mpFill: {
    backgroundColor: '#FF5C61',
  },
  statMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minWidth: 0,
  },
  hpLabel: {
    color: '#61778C',
    fontSize: 12,
    fontWeight: '800',
  },
  hpValue: {
    color: '#61778C',
    fontSize: 12,
    fontWeight: '800',
  },
  expLabel: {
    color: '#FFE1AE',
    fontSize: 12,
    fontWeight: '800',
  },
  expValue: {
    color: '#FFE1AE',
    fontSize: 12,
    fontWeight: '800',
  },
  mpLabel: {
    color: '#FF9CA3',
    fontSize: 12,
    fontWeight: '800',
  },
  mpValue: {
    color: '#FF9CA3',
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  currencyPill: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: d.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginTop: spacing.xxs,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  gemIcon: {
    fontSize: 18,
  },
  gemValue: {
    color: '#39D6A0',
    fontSize: 14,
    fontWeight: '800',
  },
  coinIcon: {
    fontSize: 18,
  },
  coinValue: {
    color: '#FFB33A',
    fontSize: 14,
    fontWeight: '800',
  },
});
