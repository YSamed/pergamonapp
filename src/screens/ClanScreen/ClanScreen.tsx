import { useMemo, useState } from 'react';
import {
  Image,
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

const d = colors;
const accent = colors.level;
const accentDim = 'rgba(139,92,246,0.16)';
const accentBorder = 'rgba(139,92,246,0.42)';
const accentSoft = '#C4B5FD';

type SheetMode = 'none' | 'create' | 'join';
type PrivacyMode = 'open' | 'invite';

export const ClanScreen = () => {
  const [sheetMode, setSheetMode] = useState<SheetMode>('none');
  const [hasClan, setHasClan] = useState(false);
  const [clanName, setClanName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyMode>('open');

  const dashboard = useMemo(() => {
    const source = mockClanPage.dashboard;
    return {
      ...source,
      name: clanName.trim() || source.name,
    };
  }, [clanName]);

  const progress = Math.min(
    1,
    dashboard.weeklyCurrent / dashboard.weeklyTarget,
  );
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
          <ScrollView
            style={styles.emptyScroll}
            contentContainerStyle={styles.emptyScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.heroImageContainer}>
                <Image
                  source={require('../../assets/images/clan-hero.png')}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
                <View style={styles.heroGradient} />
              </View>

              <View style={styles.heroContent}>
                <Text style={styles.heroTitleMain}>
                  {mockClanPage.emptyState.hero.title}
                </Text>
                <Text style={styles.heroDescMain}>
                  {mockClanPage.emptyState.hero.description}
                </Text>

                <TouchableOpacity
                  style={[styles.primaryButton, styles.shadowSoft]}
                  onPress={() => setSheetMode('create')}
                  activeOpacity={0.86}
                >
                  <Text style={styles.primaryButtonText}>
                    {mockClanPage.emptyState.hero.cta}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Discover Section */}
            <View style={styles.discoverSection}>
              <View style={styles.miniAvatars}>
                <View
                  style={[styles.miniAvatar, { backgroundColor: '#3B82F6' }]}
                >
                  <Text style={styles.miniAvatarText}>🛡️</Text>
                </View>
                <View
                  style={[
                    styles.miniAvatar,
                    { backgroundColor: '#F59E0B', marginLeft: -12 },
                  ]}
                >
                  <Text style={styles.miniAvatarText}>⚔️</Text>
                </View>
                <View
                  style={[
                    styles.miniAvatar,
                    { backgroundColor: '#8B5CF6', marginLeft: -12 },
                  ]}
                >
                  <Text style={styles.miniAvatarText}>🪄</Text>
                </View>
              </View>

              <Text style={styles.discoverTitle}>
                {mockClanPage.emptyState.discover.title}
              </Text>
              <Text style={styles.discoverDesc}>
                {mockClanPage.emptyState.discover.description}
              </Text>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setSheetMode('join')}
                activeOpacity={0.86}
              >
                <Text style={styles.secondaryButtonText}>
                  {mockClanPage.emptyState.discover.cta}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Explore Section */}
            <View style={styles.exploreSection}>
              <View style={styles.exploreHeader}>
                <Text style={styles.exploreTitle}>Popüler Klanlar</Text>
                <Text style={styles.exploreNotice}>
                  Sadece iki kişi ve üzerindeki klanlar görüntüleniyor
                </Text>
              </View>
              <View style={styles.exploreListContainer}>
                <View style={styles.exploreList}>
                  {mockClanPage.emptyState.exploreClans.map((clan, idx) => (
                    <ClanRow key={clan.id} clan={clan} rank={idx + 1} />
                  ))}
                </View>

                {/* Void Gradient Effect */}
                <View style={styles.voidOverlay}>
                  <View
                    style={[
                      styles.voidStep,
                      { opacity: 0.1, height: 40, bottom: 120 },
                    ]}
                  />
                  <View
                    style={[
                      styles.voidStep,
                      { opacity: 0.3, height: 40, bottom: 80 },
                    ]}
                  />
                  <View
                    style={[
                      styles.voidStep,
                      { opacity: 0.6, height: 40, bottom: 40 },
                    ]}
                  />
                  <View
                    style={[
                      styles.voidStep,
                      { opacity: 1.0, height: 40, bottom: 0 },
                    ]}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewAllButton}
                activeOpacity={0.8}
              >
                <View style={styles.viewAllContent}>
                  <Text style={styles.viewAllText}>Tüm Klanları Gör</Text>
                  <Text style={styles.viewAllIcon}>→</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.spacer} />
          </ScrollView>
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
                  <TouchableOpacity
                    style={styles.settingsButton}
                    activeOpacity={0.84}
                  >
                    <Text style={styles.settingsText}>⚙</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.scoreLabel}>Günlük skor</Text>
                <Text style={styles.scoreValue}>{dashboard.dailyScore}</Text>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Haftalık hedef</Text>
                  <Text style={styles.progressValue}>
                    {dashboard.weeklyCurrent} / {dashboard.weeklyTarget}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressPercent}>
                  %{Math.round(progress * 100)} ilerleme
                </Text>
              </View>

              <SectionCard title="Üyeler">
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
                <Text style={styles.pressureTitle}>
                  {dashboard.pressureTitle}
                </Text>
                <Text style={styles.pressureSubtitle}>
                  {dashboard.pressureSubtitle}
                </Text>
              </View>

              <SectionCard title="Aktivite">
                <View style={styles.listColumn}>
                  {dashboard.activity.map((item) => (
                    <ActivityRow key={item.id} item={item} />
                  ))}
                </View>
              </SectionCard>

              <SectionCard title="Lig / Sıralama">
                <View style={styles.listColumn}>
                  {dashboard.leaderboard.map((entry) => (
                    <LeaderboardRow key={entry.id} entry={entry} />
                  ))}
                </View>
              </SectionCard>
            </ScrollView>

            <View style={styles.stickyCtaWrap}>
              <TouchableOpacity
                style={[styles.primaryButton, styles.shadowSoft]}
                activeOpacity={0.86}
              >
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
            <TouchableOpacity
              style={styles.sheetBackdrop}
              activeOpacity={1}
              onPress={closeSheet}
            />
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              {sheetMode === 'create' ? (
                <>
                  <Text style={styles.sheetTitle}>Klan Oluştur</Text>
                  <Text style={styles.sheetSubtitle}>
                    Kendi ekibini kur ve birlikte hedeflere ulaş
                  </Text>

                  <LabeledInput
                    label="Klan Adı"
                    value={clanName}
                    onChangeText={setClanName}
                    placeholder=""
                  />
                  <LabeledInput
                    label="Açıklama"
                    value={description}
                    onChangeText={setDescription}
                    placeholder=""
                    multiline
                  />

                  <Text style={styles.fieldLabel}>Erişim Modu</Text>
                  <View style={styles.privacyStack}>
                    <PrivacyCard
                      title="Açık Katılım"
                      subtitle="Dileyen herkes ekibe katılabilir"
                      active={privacy === 'open'}
                      onPress={() => setPrivacy('open')}
                    />
                    <PrivacyCard
                      title="Özel Davet"
                      subtitle="Üyeler yalnızca onay ile girebilir"
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
                    <Text style={styles.primaryButtonText}>Oluştur</Text>
                  </TouchableOpacity>

                  <View style={styles.sheetNotes}>
                    <Text style={styles.sheetNote}>
                      Klan kurmak sorumluluk gerektirir
                    </Text>
                    <Text style={styles.sheetNote}>
                      Aktif kalmazsan klanın geriler
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.sheetTitle}>Klana Katıl</Text>
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
                    <Text style={styles.primaryButtonText}>Katıl</Text>
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

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
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

const ClanRow = ({ clan, rank }: { clan: any; rank: number }) => (
  <View style={styles.leaderboardRow}>
    <View style={styles.leaderboardLeft}>
      <Text style={styles.rankText}>#{rank}</Text>
      <View style={styles.clanIconWrap}>
        <Text style={styles.clanIcon}>{clan.icon}</Text>
      </View>
      <View>
        <Text style={styles.leaderboardName}>{clan.name}</Text>
        <Text style={styles.clanMeta}>{clan.members} Üye</Text>
      </View>
    </View>
    <Text style={styles.leaderboardScore}>{clan.score}</Text>
  </View>
);

const LeaderboardRow = ({ entry }: { entry: ClanLeaderboardEntry }) => (
  <View
    style={[
      styles.leaderboardRow,
      entry.isCurrentClan && styles.leaderboardRowActive,
    ]}
  >
    <View style={styles.leaderboardLeft}>
      <Text
        style={[styles.rankText, entry.isCurrentClan && styles.rankTextActive]}
      >
        #{entry.rank}
      </Text>
      <Text
        style={[
          styles.leaderboardName,
          entry.isCurrentClan && styles.leaderboardNameActive,
        ]}
      >
        {entry.name}
      </Text>
    </View>
    <Text
      style={[
        styles.leaderboardScore,
        entry.isCurrentClan && styles.leaderboardScoreActive,
      ]}
    >
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
    <Text style={[styles.privacyTitle, active && styles.privacyTitleActive]}>
      {title}
    </Text>
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
  emptyScroll: {
    flex: 1,
  },
  emptyScrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: spacing.xxl,
  },
  heroImageContainer: {
    width: '100%',
    height: 380,
    backgroundColor: d.surfaceElevated,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    // Note: React Native doesn't support linear-gradient natively
    // without a library, so we use a solid background fade or multiple views.
    // Assuming background color is dark.
    backgroundColor: d.background,
    opacity: 0.9,
    transform: [{ translateY: 60 }], // Soften the edge
  },
  heroContent: {
    paddingHorizontal: spacing.lg,
    marginTop: -40, // Pull content up over the image fade
  },
  heroTitleMain: {
    color: d.text,
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -1,
    lineHeight: 40,
  },
  heroDescMain: {
    color: d.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  discoverSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
    backgroundColor: d.surface,
    borderRadius: 32,
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: d.cardBorder,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  miniAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  miniAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: d.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontSize: 18,
  },
  discoverTitle: {
    color: d.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: -0.4,
  },
  discoverDesc: {
    color: d.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  spacer: {
    height: 100,
  },
  exploreSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  exploreHeader: {
    marginBottom: spacing.md,
  },
  exploreTitle: {
    color: d.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  exploreNotice: {
    color: d.textMuted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  exploreListContainer: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: d.surface,
    borderWidth: 1,
    borderColor: d.cardBorder,
  },
  exploreList: {
    gap: 0,
    paddingBottom: 40,
  },
  clanIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  clanIcon: {
    fontSize: 16,
  },
  clanMeta: {
    color: d.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  voidOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    pointerEvents: 'none',
  },
  voidStep: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: d.background,
  },
  viewAllButton: {
    marginTop: spacing.md,
    alignSelf: 'center',
  },
  viewAllContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  viewAllText: {
    color: accent,
    fontSize: 16,
    fontWeight: '700',
  },
  viewAllIcon: {
    color: accent,
    fontSize: 18,
    fontWeight: '700',
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
