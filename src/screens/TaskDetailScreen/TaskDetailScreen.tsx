import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { colors, spacing, radius } from '../../theme';
import { habitsService } from '../../services/habits.service';
import { todosService } from '../../services/todos.service';
import type { Habit, Todo } from '../../types';
import { InfoCard } from '../../components/TaskDetailScreen/InfoCard';
import { WeeklyActivity } from '../../components/TaskDetailScreen/WeeklyActivity';
import { TaskFab } from '../../components/TaskDetailScreen/TaskFab';
import {
  XPGainOverlay,
  LevelUpModal,
  StreakMilestoneToast,
} from '../../components/Gamification';
import { mockProgress } from '../../mock';
import { getStreakBonus } from '../../modules/xp';
import { levelProgress as calcLevelProgress, calculateLevel } from '../../modules/level';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

const d = colors;

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


export const TaskDetailScreen = ({ route, navigation }: Props) => {
  const { taskId, taskType } = route.params;
  const [habit, setHabit] = useState<Habit | null>(null);
  const [todo, setTodo] = useState<Todo | null>(null);

  // Gamification state
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [xpSkillGains, setXpSkillGains] = useState<{ icon: string; label: string; xp: number }[]>([]);
  const [xpLevelProgress, setXpLevelProgress] = useState<{ from: number; to: number } | undefined>();
  const [xpStreakCount, setXpStreakCount] = useState<number | undefined>();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);
  const [streakMilestoneCount, setStreakMilestoneCount] = useState(0);
  const [streakBonusXP, setStreakBonusXP] = useState(0);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    if (taskType === 'habit') {
      setHabit(await habitsService.getHabitById(taskId));
    } else {
      setTodo(await todosService.getTodoById(taskId));
    }
  };

  const handleComplete = async () => {
    const task = habit ?? todo;
    if (!task) return;

    // Calculate XP and skill gains before completing
    const earnedXP = task.xpReward;
    const skills = task.skillIds.map((skillId) => {
      const info = SKILL_INFO[skillId];
      return {
        icon: info?.emoji ?? '⭐',
        label: info?.label ?? skillId,
        xp: Math.round(earnedXP / task.skillIds.length),
      };
    });

    // Calculate level progress
    const currentTotalXP = mockProgress.user.totalXP;
    const newTotalXP = currentTotalXP + earnedXP;
    const progressFrom = calcLevelProgress(currentTotalXP);
    const progressTo = calcLevelProgress(newTotalXP);
    const oldLevel = calculateLevel(currentTotalXP);
    const nextLevel = calculateLevel(newTotalXP);
    const didLevelUp = nextLevel > oldLevel;

    // Check streak milestone (for habits)
    const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
    let streakHit = 0;
    if (taskType === 'habit' && habit) {
      const newStreak = habit.streak + 1;
      if (STREAK_MILESTONES.includes(newStreak)) {
        streakHit = newStreak;
      }
    }

    // Perform the actual completion
    if (taskType === 'habit' && habit) {
      setHabit(await habitsService.completeHabit(taskId));
    } else if (taskType === 'todo' && todo) {
      setTodo(await todosService.completeTodo(taskId));
    }

    // Trigger XP animation
    setXpAmount(earnedXP);
    setXpSkillGains(skills);
    setXpLevelProgress({ from: progressFrom, to: didLevelUp ? 1 : progressTo });
    setXpStreakCount(taskType === 'habit' && habit ? habit.streak + 1 : undefined);
    setShowXP(true);

    // Queue level-up modal after XP animation
    if (didLevelUp) {
      setNewLevel(nextLevel);
      setTimeout(() => setShowLevelUp(true), 2500);
    }

    // Queue streak milestone toast
    if (streakHit > 0) {
      const bonus = getStreakBonus(streakHit);
      setStreakMilestoneCount(streakHit);
      setStreakBonusXP(bonus);
      setTimeout(() => setShowStreakMilestone(true), didLevelUp ? 4500 : 2600);
    }
  };

  const handleFail = async () => {
    if (taskType === 'todo' && todo) {
      setTodo(await todosService.failTodo(taskId));
    }
  };

  const handleUndo = async () => {
    if (taskType === 'habit' && habit) {
      setHabit(await habitsService.uncompleteHabit(taskId));
    } else if (taskType === 'todo' && todo) {
      setTodo(await todosService.uncompleteTodo(taskId));
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
  const categoryLabel = isHabit ? 'Habit' : 'To Do';
  const statusLabel = isFailed ? 'Failed' : isCompleted ? 'Completed' : 'Pending';
  const energyCost = task.difficulty === 'easy' ? 1 : task.difficulty === 'medium' ? 2 : 3;

  const completedDates: string[] = isHabit
    ? [
        ...((habit as Habit).completionHistory ?? []),
        ...((habit as Habit).completedTodayAt
          ? [new Date().toISOString().slice(0, 10)]
          : []),
      ]
    : (todo as Todo).completedAt && (todo as Todo).completedAt !== 'failed'
      ? [(todo as Todo).completedAt!.slice(0, 10)]
      : [];

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.headerIcon}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{task.title}</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
            <Text style={styles.headerIcon}>🗑</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
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

          {/* Energy + Health cost */}
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
                <Text style={styles.costValue}>0</Text>
              </View>
            </InfoCard>
          </View>

          {/* Coins Reward */}
          <InfoCard>
            <Text style={styles.cardLabel}>Coins Reward</Text>
            <View style={styles.costRow}>
              <Text style={styles.costEmoji}>🪙</Text>
              <Text style={styles.coinsValue}>+0</Text>
            </View>
          </InfoCard>

          {/* Weekly Activity */}
          <WeeklyActivity completedDates={completedDates} />

          {/* Skills */}
          <View style={styles.section}>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Task Details</Text>
            <View style={styles.row2}>
              <InfoCard style={styles.flex1}>
                <Text style={styles.cardLabel}>Frequency</Text>
                <Text style={styles.cardValue}>
                  {isHabit
                    ? (habit as Habit).frequency.charAt(0).toUpperCase() + (habit as Habit).frequency.slice(1)
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
                    ? (todo as Todo).priority.charAt(0).toUpperCase() + (todo as Todo).priority.slice(1)
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

        <TaskFab
          onComplete={handleComplete}
          onFail={handleFail}
          onUndo={handleUndo}
          onEdit={() => {}}
        />

        {/* Gamification overlays */}
        <XPGainOverlay
          visible={showXP}
          xpAmount={xpAmount}
          skillGains={xpSkillGains}
          levelProgress={xpLevelProgress}
          streakCount={xpStreakCount}
          onDismiss={() => setShowXP(false)}
        />
        <LevelUpModal
          visible={showLevelUp}
          newLevel={newLevel}
          onDismiss={() => setShowLevelUp(false)}
        />
        <StreakMilestoneToast
          visible={showStreakMilestone}
          streakCount={streakMilestoneCount}
          bonusXP={streakBonusXP}
          onDismiss={() => setShowStreakMilestone(false)}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: d.background },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { color: d.text, fontSize: 20, fontWeight: '600' },
  headerTitle: {
    flex: 1,
    color: d.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },

  // Hero
  hero: { alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 36 },
  heroTitle: { color: d.text, fontSize: 18, fontWeight: '700', textAlign: 'center' },

  // Card content
  cardLabel: { color: d.textSecondary, fontSize: 13, fontWeight: '500' },
  cardValue: { color: d.text, fontSize: 15, fontWeight: '600' },
  statusCompleted: { color: colors.success },
  statusFailed: { color: colors.error },

  // Layouts
  row2: { flexDirection: 'row', gap: spacing.sm },
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
  categoryPillText: { color: d.text, fontSize: 13, fontWeight: '600' },

  // Difficulty
  diffRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  diffEmoji: { fontSize: 16 },
  diffLabel: { fontSize: 15, fontWeight: '600' },

  // Cost
  costRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  costEmoji: { fontSize: 18 },
  costValue: { color: d.text, fontSize: 15, fontWeight: '600' },
  coinsValue: { color: colors.xp, fontSize: 15, fontWeight: '700' },

  // Sections
  section: { gap: spacing.sm },
  sectionTitle: { color: d.text, fontSize: 17, fontWeight: '700' },

  // Skills
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skillPill: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: d.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  skillPillText: { color: d.text, fontSize: 13, fontWeight: '600' },

  bottomPad: { height: 100 },
});
