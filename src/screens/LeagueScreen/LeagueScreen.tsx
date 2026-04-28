import { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { League, LeagueHistoryEntry, UserLeagueState } from '../../types';
import { colors, radius, spacing } from '../../theme';
import {
  COHORT_SIZE,
  DECAY_RATE,
  DEMOTE_COUNT,
  HEARTBEAT_MAX,
  PROMOTE_COUNT,
  TIER_COLOR,
  TIER_LABEL,
  isUpperTier,
} from '../../modules/league';
import { leagueService } from '../../services/league.service';
import { RankBadge } from '../../components/League/RankBadge';
import { HeartbeatBar } from '../../components/League/HeartbeatBar';
import { LeagueLeaderboardRow } from '../../components/League/LeagueLeaderboardRow';

const PROMOTE_GREEN = '#10B981';
const DEMOTE_RED = '#EF4444';

const formatRemaining = (endsAt: string): string => {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return 'Hafta tamamlandı';
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

const OUTCOME_META: Record<
  LeagueHistoryEntry['outcome'],
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  promote: { label: 'Yükseldi', color: PROMOTE_GREEN, icon: 'arrow-up' },
  hold: { label: 'Kaldı', color: '#9EB0C5', icon: 'remove' },
  demote: { label: 'Düştü', color: DEMOTE_RED, icon: 'arrow-down' },
  freeze: { label: 'Donduruldu', color: '#06B6D4', icon: 'snow' },
};

export const LeagueScreen = () => {
  const navigation = useNavigation();
  const [league, setLeague] = useState<League | null>(null);
  const [state, setState] = useState<UserLeagueState | null>(null);
  const [freezePending, setFreezePending] = useState(false);
  const [freezeMessage, setFreezeMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [l, s] = await Promise.all([
      leagueService.getCurrentLeague(),
      leagueService.getUserState(),
    ]);
    setLeague(l);
    setState(s);
  }, []);

  useEffect(() => {
    void load();
    void leagueService.runMidnightTick();
    const unsub = navigation.addListener('focus', () => {
      void load();
      void leagueService.runMidnightTick();
    });
    return unsub;
  }, [navigation, load]);

  const handleFreeze = async () => {
    if (!state || freezePending) return;
    setFreezePending(true);
    const result = await leagueService.useFreeze(state.userId);
    setFreezePending(false);
    if (result.ok) {
      setFreezeMessage('Donma günü etkinleştirildi.');
      await load();
    } else {
      setFreezeMessage('Bu hafta donma hakkın kalmadı.');
    }
    setTimeout(() => setFreezeMessage(null), 3200);
  };

  if (!league || !state) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.safeArea} edges={['top']} />
      </View>
    );
  }

  const tier = league.tier;
  const tierColor = TIER_COLOR[tier];
  const me = league.participants.find((p) => p.userId === state.userId);
  const myRank = me?.rank ?? 0;
  const promoteCount = PROMOTE_COUNT[tier];
  const demoteCount = DEMOTE_COUNT[tier];

  const promoteSlice = league.participants.slice(0, promoteCount);
  const holdSlice = league.participants.slice(
    promoteCount,
    COHORT_SIZE - demoteCount,
  );
  const demoteSlice = league.participants.slice(COHORT_SIZE - demoteCount);

  const showDecayBanner = isUpperTier(tier) && state.heartbeatBank === 0;
  const decayPct = Math.round(DECAY_RATE[tier] * 100);
  const xpAtRisk = Math.floor(state.weeklyXP * DECAY_RATE[tier]);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeftSpacer} />
            <View style={styles.headerCenter}>
              <Text style={styles.headerEyebrow}>Haftalık Lig</Text>
              <Text style={styles.headerTitle}>Lig</Text>
            </View>
            <TouchableOpacity
              style={styles.freezeCounterBtn}
              activeOpacity={0.85}
              onPress={handleFreeze}
              accessibilityLabel="Donma günü"
            >
              <Ionicons name="snow" size={18} color="#06B6D4" />
              <Text style={styles.freezeCounterText}>
                {state.freezesAvailable}
              </Text>
            </TouchableOpacity>
          </View>

          {freezeMessage ? (
            <View style={styles.freezeFlash}>
              <Text style={styles.freezeFlashText}>{freezeMessage}</Text>
            </View>
          ) : null}

          {/* Hero */}
          <View
            style={[
              styles.hero,
              { borderColor: `${tierColor}55`, shadowColor: tierColor },
            ]}
          >
            <View style={[styles.heroAccent, { backgroundColor: tierColor }]} />
            <View style={styles.heroBody}>
              <RankBadge tier={tier} size="lg" />
              <View style={styles.heroCol}>
                <Text style={styles.heroEyebrow}>
                  {TIER_LABEL[tier]} Ligi
                </Text>
                <Text style={styles.heroRank}>
                  {myRank > 0 ? `${myRank} / ${COHORT_SIZE}` : `— / ${COHORT_SIZE}`}
                </Text>
                <View style={styles.heroXpRow}>
                  <Ionicons name="flash" size={14} color={colors.xp} />
                  <Text style={styles.heroXpText}>
                    {state.weeklyXP} XP bu hafta
                  </Text>
                </View>
                <Text style={styles.heroCountdown}>
                  Pazar 23:59&apos;a kadar • {formatRemaining(league.endsAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Heartbeat */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Daily heartbeat</Text>
              <Text style={styles.cardMeta}>
                {state.heartbeatBank}/{HEARTBEAT_MAX}
              </Text>
            </View>
            <HeartbeatBar
              filled={state.heartbeatBank}
              today={state.heartbeatToday}
            />
            <Text style={styles.cardHint}>
              Daily heartbeat — habit yapmazsan azalır
            </Text>
          </View>

          {/* Decay warning */}
          {showDecayBanner ? (
            <View style={styles.decayBanner}>
              <View style={styles.decayIconWrap}>
                <Ionicons name="warning" size={20} color="#F59E0B" />
              </View>
              <View style={styles.decayTextWrap}>
                <Text style={styles.decayTitle}>
                  Lig XP&apos;in azalmak üzere
                </Text>
                <Text style={styles.decaySubtitle}>
                  {TIER_LABEL[tier]} tierinde gece her gün %{decayPct} kayıp
                  {xpAtRisk > 0 ? ` (≈ ${xpAtRisk} XP)` : ''}. Bugün bir habit yap.
                </Text>
              </View>
            </View>
          ) : null}

          {/* Promotion zone */}
          <View style={styles.zoneSection}>
            <View style={styles.zoneHeader}>
              <View
                style={[styles.zoneDot, { backgroundColor: PROMOTE_GREEN }]}
              />
              <Text style={styles.zoneLabel}>
                Yükselme bölgesi · İlk {promoteCount}
              </Text>
            </View>
            <View style={styles.rowList}>
              {promoteSlice.map((p) => (
                <LeagueLeaderboardRow
                  key={p.userId}
                  participant={p}
                  tier={tier}
                  isMe={p.userId === state.userId}
                />
              ))}
            </View>
          </View>

          {/* Hold zone */}
          {holdSlice.length > 0 ? (
            <View style={styles.zoneSection}>
              <View style={styles.zoneHeader}>
                <View
                  style={[styles.zoneDot, { backgroundColor: colors.textMuted }]}
                />
                <Text style={styles.zoneLabel}>Sürdürme bölgesi</Text>
              </View>
              <View style={styles.rowList}>
                {holdSlice.map((p) => (
                  <LeagueLeaderboardRow
                    key={p.userId}
                    participant={p}
                    tier={tier}
                    isMe={p.userId === state.userId}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/* Demotion zone */}
          {demoteSlice.length > 0 ? (
            <View style={styles.zoneSection}>
              <View style={styles.zoneHeader}>
                <View
                  style={[styles.zoneDot, { backgroundColor: DEMOTE_RED }]}
                />
                <Text style={styles.zoneLabel}>
                  Düşme bölgesi · Son {demoteCount}
                </Text>
              </View>
              <View style={styles.rowList}>
                {demoteSlice.map((p) => (
                  <LeagueLeaderboardRow
                    key={p.userId}
                    participant={p}
                    tier={tier}
                    isMe={p.userId === state.userId}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/* Freeze CTA */}
          <TouchableOpacity
            style={[
              styles.freezeBtn,
              (state.freezesAvailable <= 0 || freezePending) &&
                styles.freezeBtnDisabled,
            ]}
            onPress={handleFreeze}
            disabled={state.freezesAvailable <= 0 || freezePending}
            activeOpacity={0.85}
          >
            <Ionicons name="snow" size={18} color="#06B6D4" />
            <Text style={styles.freezeBtnText}>
              Donma günü kullan
            </Text>
            <View style={styles.freezeBtnPill}>
              <Text style={styles.freezeBtnPillText}>
                {state.freezesAvailable}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Tier history */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Son haftalar</Text>
              <Text style={styles.cardMeta}>
                {state.history.length}/8
              </Text>
            </View>
            <View style={styles.historyRow}>
              {Array.from({ length: 8 }).map((_, i) => {
                const entry = state.history[i];
                if (!entry) {
                  return <View key={i} style={styles.historyEmpty} />;
                }
                const meta = OUTCOME_META[entry.outcome];
                const endColor = TIER_COLOR[entry.endTier];
                return (
                  <View
                    key={i}
                    style={[
                      styles.historyBox,
                      { borderColor: `${endColor}66` },
                    ]}
                  >
                    <Text
                      style={[styles.historyTier, { color: endColor }]}
                      numberOfLines={1}
                    >
                      {TIER_LABEL[entry.endTier].slice(0, 3)}
                    </Text>
                    <View
                      style={[
                        styles.historyOutcome,
                        { backgroundColor: `${meta.color}22` },
                      ]}
                    >
                      <Ionicons
                        name={meta.icon}
                        size={11}
                        color={meta.color}
                      />
                    </View>
                    <Text style={styles.historyRank}>#{entry.finalRank}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.bottomPad} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerLeftSpacer: {
    width: 64,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerEyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  freezeCounterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.35)',
    minWidth: 64,
    justifyContent: 'center',
  },
  freezeCounterText: {
    color: '#06B6D4',
    fontSize: 14,
    fontWeight: '900',
  },

  freezeFlash: {
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderColor: 'rgba(6,182,212,0.35)',
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  freezeFlashText: {
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Hero
  hero: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  heroAccent: {
    width: 4,
  },
  heroBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  heroCol: {
    flex: 1,
    gap: 4,
  },
  heroEyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroRank: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
  },
  heroXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroXpText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  heroCountdown: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },

  // Card (heartbeat / history)
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  cardHint: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },

  // Decay banner
  decayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderColor: 'rgba(245,158,11,0.4)',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  decayIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(245,158,11,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decayTextWrap: {
    flex: 1,
    gap: 2,
  },
  decayTitle: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '800',
  },
  decaySubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },

  // Zones
  zoneSection: {
    gap: spacing.sm,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  zoneLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  rowList: {
    gap: spacing.xs,
  },

  // Freeze CTA
  freezeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(6,182,212,0.5)',
  },
  freezeBtnDisabled: {
    opacity: 0.4,
  },
  freezeBtnText: {
    color: '#06B6D4',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  freezeBtnPill: {
    minWidth: 24,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(6,182,212,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freezeBtnPillText: {
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: '900',
  },

  // History
  historyRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  historyBox: {
    flex: 1,
    aspectRatio: 0.78,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  historyEmpty: {
    flex: 1,
    aspectRatio: 0.78,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    opacity: 0.4,
  },
  historyTier: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  historyOutcome: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyRank: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },

  bottomPad: {
    height: 110,
  },
});
