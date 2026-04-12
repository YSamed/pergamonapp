import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radius } from '../../theme';
import type { Habit } from '../../types';

type Props = {
  habit: Habit;
  onComplete: (id: string) => void;
  onPress?: (id: string) => void;
};

const d = colors.dark;

const SKILL_EMOJI: Record<string, string> = {
  strength: '💪',
  focus: '🎯',
  discipline: '⚔️',
  coding: '💻',
  communication: '💬',
  health: '❤️',
  learning: '📚',
  mindset: '🧠',
  career: '💼',
  social: '🤝',
};

export const HabitRow = ({ habit, onComplete, onPress }: Props) => {
  const isCompleted = !!habit.completedTodayAt;

  return (
    <TouchableOpacity
      style={[styles.row, isCompleted && styles.rowCompleted]}
      onPress={() => onPress?.(habit.id)}
      activeOpacity={0.8}
    >
      {/* Sol: İkon placeholder */}
      <View style={styles.iconBox}>
        <Text style={styles.iconEmoji}>📸</Text>
      </View>

      {/* Orta: Başlık + skill'ler */}
      <View style={styles.middle}>
        <Text style={[styles.title, isCompleted && styles.titleCompleted]} numberOfLines={1}>
          {habit.title}
        </Text>
        <View style={styles.skillRow}>
          {habit.skillIds.slice(0, 2).map((skillId) => (
            <Text key={skillId} style={styles.skillEmoji}>
              {SKILL_EMOJI[skillId] ?? '⭐'}
            </Text>
          ))}
          {habit.skillIds.length > 2 && (
            <Text style={styles.extraSkills}>+{habit.skillIds.length - 2}</Text>
          )}
          <Text style={styles.difficultyEmoji}>
            {habit.difficulty === 'easy' ? '🙂' : habit.difficulty === 'medium' ? '😐' : '😤'}
          </Text>
        </View>
      </View>

      {/* Sağ: Tamamla butonu */}
      <TouchableOpacity
        style={[styles.checkBox, isCompleted && styles.checkBoxDone]}
        onPress={() => !isCompleted && onComplete(habit.id)}
        activeOpacity={0.7}
      >
        {isCompleted && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: d.cardBorder,
    gap: spacing.md,
  },
  rowCompleted: {
    opacity: 0.5,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 22,
  },
  middle: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: d.text,
    fontSize: 15,
    fontWeight: '600',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: d.textMuted,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  skillEmoji: {
    fontSize: 14,
  },
  extraSkills: {
    color: d.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyEmoji: {
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  checkBox: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: d.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxDone: {
    backgroundColor: d.primary,
    borderColor: d.primary,
  },
  checkMark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
