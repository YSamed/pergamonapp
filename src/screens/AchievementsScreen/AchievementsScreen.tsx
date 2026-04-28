import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Achievement, RootStackParamList } from '../../types';
import { colors, radius, spacing } from '../../theme';
import { progressService } from '../../services/progress.service';

const d = colors;

type Nav = NativeStackNavigationProp<RootStackParamList>;

type FilterTab = 'all' | 'unlocked' | 'locked';

const FILTER_LABELS: Record<FilterTab, string> = {
  all: 'Tümü',
  unlocked: 'Açık',
  locked: 'Kilitli',
};

const formatDate = (iso: string) => {
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const AchievementsScreen = () => {
  const navigation = useNavigation<Nav>();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');

  const load = useCallback(async () => {
    const p = await progressService.getUserProgress();
    setAchievements(p.achievements);
  }, []);

  useEffect(() => {
    void load();
    const unsub = navigation.addListener('focus', () => void load());
    return unsub;
  }, [navigation, load]);

  const filtered = useMemo(() => {
    if (filter === 'unlocked') {
      return achievements.filter((a) => !!a.unlockedAt);
    }
    if (filter === 'locked') {
      return achievements.filter((a) => !a.unlockedAt);
    }
    // all — unlocked first (newest), then locked
    const unlocked = achievements
      .filter((a) => !!a.unlockedAt)
      .sort((a, b) => {
        const aT = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
        const bT = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
        return bT - aT;
      });
    const locked = achievements.filter((a) => !a.unlockedAt);
    return [...unlocked, ...locked];
  }, [achievements, filter]);

  const unlockedCount = achievements.filter((a) => !!a.unlockedAt).length;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color={d.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerEyebrow}>Koleksiyonun</Text>
            <Text style={styles.headerTitle}>Başarımlar</Text>
          </View>
          <View style={styles.headerCount}>
            <Text style={styles.headerCountText}>
              {unlockedCount}/{achievements.length}
            </Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {(Object.keys(FILTER_LABELS) as FilterTab[]).map((key) => (
            <FilterPill
              key={key}
              label={FILTER_LABELS[key]}
              value={key}
              current={filter}
              onPress={setFilter}
            />
          ))}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏅</Text>
              <Text style={styles.emptyTitle}>Bu sekmede gösterilecek başarım yok</Text>
              <Text style={styles.emptyText}>
                Görevleri tamamlamaya devam et — yeni başarımlar açılacak.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filtered.map((a) => (
                <AchievementCard key={a.id} achievement={a} />
              ))}
            </View>
          )}
          <View style={styles.bottomPad} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

type FilterPillProps = {
  label: string;
  value: FilterTab;
  current: FilterTab;
  onPress: (v: FilterTab) => void;
};

const FilterPill = ({ label, value, current, onPress }: FilterPillProps) => {
  const active = current === value;
  return (
    <TouchableOpacity
      style={[styles.filterBtn, active && styles.filterBtnActive]}
      onPress={() => onPress(value)}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.filterBtnText, active && styles.filterBtnTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const unlocked = !!achievement.unlockedAt;
  return (
    <View
      style={[
        styles.card,
        unlocked ? styles.cardUnlocked : styles.cardLocked,
      ]}
    >
      <Text style={[styles.cardIcon, !unlocked && styles.cardIconLocked]}>
        {unlocked ? achievement.icon : '🔒'}
      </Text>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {achievement.title}
      </Text>
      <Text style={styles.cardDesc} numberOfLines={3}>
        {achievement.description}
      </Text>
      {unlocked && achievement.unlockedAt ? (
        <Text style={styles.cardDate}>{formatDate(achievement.unlockedAt)}</Text>
      ) : (
        <Text style={styles.cardLockedLabel}>Kilitli</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: d.background },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: d.surface,
    borderWidth: 1,
    borderColor: d.border,
  },
  headerTitleWrap: {
    flex: 1,
    gap: 2,
  },
  headerEyebrow: {
    color: d.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: d.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  headerCount: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: d.surface,
    borderWidth: 1,
    borderColor: d.border,
  },
  headerCountText: {
    color: d.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

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
    fontWeight: '600',
  },
  filterBtnTextActive: {
    color: d.text,
    fontWeight: '700',
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 180,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  cardUnlocked: {
    backgroundColor: 'rgba(244,181,68,0.12)',
    borderColor: 'rgba(244,181,68,0.4)',
  },
  cardLocked: {
    backgroundColor: d.surfaceElevated,
    borderColor: d.border,
    opacity: 0.7,
  },
  cardIcon: {
    fontSize: 40,
  },
  cardIconLocked: {
    opacity: 0.7,
  },
  cardTitle: {
    color: d.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  cardDesc: {
    color: d.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    minHeight: 32,
  },
  cardDate: {
    color: d.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  cardLockedLabel: {
    color: d.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    color: d.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    color: d.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },

  bottomPad: { height: 60 },
});
