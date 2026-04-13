import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radius } from '../../theme';
import { MonthlyViewModal } from './MonthlyViewModal';

const d = colors.dark;

const DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

const todayDayIndex = (() => {
  const day = new Date().getDay(); // 0=Sun
  return day === 0 ? 6 : day - 1; // 0=Mon...6=Sun
})();

export type WeeklyActivityProps = {
  /** 0=not done, 1=done for each day of the week (Mon–Sun) */
  activity: (0 | 1)[];
  completedDates?: string[];
};

export const WeeklyActivity = ({ activity, completedDates = [] }: WeeklyActivityProps) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthViewVisible, setMonthViewVisible] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);

  const completionCount = activity.reduce<number>((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Activity</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{completionCount} ✓</Text>
        </View>
      </View>

      <View style={styles.weekGrid}>
        {DAYS.map((day, i) => (
          <View key={day} style={styles.dayCol}>
            <View
              style={[
                styles.dayBox,
                activity[i] ? styles.dayBoxDone : null,
                i === todayDayIndex ? styles.dayBoxToday : null,
              ]}
            >
              {(activity[i] || i === todayDayIndex) ? (
                <Text style={styles.dayNum}>{i + 1}</Text>
              ) : null}
            </View>
            <Text style={styles.dayLabel}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.weekNav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setWeekOffset((p) => p - 1)}
        >
          <Text style={styles.navArrow}>{'<'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.currentWeekBtn}
          onPress={() => setWeekOffset(0)}
        >
          <Text style={styles.currentWeekText}>Current Week</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setWeekOffset((p) => p + 1)}
        >
          <Text style={styles.navArrow}>{'>'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setMonthViewVisible(true)}
        >
          <Text style={styles.gridIcon}>⊞</Text>
        </TouchableOpacity>
      </View>

      <MonthlyViewModal
        visible={monthViewVisible}
        monthOffset={monthOffset}
        onMonthChange={setMonthOffset}
        onClose={() => setMonthViewVisible(false)}
        completedDates={completedDates}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: d.background,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: d.text,
    fontSize: 17,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: d.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBoxDone: {
    backgroundColor: d.primary,
  },
  dayBoxToday: {
    backgroundColor: d.surface,
    borderWidth: 1.5,
    borderColor: d.primary,
  },
  dayNum: {
    color: d.text,
    fontSize: 13,
    fontWeight: '700',
  },
  dayLabel: {
    color: d.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    color: d.text,
    fontSize: 14,
    fontWeight: '700',
  },
  gridIcon: {
    color: d.primary,
    fontSize: 16,
  },
  currentWeekBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: d.primary,
  },
  currentWeekText: {
    color: d.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
