import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import type { Skill } from '../../types';
import { skillsService, type LinkedTask } from '../../services/skills.service';
import { colors, spacing, radius } from '../../theme';
import { WeeklyActivity } from '../../components/TaskDetailScreen/WeeklyActivity';

type Props = NativeStackScreenProps<RootStackParamList, 'SkillDetail'>;

const d = colors.dark;
const XP_PER_LEVEL = 100;

export const SkillDetailScreen = ({ route, navigation }: Props) => {
  const { skillId } = route.params;
  const [skill, setSkill] = useState<Skill | null>(null);
  const [linkedTasks, setLinkedTasks] = useState<LinkedTask[]>([]);
  const [completedDates, setCompletedDates] = useState<string[]>([]);

  useEffect(() => {
    void Promise.all([
      skillsService.getSkillById(skillId).then(setSkill),
      skillsService.getLinkedTasks(skillId).then(setLinkedTasks),
      skillsService.getCompletedDates(skillId).then(setCompletedDates),
    ]);
  }, [skillId]);

  if (!skill) return null;

  const xpInLevel = skill.xp % XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - xpInLevel;
  const progress = xpInLevel / XP_PER_LEVEL;

  const handleDelete = () => {
    Alert.alert('Delete Skill', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.headerIcon}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{skill.label}</Text>
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
              <Text style={styles.iconEmoji}>{skill.icon}</Text>
            </View>
            <Text style={styles.heroTitle}>{skill.label}</Text>
            <Text style={styles.heroDesc}>{skill.description}</Text>
          </View>

          {/* Level + XP bar */}
          <View style={styles.levelCard}>
            <Text style={styles.levelText}>Level {skill.level}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.xpRow}>
              <Text style={styles.xpCurrent}>{xpInLevel}/{XP_PER_LEVEL} XP</Text>
              <Text style={styles.xpRemaining}>{xpToNext} XP remaining</Text>
            </View>
          </View>

          {/* Streak cards */}
          <View style={styles.row2}>
            <View style={[styles.streakCard, styles.flex1]}>
              <Text style={styles.streakLabel}>Current Streak</Text>
              <View style={styles.streakVal}>
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={styles.streakNum}>
                  {skill.currentStreak} {skill.currentStreak === 1 ? 'day' : 'days'}
                </Text>
              </View>
            </View>
            <View style={[styles.streakCard, styles.flex1]}>
              <Text style={styles.streakLabel}>Best Streak</Text>
              <View style={styles.streakVal}>
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={styles.streakNum}>
                  {skill.longestStreak} {skill.longestStreak === 1 ? 'day' : 'days'}
                </Text>
              </View>
            </View>
          </View>

          {/* Weekly Activity */}
          <WeeklyActivity completedDates={completedDates} />

          {/* Linked Tasks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Linked Tasks</Text>
            {linkedTasks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No tasks linked to this skill yet.</Text>
              </View>
            ) : (
              linkedTasks.map((task) => (
                <LinkedTaskRow
                  key={task.id}
                  task={task}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: task.id, taskType: task.type })}
                />
              ))
            )}
          </View>

          <View style={styles.bottomPad} />
        </ScrollView>

        {/* Edit FAB */}
        <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
          <Text style={styles.fabIcon}>✎</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

// ── Linked Task Row ──────────────────────────────────────────────────────────

const TASK_ICONS: Record<string, string> = {
  habit: '🎯',
  todo: '📋',
};

const LinkedTaskRow = ({ task, onPress }: { task: LinkedTask; onPress: () => void }) => (
  <TouchableOpacity style={styles.taskCard} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.taskIconWrap}>
      <Text style={styles.taskIcon}>{TASK_ICONS[task.type]}</Text>
    </View>
    <View style={styles.taskInfo}>
      <Text
        style={[
          styles.taskTitle,
          task.isCompleted && styles.taskTitleDone,
          task.isFailed && styles.taskTitleFailed,
        ]}
        numberOfLines={1}
      >
        {task.title}
      </Text>
      <View style={styles.taskMeta}>
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>⭐ +{task.xpReward} XP</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            task.isCompleted && styles.statusDone,
            task.isFailed && styles.statusFailed,
          ]}
        >
          <Text style={styles.statusText}>
            {task.isFailed ? '✕ Failed' : task.isCompleted ? '✓ Completed' : '○ Pending'}
          </Text>
        </View>
      </View>
    </View>
    <Text style={styles.taskArrow}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: d.background },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { color: d.text, fontSize: 20, fontWeight: '600' },
  headerTitle: {
    flex: 1,
    color: d.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },

  hero: { alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 40 },
  heroTitle: { color: d.text, fontSize: 20, fontWeight: '700' },
  heroDesc: {
    color: d.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },

  levelCard: {
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: d.border,
    gap: spacing.sm,
  },
  levelText: { color: d.text, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: d.surfaceElevated,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: colors.success },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  xpCurrent: { color: d.textSecondary, fontSize: 13 },
  xpRemaining: { color: d.textSecondary, fontSize: 13 },

  row2: { flexDirection: 'row', gap: spacing.sm },
  flex1: { flex: 1 },

  streakCard: {
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: d.border,
    gap: spacing.xs,
  },
  streakLabel: { color: d.textSecondary, fontSize: 13, fontWeight: '500' },
  streakVal: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  streakFire: { fontSize: 18 },
  streakNum: { color: d.text, fontSize: 18, fontWeight: '700' },

  section: { gap: spacing.sm },
  sectionTitle: { color: d.text, fontSize: 17, fontWeight: '700' },

  emptyCard: {
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: d.border,
    alignItems: 'center',
  },
  emptyText: { color: d.textSecondary, fontSize: 14 },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: d.border,
    gap: spacing.md,
  },
  taskIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskIcon: { fontSize: 22 },
  taskInfo: { flex: 1, gap: 6 },
  taskTitle: { color: d.text, fontSize: 15, fontWeight: '600' },
  taskTitleDone: { textDecorationLine: 'line-through', color: d.textSecondary },
  taskTitleFailed: { textDecorationLine: 'line-through', color: colors.error },
  taskMeta: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  xpBadge: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: d.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  xpBadgeText: { color: d.text, fontSize: 12, fontWeight: '600' },
  statusBadge: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: d.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusDone: { borderColor: colors.success },
  statusFailed: { borderColor: colors.error },
  statusText: { color: d.textSecondary, fontSize: 12, fontWeight: '600' },
  taskArrow: { color: d.textMuted, fontSize: 20 },

  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: d.surface,
    borderWidth: 1,
    borderColor: d.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: { color: d.text, fontSize: 20 },

  bottomPad: { height: 80 },
});
