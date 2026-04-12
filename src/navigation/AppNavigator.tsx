import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

/**
 * Navigation shell — Tab ve Stack navigator'lar
 * Faz 2'de tam olarak kurulacak.
 */
export const AppNavigator = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PergamonApp</Text>
      <Text style={styles.subtitle}>Navigation kurulumu yakında 🚀</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
