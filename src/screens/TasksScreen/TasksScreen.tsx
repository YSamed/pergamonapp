import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import type { RootStackParamList } from '../../types';
import { colors, spacing, radius } from '../../theme';
import { habitsService } from '../../services/habits.service';
import { todosService } from '../../services/todos.service';
import { progressService } from '../../services/progress.service';
import { profileService } from '../../services/profile.service';
import type { Habit, Todo, UserProgress, User } from '../../types';
import { UserProgressCard } from '../../components/TasksScreen/UserProgressCard';
import { HabitRow } from '../../components/TasksScreen/HabitRow';
import { TodoRow } from '../../components/TasksScreen/TodoRow';
import { CategoriesBottomSheet, type Category } from '../../components/TasksScreen/CategoriesBottomSheet';
import { NewCategoryDialog } from '../../components/TasksScreen/NewCategoryDialog';
import { DeleteCategoryDialog } from '../../components/TasksScreen/DeleteCategoryDialog';

type FilterTab = 'all' | 'habits' | 'todos';
type ReminderTask = {
  id: string;
  title: string;
  type: 'habit' | 'todo';
};

const d = colors.dark;
const MOCK_TASK_DURATION_SECONDS = 3;
const TASKS_NOTIFICATION_CHANNEL_ID = 'tasks-notifications';
const FALLBACK_REMINDER_TASK: ReminderTask = {
  id: 'mock-software-task',
  title: 'Yazılım',
  type: 'todo',
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'habits', name: 'Habits', taskCount: 1 },
  { id: 'todos', name: 'To Do', taskCount: 4 },
];

