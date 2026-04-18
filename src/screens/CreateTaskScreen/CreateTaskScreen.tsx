import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../theme';
import { SectionCard } from '../../components/CreateTaskScreen/SectionCard';
import { PillButton } from '../../components/CreateTaskScreen/PillButton';
import { habitsService } from '../../services/habits.service';
import { todosService } from '../../services/todos.service';
import type { Difficulty, SkillId } from '../../types';

const d = colors.dark;
const USER_ID = 'user-1';
const TASK_TYPES = ['habit', 'todo'] as const;
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const HABIT_SKILLS: Array<{ id: SkillId; label: string; icon: string }> = [
  { id: 'strength', label: 'Strength', icon: '🏋️' },
  { id: 'focus', label: 'Focus', icon: '🧠' },
  { id: 'discipline', label: 'Discipline', icon: '🔥' },
  { id: 'coding', label: 'Coding', icon: '💻' },
  { id: 'communication', label: 'Communication', icon: '💬' },
  { id: 'health', label: 'Health', icon: '❤️' },
  { id: 'learning', label: 'Learning', icon: '📚' },
  { id: 'mindset', label: 'Mindset', icon: '⚔️' },
  { id: 'career', label: 'Career', icon: '💼' },
  { id: 'social', label: 'Social', icon: '🤝' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
];

type TaskType = (typeof TASK_TYPES)[number];

type Props = {
  onClose: () => void;
  onSubmit?: (task: unknown) => void;
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor',
};

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const isValidTime = (value: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

const getXpReward = (difficulty: Difficulty) => {
  if (difficulty === 'easy') return 5;
  if (difficulty === 'medium') return 10;
  return 15;
};

const getTodoPriority = (difficulty: Difficulty) => {
  if (difficulty === 'easy') return 'low' as const;
  if (difficulty === 'medium') return 'medium' as const;
  return 'high' as const;
};

const buildDueDate = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const due = new Date();
  due.setHours(hours, minutes, 0, 0);
  return due.toISOString();
};

type DateFieldProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: string;
  onPress: () => void;
};

const DateField = ({ label, value, hint = 'Takvim acmak icin dokun', icon = '📅', onPress }: DateFieldProps) => {
  return (
    <View style={styles.dateFieldWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.dateFieldButton} onPress={onPress} activeOpacity={0.85}>
        <View>
          <Text style={styles.dateFieldValue}>{value}</Text>
          <Text style={styles.dateFieldHint}>{hint}</Text>
        </View>
        <Text style={styles.dateFieldIcon}>{icon}</Text>
      </TouchableOpacity>
    </View>
  );
};

