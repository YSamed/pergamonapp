import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Habit, RootStackParamList, Todo, User, UserProgress } from '../../types';
import { colors, spacing, radius } from '../../theme';
import { habitsService } from '../../services/habits.service';
import { todosService } from '../../services/todos.service';
import { progressService } from '../../services/progress.service';
import { profileService } from '../../services/profile.service';
import { clanService } from '../../services/clan.service';
import {
  levelProgress as calcLevelProgress,
  xpToNextLevel,
} from '../../modules/level';

const d = colors;
const avatarImage = require('../../assets/icons/iconn.png');

type Nav = NativeStackNavigationProp<RootStackParamList>;

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
  fitness: '🏋️',
};

const greetingFor = (hour: number) => {
  if (hour < 5) return 'İyi geceler';
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
};

const formatDateTR = (date: Date) => {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
};

export const HomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [clanTitle, setClanTitle] = useState<string | null>(null);
  const [clanProgress, setClanProgress] = useState<number>(0);

  const loadData = useCallback(async () => {
    const [u, p, h, t] = await Promise.all([
      profileService.getProfile(),
      progressService.getUserProgress(),
      habitsService.getTodayHabits(),
      todosService.getTodos(),
    ]);
    setUser(u);
    setProgress(p);
    setHabits(h);
    setTodos(t);

    if (u.clanId) {
      const overview = await clanService.getClanOverview(u.clanId);
      const ch = overview.activeChallenge;
      if (ch) {
        setClanTitle(ch.title);
        setClanProgress(Math.min(1, ch.currentScore / ch.targetScore));
      }
    }
  }, []);

  useEffect(() => {
    void loadData();
    const unsub = navigation.addListener('focus', () => void loadData());
    return unsub;
  }, [navigation, loadData]);

  const completeHabit = async (id: string) => {
    const target = habits.find((habit) => habit.id === id);
    if (!target) return;
    const updated = target.completedTodayAt
      ? await habitsService.uncompleteHabit(id)
      : await habitsService.completeHabit(id);
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
  };

  const completeTodo = async (id: string) => {
    const target = todos.find((todo) => todo.id === id);
    if (!target) return;
    const updated = target.completedAt
      ? await todosService.uncompleteTodo(id)
      : await todosService.completeTodo(id);
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const totalTodayXP =
    progress?.recentXPEvents
      ?.filter((event) => {
        const created = new Date(event.createdAt);
        const now = new Date();
        return (
          created.getFullYear() === now.getFullYear() &&
          created.getMonth() === now.getMonth() &&
          created.getDate() === now.getDate()
        );
      })
      .reduce((sum, event) => sum + event.xpAmount, 0) ?? 0;

  const completedHabitsToday = habits.filter((h) => !!h.completedTodayAt).length;
  const remainingHabits = habits.filter((h) => !h.completedTodayAt).slice(0, 3);

  const priorityScore = (todo: Todo) => {
    if (todo.priority === 'high') return 0;
    if (todo.priority === 'medium') return 1;
    return 2;
  };
  const topTodos = [...todos]
    .filter((t) => !t.completedAt)
    .sort((a, b) => priorityScore(a) - priorityScore(b))
    .slice(0, 3);

  const now = new Date();
  const greeting = greetingFor(now.getHours());

  const totalTasksToday = habits.length + topTodos.length;
  const completedTasksToday =
    completedHabitsToday + todos.filter((t) => !!t.completedAt).length;
  const todayProgressPct =
    totalTasksToday > 0 ? completedTasksToday / totalTasksToday : 0;

  const lvlProgress = progress ? calcLevelProgress(progress.user.totalXP) : 0;
  const xpRemaining = progress ? xpToNextLevel(progress.user.totalXP) : 0;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting header */}
          <View style={styles.greetingRow}>
            <View style={styles.greetingTextWrap}>
              <Text style={styles.greetingDate}>{formatDateTR(now)}</Text>
              <Text style={styles.greetingHello}>
                {greeting}, {user?.displayName ?? '...'}
              </Text>
            </View>
            <View style={styles.avatarBtn}>
              <Image source={avatarImage} style={styles.avatarImage} resizeMode="contain" />
              {user && (
                <View style={styles.avatarLevel}>
                  <Text style={styles.avatarLevelText}>{user.level}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Today plan card */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Bugünün planı</Text>
              <Text style={styles.planXP}>+{totalTodayXP} XP</Text>
            </View>
            <View style={styles.planMetrics}>
              <PlanMetric label="Habit" value={`${completedHabitsToday}/${habits.length}`} />
              <PlanMetric
                label="To Do"
                value={`${todos.filter((t) => !!t.completedAt).length}/${todos.length}`}
              />
              <PlanMetric
                label="Streak"
                value={`${progress?.streak.currentStreak ?? 0}🔥`}
              />
            </View>
            <View style={styles.planTrack}>
              <View
                style={[styles.planFill, { width: `${todayProgressPct * 100}%` }]}
              />
            </View>
            <Text style={styles.planPercent}>
              %{Math.round(todayProgressPct * 100)} tamamlandı
            </Text>
          </View>

          {/* Level snapshot */}
          {progress && (
            <View style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>Lv {progress.user.level}</Text>
                </View>
                <Text style={styles.levelMeta}>
                  {progress.user.totalXP} XP toplam
                </Text>
              </View>
              <View style={styles.levelTrack}>
                <View style={[styles.levelFill, { width: `${lvlProgress * 100}%` }]} />
              </View>
              <Text style={styles.levelHint}>
                Sonraki seviyeye {xpRemaining} XP
              </Text>
            </View>
          )}

          {/* Quick actions */}
          <View style={styles.quickActions}>
            <QuickAction
              icon="add-circle-outline"
              label="Görev ekle"
              onPress={() => navigation.navigate('CreateTask')}
            />
            <QuickAction
              icon="stats-chart-outline"
              label="İstatistikler"
              onPress={() => navigation.navigate('SkillStatistics')}
            />
            <QuickAction
              icon="people-outline"
              label="Topluluk"
              onPress={() => navigation.navigate('Community')}
            />
          </View>

          {/* Today's habits */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bugünün habitleri</Text>
              <Text style={styles.sectionMeta}>
                {completedHabitsToday}/{habits.length}
              </Text>
            </View>
            {remainingHabits.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🎉</Text>
                <Text style={styles.emptyTitle}>Bugünkü habitler tamam</Text>
                <Text style={styles.emptySubtitle}>
                  Harika gidiyorsun, yarın tekrar görüşürüz.
                </Text>
              </View>
            ) : (
              remainingHabits.map((habit) => (
                <QuickHabitRow
                  key={habit.id}
                  habit={habit}
                  onComplete={() => completeHabit(habit.id)}
                  onPress={() =>
                    navigation.navigate('TaskDetail', {
                      taskId: habit.id,
                      taskType: 'habit',
                    })
                  }
                />
              ))
            )}
          </View>

          {/* Priority todos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Öncelikli todo'lar</Text>
              <Text style={styles.sectionMeta}>{topTodos.length}</Text>
            </View>
            {topTodos.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyTitle}>Aktif todo yok</Text>
                <Text style={styles.emptySubtitle}>
                  Yeni bir görev ekleyerek başlayabilirsin.
                </Text>
              </View>
            ) : (
              topTodos.map((todo) => (
                <QuickTodoRow
                  key={todo.id}
                  todo={todo}
                  onComplete={() => completeTodo(todo.id)}
                  onPress={() =>
                    navigation.navigate('TaskDetail', {
                      taskId: todo.id,
                      taskType: 'todo',
                    })
                  }
                />
              ))
            )}
          </View>

          {/* Clan teaser */}
          {clanTitle && (
            <View style={styles.clanCard}>
              <View style={styles.clanHeader}>
                <Text style={styles.clanIcon}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clanLabel}>Klan challenge</Text>
                  <Text style={styles.clanTitle}>{clanTitle}</Text>
                </View>
                <Text style={styles.clanPercent}>
                  %{Math.round(clanProgress * 100)}
                </Text>
              </View>
              <View style={styles.clanTrack}>
                <View
                  style={[styles.clanFill, { width: `${clanProgress * 100}%` }]}
                />
              </View>
            </View>
          )}

          <View style={styles.bottomPad} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const PlanMetric = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metricCell}>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const QuickAction = ({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.quickActionBtn}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.quickActionIcon}>
      <Ionicons name={icon} size={20} color={d.text} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const QuickHabitRow = ({
  habit,
  onComplete,
  onPress,
}: {
  habit: Habit;
  onComplete: () => void;
  onPress: () => void;
}) => {
  const isDone = !!habit.completedTodayAt;
  return (
    <TouchableOpacity
      style={styles.taskRow}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <TouchableOpacity
        onPress={onComplete}
        style={[styles.checkBtn, isDone && styles.checkBtnDone]}
        activeOpacity={0.8}
      >
        {isDone && <Text style={styles.checkBtnDoneText}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.taskBody}>
        <Text style={styles.taskTitle} numberOfLines={1}>{habit.title}</Text>
        <View style={styles.taskMetaRow}>
          {habit.streak > 0 && (
            <Text style={styles.taskMetaStreak}>🔥 {habit.streak}</Text>
          )}
          <View style={styles.taskSkillRow}>
            {habit.skillIds.slice(0, 3).map((skillId) => (
              <Text key={skillId} style={styles.taskSkillEmoji}>
                {SKILL_EMOJI[skillId] ?? '⭐'}
              </Text>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.xpBadge}>
        <Text style={styles.xpBadgeText}>+{habit.xpReward}</Text>
      </View>
    </TouchableOpacity>
  );
};

const QuickTodoRow = ({
  todo,
  onComplete,
  onPress,
}: {
  todo: Todo;
  onComplete: () => void;
  onPress: () => void;
}) => {
  const isDone = !!todo.completedAt && todo.completedAt !== 'failed';
  const priorityColor =
    todo.priority === 'high' ? '#FF6B6B' : todo.priority === 'medium' ? '#F4B544' : '#4ED8C7';
  return (
    <TouchableOpacity
      style={styles.taskRow}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <TouchableOpacity
        onPress={onComplete}
        style={[styles.checkBtn, isDone && styles.checkBtnDone]}
        activeOpacity={0.8}
      >
        {isDone && <Text style={styles.checkBtnDoneText}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.taskBody}>
        <Text style={styles.taskTitle} numberOfLines={1}>{todo.title}</Text>
        <View style={styles.taskMetaRow}>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          <Text style={styles.taskMetaPriority}>
            {todo.priority === 'high' ? 'Yüksek' : todo.priority === 'medium' ? 'Orta' : 'Düşük'}
          </Text>
        </View>
      </View>
      <View style={styles.xpBadge}>
        <Text style={styles.xpBadgeText}>+{todo.xpReward}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: d.background,
  },
  safeArea: {
    flex: 1,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  greetingTextWrap: { flex: 1 },
  greetingDate: {
    color: d.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  greetingHello: {
    color: d.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginTop: 2,
  },
  avatarBtn: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: '#B9AAEA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: 44,
    height: 44,
  },
  avatarLevel: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    minWidth: 22,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: d.surfaceElevated,
    borderWidth: 1.5,
    borderColor: d.background,
  },
  avatarLevelText: {
    color: d.text,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },

  planCard: {
    backgroundColor: d.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: d.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    color: d.text,
    fontSize: 17,
    fontWeight: '700',
  },
  planXP: {
    color: d.xp,
    fontSize: 14,
    fontWeight: '800',
  },
  planMetrics: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCell: {
    flex: 1,
    backgroundColor: d.surfaceElevated,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: d.border,
  },
  metricValue: {
    color: d.text,
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    color: d.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  planTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: d.surfaceElevated,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  planFill: {
    height: '100%',
    backgroundColor: d.primary,
    borderRadius: radius.full,
  },
  planPercent: {
    color: d.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },

  levelCard: {
    backgroundColor: d.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: d.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(78,216,199,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(78,216,199,0.3)',
  },
  levelBadgeText: {
    color: d.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  levelMeta: {
    color: d.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  levelTrack: {
    height: 10,
    borderRadius: radius.full,
    backgroundColor: d.surfaceElevated,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    backgroundColor: d.primary,
    borderRadius: radius.full,
  },
  levelHint: {
    color: d.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },

  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: d.border,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    color: d.text,
    fontSize: 12,
    fontWeight: '700',
  },

  section: { gap: spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: d.text,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionMeta: {
    color: d.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: d.border,
  },
  checkBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: d.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDone: {
    backgroundColor: d.primary,
    borderColor: d.primary,
  },
  checkBtnDoneText: {
    color: d.background,
    fontSize: 14,
    fontWeight: '900',
  },
  taskBody: {
    flex: 1,
    gap: 2,
  },
  taskTitle: {
    color: d.text,
    fontSize: 15,
    fontWeight: '700',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  taskMetaStreak: {
    color: d.streak,
    fontSize: 12,
    fontWeight: '800',
  },
  taskSkillRow: {
    flexDirection: 'row',
    gap: 4,
  },
  taskSkillEmoji: {
    fontSize: 14,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskMetaPriority: {
    color: d.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  xpBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(244,181,68,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(244,181,68,0.3)',
  },
  xpBadgeText: {
    color: d.xp,
    fontSize: 12,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: d.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  emptyEmoji: { fontSize: 28 },
  emptyTitle: {
    color: d.text,
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: d.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },

  clanCard: {
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    padding: spacing.md,
    gap: spacing.sm,
  },
  clanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clanIcon: { fontSize: 26 },
  clanLabel: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  clanTitle: {
    color: d.text,
    fontSize: 15,
    fontWeight: '700',
  },
  clanPercent: {
    color: '#C4B5FD',
    fontSize: 14,
    fontWeight: '800',
  },
  clanTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: 'rgba(139,92,246,0.16)',
    overflow: 'hidden',
  },
  clanFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: radius.full,
  },

  bottomPad: { height: 110 },
});
