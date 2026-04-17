import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { spacing } from '../../theme';
import type { Habit } from '../../types';
import { SwipeToDeleteRow } from './SwipeToDeleteRow';

type Props = {
  habit: Habit;
  onComplete: (id: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onPress?: (id: string) => void;
};

const DAY_LABELS: Record<number, string> = {
  0: 'Pa',
  1: 'Pt',
  2: 'Sa',
  3: 'Ça',
  4: 'Pe',
  5: 'Cu',
  6: 'Ct',
};

const WINDOW_SIZE = 5;

const startOfDay = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const getVisibleDates = (completionSet: Set<string>) => {
  const today = startOfDay(new Date());
  const completionDates = [...completionSet].sort();
  const lastCompleted = completionDates.length > 0
    ? startOfDay(new Date(completionDates[completionDates.length - 1]))
    : today;

  let start = addDays(
    lastCompleted > today ? lastCompleted : today,
    -(WINDOW_SIZE - 1),
  );

  const currentWindow = Array.from({ length: WINDOW_SIZE }, (_, index) => addDays(start, index));
  const isWindowCompleted = currentWindow.every((date) =>
    completionSet.has(date.toISOString().slice(0, 10)),
  );

  if (isWindowCompleted) {
    start = addDays(currentWindow[currentWindow.length - 1], 1);
  }

  return Array.from({ length: WINDOW_SIZE }, (_, index) => addDays(start, index));
};

export const HabitRow = ({ habit, onComplete, onDelete, onPress }: Props) => {
  const completionSet = new Set([
    ...habit.completionHistory,
    ...(habit.completedTodayAt ? [habit.completedTodayAt.slice(0, 10)] : []),
  ]);

  const visibleDates = getVisibleDates(completionSet).map((date) => {
    const isoDate = date.toISOString().slice(0, 10);
    return {
      key: isoDate,
      label: DAY_LABELS[date.getDay()],
      isDone: completionSet.has(isoDate),
    };
  });

  return (
    <SwipeToDeleteRow
      onDelete={() => onDelete(habit.id)}
      onComplete={() => onComplete(habit.id)}
    >
      <TouchableOpacity
        style={styles.row}
        onPress={() => onPress?.(habit.id)}
        activeOpacity={0.82}
      >
        <View style={styles.contentRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {habit.title}
            </Text>
          </View>

          <View style={styles.weekRow}>
            {visibleDates.map((day) => (
              <View key={day.key} style={styles.dayItem}>
                <View style={[styles.dayCircle, day.isDone && styles.dayCircleDone]}>
                  {day.isDone && <Text style={styles.dayCheck}>✓</Text>}
                </View>
                <Text style={[styles.dayLabel, day.isDone && styles.dayLabelDone]}>{day.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </SwipeToDeleteRow>
  );
};

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#1F1D25',
    borderRadius: 30,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2D2934',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  title: {
    color: '#F4F3F8',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  dayItem: {
    alignItems: 'center',
    gap: 4,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3C4250',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleDone: {
    backgroundColor: '#C5DDE4',
  },
  dayCheck: {
    color: '#2B3941',
    fontSize: 13,
    fontWeight: '800',
  },
  dayLabel: {
    color: '#646072',
    fontSize: 9,
    fontWeight: '700',
  },
  dayLabelDone: {
    color: '#8C8898',
  },
});
