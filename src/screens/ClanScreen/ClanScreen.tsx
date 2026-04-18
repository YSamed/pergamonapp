import { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../../theme';
import {
  mockClanPage,
  type ClanLeaderboardEntry,
  type ClanPageActivity,
  type ClanPageMember,
} from '../../mock';

const d = colors.dark;
const accent = colors.level;
const accentDim = 'rgba(139,92,246,0.16)';
const accentBorder = 'rgba(139,92,246,0.42)';
const accentSoft = '#C4B5FD';

type SheetMode = 'none' | 'create' | 'join';
type PrivacyMode = 'open' | 'invite';
type MemberLimit = 3 | 5 | 10;

const MEMBER_LIMITS: MemberLimit[] = [3, 5, 10];

export const ClanScreen = () => {
  const [sheetMode, setSheetMode] = useState<SheetMode>('none');
  const [hasClan, setHasClan] = useState(false);
  const [clanName, setClanName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyMode>('open');
  const [memberLimit, setMemberLimit] = useState<MemberLimit>(5);

  const dashboard = useMemo(() => {
    const source = mockClanPage.dashboard;
    return {
      ...source,
      name: clanName.trim() || source.name,
    };
  }, [clanName]);

  const progress = Math.min(1, dashboard.weeklyCurrent / dashboard.weeklyTarget);
  const canCreate = clanName.trim().length > 0;
  const canJoin = inviteCode.trim().length > 0;

  const closeSheet = () => setSheetMode('none');

  const handleCreateClan = () => {
    if (!canCreate) return;
    setHasClan(true);
    closeSheet();
  };

  const handleJoinClan = () => {
    if (!canJoin) return;
    setHasClan(true);
    closeSheet();
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {!hasClan ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyBadge}>
              <Text style={styles.emptyBadgeIcon}>🛡️</Text>
            </View>
            <Text style={styles.emptyTitle}>{mockClanPage.emptyState.title}</Text>
            <Text style={styles.emptyDescription}>{mockClanPage.emptyState.description}</Text>

            <View style={styles.actionStack}>
              <TouchableOpacity
                style={[styles.primaryButton, styles.shadowSoft]}
                onPress={() => setSheetMode('create')}
                activeOpacity={0.86}
              >
                <Text style={styles.primaryButtonText}>Klan Olustur</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setSheetMode('join')}
                activeOpacity={0.86}
              >
                <Text style={styles.secondaryButtonText}>Klana Katil</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              {mockClanPage.emptyState.infoLines.map((line) => (
                <View key={line} style={styles.infoRow}>
                  <View style={styles.infoDot} />
                  <Text style={styles.infoText}>{line}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.filledWrap}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.heroCard}>
                <View style={styles.heroTop}>
                  <View>
                    <Text style={styles.heroTitle}>{dashboard.name}</Text>
                    <Text style={styles.heroMeta}>
                      {dashboard.league} • Level {dashboard.level}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.settingsButton} activeOpacity={0.84}>
                    <Text style={styles.settingsText}>⚙</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.scoreLabel}>Gunluk skor</Text>
                <Text style={styles.scoreValue}>{dashboard.dailyScore}</Text>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Haftalik hedef</Text>
                  <Text style={styles.progressValue}>
                    {dashboard.weeklyCurrent} / {dashboard.weeklyTarget}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.progressPercent}>%{Math.round(progress * 100)} ilerleme</Text>
              </View>

              <SectionCard title="Uyeler">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.memberRow}
                >
                  {dashboard.members.map((member) => (
                    <MemberAvatar key={member.id} member={member} />
                  ))}
                </ScrollView>
              </SectionCard>

              <View style={styles.pressureCard}>
                <Text style={styles.pressureTitle}>{dashboard.pressureTitle}</Text>
                <Text style={styles.pressureSubtitle}>{dashboard.pressureSubtitle}</Text>
              </View>

              <SectionCard title="Aktivite">
                <View style={styles.listColumn}>
                  {dashboard.activity.map((item) => (
                    <ActivityRow key={item.id} item={item} />
                  ))}
                </View>
              </SectionCard>

              <SectionCard title="Lig / Siralama">
                <View style={styles.listColumn}>
                  {dashboard.leaderboard.map((entry) => (
                    <LeaderboardRow key={entry.id} entry={entry} />
                  ))}
                </View>
              </SectionCard>
            </ScrollView>

            <View style={styles.stickyCtaWrap}>
              <TouchableOpacity style={[styles.primaryButton, styles.shadowSoft]} activeOpacity={0.86}>
                <Text style={styles.primaryButtonText}>Habitleri Tamamla</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Modal
          transparent
          visible={sheetMode !== 'none'}
          animationType="slide"
          onRequestClose={closeSheet}
        >
          <View style={styles.sheetOverlay}>
            <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={closeSheet} />
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              {sheetMode === 'create' ? (
                <>
                  <Text style={styles.sheetTitle}>Klan Olustur</Text>
                  <Text style={styles.sheetSubtitle}>
                    Kendi ekibini kur ve birlikte hedeflere ulas
                  </Text>

                  <LabeledInput
                    label="Klan Adi"
                    value={clanName}
                    onChangeText={setClanName}
                    placeholder="Disiplin Ekibi"
                  />
                  <LabeledInput
                    label="Aciklama"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Kisa bir klan aciklamasi"
                    multiline
                  />

                  <Text style={styles.fieldLabel}>Maksimum Uye</Text>
                  <View style={styles.segmentRow}>
                    {MEMBER_LIMITS.map((limit) => {
                      const active = memberLimit === limit;
                      return (
                        <TouchableOpacity
                          key={limit}
                          style={[styles.segmentButton, active && styles.segmentButtonActive]}
                          onPress={() => setMemberLimit(limit)}
                          activeOpacity={0.84}
                        >
                          <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                            {limit}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.fieldLabel}>Gizlilik</Text>
                  <View style={styles.privacyStack}>
                    <PrivacyCard
                      title="Acik"
                      subtitle="Herkes katilabilir"
                      active={privacy === 'open'}
                      onPress={() => setPrivacy('open')}
                    />
                    <PrivacyCard
                      title="Davetli"
                      subtitle="Invite code ile giris"
                      active={privacy === 'invite'}
                      onPress={() => setPrivacy('invite')}
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      styles.sheetPrimaryButton,
                      !canCreate && styles.primaryButtonDisabled,
                    ]}
                    onPress={handleCreateClan}
                    activeOpacity={0.86}
                    disabled={!canCreate}
                  >
                    <Text style={styles.primaryButtonText}>Klani Olustur</Text>
                  </TouchableOpacity>

                  <View style={styles.sheetNotes}>
                    <Text style={styles.sheetNote}>Klan kurmak sorumluluk gerektirir</Text>
                    <Text style={styles.sheetNote}>Aktif kalmazsan klanin geriler</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.sheetTitle}>Klana Katil</Text>
                  <Text style={styles.sheetSubtitle}>
                    Davet kodunu gir ve dogrudan ekibe dahil ol
                  </Text>

                  <LabeledInput
                    label="Davet Kodu Gir"
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    placeholder="ORNK-4281"
                  />

                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      styles.sheetPrimaryButton,
                      !canJoin && styles.primaryButtonDisabled,
                    ]}
                    onPress={handleJoinClan}
                    activeOpacity={0.86}
                    disabled={!canJoin}
                  >
                    <Text style={styles.primaryButtonText}>Katil</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={[styles.sectionCard, styles.shadowSoft]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const MemberAvatar = ({ member }: { member: ClanPageMember }) => (
  <View style={styles.memberItem}>
    <View
      style={[
        styles.memberAvatarWrap,
        member.isCurrentUser && styles.memberAvatarWrapActive,
      ]}
    >
      <View style={[styles.memberAvatar, { backgroundColor: member.color }]}>
        <Text style={styles.memberAvatarText}>{member.avatar}</Text>
      </View>
      <View
        style={[
          styles.statusDot,
          member.status === 'done' ? styles.statusDone : styles.statusMissed,
        ]}
      />
    </View>
    <Text style={styles.memberName}>{member.name}</Text>
  </View>
);

const ActivityRow = ({ item }: { item: ClanPageActivity }) => (
  <View style={styles.activityRow}>
    <View style={styles.activityIconWrap}>
      <Text style={styles.activityIcon}>{item.icon}</Text>
    </View>
    <View style={styles.activityTextWrap}>
      <Text style={styles.activityTitle}>{item.title}</Text>
      <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
    </View>
  </View>
);

const LeaderboardRow = ({ entry }: { entry: ClanLeaderboardEntry }) => (
  <View style={[styles.leaderboardRow, entry.isCurrentClan && styles.leaderboardRowActive]}>
    <View style={styles.leaderboardLeft}>
      <Text style={[styles.rankText, entry.isCurrentClan && styles.rankTextActive]}>
        #{entry.rank}
      </Text>
      <Text style={[styles.leaderboardName, entry.isCurrentClan && styles.leaderboardNameActive]}>
        {entry.name}
      </Text>
    </View>
    <Text style={[styles.leaderboardScore, entry.isCurrentClan && styles.leaderboardScoreActive]}>
      {entry.score}
    </Text>
  </View>
);

const PrivacyCard = ({
  title,
  subtitle,
  active,
  onPress,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.privacyCard, active && styles.privacyCardActive]}
    onPress={onPress}
    activeOpacity={0.86}
  >
    <Text style={[styles.privacyTitle, active && styles.privacyTitleActive]}>{title}</Text>
    <Text style={styles.privacySubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const LabeledInput = ({
  label,
  multiline,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      {...props}
      multiline={multiline}
      placeholderTextColor={d.textMuted}
      style={[styles.input, multiline && styles.inputMultiline]}
    />
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: d.background,
  },
  safeArea: {
    flex: 1,
  },
  shadowSoft: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  emptyBadge: {
    width: 92,
    height: 92,
    borderRadius: 30,
    alignSelf: 'center',
    backgroundColor: d.surface,
    borderWidth: 1,
    borderColor: d.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptyBadgeIcon: {
    fontSize: 42,
  },
  emptyTitle: {
    color: d.text,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.6,
  },
  emptyDescription: {
    color: d.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actionStack: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: radius.xl,
    backgroundColor: accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: d.background,
    fontSize: 16,
    fontWeight: '800',
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  secondaryButton: {
    minHeight: 56,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: accentBorder,
    backgroundColor: accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: d.text,
    fontSize: 16,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: d.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: d.cardBorder,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: accent,
  },
  infoText: {
    color: d.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  filledWrap: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 120,
    gap: spacing.md,
  },
  heroCard: {
    backgroundColor: d.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: d.cardBorder,
    padding: spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    color: d.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  heroMeta: {
    color: d.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: d.surfaceElevated,
    borderWidth: 1,
    borderColor: d.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    color: d.text,
    fontSize: 18,
  },
  scoreLabel: {
    color: d.textSecondary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  scoreValue: {
    color: d.text,
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -1.4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  progressTitle: {
    color: d.textSecondary,
    fontSize: 14,
  },
  progressValue: {
    color: d.text,
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    height: 12,
    backgroundColor: accentDim,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: accent,
  },
  progressPercent: {
    color: d.textMuted,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  sectionCard: {
    backgroundColor: d.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: d.cardBorder,
    padding: spacing.md,
  },
  sectionTitle: {
    color: d.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  memberRow: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  memberItem: {
    width: 72,
    alignItems: 'center',
    gap: spacing.sm,
  },
  memberAvatarWrap: {
    width: 66,
    height: 66,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  memberAvatarWrapActive: {
    borderColor: accent,
    shadowColor: accent,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  memberAvatar: {
    width: 58,
    height: 58,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  statusDot: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 14,
    height: 14,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: d.surface,
  },
  statusDone: {
    backgroundColor: colors.success,
  },
  statusMissed: {
    backgroundColor: '#6B7280',
  },
  memberName: {
    color: d.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pressureCard: {
    backgroundColor: accentDim,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: accentBorder,
    padding: spacing.md,
    gap: spacing.xs,
  },
  pressureTitle: {
    color: d.text,
    fontSize: 18,
    fontWeight: '700',
  },
  pressureSubtitle: {
    color: accentSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  listColumn: {
    gap: spacing.sm,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: d.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: d.cardBorder,
  },
  activityIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    fontSize: 20,
  },
  activityTextWrap: {
    flex: 1,
  },
  activityTitle: {
    color: d.text,
    fontSize: 15,
    fontWeight: '700',
  },
  activitySubtitle: {
    color: d.textSecondary,
    fontSize: 13,
    marginTop: spacing.xxs,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: d.surfaceElevated,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: d.cardBorder,
  },
  leaderboardRowActive: {
    borderWidth: 1,
    borderColor: accentBorder,
    backgroundColor: accentDim,
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rankText: {
    color: d.textMuted,
    fontSize: 14,
    fontWeight: '700',
    width: 26,
  },
  rankTextActive: {
    color: accent,
  },
  leaderboardName: {
    color: d.text,
    fontSize: 15,
    fontWeight: '700',
  },
  leaderboardNameActive: {
    color: d.text,
  },
  leaderboardScore: {
    color: d.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  leaderboardScoreActive: {
    color: accent,
  },
  stickyCtaWrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: d.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderColor: d.cardBorder,
    gap: spacing.md,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: d.textMuted,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    color: d.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  sheetSubtitle: {
    color: d.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  fieldWrap: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: d.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor: d.surfaceElevated,
    borderWidth: 1,
    borderColor: d.cardBorder,
    paddingHorizontal: spacing.md,
    color: d.text,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 92,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segmentButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: d.cardBorder,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: accentDim,
    borderColor: accentBorder,
  },
  segmentText: {
    color: d.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: accent,
  },
  privacyStack: {
    gap: spacing.sm,
  },
  privacyCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: d.cardBorder,
    backgroundColor: d.surfaceElevated,
    padding: spacing.md,
    gap: spacing.xs,
  },
  privacyCardActive: {
    borderColor: accentBorder,
    backgroundColor: accentDim,
  },
  privacyTitle: {
    color: d.text,
    fontSize: 15,
    fontWeight: '700',
  },
  privacyTitleActive: {
    color: accent,
  },
  privacySubtitle: {
    color: d.textSecondary,
    fontSize: 13,
  },
  sheetPrimaryButton: {
    marginTop: spacing.sm,
  },
  sheetNotes: {
    gap: spacing.xs,
  },
  sheetNote: {
    color: d.textMuted,
    fontSize: 12,
  },
});
