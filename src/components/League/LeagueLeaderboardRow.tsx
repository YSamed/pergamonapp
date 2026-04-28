import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LeagueParticipant, LeagueTier } from '../../types';
import { colors, radius, spacing } from '../../theme';
import { COHORT_SIZE, DEMOTE_COUNT, PROMOTE_COUNT } from '../../modules/league';

type Props = {
  participant: LeagueParticipant;
  tier: LeagueTier;
  isMe: boolean;
};

const PROMOTE_GREEN = '#10B981';
const DEMOTE_RED = '#EF4444';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const LeagueLeaderboardRow = ({ participant, tier, isMe }: Props) => {
  const promoteCount = PROMOTE_COUNT[tier];
  const demoteCount = DEMOTE_COUNT[tier];
  const inPromote = promoteCount > 0 && participant.rank <= promoteCount;
  const inDemote = demoteCount > 0 && participant.rank > COHORT_SIZE - demoteCount;

  const accent = inPromote
    ? PROMOTE_GREEN
    : inDemote
      ? DEMOTE_RED
      : colors.border;
  const tint = inPromote
    ? `${PROMOTE_GREEN}14`
    : inDemote
      ? `${DEMOTE_RED}14`
      : colors.surface;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: tint,
          borderLeftColor: accent,
          borderLeftWidth: 3,
          borderColor: isMe ? colors.primary : colors.border,
          borderWidth: isMe ? 1.5 : 1,
        },
      ]}
    >
      <Text style={[styles.rank, isMe && styles.rankMe]}>{participant.rank}</Text>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(participant.displayName)}</Text>
      </View>
      <View style={styles.body}>
        <Text
          style={[styles.name, isMe && styles.nameMe]}
          numberOfLines={1}
        >
          {participant.displayName}
          {isMe ? ' (sen)' : ''}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons
            name={participant.heartbeatToday ? 'heart' : 'heart-outline'}
            size={11}
            color={participant.heartbeatToday ? colors.streak : colors.textMuted}
          />
          <Text style={styles.metaText}>
            {participant.heartbeatToday ? 'bugün aktif' : 'bekleniyor'}
          </Text>
        </View>
      </View>
      <View style={styles.xpCol}>
        <Text style={[styles.xpValue, isMe && styles.xpValueMe]}>
          {participant.weeklyXP}
        </Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
  },
  rank: {
    width: 28,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  rankMe: {
    color: colors.primary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  nameMe: {
    fontWeight: '900',
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  xpCol: {
    alignItems: 'flex-end',
    minWidth: 56,
  },
  xpValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  xpValueMe: {
    color: colors.primary,
  },
  xpLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
