import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../theme';

const d = colors;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export type Category = {
  id: string;
  name: string;
  taskCount: number;
};

type Props = {
  visible: boolean;
  categories: Category[];
  onClose: () => void;
  onAddPress: () => void;
  onEditPress: (cat: Category) => void;
  onDeletePress: (cat: Category) => void;
  onAddSkillPress: () => void;
};

export const CategoriesBottomSheet = ({
  visible,
  categories,
  onClose,
  onAddPress,
  onEditPress,
  onDeletePress,
  onAddSkillPress,
}: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Categories</Text>

        {categories.map((cat) => (
          <View key={cat.id} style={styles.categoryRow}>
            <Text style={styles.dragDots}>⠿</Text>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <Text style={styles.categoryCount}>{cat.taskCount} tasks</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn} onPress={() => onEditPress(cat)}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, styles.deleteBtn]}
              onPress={() => onDeletePress(cat)}
            >
              <Text style={styles.deleteIcon}>🗑</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addRow} onPress={onAddPress} activeOpacity={0.7}>
          <Text style={styles.addIcon}>+</Text>
          <Text style={styles.addText}>Add new category</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addSkillBtn} activeOpacity={0.85} onPress={onAddSkillPress}>
          <Text style={styles.addSkillText}>+ Add Skill</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: d.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: d.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: d.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: d.surfaceElevated,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  dragDots: {
    color: d.textMuted,
    fontSize: 18,
    letterSpacing: -2,
  },
  categoryInfo: {
    flex: 1,
    gap: 2,
  },
  categoryName: {
    color: d.text,
    fontSize: 15,
    fontWeight: '600',
  },
  categoryCount: {
    color: d.textSecondary,
    fontSize: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: '#3A1515',
  },
  editIcon: { fontSize: 16 },
  deleteIcon: { fontSize: 16 },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  addIcon: {
    color: d.text,
    fontSize: 18,
    fontWeight: '300',
  },
  addText: {
    color: d.text,
    fontSize: 15,
    fontWeight: '500',
  },
  addSkillBtn: {
    alignSelf: 'flex-end',
    backgroundColor: d.text,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  addSkillText: {
    color: d.background,
    fontSize: 14,
    fontWeight: '700',
  },
});
