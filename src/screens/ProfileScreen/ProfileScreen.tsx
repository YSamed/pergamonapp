import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {
  League,
  RootStackParamList,
  User,
  UserLeagueState,
  UserProgress,
} from '../../types';
import { colors, radius, spacing } from '../../theme';
import { profileService } from '../../services/profile.service';
import { progressService } from '../../services/progress.service';
import { clanService } from '../../services/clan.service';
import { leagueService } from '../../services/league.service';
import { COHORT_SIZE } from '../../modules/league';
import {
  AchievementsStrip,
  LeagueSummaryCard,
  LevelHeroCard,
  SkillBarsCard,
  WeeklyXPChart,
} from '../../components/Profile';

const d = colors;
const avatarImage = require('../../assets/icons/iconn.png');

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
  const navigation = useNavigation<Nav>();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [clanName, setClanName] = useState<string | null>(null);
  const [leagueState, setLeagueState] = useState<UserLeagueState | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [reminderSounds, setReminderSounds] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const load = useCallback(async () => {
    const [u, p, ls, lg] = await Promise.all([
      profileService.getProfile(),
      progressService.getUserProgress(),
      leagueService.getUserState().catch(() => null),
      leagueService.getCurrentLeague().catch(() => null),
    ]);
    setUser(u);
    setProgress(p);
    setLeagueState(ls);
    setLeague(lg);
    if (u.clanId) {
      const overview = await clanService.getClanOverview(u.clanId);
      setClanName(overview.clan.name);
    } else {
      setClanName(null);
    }
  }, []);

  useEffect(() => {
    void load();
    const unsub = navigation.addListener('focus', () => void load());
    return unsub;
  }, [navigation, load]);

  if (!user || !progress) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.safeArea} edges={['top']} />
      </View>
    );
  }

  const unlockedCount = progress.achievements.filter((a) => !!a.unlockedAt).length;

  const openEdit = () => {
    setDraftName(user.displayName);
    setEditing(true);
  };

  const saveEdit = async () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setEditing(false);
      return;
    }
    const updated = await profileService.updateProfile({ displayName: trimmed });
    setUser(updated);
    setEditing(false);
  };

  const goToLeagueTab = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('League' as never);
    } else {
      (navigation as unknown as {
        navigate: (n: string, p?: unknown) => void;
      }).navigate('Main', { screen: 'League' });
    }
  };

  const myLeagueRank =
    league && leagueState
      ? league.participants.find((p) => p.userId === leagueState.userId)?.rank ?? 0
      : 0;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Profil</Text>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={openEdit}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={20} color={d.text} />
            </TouchableOpacity>
          </View>

          {/* Section 1: Identity */}
          <View style={styles.identityCard}>
            <View style={styles.avatarBig}>
              <Image source={avatarImage} style={styles.avatarBigImage} resizeMode="contain" />
              <View style={styles.avatarLevelChip}>
                <Text style={styles.avatarLevelChipText}>Lv {user.level}</Text>
              </View>
            </View>
            <Text style={styles.identityName}>{user.displayName}</Text>
            <Text style={styles.identityHandle}>@{user.username}</Text>
            {clanName && (
              <View style={styles.clanChip}>
                <Text style={styles.clanChipIcon}>🛡️</Text>
                <Text style={styles.clanChipText}>{clanName}</Text>
              </View>
            )}
          </View>

          {/* Section 2: League summary */}
          {leagueState && league ? (
            <LeagueSummaryCard
              tier={leagueState.currentTier}
              rank={myLeagueRank}
              weeklyXP={leagueState.weeklyXP}
              cohortSize={COHORT_SIZE}
              endsAt={league.endsAt}
              onPress={goToLeagueTab}
            />
          ) : null}

          {/* Section 3: Stat grid */}
          <View style={styles.statGrid}>
            <StatTile
              label="Toplam XP"
              value={progress.user.totalXP.toLocaleString('tr-TR')}
              accent={d.xp}
            />
            <StatTile
              label="Seviye"
              value={`${progress.user.level}`}
              accent={d.primary}
            />
            <StatTile
              label="Aktif seri"
              value={`${progress.streak.currentStreak} gün`}
              accent={d.streak}
            />
            <StatTile
              label="Başarımlar"
              value={`${unlockedCount}/${progress.achievements.length}`}
              accent={d.accent}
            />
          </View>

          {/* Section 4: Level hero */}
          <LevelHeroCard progress={progress} />

          {/* Section 5: Weekly XP chart */}
          <WeeklyXPChart events={progress.recentXPEvents} />

          {/* Section 6: Skill bars (top 6) */}
          <SkillBarsCard
            skills={progress.skills}
            limit={6}
            onSkillPress={(id) =>
              navigation.navigate('SkillDetail', { skillId: id })
            }
            onSeeAll={() => navigation.navigate('Skills')}
          />

          {/* Section 7: Achievements strip */}
          <AchievementsStrip
            achievements={progress.achievements}
            limit={5}
            onSeeAll={() =>
              (navigation as unknown as { navigate: (n: string) => void }).navigate(
                'Achievements',
              )
            }
          />

          {/* Section 9: Preferences */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tercihler</Text>
            <ToggleRow
              label="Bildirimler"
              icon="notifications-outline"
              value={notifications}
              onChange={setNotifications}
            />
            <ToggleRow
              label="Hatırlatıcı sesi"
              icon="volume-medium-outline"
              value={reminderSounds}
              onChange={setReminderSounds}
            />
            <ToggleRow
              label="Karanlık tema"
              icon="moon-outline"
              value={darkMode}
              onChange={setDarkMode}
            />
          </View>

          {/* Section 10: Account links */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hesap</Text>
            <LinkRow
              icon="people-outline"
              label="Topluluk"
              onPress={() => navigation.navigate('Community')}
            />
            <LinkRow
              icon="information-circle-outline"
              label="Hakkında & Yardım"
              onPress={() => undefined}
            />
            <LinkRow icon="mail-outline" label={user.email} onPress={openEdit} />
            <LinkRow
              icon="log-out-outline"
              label="Çıkış yap"
              danger
              onPress={() => undefined}
            />
          </View>

          <View style={styles.bottomPad} />
        </ScrollView>

        <Modal
          transparent
          visible={editing}
          animationType="fade"
          onRequestClose={() => setEditing(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Profili düzenle</Text>
              <Text style={styles.modalLabel}>Görünen ad</Text>
              <TextInput
                value={draftName}
                onChangeText={setDraftName}
                style={styles.modalInput}
                placeholder="Adın"
                placeholderTextColor={d.textMuted}
                autoFocus
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnGhost]}
                  onPress={() => setEditing(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalBtnGhostText}>Vazgeç</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnPrimary]}
                  onPress={saveEdit}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalBtnPrimaryText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const StatTile = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) => (
  <View style={[styles.statTile, { borderColor: `${accent}30` }]}>
    <Text style={styles.statTileLabel}>{label}</Text>
    <Text style={[styles.statTileValue, { color: accent }]}>{value}</Text>
  </View>
);

