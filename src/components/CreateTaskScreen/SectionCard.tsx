import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../theme';

const d = colors.dark;

type Props = {
  title?: string;
  children: React.ReactNode;
};

export const SectionCard = ({ title, children }: Props) => (
  <View style={styles.card}>
    {title ? <Text style={styles.title}>{title}</Text> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: d.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: d.cardBorder,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    color: d.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
});