export const TasksScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [pendingReminderTask, setPendingReminderTask] = useState<ReminderTask | null>(null);
  const [notificationCardTask, setNotificationCardTask] = useState<ReminderTask | null>(null);
  const reminderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    return () => {
      if (reminderTimer.current) {
        clearTimeout(reminderTimer.current);
      }
    };
  }, []);

  const loadData = async () => {
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
  };

  const handleTaskPress = (id: string, type: 'habit' | 'todo') => {
    navigation.navigate('TaskDetail', { taskId: id, taskType: type });
  };

  const handleCompleteHabit = async (id: string) => {
    const updated = await habitsService.completeHabit(id);
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
  };

  const handleCompleteTodo = async (id: string) => {
    const updated = await todosService.completeTodo(id);
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const getReminderTask = (): ReminderTask => {
    const expiredTodo = todos.find((todo) => {
      if (!todo.dueDate) return false;
      return new Date(todo.dueDate).getTime() <= Date.now();
    });

    if (expiredTodo) {
      return {
        id: expiredTodo.id,
        title: expiredTodo.title,
        type: 'todo',
      };
    }

    const activeTodo = todos.find((todo) => !todo.completedAt);
    if (activeTodo) {
      return {
        id: activeTodo.id,
        title: activeTodo.title,
        type: 'todo',
      };
    }

    const activeHabit = habits.find((habit) => !habit.completedTodayAt);
    if (!activeHabit) return FALLBACK_REMINDER_TASK;

    return {
      id: activeHabit.id,
      title: activeHabit.title,
      type: 'habit',
    };
  };

  const handleNotificationPress = () => {
    const reminderTask = getReminderTask();

    if (reminderTimer.current) {
      clearTimeout(reminderTimer.current);
      reminderTimer.current = null;
    }

    setPendingReminderTask(null);
    setNotificationCardTask(null);
    void showSystemNotification(reminderTask);
  };

  const showSystemNotification = async (task: ReminderTask) => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(TASKS_NOTIFICATION_CHANNEL_ID, {
          name: 'Tasks',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
        });
      }

      const currentPermissions = await Notifications.getPermissionsAsync();
      let isGranted = currentPermissions.granted;

      if (!isGranted) {
        const requestedPermissions = await Notifications.requestPermissionsAsync();
        isGranted = requestedPermissions.granted;
      }

      if (!isGranted) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: task.title,
          body: `${task.title} görevinin süresi tamamlandı`,
          sound: 'default',
        },
        trigger: Platform.OS === 'android'
          ? { channelId: TASKS_NOTIFICATION_CHANNEL_ID }
          : null,
      });
    } catch {
      // Notification failures should not block the in-app reminder controls.
    }
  };

  const handleReminderComplete = async () => {
    if (!notificationCardTask) return;

    if (reminderTimer.current) {
      clearTimeout(reminderTimer.current);
      reminderTimer.current = null;
    }

    if (notificationCardTask.type === 'habit') {
      await handleCompleteHabit(notificationCardTask.id);
    } else {
      await handleCompleteTodo(notificationCardTask.id);
    }

    setPendingReminderTask(null);
    setNotificationCardTask(null);
  };

  const handleReminderIncomplete = () => {
    if (reminderTimer.current) {
      clearTimeout(reminderTimer.current);
      reminderTimer.current = null;
    }

    setPendingReminderTask(null);
    setNotificationCardTask(null);
  };

  const showHabits = filter === 'all' || filter === 'habits';
  const showTodos = filter === 'all' || filter === 'todos';

  return (
    <View style={styles.screen}>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerGiftIcon}>🎁</Text>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={handleNotificationPress}
              activeOpacity={0.75}
              accessibilityLabel="Notifications"
              accessibilityRole="button"
            >
              <Text style={styles.headerBtnIcon}>🔔</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>Tasks</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn}>
              <Text style={styles.headerBtnIcon}>🕐</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => setShowCategories(true)}>
              <Text style={styles.headerBtnIcon}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Progress Card */}
          {user && progress && (
            <UserProgressCard user={user} progress={progress} />
          )}

          {/* Filter Tabs */}
          <View style={styles.filterRow}>
            <FilterButton label="All" value="all" current={filter} onPress={setFilter} />
            <FilterButton label="Habits" value="habits" current={filter} onPress={setFilter} />
            <FilterButton label="To Do" value="todos" current={filter} onPress={setFilter} />
            <TouchableOpacity style={styles.addTabBtn}>
              <Text style={styles.addTabBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Habits Section */}
          {showHabits && habits.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Habits</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{habits.length}</Text>
                </View>
              </View>
              {habits.map((habit) => (
                <HabitRow key={habit.id} habit={habit} onComplete={handleCompleteHabit} onPress={(id) => handleTaskPress(id, 'habit')} />
              ))}
            </View>
          )}

          {/* To Do Section */}
          {showTodos && todos.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>To Do</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{todos.length}</Text>
                </View>
              </View>
              {todos.map((todo) => (
                <TodoRow key={todo.id} todo={todo} onComplete={handleCompleteTodo} onPress={(id) => handleTaskPress(id, 'todo')} />
              ))}
            </View>
          )}

          <View style={styles.bottomPad} />
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateTask')}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        {pendingReminderTask && !notificationCardTask && (
          <TouchableOpacity
            style={styles.pendingReminderPill}
            onPress={() => showSystemNotification(pendingReminderTask)}
            activeOpacity={0.82}
          >
            <Text style={styles.pendingReminderText}>
              {pendingReminderTask.title} bildirimi hazırlanıyor...
            </Text>
          </TouchableOpacity>
        )}

        {notificationCardTask && (
          <View style={styles.notificationGlassCard}>
            <View style={styles.notificationContent}>
              <TouchableOpacity
                onPress={() => showSystemNotification(notificationCardTask)}
                activeOpacity={0.82}
              >
                <Text style={styles.notificationMessage}>
                  {notificationCardTask.title} görevinin süresi tamamlandı
                </Text>
              </TouchableOpacity>

              <View style={styles.notificationActionRow}>
                <TouchableOpacity
                  style={[styles.notificationActionBtn, styles.notificationActionBtnPrimary]}
                  onPress={handleReminderComplete}
                  activeOpacity={0.8}
                >
                  <Text style={styles.notificationActionPrimaryText}>Tamamladım</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.notificationActionBtn, styles.notificationActionBtnGhost]}
                  onPress={handleReminderIncomplete}
                  activeOpacity={0.8}
                >
                  <Text style={styles.notificationActionGhostText}>Tamamlamadım</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>

      <CategoriesBottomSheet
        visible={showCategories}
        categories={categories}
        onClose={() => setShowCategories(false)}
        onAddPress={() => {
          setShowCategories(false);
          setShowNewCategory(true);
        }}
        onEditPress={(cat) => {
          setShowCategories(false);
          setEditTarget(cat);
          setShowNewCategory(true);
        }}
        onDeletePress={(cat) => {
          setShowCategories(false);
          setDeleteTarget(cat);
        }}
        onAddSkillPress={() => {
          setShowCategories(false);
          setShowNewCategory(true);
        }}
      />

      <NewCategoryDialog
        visible={showNewCategory}
        initialValue={editTarget?.name}
        onCancel={() => {
          setShowNewCategory(false);
          setEditTarget(null);
        }}
        onCreate={(name) => {
          if (editTarget) {
            setCategories((prev) =>
              prev.map((c) => (c.id === editTarget.id ? { ...c, name } : c)),
            );
          } else {
            setCategories((prev) => [
              ...prev,
              { id: `cat-${Date.now()}`, name, taskCount: 0 },
            ]);
          }
          setShowNewCategory(false);
          setEditTarget(null);
        }}
      />

      <DeleteCategoryDialog
        visible={!!deleteTarget}
        categoryName={deleteTarget?.name ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onDelete={() => {
          if (deleteTarget) {
            setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
          }
          setDeleteTarget(null);
        }}
      />
    </View>
  );
};

