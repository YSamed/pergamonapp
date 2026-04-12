import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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

const d = colors.dark;

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

  useEffect(() => {
    void loadData();
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

  const showHabits = filter === 'all' || filter === 'habits';
  const showTodos = filter === 'all' || filter === 'todos';

  return (
    <View style={styles.screen}>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerGiftIcon}>🎁</Text>
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
  headerGiftIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: d.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginRight: 40, // offset for gift icon
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnIcon: {
    fontSize: 18,
    color: d.textSecondary,
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
