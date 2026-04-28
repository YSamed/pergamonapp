import { StyleSheet, Text, View } from 'react-native';
import type { XPEvent } from '../../types';
import { colors, radius, spacing } from '../../theme';

const d = colors;

const DAY_LABELS_TR = ['Pa', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export const buildWeeklyXP = (events: XPEvent[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets: { label: string; xp: number; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    buckets.push({
      label: DAY_LABELS_TR[day.getDay()],
      xp: 0,
      isToday: i === 0,
    });
  }

  const lookup = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    lookup.set(dayKey(day), 6 - i);
  }

  events.forEach((event) => {
    const created = new Date(event.createdAt);
    created.setHours(0, 0, 0, 0);
    const idx = lookup.get(dayKey(created));
    if (idx !== undefined) {
      buckets[idx].xp += event.xpAmount;
    }
  });

  return buckets;
};

type Props = {
  events: XPEvent[];
};

export const WeeklyXPChart = ({ events }: Props) => {
  const weeklyXP = buildWeeklyXP(events);
  const weeklyMax = Math.max(...weeklyXP.map((b) => b.xp), 1);
  const weeklyTotal = weeklyXP.reduce((sum, b) => sum + b.xp, 0);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Haftalık XP</Text>
        <Text style={styles.cardMeta}>{weeklyTotal} XP</Text>
      </View>
      <View style={styles.chartRow}>
        {weeklyXP.map((bucket, idx) => {
          const fill = (bucket.xp / weeklyMax) * 100;
          return (
            <View key={idx} style={styles.chartCol}>
              <View style={styles.chartBarTrack}>
                <View
                  style={[
                    styles.chartBarFill,
                    {
                      height: `${Math.max(4, fill)}%`,
                      backgroundColor: bucket.isToday
                        ? d.primary
                        : 'rgba(78,216,199,0.45)',
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.chartLabel,
                  bucket.isToday && styles.chartLabelToday,
                ]}
              >
                {bucket.label}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.chartHint}>
        Son 7 günün XP kazanımı (bugün vurgulu)
      </Text>
    </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: d.text,
    fontSize: 17,
    fontWeight: '700',
  },
  cardMeta: {
    color: d.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: spacing.xs,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  chartBarTrack: {
    width: '100%',
    flex: 1,
    backgroundColor: d.surfaceElevated,
    borderRadius: radius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: radius.sm,
  },
  chartLabel: {
    color: d.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  chartLabelToday: {
    color: d.primary,
  },
  chartHint: {
    color: d.textMuted,
    fontSize: 12,
  },
});
