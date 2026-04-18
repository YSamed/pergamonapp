import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import type { Skill } from '../../types';
import { skillsService } from '../../services/skills.service';
import { colors, spacing, radius } from '../../theme';

const d = colors;

const XP_PER_LEVEL = 100;

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const SkillsScreen = () => {
  const navigation = useNavigation<Nav>();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void skillsService.getAllSkills().then(setSkills);
  }, []);

  const filtered = skills.filter((s) =>
    s.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Text style={styles.title}>Skills</Text>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search skill"
            placeholderTextColor={d.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* View Statistics */}
          <TouchableOpacity style={styles.statsCard} activeOpacity={0.75} onPress={() => navigation.navigate('SkillStatistics')}>
            <View style={styles.statsIconWrap}>
              <Text style={styles.statsIcon}>📊</Text>
            </View>
            <View style={styles.statsText}>
              <Text style={styles.statsTitle}>View Statistics</Text>
              <Text style={styles.statsSub}>View progress and analysis</Text>
            </View>
            <Text style={styles.statsArrow}>›</Text>
          </TouchableOpacity>

          {/* Skill list */}
          <View style={styles.list}>
            {filtered.map((skill) => (
              <SkillRow
                key={skill.id}
                skill={skill}
                onPress={() => navigation.navigate('SkillDetail', { skillId: skill.id })}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ── Skill row ──────────────────────────────────────────────────────────────

type SkillRowProps = { skill: Skill; onPress: () => void };

const SkillRow = ({ skill, onPress }: SkillRowProps) => {
  const xpInLevel = skill.xp % XP_PER_LEVEL;
  const progress = xpInLevel / XP_PER_LEVEL;

  return (
    <TouchableOpacity style={styles.skillCard} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.skillIconWrap}>
        <Text style={styles.skillIcon}>{skill.icon}</Text>
      </View>
      <View style={styles.skillInfo}>
        <View style={styles.skillTopRow}>
          <Text style={styles.skillLabel}>{skill.label}</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakText}>
              {skill.currentStreak} {skill.currentStreak === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>
        <Text style={styles.skillLevel}>Level {skill.level}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.xpRow}>
          <Text style={styles.xpText}>{xpInLevel}/{XP_PER_LEVEL} XP</Text>
        </View>
      </View>
      <Text style={styles.skillArrow}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: d.background },
  safeArea: { flex: 1 },
  title: {
    color: d.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: d.border,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    color: d.text,
    fontSize: 15,
    paddingVertical: spacing.md,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: d.border,
    gap: spacing.md,
  },
  statsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsIcon: { fontSize: 22 },
  statsText: { flex: 1 },
  statsTitle: { color: d.text, fontSize: 16, fontWeight: '700' },
  statsSub: { color: d.textSecondary, fontSize: 13 },
  statsArrow: { color: d.textMuted, fontSize: 20 },
  list: { gap: spacing.sm },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: d.border,
    gap: spacing.md,
  },
  skillIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillIcon: { fontSize: 28 },
  skillInfo: { flex: 1, gap: 4 },
  skillTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillLabel: { color: d.text, fontSize: 16, fontWeight: '700' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  streakFire: { fontSize: 13 },
  streakText: { color: d.textSecondary, fontSize: 12, fontWeight: '600' },
  skillLevel: { color: d.textSecondary, fontSize: 13 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: d.surfaceElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  xpText: { color: d.textSecondary, fontSize: 11 },
  skillArrow: { color: d.textMuted, fontSize: 20 },
});
