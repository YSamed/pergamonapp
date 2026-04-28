import { StyleSheet, Text, View } from 'react-native';
import type { UserProgress } from '../../types';
import { colors, radius, spacing } from '../../theme';
import {
  levelProgress as calcLevelProgress,
  xpRequiredForLevel,
  xpToNextLevel,
} from '../../modules/level';

const d = colors;

type Props = {
  progress: UserProgress;
};

export const LevelHeroCard = ({ progress }: Props) => {
  const lvl = progress.user.level;
  const lvlProgress = calcLevelProgress(progress.user.totalXP);
  const xpRemaining = xpToNextLevel(progress.user.totalXP);
  const currentLevelXP = xpRequiredForLevel(lvl);
  const nextLevelXP = xpRequiredForLevel(lvl + 1);

  return (
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
  );
};

const styles = StyleSheet.create({
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
});
