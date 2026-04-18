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
import { Ionicons } from '@expo/vector-icons';
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
  const [showPriorityTasks, setShowPriorityTasks] = useState(false);
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

    const unsubscribe = navigation.addListener('focus', () => {
      void loadData();
    });

    return unsubscribe;
  }, [navigation]);

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
      todosService.getAllTodos(),
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
    const targetHabit = habits.find((habit) => habit.id === id);
    if (!targetHabit) return;

    const updated = targetHabit.completedTodayAt
      ? await habitsService.uncompleteHabit(id)
      : await habitsService.completeHabit(id);

    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
  };

  const handleCompleteTodo = async (id: string) => {
    const targetTodo = todos.find((todo) => todo.id === id);
    if (!targetTodo) return;

    const updated = targetTodo.completedAt
      ? await todosService.uncompleteTodo(id)
      : await todosService.completeTodo(id);

    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleDeleteHabit = async (id: string) => {
    await habitsService.deleteHabit(id);
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  };

  const handleDeleteTodo = async (id: string) => {
    await todosService.deleteTodo(id);
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const getTodoPriorityScore = (todo: Todo) => {
    const isOverdue = todo.dueDate ? new Date(todo.dueDate).getTime() <= Date.now() : false;
    if (isOverdue) return 0;
    if (todo.priority === 'high') return 1;
    if (todo.priority === 'medium') return 2;
    return 3;
  };

  const prioritizedTodos = [...todos].sort((a, b) => {
    const scoreDiff = getTodoPriorityScore(a) - getTodoPriorityScore(b);
    if (scoreDiff !== 0) return scoreDiff;

    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    return aDue - bDue;
  });

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

  const visibleHabits = showPriorityTasks ? [] : habits;
  const visibleTodos = showPriorityTasks ? prioritizedTodos : todos;
  const showHabits = !showPriorityTasks && (filter === 'all' || filter === 'habits');
  const showTodos = showPriorityTasks || filter === 'all' || filter === 'todos';

  return (
    <View style={styles.screen}>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              activeOpacity={0.78}
              accessibilityLabel="Search"
              accessibilityRole="button"
            >
              <View style={styles.searchGlyph}>
                <View style={styles.searchGlyphCircle} />
                <View style={styles.searchGlyphHandle} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={handleNotificationPress}
              activeOpacity={0.75}
              accessibilityLabel="Notifications"
              accessibilityRole="button"
            >
              <Ionicons name="notifications" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>Tasks</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerCreateBtn}
              onPress={() => navigation.navigate('CreateTask')}
              activeOpacity={0.78}
              accessibilityLabel="Create task"
              accessibilityRole="button"
            >
              <Text style={styles.headerCreateBtnIcon}>+</Text>
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
            <UserProgressCard user={user} progress={progress} habits={habits} todos={todos} />
          )}

          {/* Filter Tabs */}
          <View style={styles.filterRow}>
            <FilterButton
              label="All"
              value="all"
              current={filter}
              onPress={(value) => {
                setShowPriorityTasks(false);
                setFilter(value);
              }}
            />
            <FilterButton
              label="Habits"
              value="habits"
              current={filter}
              onPress={(value) => {
                setShowPriorityTasks(false);
                setFilter(value);
              }}
            />
            <FilterButton
              label="To Do"
              value="todos"
              current={filter}
              onPress={(value) => {
                setShowPriorityTasks(false);
                setFilter(value);
              }}
            />
            <TouchableOpacity
              style={[styles.addTabBtn, showPriorityTasks && styles.addTabBtnActive]}
              onPress={() => setShowPriorityTasks((prev) => !prev)}
              activeOpacity={0.75}
            >
              <Text style={[styles.addTabBtnText, showPriorityTasks && styles.addTabBtnTextActive]}>
                Priority
              </Text>
            </TouchableOpacity>
          </View>

          {/* Habits Section */}
          {showHabits && visibleHabits.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Habits</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{visibleHabits.length}</Text>
                </View>
              </View>
              {visibleHabits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  onComplete={handleCompleteHabit}
                  onDelete={handleDeleteHabit}
                  onPress={(id) => handleTaskPress(id, 'habit')}
                />
              ))}
            </View>
          )}

          {/* To Do Section */}
          {showTodos && visibleTodos.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{showPriorityTasks ? 'Priority Tasks' : 'To Do'}</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{visibleTodos.length}</Text>
                </View>
              </View>
              {visibleTodos.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onComplete={handleCompleteTodo}
                  onDelete={handleDeleteTodo}
                  onPress={(id) => handleTaskPress(id, 'todo')}
                />
              ))}
            </View>
          )}

          <View style={styles.bottomPad} />
        </ScrollView>

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
    width: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchGlyph: {
    width: 22,
    height: 22,
    position: 'relative',
  },
  searchGlyphCircle: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 15,
    height: 15,
    borderRadius: radius.full,
    borderWidth: 2.5,
    borderColor: d.text,
  },
  searchGlyphHandle: {
    position: 'absolute',
    width: 9,
    height: 3.5,
    borderRadius: radius.full,
    backgroundColor: d.text,
    right: 0,
    bottom: 1,
    transform: [{ rotate: '45deg' }],
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  headerIconBtnIcon: {
    fontSize: 18,
    color: d.textSecondary,
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
  },
  headerCreateBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerCreateBtnIcon: {
    fontSize: 28,
    lineHeight: 28,
    color: d.text,
    fontWeight: '300',
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
  addTabBtnActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    borderStyle: 'solid',
  },
  addTabBtnText: {
    color: d.text,
    fontSize: 14,
    fontWeight: '600',
  },
  addTabBtnTextActive: {
    color: '#050507',
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

  bottomPad: {
    height: 80,
  },
});
