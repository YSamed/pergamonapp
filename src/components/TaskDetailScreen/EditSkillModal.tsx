import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors, spacing, radius } from '../../theme';

const d = colors;
const NAME_LIMIT = 32;

export type EditSkillValues = {
  label: string;
  description: string;
  level: number;
};

export type EditSkillModalProps = {
  visible: boolean;
  icon: string;
  initialValues: EditSkillValues;
  onClose: () => void;
  onSave: (values: EditSkillValues) => void;
};

export const EditSkillModal = ({
  visible,
  icon,
  initialValues,
  onClose,
  onSave,
}: EditSkillModalProps) => {
  const [label, setLabel] = useState(initialValues.label);
  const [description, setDescription] = useState(initialValues.description);
  const [level, setLevel] = useState(String(initialValues.level));
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Sync when modal reopens with new initialValues
  useEffect(() => {
    if (visible) {
      setLabel(initialValues.label);
      setDescription(initialValues.description);
      setLevel(String(initialValues.level));
      setAdvancedOpen(false);
    }
  }, [visible]);

  const handleSave = () => {
    onSave({
      label: label.trim(),
      description: description.trim(),
      level: Math.max(1, parseInt(level, 10) || 1),
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>Edit skill</Text>

          {/* Icon preview */}
          <View style={styles.iconWrap}>
            <Text style={styles.iconEmoji}>{icon}</Text>
          </View>

          <ScrollView
            style={styles.form}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Name field */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={label}
                onChangeText={(t) => setLabel(t.slice(0, NAME_LIMIT))}
                placeholderTextColor={d.textMuted}
                selectionColor={d.primary}
              />
              <Text style={styles.charCount}>{label.length}/{NAME_LIMIT}</Text>
            </View>

            {/* Description field */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                placeholderTextColor={d.textMuted}
                selectionColor={d.primary}
                textAlignVertical="top"
              />
            </View>

            {/* Advanced toggle */}
            <TouchableOpacity
              style={styles.advancedToggle}
              onPress={() => setAdvancedOpen((p) => !p)}
              activeOpacity={0.7}
            >
              <Text style={styles.advancedIcon}>{advancedOpen ? '∧' : '∨'}</Text>
              <Text style={styles.advancedText}>Advanced</Text>
            </TouchableOpacity>

            {/* Advanced: Level */}
            {advancedOpen && (
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Level</Text>
                <TextInput
                  style={styles.input}
                  value={level}
                  onChangeText={(t) => setLevel(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  placeholderTextColor={d.textMuted}
                  selectionColor={d.primary}
                />
                <Text style={styles.hint}>Solo modificar si es necesario</Text>
              </View>
            )}
          </ScrollView>

          {/* Save button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: d.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: d.border,
    marginBottom: spacing.md,
  },
  title: {
    color: d.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: d.surfaceElevated,
    borderWidth: 2,
    borderColor: d.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconEmoji: { fontSize: 40 },
  form: { flexGrow: 0 },
  formContent: { gap: spacing.md, paddingBottom: spacing.md },
  fieldWrap: { gap: spacing.xs },
  fieldLabel: {
    color: d.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: d.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: d.text,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.sm,
  },
  charCount: {
    color: d.textMuted,
    fontSize: 11,
    textAlign: 'right',
    marginRight: spacing.xs,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  advancedIcon: {
    color: d.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  advancedText: {
    color: d.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    color: d.textMuted,
    fontSize: 12,
    marginLeft: spacing.xs,
  },
  saveBtn: {
    marginTop: spacing.md,
    backgroundColor: d.text,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveBtnText: {
    color: d.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
