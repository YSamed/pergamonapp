import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { colors, spacing, radius } from '../../theme';

const d = colors.dark;

type Props = {
  visible: boolean;
  categoryName: string;
  onCancel: () => void;
  onDelete: () => void;
};

export const DeleteCategoryDialog = ({ visible, categoryName, onCancel, onDelete }: Props) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <View style={styles.dialog}>
        <Text style={styles.title}>Delete category</Text>
        <Text style={styles.body}>
          Are you sure you want to delete the category "{categoryName}"? This action cannot be undone.
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onCancel} style={styles.actionBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  dialog: {
    width: '100%',
    backgroundColor: d.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  title: {
    color: d.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  body: {
    color: d.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.lg,
  },
  actionBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  cancelText: {
    color: d.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  deleteText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '600',
  },
});
