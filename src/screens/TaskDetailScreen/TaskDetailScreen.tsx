import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { colors, spacing, radius } from '../../theme';
import { habitsService } from '../../services/habits.service';
import { todosService } from '../../services/todos.service';
import type { Habit, Todo } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

const d = colors.dark;

const SKILL_INFO: Record<string, { emoji: string; label: string }> = {
  strength: { emoji: '💪', label: 'Strength' },
  focus: { emoji: '🎯', label: 'Focus' },
  discipline: { emoji: '⚔️', label: 'Discipline' },
  coding: { emoji: '💻', label: 'Coding' },
  communication: { emoji: '💬', label: 'Communication' },
  health: { emoji: '❤️', label: 'Health' },
  learning: { emoji: '📚', label: 'Learning' },
  mindset: { emoji: '🧠', label: 'Mindset' },
  career: { emoji: '💼', label: 'Career' },
  social: { emoji: '🤝', label: 'Social' },
  fitness: { emoji: '🏋️', label: 'Fitness' },
};

const DIFFICULTY_INFO = {
  easy: { emoji: '🙂', label: 'Easy', color: colors.difficultyEasy },
  medium: { emoji: '😐', label: 'Medium', color: colors.difficultyMedium },
  hard: { emoji: '😤', label: 'Hard', color: colors.difficultyHard },
};

// Minimal weekly activity mock — gerçek uygulamada API'den gelir
const DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

const todayDayIndex = (() => {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1; // 0=Mon...6=Sun
})();

