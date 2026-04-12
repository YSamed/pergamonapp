import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { colors, spacing, radius } from '../../theme';
import { SectionCard } from './components/SectionCard';
import { PillButton } from './components/PillButton';
import { SliderRow } from './components/SliderRow';

const d = colors.dark;

type Frequency = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Custom';
type Deadline = 'Today' | 'Tomorrow' | '1 week' | 'Custom';
type Duration = '1 hour' | '30 min' | '15 min' | '5 min' | 'Custom';
type Difficulty = 1 | 2 | 3 | 4 | 5;

const SKILLS = [
  { id: 'focus', label: 'Focus', icon: '🧠' },
  { id: 'discipline', label: 'Discipline', icon: '🔥' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'coding', label: 'Coding', icon: '💻' },
  { id: 'health', label: 'Health', icon: '❤️' },
  { id: 'learning', label: 'Learning', icon: '📚' },
  { id: 'mindset', label: 'Mindset', icon: '⚔️' },
  { id: 'social', label: 'Social', icon: '🤝' },
  { id: 'career', label: 'Career', icon: '💼' },
  { id: 'communication', label: 'Communication', icon: '💬' },
];

const DIFFICULTY_EMOJIS: Record<Difficulty, string> = {
  1: '😁',
  2: '🙂',
  3: '😐',
  4: '😟',
  5: '😤',
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard',
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  1: '#22C55E',
  2: '#86EFAC',
  3: colors.xp,
  4: '#F97316',
  5: '#EF4444',
};

type Props = {
  onClose: () => void;
  onSubmit?: (task: unknown) => void;
};

