import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radius } from '../../theme';
import { MonthlyViewModal } from './MonthlyViewModal';

const d = colors;

const DAY_LABELS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

/** Returns Monday of the week that contains `date` as a new Date */
function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Mon
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** "YYYY-MM-DD" from a Date */
function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export type WeeklyActivityProps = {
  /** ISO date strings ("YYYY-MM-DD") on which the task was completed */
  completedDates: string[];
};

export const WeeklyActivity = ({ completedDates }: WeeklyActivityProps) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthViewVisible, setMonthViewVisible] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);

  const completedSet = useMemo(() => new Set(completedDates), [completedDates]);

  // Week days for current offset (Mon–Sun)
  const { weekDays, weekLabel } = useMemo(() => {
    const monday = getMondayOf(new Date());
    monday.setDate(monday.getDate() + weekOffset * 7);

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });

    const label = weekOffset === 0
      ? 'Current Week'
      : `${days[0].getDate()}/${days[0].getMonth() + 1} – ${days[6].getDate()}/${days[6].getMonth() + 1}`;

    return { weekDays: days, weekLabel: label };
  }, [weekOffset]);

  const today = toDateStr(new Date());

  const completionCount = weekDays.filter((d) => completedSet.has(toDateStr(d))).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Activity</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{completionCount} ✓</Text>
        </View>
      </View>

      <View style={styles.weekGrid}>
        {weekDays.map((date, i) => {
          const dateStr = toDateStr(date);
          const isDone = completedSet.has(dateStr);
          const isToday = dateStr === today;
          return (
            <View key={i} style={styles.dayCol}>
              <View
                style={[
                  styles.dayBox,
                  isDone && styles.dayBoxDone,
                  isToday && !isDone && styles.dayBoxToday,
                ]}
              >
                <Text style={[styles.dayNum, isDone && styles.dayNumDone]}>
                  {date.getDate()}
                </Text>
              </View>
              <Text style={styles.dayLabel}>{DAY_LABELS[i]}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.weekNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => setWeekOffset((p) => p - 1)}>
          <Text style={styles.navArrow}>{'<'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.currentWeekBtn} onPress={() => setWeekOffset(0)}>
          <Text style={styles.currentWeekText}>{weekLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setWeekOffset((p) => p + 1)}>
          <Text style={styles.navArrow}>{'>'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setMonthViewVisible(true)}>
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
  title: { color: d.text, fontSize: 17, fontWeight: '700' },
  badge: {
    backgroundColor: d.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  weekGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: spacing.xs },
  dayBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBoxDone: { backgroundColor: d.primary },
  dayBoxToday: {
    backgroundColor: d.surface,
    borderWidth: 1.5,
    borderColor: d.primary,
  },
  dayNum: { color: d.textSecondary, fontSize: 13, fontWeight: '600' },
  dayNumDone: { color: '#fff' },
  dayLabel: { color: d.textSecondary, fontSize: 11, fontWeight: '500' },
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
  navArrow: { color: d.text, fontSize: 14, fontWeight: '700' },
  gridIcon: { color: d.primary, fontSize: 16 },
  currentWeekBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: d.primary,
    minWidth: 130,
    alignItems: 'center',
  },
  currentWeekText: { color: d.primary, fontSize: 13, fontWeight: '600' },
});