export const TaskDetailScreen = ({ route, navigation }: Props) => {
  const { taskId, taskType } = route.params;
  const [habit, setHabit] = useState<Habit | null>(null);
  const [todo, setTodo] = useState<Todo | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week

  // FAB animation
  const fabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    if (taskType === 'habit') {
      const h = await habitsService.getHabitById(taskId);
      setHabit(h);
    } else {
      const t = await todosService.getTodoById(taskId);
      setTodo(t);
    }
  };

  const toggleFab = () => {
    const toValue = fabOpen ? 0 : 1;
    Animated.spring(fabAnim, {
      toValue,
      useNativeDriver: true,
      bounciness: 8,
    }).start();
    setFabOpen(!fabOpen);
  };

  const closeFab = () => {
    if (!fabOpen) return;
    Animated.spring(fabAnim, { toValue: 0, useNativeDriver: true }).start();
    setFabOpen(false);
  };

  const handleComplete = async () => {
    closeFab();
    if (taskType === 'habit' && habit) {
      const updated = await habitsService.completeHabit(taskId);
      setHabit(updated);
    } else if (taskType === 'todo' && todo) {
      const updated = await todosService.completeTodo(taskId);
      setTodo(updated);
    }
  };

  const handleFail = async () => {
    closeFab();
    if (taskType === 'todo' && todo) {
      const updated = await todosService.failTodo(taskId);
      setTodo(updated);
    }
  };

  const handleUndo = async () => {
    closeFab();
    if (taskType === 'habit' && habit) {
      const updated = await habitsService.uncompleteHabit(taskId);
      setHabit(updated);
    } else if (taskType === 'todo' && todo) {
      const updated = await todosService.uncompleteTodo(taskId);
      setTodo(updated);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (taskType === 'habit') {
            await habitsService.deleteHabit(taskId);
          } else {
            await todosService.deleteTodo(taskId);
          }
          navigation.goBack();
        },
      },
    ]);
  };

  const task = habit ?? todo;
  if (!task) return null;

  const isHabit = taskType === 'habit';
  const isCompleted = isHabit
    ? !!(habit as Habit).completedTodayAt
    : !!(todo as Todo).completedAt;
  const isFailed = !isHabit && (todo as Todo).completedAt === 'failed';

  const difficulty = DIFFICULTY_INFO[task.difficulty];

  // Category label
  const categoryLabel = isHabit ? 'Habit' : 'To Do';

  // Status label
  const statusLabel = isFailed ? 'Failed' : isCompleted ? 'Completed' : 'Pending';

  // Fotoğraflardaki gibi Energy cost = difficulty-based, Health cost ve Coins Reward
  const energyCost = task.difficulty === 'easy' ? 1 : task.difficulty === 'medium' ? 2 : 3;
  const healthCost = 0;
  const coinsReward = 0;

  // Weekly activity: sadece habit için anlamlı
  // Mock: sadece bugün complete ise bugün işaretli
  const weekActivity = DAYS.map((_, i) => {
    if (i === todayDayIndex && isCompleted) return 1;
    return 0;
  });

  // Animate FAB actions
  const btn1 = {
    transform: [
      {
        translateY: fabAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -70],
        }),
      },
      { scale: fabAnim },
    ],
    opacity: fabAnim,
  };
  const btn2 = {
    transform: [
      {
        translateY: fabAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -140],
        }),
      },
      { scale: fabAnim },
    ],
    opacity: fabAnim,
  };
  const btn3 = {
    transform: [
      {
        translateY: fabAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -210],
        }),
      },
      { scale: fabAnim },
    ],
    opacity: fabAnim,
  };
  const btn4 = {
    transform: [
      {
        translateY: fabAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -280],
        }),
      },
      { scale: fabAnim },
    ],
    opacity: fabAnim,
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {task.title}
          </Text>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={closeFab}
        >
          {/* Task Icon + Title */}
          <View style={styles.heroSection}>
            <View style={styles.iconBox}>
              <Text style={styles.iconEmoji}>🏀</Text>
            </View>
            <Text style={styles.heroTitle}>{task.title}</Text>
          </View>

          {/* Category + Difficulty */}
          <View style={styles.row2}>
            <InfoCard style={styles.flex1}>
              <Text style={styles.cardLabel}>Category</Text>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{categoryLabel}</Text>
              </View>
            </InfoCard>
            <InfoCard style={styles.flex1}>
              <Text style={styles.cardLabel}>Difficulty</Text>
              <View style={styles.diffRow}>
                <Text style={styles.diffEmoji}>{difficulty.emoji}</Text>
                <Text style={[styles.diffLabel, { color: difficulty.color }]}>
                  {difficulty.label}
                </Text>
              </View>
            </InfoCard>
          </View>

          {/* Energy cost + Health cost */}
          <View style={styles.row2}>
            <InfoCard style={styles.flex1}>
              <Text style={styles.cardLabel}>Energy cost</Text>
              <View style={styles.costRow}>
                {Array.from({ length: energyCost }).map((_, i) => (
                  <Text key={i} style={styles.costEmoji}>⚡</Text>
                ))}
              </View>
            </InfoCard>
            <InfoCard style={styles.flex1}>
              <Text style={styles.cardLabel}>Health cost</Text>
              <View style={styles.costRow}>
                <Text style={styles.costEmoji}>❤️</Text>
                <Text style={styles.costValue}>{healthCost}</Text>
              </View>
            </InfoCard>
          </View>

          {/* Coins Reward */}
          <InfoCard>
            <Text style={styles.cardLabel}>Coins Reward</Text>
            <View style={styles.costRow}>
              <Text style={styles.costEmoji}>🪙</Text>
              <Text style={styles.coinsValue}>+{coinsReward}</Text>
            </View>
          </InfoCard>

          {/* Weekly Activity */}
          <View style={styles.weeklySection}>
            <View style={styles.weeklyHeader}>
              <Text style={styles.weeklyTitle}>Weekly Activity</Text>
              <View style={styles.completionBadge}>
                <Text style={styles.completionBadgeText}>
                  {weekActivity.reduce((a, b) => a + b, 0)} ✓
                </Text>
              </View>
            </View>

            <View style={styles.weekGrid}>
              {DAYS.map((day, i) => (
                <View key={day} style={styles.dayCol}>
                  <View
                    style={[
                      styles.dayBox,
                      weekActivity[i] ? styles.dayBoxDone : null,
                      i === todayDayIndex ? styles.dayBoxToday : null,
                    ]}
                  >
                    {weekActivity[i] ? (
                      <Text style={styles.dayNum}>{i + 1}</Text>
                    ) : null}
                    {i === todayDayIndex && !weekActivity[i] ? (
                      <Text style={styles.dayNum}>{i + 1}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Week navigation */}
            <View style={styles.weekNav}>
              <TouchableOpacity
                style={styles.weekNavBtn}
                onPress={() => setWeekOffset((p) => p - 1)}
              >
                <Text style={styles.weekNavArrow}>{'<'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.currentWeekBtn}
                onPress={() => setWeekOffset(0)}
              >
                <Text style={styles.currentWeekText}>Current Week</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.weekNavBtn}
                onPress={() => setWeekOffset((p) => p + 1)}
              >
                <Text style={styles.weekNavArrow}>{'>'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.weekNavBtn}>
                <Text style={styles.weekNavGrid}>⊞</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Skills */}
          <View style={styles.skillsSection}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <InfoCard>
              <View style={styles.skillsRow}>
                {task.skillIds.map((skillId) => {
                  const info = SKILL_INFO[skillId];
                  return (
                    <View key={skillId} style={styles.skillPill}>
                      <Text style={styles.skillPillText}>
                        {info?.label ?? skillId} {info?.emoji ?? '⭐'} +{Math.round(task.xpReward / task.skillIds.length)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </InfoCard>
          </View>

          {/* Task Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Task Details</Text>
            <View style={styles.row2}>
              <InfoCard style={styles.flex1}>
                <Text style={styles.cardLabel}>Frequency</Text>
                <Text style={styles.cardValue}>
                  {isHabit
                    ? (habit as Habit).frequency.charAt(0).toUpperCase() +
                      (habit as Habit).frequency.slice(1)
                    : 'Not scheduled'}
                </Text>
              </InfoCard>
              <InfoCard style={styles.flex1}>
                <Text style={styles.cardLabel}>Status</Text>
                <Text
                  style={[
                    styles.cardValue,
                    isCompleted && !isFailed ? styles.statusCompleted : null,
                    isFailed ? styles.statusFailed : null,
                  ]}
                >
                  {statusLabel}
                </Text>
              </InfoCard>
            </View>
            <View style={styles.row2}>
              <InfoCard style={styles.flex1}>
                <Text style={styles.cardLabel}>Deadline</Text>
                <Text style={styles.cardValue}>
                  {!isHabit && (todo as Todo).dueDate
                    ? new Date((todo as Todo).dueDate!).toLocaleDateString()
                    : 'No deadline'}
                </Text>
              </InfoCard>
              <InfoCard style={styles.flex1}>
                <Text style={styles.cardLabel}>Priority</Text>
                <Text style={styles.cardValue}>
                  {!isHabit
                    ? (todo as Todo).priority.charAt(0).toUpperCase() +
                      (todo as Todo).priority.slice(1)
                    : 'Medium'}
                </Text>
              </InfoCard>
            </View>
            <View style={styles.row2}>
              <InfoCard style={styles.flex1}>
                <Text style={styles.cardLabel}>{'Estimated\nDuration'}</Text>
                <Text style={styles.cardValue}>{'No estimated\nduration'}</Text>
              </InfoCard>
              <InfoCard style={styles.flex1}>
                <Text style={styles.cardLabel}>Created</Text>
                <Text style={styles.cardValue}>
                  {new Date(task.createdAt).toLocaleDateString()}
                </Text>
              </InfoCard>
            </View>
            <InfoCard>
              <Text style={styles.cardLabel}>Multiplier</Text>
              <Text style={styles.cardValue}>x1</Text>
            </InfoCard>
          </View>

          <View style={styles.bottomPad} />
        </ScrollView>

        {/* FAB + Actions */}
        <View style={styles.fabContainer} pointerEvents="box-none">
          {/* Action buttons */}
          <Animated.View style={[styles.fabAction, btn4]}>
            <Text style={styles.fabActionLabel}>Undo</Text>
            <TouchableOpacity style={[styles.fabActionBtn, styles.fabActionUndo]} onPress={handleUndo}>
              <Text style={styles.fabActionIcon}>↩</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.fabAction, btn3]}>
            <Text style={styles.fabActionLabel}>Edit</Text>
            <TouchableOpacity style={[styles.fabActionBtn, styles.fabActionEdit]} onPress={closeFab}>
              <Text style={styles.fabActionIcon}>✎</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.fabAction, btn2]}>
            <Text style={styles.fabActionLabel}>Fail</Text>
            <TouchableOpacity style={[styles.fabActionBtn, styles.fabActionFail]} onPress={handleFail}>
              <Text style={styles.fabActionIcon}>✕</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.fabAction, btn1]}>
            <Text style={styles.fabActionLabel}>Completed</Text>
            <TouchableOpacity style={[styles.fabActionBtn, styles.fabActionComplete]} onPress={handleComplete}>
              <Text style={styles.fabActionIcon}>✓</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Main FAB */}
          <TouchableOpacity style={styles.fab} onPress={toggleFab} activeOpacity={0.85}>
            <Animated.Text
              style={[
                styles.fabIcon,
                {
                  transform: [
                    {
                      rotate: fabAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '90deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              {fabOpen ? '←' : '☰'}
            </Animated.Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

// Küçük helper component
const InfoCard = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) => <View style={[styles.infoCard, style]}>{children}</View>;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: d.background,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: d.text,
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    color: d.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 18,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 36,
  },
  heroTitle: {
    color: d.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Cards
  infoCard: {
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: d.cardBorder,
    gap: spacing.xs,
  },
  cardLabel: {
    color: d.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  cardValue: {
    color: d.text,
    fontSize: 15,
    fontWeight: '600',
  },
  statusCompleted: {
    color: colors.success,
  },
  statusFailed: {
    color: colors.error,
  },

  // Row layouts
  row2: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: { flex: 1 },

  // Category pill
  categoryPill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: d.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  categoryPillText: {
    color: d.text,
    fontSize: 13,
    fontWeight: '600',
  },

  // Difficulty
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  diffEmoji: { fontSize: 16 },
  diffLabel: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Cost
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  costEmoji: { fontSize: 18 },
  costValue: {
    color: d.text,
    fontSize: 15,
    fontWeight: '600',
  },
  coinsValue: {
    color: colors.xp,
    fontSize: 15,
    fontWeight: '700',
  },

  // Weekly
  weeklySection: {
    backgroundColor: d.background,
    gap: spacing.md,
  },
  weeklyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weeklyTitle: {
    color: d.text,
    fontSize: 17,
    fontWeight: '700',
  },
  completionBadge: {
    backgroundColor: d.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  completionBadgeText: {
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
  weekNavBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNavArrow: {
    color: d.text,
    fontSize: 14,
    fontWeight: '700',
  },
  weekNavGrid: {
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

  // Skills
  skillsSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: d.text,
    fontSize: 17,
    fontWeight: '700',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillPill: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: d.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  skillPillText: {
    color: d.text,
    fontSize: 13,
    fontWeight: '600',
  },

  // Details section
  detailsSection: {
    gap: spacing.sm,
  },

  // FAB
  fabContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    alignItems: 'flex-end',
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: d.surface,
    borderWidth: 1,
    borderColor: d.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    color: d.text,
    fontSize: 20,
    fontWeight: '600',
  },
  fabAction: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fabActionLabel: {
    color: d.text,
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: d.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  fabActionBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabActionComplete: {
    backgroundColor: colors.success,
  },
  fabActionFail: {
    backgroundColor: colors.error,
  },
  fabActionEdit: {
    backgroundColor: d.surfaceElevated,
  },
  fabActionUndo: {
    backgroundColor: colors.warning,
  },
  fabActionIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  bottomPad: { height: 100 },
});