const ToggleRow = ({
  icon,
  label,
  value,
  onChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <View style={styles.linkRow}>
    <View style={styles.linkRowLeft}>
      <View style={styles.linkIconWrap}>
        <Ionicons name={icon} size={18} color={d.text} />
      </View>
      <Text style={styles.linkLabel}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: d.surfaceElevated, true: d.primary }}
      thumbColor="#fff"
    />
  </View>
);

const LinkRow = ({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) => (
  <TouchableOpacity
    style={styles.linkRow}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.linkRowLeft}>
      <View
        style={[
          styles.linkIconWrap,
          danger && { backgroundColor: 'rgba(255,107,107,0.16)' },
        ]}
      >
        <Ionicons name={icon} size={18} color={danger ? d.error : d.text} />
      </View>
      <Text style={[styles.linkLabel, danger && { color: d.error }]}>
        {label}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={d.textMuted} />
  </TouchableOpacity>
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

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: d.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: d.surface,
    borderWidth: 1,
    borderColor: d.border,
  },

  identityCard: {
    backgroundColor: d.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: d.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  avatarBig: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: '#B9AAEA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatarBigImage: {
    width: 78,
    height: 78,
  },
  avatarLevelChip: {
    position: 'absolute',
    bottom: -4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: d.surfaceElevated,
    borderWidth: 1.5,
    borderColor: d.background,
  },
  avatarLevelChipText: {
    color: d.text,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  identityName: {
    color: d.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  identityHandle: {
    color: d.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  clanChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(139,92,246,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  clanChipIcon: { fontSize: 14 },
  clanChipText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '800',
  },

  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statTile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: d.surface,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  statTileLabel: {
    color: d.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statTileValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  card: {
    backgroundColor: d.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: d.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    color: d.text,
    fontSize: 17,
    fontWeight: '700',
  },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  linkRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  linkIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: d.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: {
    color: d.text,
    fontSize: 14,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: d.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: d.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: {
    color: d.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  modalLabel: {
    color: d.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  modalInput: {
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: d.surfaceElevated,
    borderWidth: 1,
    borderColor: d.border,
    paddingHorizontal: spacing.md,
    color: d.text,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnGhost: {
    backgroundColor: d.surfaceElevated,
    borderWidth: 1,
    borderColor: d.border,
  },
  modalBtnGhostText: {
    color: d.text,
    fontSize: 14,
    fontWeight: '700',
  },
  modalBtnPrimary: {
    backgroundColor: d.primary,
  },
  modalBtnPrimaryText: {
    color: d.background,
    fontSize: 14,
    fontWeight: '800',
  },

  bottomPad: { height: 110 },
});