export const CreateTaskScreen = ({ onClose, onSubmit }: Props) => {
  const today = new Date();
  const [taskType, setTaskType] = useState<TaskType>('habit');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [selectedSkills, setSelectedSkills] = useState<SkillId[]>([]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [isOngoing, setIsOngoing] = useState(false);
  const [todoTime, setTodoTime] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDateField, setActiveDateField] = useState<'start' | 'end' | null>(null);
  const [showIosTimePicker, setShowIosTimePicker] = useState(false);
  const toggleProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(toggleProgress, {
      toValue: isOngoing ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isOngoing, toggleProgress]);

  const handleTypeChange = (nextType: TaskType) => {
    setTaskType(nextType);
    setError('');
  };

  const toggleSkill = (skillId: SkillId) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((value) => value !== skillId)
        : [...prev, skillId],
    );
  };

  const handleCreate = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || isSubmitting) return;

    setError('');

    if (taskType === 'habit') {
      if (!isOngoing && formatDate(endDate) < formatDate(startDate)) {
        setError('Bitis tarihi baslangic tarihinden once olamaz.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const createdTask = taskType === 'habit'
        ? await habitsService.createHabit({
            userId: USER_ID,
            title: trimmedTitle,
            description: null,
            difficulty,
            xpReward: getXpReward(difficulty),
            skillIds: selectedSkills,
            frequency: 'daily',
            frequencyDays: [],
            isActive: true,
            startDate: formatDate(startDate),
            endDate: isOngoing ? null : formatDate(endDate),
            isOngoing,
          })
        : await todosService.createTodo({
            userId: USER_ID,
            title: trimmedTitle,
            description: null,
            priority: getTodoPriority(difficulty),
            difficulty,
            xpReward: getXpReward(difficulty),
            skillIds: [],
            dueDate: todoTime ? buildDueDate(todoTime) : null,
          });

      onSubmit?.(createdTask);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDatePicker = (field: 'start' | 'end') => {
    const value = field === 'start' ? startDate : endDate;

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'date',
        is24Hour: true,
        onChange: (_, selectedDate) => {
          if (!selectedDate) return;
          if (field === 'start') {
            setStartDate(selectedDate);
            if (formatDate(endDate) < formatDate(selectedDate)) {
              setEndDate(selectedDate);
            }
            return;
          }
          setEndDate(selectedDate);
        },
      });
      return;
    }

    setActiveDateField(field);
  };

  const handleIosDateChange = (selectedDate: Date) => {
    if (activeDateField === 'start') {
      setStartDate(selectedDate);
      if (formatDate(endDate) < formatDate(selectedDate)) {
        setEndDate(selectedDate);
      }
      return;
    }

    if (activeDateField === 'end') {
      setEndDate(selectedDate);
    }
  };

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);

  const openTimePicker = () => {
    const baseTime = todoTime && isValidTime(todoTime)
      ? (() => {
          const [hours, minutes] = todoTime.split(':').map(Number);
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          return date;
        })()
      : new Date();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: baseTime,
        mode: 'time',
        is24Hour: true,
        onChange: (_, selectedDate) => {
          if (!selectedDate) return;
          setTodoTime(formatTime(selectedDate));
        },
      });
      return;
    }

    setShowIosTimePicker(true);
  };

  const thumbTranslateX = toggleProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 61],
  });

  const glowTranslateX = toggleProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 62],
  });

  const offOpacity = toggleProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 0.38],
  });

  const onOpacity = toggleProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.38, 0.95],
  });

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Task</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SectionCard>
            <Text style={styles.cardLabel}>Task type</Text>
            <View style={styles.typeRow}>
              {TASK_TYPES.map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.typeButton,
                    taskType === value && styles.typeButtonActive,
                  ]}
                  onPress={() => handleTypeChange(value)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      taskType === value && styles.typeButtonTextActive,
                    ]}
                  >
                    {value === 'habit' ? 'Habit' : 'To Do'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={styles.cardLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder={taskType === 'habit' ? 'Yeni bir habit olustur...' : 'Yeni bir to do olustur...'}
              placeholderTextColor={d.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </SectionCard>

          {taskType === 'habit' ? (
            <>
              <SectionCard title="Skills">
                <View style={styles.pillWrap}>
                  {HABIT_SKILLS.map((skill) => (
                    <PillButton
                      key={skill.id}
                      label={skill.label}
                      icon={skill.icon}
                      selected={selectedSkills.includes(skill.id)}
                      onPress={() => toggleSkill(skill.id)}
                    />
                  ))}
                </View>
              </SectionCard>

              <SectionCard title="Habit Date">
                <DateField
                  label="Baslangic tarihi"
                  value={formatDate(startDate)}
                  onPress={() => openDatePicker('start')}
                />

                <View style={styles.ongoingRow}>
                  <Text style={styles.inputLabel}>Suresiz</Text>
                  <TouchableOpacity
                    style={styles.toggleTrack}
                    onPress={() => setIsOngoing((prev) => !prev)}
                    activeOpacity={0.8}
                  >
                    <Animated.View
                      style={[
                        styles.toggleLiquidGlow,
                        { transform: [{ translateX: glowTranslateX }] },
                      ]}
                    />
                    <View style={styles.toggleGlassSheen} />
                    <View style={styles.toggleLabels}>
                      <Animated.Text style={[styles.toggleLabel, { opacity: offOpacity }]}>
                        OFF
                      </Animated.Text>
                      <Animated.Text style={[styles.toggleLabel, { opacity: onOpacity }]}>
                        ON
                      </Animated.Text>
                    </View>
                    <Animated.View
                      style={[
                        styles.toggleThumb,
                        isOngoing && styles.toggleThumbActive,
                        { transform: [{ translateX: thumbTranslateX }] },
                      ]}
                    >
                      <View style={styles.toggleThumbShine} />
                    </Animated.View>
                  </TouchableOpacity>
                </View>

                {!isOngoing && (
                  <DateField
                    label="Bitis tarihi"
                    value={formatDate(endDate)}
                    onPress={() => openDatePicker('end')}
                  />
                )}
              </SectionCard>
            </>
          ) : (
            <SectionCard title="To Do details">
              <DateField
                label="Saat (opsiyonel)"
                value={todoTime || 'Saat sec'}
                hint="Saat secmek icin dokun"
                icon="🕒"
                onPress={openTimePicker}
              />
            </SectionCard>
          )}

          <SectionCard title="Difficulty">
            <View style={styles.pillWrap}>
              {DIFFICULTIES.map((value) => (
                <PillButton
                  key={value}
                  label={DIFFICULTY_LABELS[value]}
                  selected={difficulty === value}
                  onPress={() => setDifficulty(value)}
                />
              ))}
            </View>
          </SectionCard>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.bottomPad} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createBtn, (!title.trim() || isSubmitting) && styles.createBtnDisabled]}
            onPress={() => {
              void handleCreate();
            }}
            activeOpacity={0.85}
            disabled={!title.trim() || isSubmitting}
          >
            <Text style={[styles.createBtnText, (!title.trim() || isSubmitting) && styles.createBtnTextDisabled]}>
              {isSubmitting
                ? 'Creating...'
                : taskType === 'habit'
                  ? 'Create Habit'
                  : 'Create To Do'}
            </Text>
          </TouchableOpacity>
        </View>

        {Platform.OS === 'ios' && activeDateField ? (
          <Modal
            transparent
            animationType="slide"
            visible={!!activeDateField}
            onRequestClose={() => setActiveDateField(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setActiveDateField(null)} activeOpacity={0.8}>
                    <Text style={styles.modalDoneText}>Kapat</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>
                    {activeDateField === 'start' ? 'Baslangic tarihi' : 'Bitis tarihi'}
                  </Text>
                  <TouchableOpacity onPress={() => setActiveDateField(null)} activeOpacity={0.8}>
                    <Text style={styles.modalDoneText}>Tamam</Text>
                  </TouchableOpacity>
                </View>

                <DateTimePicker
                  value={activeDateField === 'start' ? startDate : endDate}
                  mode="date"
                  display="spinner"
                  onChange={(_, selectedDate) => {
                    if (!selectedDate) return;
                    handleIosDateChange(selectedDate);
                  }}
                  style={styles.iosPicker}
                  themeVariant="dark"
                />
              </View>
            </View>
          </Modal>
        ) : null}

        {Platform.OS === 'ios' && showIosTimePicker ? (
          <Modal
            transparent
            animationType="slide"
            visible={showIosTimePicker}
            onRequestClose={() => setShowIosTimePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowIosTimePicker(false)} activeOpacity={0.8}>
                    <Text style={styles.modalDoneText}>Kapat</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Saat</Text>
                  <TouchableOpacity onPress={() => setShowIosTimePicker(false)} activeOpacity={0.8}>
                    <Text style={styles.modalDoneText}>Tamam</Text>
                  </TouchableOpacity>
                </View>

                <DateTimePicker
                  value={
                    todoTime && isValidTime(todoTime)
                      ? (() => {
                          const [hours, minutes] = todoTime.split(':').map(Number);
                          const date = new Date();
                          date.setHours(hours, minutes, 0, 0);
                          return date;
                        })()
                      : new Date()
                  }
                  mode="time"
                  display="spinner"
                  is24Hour
                  onChange={(_, selectedDate) => {
                    if (!selectedDate) return;
                    setTodoTime(formatTime(selectedDate));
                  }}
                  style={styles.iosPicker}
                  themeVariant="dark"
                />
              </View>
            </View>
          </Modal>
        ) : null}
      </SafeAreaView>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    minHeight: 56,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: d.text,
    fontSize: 22,
    fontWeight: '300',
  },
  headerTitle: {
    flex: 1,
    color: d.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.sm,
  },
  cardLabel: {
    color: d.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: d.border,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: d.text,
    borderColor: d.text,
  },
  typeButtonText: {
    color: d.text,
    fontSize: 15,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: d.background,
  },
  titleInput: {
    color: d.text,
    fontSize: 15,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  inputLabel: {
    color: d.textSecondary,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  dateFieldWrap: {
    marginBottom: spacing.md,
  },
  dateFieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: d.border,
    backgroundColor: d.surfaceElevated,
  },
  dateFieldValue: {
    color: d.text,
    fontSize: 16,
    fontWeight: '700',
  },
  dateFieldHint: {
    color: d.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  dateFieldIcon: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: d.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderColor: d.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: d.text,
    fontSize: 16,
    fontWeight: '700',
  },
  modalDoneText: {
    color: d.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  iosPicker: {
    alignSelf: 'center',
  },
  input: {
    color: d.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: d.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: d.surfaceElevated,
    marginBottom: spacing.md,
  },
  ongoingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  toggleTrack: {
    width: 108,
    height: 42,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.11)',
    overflow: 'hidden',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  toggleLiquidGlow: {
    position: 'absolute',
    left: 0,
    top: 6,
    width: 34,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: 'rgba(34,197,94,0.18)',
    shadowColor: '#22C55E',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  toggleGlassSheen: {
    position: 'absolute',
    left: 1,
    right: 1,
    top: 1,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  toggleLabels: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleThumb: {
    width: 42,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    position: 'absolute',
    left: 0,
    top: 5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  toggleThumbActive: {
    backgroundColor: 'rgba(34,197,94,0.72)',
    borderColor: 'rgba(187,247,208,0.32)',
  },
  toggleThumbShine: {
    width: 28,
    height: 11,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.42)',
    position: 'absolute',
    top: 4,
  },
  toggleLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: d.background,
  },
  createBtn: {
    backgroundColor: d.text,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createBtnText: {
    color: d.background,
    fontSize: 16,
    fontWeight: '700',
  },
  createBtnTextDisabled: {
    color: d.background,
  },
  bottomPad: {
    height: spacing.xl,
  },
});
