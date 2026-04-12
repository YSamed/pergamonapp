import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../theme';

const d = colors.dark;

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: string;
};

export const PillButton = ({ label, selected, onPress, icon }: Props) => (
  <TouchableOpacity
    style={[styles.pill, selected && styles.pillSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {icon ? <Text style={styles.icon}>{icon}</Text> : null}
    <Text style={[styles.label, selected && styles.labelSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: d.border,
    backgroundColor: 'transparent',
  },
  pillSelected: {
    backgroundColor: d.text,
    borderColor: d.text,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    color: d.text,
    fontSize: 14,
    fontWeight: '500',
  },
  labelSelected: {
    color: d.background,
    fontWeight: '600',
  },
});
