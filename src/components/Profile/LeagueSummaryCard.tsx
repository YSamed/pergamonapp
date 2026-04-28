import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LeagueTier } from '../../types';
import { colors, radius, spacing } from '../../theme';
import { TIER_COLOR, TIER_LABEL } from '../../modules/league';

const d = colors;

type Props = {
  tier: LeagueTier;
  rank: number;
  weeklyXP: number;
  cohortSize: number;
  endsAt: string;
  onPress: () => void;
};

const formatCountdown = (endsAt: string) => {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return 'Hafta bitti';
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}g ${hours}s kaldı`;
  if (hours > 0) return `${hours}s ${minutes}d kaldı`;
  return `${minutes}d kaldı`;
};

export const LeagueSummaryCard = ({
  tier,
  rank,
  weeklyXP,
  cohortSize,
  endsAt,
  onPress,
}: Props) => {
  const tierColor = TIER_COLOR[tier];
  const tierLabel = TIER_LABEL[tier];
  const countdown = formatCountdown(endsAt);

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: `${tierColor}55` }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.tierOrb,
              {
                backgroundColor: `${tierColor}22`,
                borderColor: tierColor,
                shadowColor: tierColor,
              },
            ]}
          >
            <Ionicons name="trophy" size={22} color={tierColor} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Lig</Text>
            <Text style={[styles.tierLabel, { color: tierColor }]}>
              {tierLabel}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={d.textMuted} />
      </View>

      <View style={styles.metaRow}>
        <MetaCell label="Sıra" value={`#${rank}/${cohortSize}`} />
        <MetaCell label="Bu hafta" value={`${weeklyXP} XP`} accent={d.xp} />
        <MetaCell label="Kalan" value={countdown} />
      </View>
    </TouchableOpacity>
  );
};

const MetaCell = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) => (
  <View style={styles.metaCell}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={[styles.metaValue, accent ? { color: accent } : null]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: d.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  tierOrb: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  headerText: { gap: 2 },
  eyebrow: {
    color: d.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tierLabel: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaCell: {
    flex: 1,
    backgroundColor: d.surfaceElevated,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: d.border,
    gap: 2,
  },
  metaLabel: {
    color: d.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: d.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
