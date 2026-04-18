import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, radius } from '../../theme';

const d = colors;

type Props = {
  visible: boolean;
  initialValue?: string;
  onCancel: () => void;
  onCreate: (name: string) => void;
};

export const NewCategoryDialog = ({ visible, initialValue, onCancel, onCreate }: Props) => {
  const [name, setName] = useState(initialValue ?? '');

  useEffect(() => {
    if (visible) setName(initialValue ?? '');
  }, [visible, initialValue]);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName('');
  };

  const handleCancel = () => {
    setName('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.dialog}>
          <Text style={styles.title}>{initialValue ? 'Edit category' : 'New category'}</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoFocus
            selectionColor={d.primary}
            cursorColor={d.primary}
            placeholderTextColor={d.textMuted}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleCancel} style={styles.actionBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreate}
              style={styles.actionBtn}
              disabled={!name.trim()}
            >
              <Text style={[styles.createText, !name.trim() && styles.disabledText]}>
                Create
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

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
    marginBottom: spacing.lg,
  },
  label: {
    color: d.primary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: d.primary,
    color: d.text,
    fontSize: 16,
    paddingVertical: spacing.xs,
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
  createText: {
    color: d.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.4,
  },
});
