import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radius } from '../../theme';
import type { Todo } from '../../types';

type Props = {
  todo: Todo;
  onComplete: (id: string) => void;
  onPress?: (id: string) => void;
};

const d = colors.dark;

const PRIORITY_COLOR: Record<string, string> = {
  high: colors.priorityHigh,
  medium: colors.priorityMedium,
  low: colors.priorityLow,
};

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

export const TodoRow = ({ todo, onComplete, onPress }: Props) => {
  const isCompleted = !!todo.completedAt;

  return (
    <TouchableOpacity
      style={[styles.row, isCompleted && styles.rowCompleted]}
      onPress={() => onPress?.(todo.id)}
      activeOpacity={0.8}
    >
      {/* Sol: İkon placeholder */}
      <View style={styles.iconBox}>
        <Text style={styles.iconEmoji}>📋</Text>
      </View>

      {/* Orta */}
      <View style={styles.middle}>
        <Text style={[styles.title, isCompleted && styles.titleCompleted]} numberOfLines={2}>
          {todo.title}
        </Text>
        <View style={styles.tagRow}>
          {/* XP badge */}
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>💜 +{todo.xpReward}</Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>🔥 +{todo.xpReward}</Text>
          </View>
          {/* Skill emojis */}
          {todo.skillIds.slice(0, 1).map((s) => (
            <Text key={s} style={styles.skillEmoji}>{SKILL_EMOJI[s] ?? '⭐'}</Text>
          ))}
          {todo.skillIds.length > 1 && (
            <Text style={styles.extraSkills}>+{todo.skillIds.length - 1}</Text>
          )}
          {/* Difficulty emoji */}
          <Text style={styles.skillEmoji}>
            {todo.difficulty === 'easy' ? '🙂' : todo.difficulty === 'medium' ? '😐' : '😤'}
          </Text>
        </View>
      </View>

      {/* Sağ: Tamamla butonu */}
      <TouchableOpacity
        style={[styles.checkBox, isCompleted && styles.checkBoxDone]}
        onPress={() => !isCompleted && onComplete(todo.id)}
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
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  xpBadge: {
    backgroundColor: d.surfaceElevated,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  xpText: {
    color: d.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  skillEmoji: {
    fontSize: 14,
  },
  extraSkills: {
    color: d.textSecondary,
    fontSize: 12,
    fontWeight: '600',
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
