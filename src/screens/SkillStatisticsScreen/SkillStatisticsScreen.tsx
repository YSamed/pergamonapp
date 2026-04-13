import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { skillsService, type SkillStatistics } from '../../services/skills.service';
import { colors, spacing, radius } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SkillStatistics'>;
type Period = 'week' | 'month' | 'allTime';

const d = colors.dark;
const CHART_SIZE = 260;
const CENTER = CHART_SIZE / 2;
const MAX_RADIUS = 90;
const LEVELS = 5;

// ── Radar Chart ──────────────────────────────────────────────────────────────

function radarPoints(values: number[], maxVal: number, cx: number, cy: number, r: number) {
  const n = values.length;
  return values.map((v, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const ratio = maxVal > 0 ? Math.min(v / maxVal, 1) : 0;
    return {
      x: cx + r * ratio * Math.cos(angle),
      y: cy + r * ratio * Math.sin(angle),
    };
  });
}

function toPolygonPoints(pts: { x: number; y: number }[]) {
  return pts.map((p) => `${p.x},${p.y}`).join(' ');
}

const RadarChart = ({ stats }: { stats: SkillStatistics }) => {
  const { skillStats } = stats;
  if (skillStats.length === 0) return null;

  const n = skillStats.length;
  const maxXP = Math.max(...skillStats.map((s) => s.xpInPeriod), 1);

  const dataPoints = radarPoints(
    skillStats.map((s) => s.xpInPeriod),
    maxXP,
    CENTER,
    CENTER,
    MAX_RADIUS,
  );

  // Grid rings
  const gridPolygons = Array.from({ length: LEVELS }, (_, lvl) => {
    const pts = radarPoints(
      Array(n).fill((lvl + 1) / LEVELS),
      1,
      CENTER,
      CENTER,
      MAX_RADIUS,
    );
    return toPolygonPoints(pts);
  });

  // Axis lines (center → vertex)
  const axisLines = Array.from({ length: n }, (_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x2: CENTER + MAX_RADIUS * Math.cos(angle),
      y2: CENTER + MAX_RADIUS * Math.sin(angle),
    };
  });

  // Labels
  const labelOffset = 22;
  const labels = skillStats.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const lx = CENTER + (MAX_RADIUS + labelOffset) * Math.cos(angle);
    const ly = CENTER + (MAX_RADIUS + labelOffset) * Math.sin(angle);
    return { label: s.skill.label.toUpperCase(), xp: s.xpInPeriod, lx, ly };
  });

  // Ring value labels (right side of outermost ring)
  const ringLabels = Array.from({ length: LEVELS }, (_, lvl) => {
    const ratio = (lvl + 1) / LEVELS;
    const value = Math.round(maxXP * ratio);
    return { value, y: CENTER - MAX_RADIUS * ratio };
  });

  return (
    <View style={chartStyles.container}>
      <Svg width={CHART_SIZE} height={CHART_SIZE}>
        {/* Grid polygons */}
        {gridPolygons.map((pts, i) => (
          <Polygon
            key={i}
            points={pts}
            fill="none"
            stroke={d.border}
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((l, i) => (
          <Line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={l.x2}
            y2={l.y2}
            stroke={d.border}
            strokeWidth={1}
          />
        ))}

        {/* Ring value labels */}
        {ringLabels.map((rl, i) => (
          <SvgText
            key={i}
            x={CENTER + 4}
            y={rl.y - 2}
            fontSize={9}
            fill={d.textMuted}
            textAnchor="start"
          >
            {rl.value}
          </SvgText>
        ))}

        {/* Data polygon */}
        <Polygon
          points={toPolygonPoints(dataPoints)}
          fill={`${d.primary}30`}
          stroke={d.text}
          strokeWidth={2}
        />

        {/* Data points */}
        {dataPoints.map((pt, i) => (
          <Circle key={i} cx={pt.x} cy={pt.y} r={4} fill={d.text} />
        ))}

        {/* Axis labels */}
        {labels.map((lb, i) => (
          <SvgText
            key={i}
            x={lb.lx}
            y={lb.ly - 6}
            fontSize={9}
            fill={d.textSecondary}
            textAnchor="middle"
          >
            {lb.label}
          </SvgText>
        ))}
        {labels.map((lb, i) => (
          <SvgText
            key={`xp-${i}`}
            x={lb.lx}
            y={lb.ly + 6}
            fontSize={9}
            fill={d.textSecondary}
            textAnchor="middle"
          >
            {`+${lb.xp} XP`}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
};

const chartStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: d.border,
    paddingVertical: spacing.md,
  },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'allTime', label: 'All Time' },
];

const METRIC_ICONS: Record<string, string> = {
  xp: '⚡',
  level: '📈',
  historical: '💪',
  success: '🎯',
};

export const SkillStatisticsScreen = ({ navigation }: Props) => {
  const [period, setPeriod] = useState<Period>('week');
  const [stats, setStats] = useState<SkillStatistics | null>(null);

  const load = useCallback(async () => {
    const data = await skillsService.getStatistics(period);
    setStats(data);
  }, [period]);

  useEffect(() => { void load(); }, [load]);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.headerIcon}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Skills Statistics</Text>
          <View style={styles.iconBtn} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Period tabs */}
          <View style={styles.tabRow}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[styles.tab, period === p.key && styles.tabActive]}
                onPress={() => setPeriod(p.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabText, period === p.key && styles.tabTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
            {/* Custom tab — locked */}
            <View style={[styles.tab, styles.tabLocked]}>
              <Text style={styles.tabLockIcon}>🔒</Text>
              <Text style={styles.tabTextLocked}>Custom</Text>
            </View>
          </View>

          {/* Radar Chart */}
          {stats && <RadarChart stats={stats} />}

          {/* Skills list */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Skills{' '}
              <Text style={styles.sectionCount}>
                ({stats?.skillStats.length ?? 0}/{stats?.skillStats.length ?? 0})
              </Text>
            </Text>
            {stats?.skillStats.map(({ skill, xpInPeriod }) => (
              <View key={skill.id} style={styles.skillRow}>
                <View style={styles.skillIconWrap}>
                  <Text style={styles.lockIcon}>🔒</Text>
                  <Text style={styles.skillEmoji}>{skill.icon}</Text>
                </View>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillLabel}>{skill.label}</Text>
                  <Text style={styles.skillMeta}>
                    {xpInPeriod} XP | Level {skill.level} | Streak {skill.currentStreak}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* General Metrics */}
          {stats && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>General Metrics</Text>
                <View style={styles.helpCircle}>
                  <Text style={styles.helpText}>?</Text>
                </View>
              </View>

              <MetricRow
                icon={METRIC_ICONS.xp}
                iconBg="#3D2F00"
                label="XP in Period"
                value={`${stats.totalXP} XP`}
                valueColor={d.xp}
              />
              <MetricRow
                icon={METRIC_ICONS.level}
                iconBg="#001A2E"
                label="Average Level"
                value={stats.avgLevel.toFixed(1)}
                valueColor="#4FC3F7"
              />
              <MetricRow
                icon={METRIC_ICONS.historical}
                iconBg="#2D0050"
                label="Total Historical XP"
                value={`${stats.totalHistoricalXP} XP`}
                valueColor="#CE93D8"
              />
              <MetricRow
                icon={METRIC_ICONS.success}
                iconBg="#002200"
                label="Success Rate"
                value={`${stats.successRate.toFixed(1)}%`}
                valueColor={colors.success}
              />
            </View>
          )}

          <View style={styles.bottomPad} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ── Metric Row ────────────────────────────────────────────────────────────────

const MetricRow = ({
  icon,
  iconBg,
  label,
  value,
  valueColor,
}: {
  icon: string;
  iconBg: string;
  label: string;
  value: string;
  valueColor: string;
}) => (
  <View style={metricStyles.row}>
    <View style={[metricStyles.iconWrap, { backgroundColor: iconBg }]}>
      <Text style={metricStyles.icon}>{icon}</Text>
    </View>
    <Text style={metricStyles.label}>{label}</Text>
    <Text style={[metricStyles.value, { color: valueColor }]}>{value}</Text>
  </View>
);

const metricStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: d.border,
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  label: { flex: 1, color: d.textSecondary, fontSize: 15 },
  value: { fontSize: 18, fontWeight: '700' },
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: d.background },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { color: d.text, fontSize: 20, fontWeight: '600' },
  headerTitle: {
    flex: 1,
    color: d.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: d.border,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  tabActive: { backgroundColor: d.text },
  tabLocked: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabText: { color: d.textSecondary, fontSize: 13, fontWeight: '500' },
  tabTextActive: { color: d.background, fontWeight: '700' },
  tabLockIcon: { fontSize: 11 },
  tabTextLocked: { color: d.textMuted, fontSize: 13 },

  section: { gap: spacing.sm },
  sectionTitle: { color: d.text, fontSize: 17, fontWeight: '700' },
  sectionCount: { color: d.textSecondary, fontWeight: '400' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  helpCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: d.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: { color: d.textSecondary, fontSize: 12, fontWeight: '600' },

  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.success + '55',
    gap: spacing.md,
  },
  skillIconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lockIcon: { fontSize: 10, position: 'absolute', top: 0, left: 0 },
  skillEmoji: { fontSize: 26 },
  skillInfo: { flex: 1 },
  skillLabel: { color: d.text, fontSize: 15, fontWeight: '700' },
  skillMeta: { color: d.textSecondary, fontSize: 13, marginTop: 2 },

  bottomPad: { height: 40 },
});
