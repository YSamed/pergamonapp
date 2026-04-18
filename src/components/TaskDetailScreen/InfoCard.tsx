import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../theme';

const d = colors;

type Props = {
  children: React.ReactNode;
  style?: object;
};

export const InfoCard = ({ children, style }: Props) => (
  <View style={[styles.infoCard, style]}>{children}</View>
);

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: d.cardBorder,
    gap: spacing.xs,
  },
});
