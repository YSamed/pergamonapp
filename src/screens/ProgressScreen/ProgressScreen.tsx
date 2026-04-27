import { useCallback, useEffect, useState } from 'react';
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
import type {
  Achievement,
  RootStackParamList,
  Skill,
  UserProgress,
  XPEvent,
} from '../../types';
import { colors, radius, spacing } from '../../theme';
import { progressService } from '../../services/progress.service';
import {
  levelProgress as calcLevelProgress,
  xpRequiredForLevel,
  xpToNextLevel,
} from '../../modules/level';

const d = colors;

type Nav = NativeStackNavigationProp<RootStackParamList>;
const XP_PER_SKILL_LEVEL = 100;

const DAY_LABELS_TR = ['Pa', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const buildWeeklyXP = (events: XPEvent[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets: { label: string; xp: number; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    buckets.push({
      label: DAY_LABELS_TR[day.getDay()],
      xp: 0,
      isToday: i === 0,
    });
  }

  const lookup = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    lookup.set(dayKey(day), 6 - i);
  }

  events.forEach((event) => {
    const created = new Date(event.createdAt);
    created.setHours(0, 0, 0, 0);
    const idx = lookup.get(dayKey(created));
    if (idx !== undefined) {
      buckets[idx].xp += event.xpAmount;
    }
  });

  return buckets;
};

export const ProgressScreen = () => {
  const navigation = useNavigation<Nav>();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const load = useCallback(async () => {
    const p = await progressService.getUserProgress();
    setProgress(p);
  }, []);

  useEffect(() => {
    void load();
    const unsub = navigation.addListener('focus', () => void load());
    return unsub;
  }, [navigation, load]);

  if (!progress) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.safeArea} edges={['top']} />
      </View>
    );
  }

  const lvl = progress.user.level;
  const lvlProgress = calcLevelProgress(progress.user.totalXP);
  const xpRemaining = xpToNextLevel(progress.user.totalXP);
  const currentLevelXP = xpRequiredForLevel(lvl);
  const nextLevelXP = xpRequiredForLevel(lvl + 1);

  const weeklyXP = buildWeeklyXP(progress.recentXPEvents);
  const weeklyMax = Math.max(...weeklyXP.map((b) => b.xp), 1);
  const weeklyTotal = weeklyXP.reduce((sum, b) => sum + b.xp, 0);

  const sortedSkills = [...progress.skills].sort((a, b) => b.xp - a.xp);

  const unlocked = progress.achievements.filter((a) => !!a.unlockedAt);
  const locked = progress.achievements.filter((a) => !a.unlockedAt);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerEyebrow}>Gelişimin</Text>
            <Text style={styles.headerTitle}>Progress</Text>
          </View>

          {/* Level hero */}
          <View style={styles.levelHero}>
            <View style={styles.levelHeroTop}>
              <View style={styles.levelOrb}>
                <Text style={styles.levelOrbNumber}>{lvl}</Text>
                <Text style={styles.levelOrbLabel}>Level</Text>
              </View>
              <View style={styles.levelMetaCol}>
                <Text style={styles.levelMetaLabel}>Toplam XP</Text>
                <Text style={styles.levelMetaValue}>
                  {progress.user.totalXP.toLocaleString('tr-TR')}
                </Text>
                <Text style={styles.levelMetaSub}>
                  Sonraki seviyeye {xpRemaining} XP
                </Text>
              </View>
            </View>
            <View style={styles.levelTrack}>
              <View
                style={[styles.levelFill, { width: `${lvlProgress * 100}%` }]}
              />
            </View>
            <View style={styles.levelTrackMeta}>
              <Text style={styles.levelTrackText}>
                {currentLevelXP.toLocaleString('tr-TR')} XP
              </Text>
              <Text style={styles.levelTrackText}>
                {nextLevelXP.toLocaleString('tr-TR')} XP
              </Text>
            </View>
          </View>

          {/* Streak cards */}
          <View style={styles.statRow}>
            <StatCard
              label="Günlük seri"
              value={`${progress.streak.currentStreak}`}
              accent={d.streak}
              suffix="🔥"
            />
            <StatCard
              label="En uzun seri"
              value={`${progress.streak.longestStreak}`}
              accent={d.accent}
              suffix="🏆"
            />
            <StatCard
              label="Yetenekler"
              value={`${progress.skills.length}`}
              accent={d.primary}
              suffix="✨"
            />
          </View>

          {/* Weekly chart */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Haftalık XP</Text>
              <Text style={styles.cardMeta}>{weeklyTotal} XP</Text>
            </View>
            <View style={styles.chartRow}>
              {weeklyXP.map((bucket, idx) => {
                const fill = (bucket.xp / weeklyMax) * 100;
                return (
                  <View key={idx} style={styles.chartCol}>
                    <View style={styles.chartBarTrack}>
                      <View
                        style={[
                          styles.chartBarFill,
                          {
                            height: `${Math.max(4, fill)}%`,
                            backgroundColor: bucket.isToday
                              ? d.primary
                              : 'rgba(78,216,199,0.45)',
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.chartLabel,
                        bucket.isToday && styles.chartLabelToday,
                      ]}
                    >
                      {bucket.label}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.chartHint}>
              Son 7 günün XP kazanımı (bugün vurgulu)
            </Text>
          </View>

          {/* Skills */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Yetenekler</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Skills')}
                activeOpacity={0.8}
              >
                <Text style={styles.linkText}>Tümünü gör →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.skillList}>
              {sortedSkills.slice(0, 6).map((skill) => (
                <SkillBar
                  key={skill.id}
                  skill={skill}
                  onPress={() =>
                    navigation.navigate('SkillDetail', { skillId: skill.id })
                  }
                />
              ))}
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Başarımlar</Text>
              <Text style={styles.cardMeta}>
                {unlocked.length}/{progress.achievements.length}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementRow}
            >
              {unlocked.map((a) => (
                <AchievementBadge key={a.id} achievement={a} unlocked />
              ))}
              {locked.map((a) => (
                <AchievementBadge key={a.id} achievement={a} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.bottomPad} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const StatCard = ({
  label,
  value,
  accent,
  suffix,
}: {
  label: string;
  value: string;
  accent: string;
  suffix?: string;
}) => (
  <View style={[styles.statCard, { borderColor: `${accent}30` }]}>
    <Text style={styles.statLabel}>{label}</Text>
    <View style={styles.statValueRow}>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      {suffix ? <Text style={styles.statSuffix}>{suffix}</Text> : null}
    </View>
  </View>
);

const SkillBar = ({
  skill,
  onPress,
}: {
  skill: Skill;
  onPress: () => void;
}) => {
  const pct = (skill.xp % XP_PER_SKILL_LEVEL) / XP_PER_SKILL_LEVEL;
  return (
    <TouchableOpacity
      style={styles.skillRow}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.skillIcon}>{skill.icon}</Text>
      <View style={styles.skillBody}>
        <View style={styles.skillTopRow}>
          <Text style={styles.skillLabel}>{skill.label}</Text>
          <Text style={styles.skillLevel}>Lv {skill.level}</Text>
        </View>
        <View style={styles.skillTrack}>
          <View style={[styles.skillFill, { width: `${pct * 100}%` }]} />
        </View>
      </View>
      <Text style={styles.skillXP}>{skill.xp} XP</Text>
    </TouchableOpacity>
  );
};

const AchievementBadge = ({
  achievement,
  unlocked,
}: {
  achievement: Achievement;
  unlocked?: boolean;
}) => (
  <View
    style={[
      styles.achievementBadge,
      unlocked ? styles.achievementUnlocked : styles.achievementLocked,
    ]}
  >
    <Text
      style={[
        styles.achievementIcon,
        !unlocked && styles.achievementIconLocked,
      ]}
    >
      {unlocked ? achievement.icon : '🔒'}
    </Text>
    <Text style={styles.achievementTitle} numberOfLines={1}>
      {achievement.title}
    </Text>
    <Text style={styles.achievementDesc} numberOfLines={2}>
      {achievement.description}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: d.background },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },

  header: { gap: 2 },
  headerEyebrow: {
    color: d.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: d.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  levelHero: {
    backgroundColor: d.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: d.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  levelHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  levelOrb: {
    width: 76,
    height: 76,
    borderRadius: radius.full,
    backgroundColor: 'rgba(78,216,199,0.18)',
    borderWidth: 2,
    borderColor: d.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: d.primary,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  levelOrbNumber: {
    color: d.primary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  levelOrbLabel: {
    color: d.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  levelMetaCol: { flex: 1, gap: 2 },
  levelMetaLabel: {
    color: d.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  levelMetaValue: {
    color: d.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  levelMetaSub: {
    color: d.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  levelTrack: {
    height: 12,
    borderRadius: radius.full,
    backgroundColor: d.surfaceElevated,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    backgroundColor: d.primary,
    borderRadius: radius.full,
  },
  levelTrackMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelTrackText: {
    color: d.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },

  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: 4,
  },
  statLabel: {
    color: d.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statSuffix: {
    fontSize: 14,
  },

  card: {
    backgroundColor: d.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: d.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: d.text,
    fontSize: 17,
    fontWeight: '700',
  },
  cardMeta: {
    color: d.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  linkText: {
    color: d.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: spacing.xs,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  chartBarTrack: {
    width: '100%',
    flex: 1,
    backgroundColor: d.surfaceElevated,
    borderRadius: radius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: radius.sm,
  },
  chartLabel: {
    color: d.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  chartLabelToday: {
    color: d.primary,
  },
  chartHint: {
    color: d.textMuted,
    fontSize: 12,
  },

  skillList: { gap: spacing.sm },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: d.surfaceElevated,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: d.border,
  },
  skillIcon: {
    fontSize: 22,
    width: 30,
    textAlign: 'center',
  },
  skillBody: { flex: 1, gap: 4 },
  skillTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skillLabel: {
    color: d.text,
    fontSize: 14,
    fontWeight: '700',
  },
  skillLevel: {
    color: d.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  skillTrack: {
    height: 6,
    backgroundColor: d.background,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    backgroundColor: d.primary,
    borderRadius: radius.full,
  },
  skillXP: {
    color: d.textMuted,
    fontSize: 11,
    fontWeight: '800',
    width: 56,
    textAlign: 'right',
  },

  achievementRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  achievementBadge: {
    width: 130,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  achievementUnlocked: {
    backgroundColor: 'rgba(244,181,68,0.12)',
    borderColor: 'rgba(244,181,68,0.4)',
  },
  achievementLocked: {
    backgroundColor: d.surfaceElevated,
    borderColor: d.border,
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 30,
  },
  achievementIconLocked: {
    opacity: 0.7,
  },
  achievementTitle: {
    color: d.text,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  achievementDesc: {
    color: d.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    minHeight: 28,
  },

  bottomPad: { height: 110 },
});