type FilterButtonProps = {
  label: string;
  value: FilterTab;
  current: FilterTab;
  onPress: (v: FilterTab) => void;
};

const FilterButton = ({ label, value, current, onPress }: FilterButtonProps) => (
  <TouchableOpacity
    style={[styles.filterBtn, current === value && styles.filterBtnActive]}
    onPress={() => onPress(value)}
    activeOpacity={0.7}
  >
    <Text style={[styles.filterBtnText, current === value && styles.filterBtnTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

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
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    minHeight: 56,
  },
  headerLeft: {
    width: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerGiftIcon: {
    fontSize: 22,
  },
  headerTitle: {
    flex: 1,
    color: d.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerRight: {
    width: 72,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  headerBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  headerBtnIcon: {
    fontSize: 18,
    color: d.textSecondary,
  },

  // In-app reminder status
  pendingReminderPill: {
    position: 'absolute',
    top: 76,
    left: spacing.md,
    right: spacing.md,
    minHeight: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(0,0,0,0.78)',
    zIndex: 20,
    elevation: 10,
  },
  pendingReminderText: {
    color: d.text,
    fontSize: 14,
    fontWeight: '700',
  },

  // Notification glass card
  notificationGlassCard: {
    position: 'absolute',
    top: 76,
    left: spacing.md,
    right: spacing.md,
    minHeight: 116,
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.88)',
    shadowColor: '#00C2A0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 16,
    zIndex: 20,
  },
  notificationContent: {
    width: '100%',
  },
  notificationMessage: {
    color: d.text,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
  },
  notificationActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  notificationActionBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  notificationActionBtnPrimary: {
    backgroundColor: d.text,
  },
  notificationActionBtnGhost: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  notificationActionPrimaryText: {
    color: '#050507',
    fontSize: 14,
    fontWeight: '800',
  },
  notificationActionGhostText: {
    color: d.text,
    fontSize: 14,
    fontWeight: '800',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.sm,
  },

  // Filter
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: d.surfaceElevated,
    borderWidth: 1,
    borderColor: d.border,
  },
  filterBtnActive: {
    backgroundColor: d.surface,
    borderColor: d.text,
  },
  filterBtnText: {
    color: d.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterBtnTextActive: {
    color: d.text,
    fontWeight: '600',
  },
  addTabBtn: {
    marginLeft: 'auto',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: d.text,
    borderStyle: 'dashed',
  },
  addTabBtnText: {
    color: d.text,
    fontSize: 14,
    fontWeight: '600',
  },

  // Section
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: d.text,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionBadge: {
    backgroundColor: d.surfaceElevated,
    borderRadius: radius.full,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBadgeText: {
    color: d.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
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
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },

  bottomPad: {
    height: 80,
  },
});
