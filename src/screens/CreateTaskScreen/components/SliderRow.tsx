import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing, radius } from '../../../theme';

const d = colors.dark;

type Props = {
  icon: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  onValueChange: (v: number) => void;
  /** Renk: negatif=kırmızı, sıfır=nötr, pozitif=yeşil */
  tintColor?: string;
};

export const SliderRow = ({
  icon,
  label,
  value,
  min = -5,
  max = 5,
  onValueChange,
}: Props) => {
  const badgeColor = value < 0 ? '#7B2020' : value > 0 ? '#1A5C3A' : '#3A3A28';
  const textColor = value < 0 ? '#EF4444' : value > 0 ? '#22C55E' : d.xp;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={[styles.badgeText, { color: textColor }]}>
            {value > 0 ? `+${value}` : value} ✏️
          </Text>
        </View>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor="#7B2020"
        maximumTrackTintColor="#1A5C3A"
        thumbTintColor="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    flex: 1,
    color: d.text,
    fontSize: 15,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.md,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 36,
  },
});