export const CreateTaskScreen = ({ onClose, onSubmit }: Props) => {
  const [title, setTitle] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<Frequency>('Daily');
  const [infiniteTimes, setInfiniteTimes] = useState(false);
  const [deadline, setDeadline] = useState<Deadline | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [energy, setEnergy] = useState(-1);
  const [health, setHealth] = useState(0);
  const [coins, setCoins] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>(3);
  const [duration, setDuration] = useState<Duration | null>(null);

  const toggleSkill = (id: string) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleCreate = () => {
    const task = {
      title,
      selectedSkills,
      frequency,
      infiniteTimes,
      deadline,
      energy,
      health,
      coins,
      difficulty,
      duration,
    };
    onSubmit?.(task);
    onClose();
  };

  return (
    <View style={styles.screen}>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
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
          {/* Task icon */}
          <View style={styles.iconWrap}>
            <View style={styles.taskIconBox}>
              <Text style={styles.taskIcon}>📸</Text>
            </View>
          </View>

          {/* Title */}
          <SectionCard>
            <Text style={styles.cardLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Go to the gym, take the dog out..."
              placeholderTextColor={d.textMuted}
              value={title}
              onChangeText={setTitle}
              multiline
            />
            <View style={styles.pillRowWrap}>
              <PillButton label="+ Add description" onPress={() => {}} />
              <PillButton label="+ Add category" onPress={() => {}} />
            </View>
          </SectionCard>

          {/* Skills */}
          <SectionCard title="Choose skills for your task">
            <View style={styles.pillWrap}>
              {SKILLS.map((skill) => (
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

          {/* Frequency */}
          <SectionCard title="Frequency">
            <View style={styles.pillWrap}>
              {(['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'] as Frequency[]).map((f) => (
                <PillButton
                  key={f}
                  label={f}
                  selected={frequency === f}
                  onPress={() => setFrequency(f)}
                />
              ))}
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleIcon}>🔁</Text>
              <Text style={styles.toggleLabel}>Complete infinite times</Text>
              <Switch
                value={infiniteTimes}
                onValueChange={setInfiniteTimes}
                trackColor={{ false: d.border, true: d.primary }}
                thumbColor={d.text}
              />
            </View>
          </SectionCard>

          {/* Deadline */}
          <SectionCard title="Deadline">
            <View style={styles.pillWrap}>
              {(['Today', 'Tomorrow', '1 week', 'Custom'] as Deadline[]).map((dl) => (
                <PillButton
                  key={dl}
                  label={dl}
                  selected={deadline === dl}
                  onPress={() => setDeadline(deadline === dl ? null : dl)}
                />
              ))}
            </View>
          </SectionCard>

          {/* More / Less options toggle */}
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => setShowMore((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.moreBtnText}>
              {showMore ? '— Less options' : '+ More options'}
            </Text>
          </TouchableOpacity>

          {showMore && (
            <>
              {/* Cost */}
              <SectionCard title="Cost">
                <SliderRow
                  icon="⚡"
                  label="Energy"
                  value={energy}
                  min={-5}
                  max={5}
                  onValueChange={(v) => setEnergy(Math.round(v))}
                />
                <SliderRow
                  icon="❤️"
                  label="Health"
                  value={health}
                  min={-5}
                  max={5}
                  onValueChange={(v) => setHealth(Math.round(v))}
                />
              </SectionCard>

              {/* Coins */}
              <SectionCard title="Coins">
                <View style={styles.coinsRow}>
                  <Text style={styles.coinIcon}>🪙</Text>
                  <Text style={styles.coinValue}>{coins}</Text>
                  <Slider
                    style={styles.coinSlider}
                    minimumValue={0}
                    maximumValue={100}
                    step={5}
                    value={coins}
                    onValueChange={(v) => setCoins(Math.round(v))}
                    minimumTrackTintColor={colors.xp}
                    maximumTrackTintColor={d.border}
                    thumbTintColor={d.primary}
                  />
                </View>
              </SectionCard>

              {/* Difficulty */}
              <SectionCard title="Select difficulty">
                <View style={styles.diffRow}>
                  {([1, 2, 3, 4, 5] as Difficulty[]).map((d_) => (
                    <TouchableOpacity
                      key={d_}
                      onPress={() => setDifficulty(d_)}
                      style={[
                        styles.diffBtn,
                        difficulty === d_ && styles.diffBtnActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.diffEmoji, difficulty === d_ && styles.diffEmojiActive]}>
                        {DIFFICULTY_EMOJIS[d_]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.diffLabel, { color: DIFFICULTY_COLORS[difficulty] }]}>
                  {DIFFICULTY_LABELS[difficulty]}
                </Text>
              </SectionCard>

              {/* Duration */}
              <SectionCard title="Duration">
                <View style={styles.pillWrap}>
                  {(['1 hour', '30 min', '15 min', '5 min', 'Custom'] as Duration[]).map((dur) => (
                    <PillButton
                      key={dur}
                      label={dur}
                      selected={duration === dur}
                      onPress={() => setDuration(duration === dur ? null : dur)}
                    />
                  ))}
                </View>
              </SectionCard>
            </>
          )}

          <View style={styles.bottomPad} />
        </ScrollView>

        {/* Create Task Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createBtn, !title.trim() && styles.createBtnDisabled]}
            onPress={handleCreate}
            activeOpacity={0.85}
            disabled={!title.trim()}
          >
            <Text style={[styles.createBtnText, !title.trim() && styles.createBtnTextDisabled]}>
              Create Task
            </Text>
          </TouchableOpacity>
        </View>
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

  // Header
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

  // Task icon
  iconWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  taskIconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: d.surfaceElevated,
    borderWidth: 1,
    borderColor: d.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskIcon: {
    fontSize: 32,
  },

  // Title card internals
  cardLabel: {
    color: d.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  titleInput: {
    color: d.text,
    fontSize: 15,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
    minHeight: 40,
  },
  pillRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // Pills
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // Frequency toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: d.cardBorder,
  },
  toggleIcon: {
    fontSize: 16,
    color: d.textSecondary,
  },
  toggleLabel: {
    flex: 1,
    color: d.textSecondary,
    fontSize: 14,
  },

  // More button
  moreBtn: {
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: d.border,
    marginBottom: spacing.md,
  },
  moreBtnText: {
    color: d.text,
    fontSize: 15,
    fontWeight: '600',
  },

  // Coins
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coinIcon: {
    fontSize: 20,
  },
  coinValue: {
    color: d.text,
    fontSize: 16,
    fontWeight: '700',
    width: 32,
  },
  coinSlider: {
    flex: 1,
    height: 36,
  },

  // Difficulty
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  diffBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
  diffBtnActive: {
    opacity: 1,
  },
  diffEmoji: {
    fontSize: 32,
  },
  diffEmojiActive: {
    fontSize: 36,
  },
  diffLabel: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    marginTop: spacing.xs,
  },

  // Footer
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
