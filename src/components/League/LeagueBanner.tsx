import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LeagueTier } from '../../types';
import { colors, radius, spacing } from '../../theme';
import { TIER_COLOR, TIER_LABEL } from '../../modules/league';
import { RankBadge } from './RankBadge';

type Props = {
  tier: LeagueTier;
  rank: number;
  weeklyXP: number;
  cohortSize: number;
  endsAt: string;
  onPress?: () => void;
};

const formatRemaining = (endsAt: string): string => {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return 'Bitti';
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin - days * 60 * 24) / 60);
  if (days > 0) return `${days} gün ${hours} saat kaldı`;
  if (hours > 0) {
    const mins = totalMin - hours * 60;
    return `${hours} saat ${mins} dk kaldı`;
  }
  return `${totalMin} dk kaldı`;
};

export const LeagueBanner = ({
  tier,
  rank,
  weeklyXP,
  cohortSize,
  endsAt,
  onPress,
}: Props) => {
  const tierColor = TIER_COLOR[tier];
  const Wrapper: React.ElementType = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { activeOpacity: 0.85, onPress } : {};

  return (
    <Wrapper {...wrapperProps} style={[styles.card, { borderColor: `${tierColor}55` }]}>
      <View style={[styles.accentBar, { backgroundColor: tierColor }]} />
      <View style={styles.body}>
        <RankBadge tier={tier} size="md" />
        <View style={styles.col}>
          <Text style={styles.title}>
            {TIER_LABEL[tier]} • Sıralama {rank}/{cohortSize}
          </Text>
          <View style={styles.xpRow}>
            <Ionicons name="flash" size={13} color={colors.xp} />
            <Text style={styles.xpText}>{weeklyXP} XP bu hafta</Text>
          </View>
          <Text style={styles.countdown}>{formatRemaining(endsAt)}</Text>
        </View>
        {onPress ? (
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        ) : null}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  col: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  countdown: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
