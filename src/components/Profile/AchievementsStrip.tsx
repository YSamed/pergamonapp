import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Achievement } from '../../types';
import { colors, radius, spacing } from '../../theme';

const d = colors;

type Props = {
  achievements: Achievement[];
  limit?: number;
  onSeeAll: () => void;
};

export const AchievementsStrip = ({
  achievements,
  limit = 5,
  onSeeAll,
}: Props) => {
  const unlocked = achievements.filter((a) => !!a.unlockedAt);
  const locked = achievements.filter((a) => !a.unlockedAt);

  // Sort unlocked descending by date, then take latest N
  const sortedUnlocked = [...unlocked].sort((a, b) => {
    const aT = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
    const bT = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
    return bT - aT;
  });

  const visible: Achievement[] = [];
  for (const a of sortedUnlocked) {
    if (visible.length >= limit) break;
    visible.push(a);
  }
  for (const a of locked) {
    if (visible.length >= limit) break;
    visible.push(a);
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Başarımlar</Text>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.8}>
          <Text style={styles.linkText}>Tümünü gör →</Text>
        </TouchableOpacity>
      </View>
      {visible.length === 0 ? (
        <Text style={styles.emptyText}>Henüz başarım açmadın.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {visible.map((a) => (
            <AchievementBadge
              key={a.id}
              achievement={a}
              unlocked={!!a.unlockedAt}
            />
          ))}
        </ScrollView>
      )}
    </View>
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
      styles.badge,
      unlocked ? styles.unlocked : styles.locked,
    ]}
  >
    <Text style={[styles.icon, !unlocked && styles.iconLocked]}>
      {unlocked ? achievement.icon : '🔒'}
    </Text>
    <Text style={styles.title} numberOfLines={1}>
      {achievement.title}
    </Text>
    <Text style={styles.desc} numberOfLines={2}>
      {achievement.description}
    </Text>
  </View>
);

const styles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: d.text,
    fontSize: 17,
    fontWeight: '700',
  },
  linkText: {
    color: d.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyText: {
    color: d.textMuted,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: spacing.sm,
  },
  row: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  badge: {
    width: 130,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  unlocked: {
    backgroundColor: 'rgba(244,181,68,0.12)',
    borderColor: 'rgba(244,181,68,0.4)',
  },
  locked: {
    backgroundColor: d.surfaceElevated,
    borderColor: d.border,
    opacity: 0.6,
  },
  icon: {
    fontSize: 30,
  },
  iconLocked: {
    opacity: 0.7,
  },
  title: {
    color: d.text,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  desc: {
    color: d.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    minHeight: 28,
  },
});
