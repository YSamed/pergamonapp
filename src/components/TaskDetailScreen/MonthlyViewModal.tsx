import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { colors, spacing, radius } from '../../theme';

const MONTH_DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Intensity levels: 0=empty, 1=light, 2=medium, 3=dark, 4=full
const INTENSITY_COLORS = ['#1E1E26', '#1A4040', '#1B6B6B', '#19A0A0', '#00CFCF'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getMonthGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // shift to Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

export type MonthlyViewModalProps = {
  visible: boolean;
  monthOffset: number;
  onMonthChange: (offset: number) => void;
  onClose: () => void;
  /** Array of date strings (Date.toDateString()) that were completed */
  completedDates: string[];
};

export const MonthlyViewModal = ({
  visible,
  monthOffset,
  onMonthChange,
  onClose,
  completedDates,
}: MonthlyViewModalProps) => {
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const grid = getMonthGrid(year, month);
  const today = new Date();
  const isCurrentMonth = monthOffset === 0;
  const completedSet = new Set(completedDates);

  const getCellIntensity = (day: number | null): number => {
    if (!day) return -1;
    const dateStr = new Date(year, month, day).toDateString();
    return completedSet.has(dateStr) ? 4 : 0;
  };

  const isToday = (day: number | null) =>
    !!day &&
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Monthly View</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.monthNav}>
            <TouchableOpacity
              style={styles.monthNavBtn}
              onPress={() => onMonthChange(monthOffset - 1)}
            >
              <Text style={styles.monthNavArrow}>{'<'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.currentMonthBtn}
              onPress={() => onMonthChange(0)}
            >
              <Text style={styles.currentMonthText}>
                {isCurrentMonth ? 'Current Month' : `${MONTH_NAMES[month]} ${year}`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.monthNavBtn}
              onPress={() => onMonthChange(monthOffset + 1)}
            >
              <Text style={styles.monthNavArrow}>{'>'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dayLabelsRow}>
            {MONTH_DAY_LABELS.map((label, i) => (
              <Text key={i} style={styles.dayLabelText}>{label}</Text>
            ))}
          </View>

          <View style={styles.calGrid}>
            {grid.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.calRow}>
                {row.map((day, colIdx) => {
                  const intensity = getCellIntensity(day);
                  const todayCell = isToday(day);
                  return (
                    <View
                      key={colIdx}
                      style={[
                        styles.calCell,
                        day !== null
                          ? { backgroundColor: INTENSITY_COLORS[intensity] }
                          : styles.calCellEmpty,
                        todayCell && styles.calCellToday,
                      ]}
                    >
                      {day !== null && (
                        <Text
                          style={[
                            styles.calCellText,
                            todayCell && styles.calCellTextToday,
                          ]}
                        >
                          {day}
                        </Text>
                      )}
                      {intensity === 4 && day !== null && (
                        <View style={styles.completionDot} />
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={styles.legend}>
            <Text style={styles.legendLabel}>Less</Text>
            {INTENSITY_COLORS.map((color, i) => (
              <View key={i} style={[styles.legendDot, { backgroundColor: color }]} />
            ))}
            <Text style={styles.legendLabel}>More</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 48 - 6 * 6) / 7);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: colors.dark.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dark.border,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.dark.text,
    fontSize: 22,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: colors.dark.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavArrow: {
    color: colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
  },
  currentMonthBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.dark.primary,
  },
  currentMonthText: {
    color: colors.dark.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  dayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  dayLabelText: {
    width: CELL_SIZE,
    textAlign: 'center',
    color: colors.dark.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  calGrid: {
    gap: 6,
  },
  calRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calCellEmpty: {
    backgroundColor: 'transparent',
  },
  calCellToday: {
    borderWidth: 1.5,
    borderColor: colors.dark.primary,
  },
  calCellText: {
    color: colors.dark.text,
    fontSize: 13,
    fontWeight: '500',
  },
  calCellTextToday: {
    color: colors.dark.primary,
    fontWeight: '700',
  },
  completionDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  legendLabel: {
    color: colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: radius.sm,
  },
});
