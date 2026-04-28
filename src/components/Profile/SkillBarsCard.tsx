import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Skill } from '../../types';
import { colors, radius, spacing } from '../../theme';

const d = colors;
const XP_PER_SKILL_LEVEL = 100;

type Props = {
  skills: Skill[];
  limit?: number;
  onSkillPress: (skillId: string) => void;
  onSeeAll: () => void;
};

export const SkillBarsCard = ({
  skills,
  limit = 6,
  onSkillPress,
  onSeeAll,
}: Props) => {
  const sortedSkills = [...skills].sort((a, b) => b.xp - a.xp).slice(0, limit);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Yetenekler</Text>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.8}>
          <Text style={styles.linkText}>Tümünü gör →</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.skillList}>
        {sortedSkills.map((skill) => (
          <SkillBar
            key={skill.id}
            skill={skill}
            onPress={() => onSkillPress(skill.id)}
          />
        ))}
      </View>
    </View>
  );
};

const SkillBar = ({
  skill,
  onPress,
}: {
  skill: Skill;
  onPress: () => void;
}) => {
  const pct = (skill.xp % XP_PER_SKILL_LEVEL) / XP_PER_SKILL_LEVEL;
  return (
    <TouchableOpacity
      style={styles.skillRow}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.skillIcon}>{skill.icon}</Text>
      <View style={styles.skillBody}>
        <View style={styles.skillTopRow}>
          <Text style={styles.skillLabel}>{skill.label}</Text>
          <Text style={styles.skillLevel}>Lv {skill.level}</Text>
        </View>
        <View style={styles.skillTrack}>
          <View style={[styles.skillFill, { width: `${pct * 100}%` }]} />
        </View>
      </View>
      <Text style={styles.skillXP}>{skill.xp} XP</Text>
    </TouchableOpacity>
  );
};

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
  skillList: { gap: spacing.sm },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: d.surfaceElevated,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: d.border,
  },
  skillIcon: {
    fontSize: 22,
    width: 30,
    textAlign: 'center',
  },
  skillBody: { flex: 1, gap: 4 },
  skillTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skillLabel: {
    color: d.text,
    fontSize: 14,
    fontWeight: '700',
  },
  skillLevel: {
    color: d.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  skillTrack: {
    height: 6,
    backgroundColor: d.background,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    backgroundColor: d.primary,
    borderRadius: radius.full,
  },
  skillXP: {
    color: d.textMuted,
    fontSize: 11,
    fontWeight: '800',
    width: 56,
    textAlign: 'right',
  },
});
