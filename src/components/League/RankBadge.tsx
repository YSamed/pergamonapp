import { StyleSheet, Text, View } from 'react-native';
import type { LeagueTier } from '../../types';
import { TIER_COLOR, TIER_LABEL } from '../../modules/league';

type Size = 'sm' | 'md' | 'lg';

type Props = {
  tier: LeagueTier;
  size?: Size;
};

const SIZE_MAP: Record<Size, { box: number; font: number; border: number }> = {
  sm: { box: 28, font: 11, border: 1 },
  md: { box: 44, font: 13, border: 2 },
  lg: { box: 72, font: 18, border: 2 },
};

const initialFor = (label: string) => label.slice(0, 2).toUpperCase();

export const RankBadge = ({ tier, size = 'md' }: Props) => {
  const dim = SIZE_MAP[size];
  const color = TIER_COLOR[tier];
  const label = TIER_LABEL[tier];
  const text = size === 'lg' ? label : initialFor(label);

  return (
    <View
      style={[
        styles.badge,
        {
          width: dim.box,
          height: dim.box,
          borderRadius: dim.box / 2,
          borderWidth: dim.border,
          borderColor: color,
          backgroundColor: `${color}22`,
          shadowColor: color,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color,
            fontSize: dim.font,
          },
        ]}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
