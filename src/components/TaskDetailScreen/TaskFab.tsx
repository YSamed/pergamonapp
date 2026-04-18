import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, spacing, radius } from '../../theme';

const d = colors;

export type TaskFabProps = {
  onComplete: () => void;
  onFail: () => void;
  onUndo: () => void;
  onEdit: () => void;
};

export const TaskFab = ({ onComplete, onFail, onUndo, onEdit }: TaskFabProps) => {
  const [fabOpen, setFabOpen] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = fabOpen ? 0 : 1;
    Animated.spring(fabAnim, { toValue, useNativeDriver: true, bounciness: 8 }).start();
    setFabOpen(!fabOpen);
  };

  const close = () => {
    if (!fabOpen) return;
    Animated.spring(fabAnim, { toValue: 0, useNativeDriver: true }).start();
    setFabOpen(false);
  };

  const makeAnimStyle = (offset: number) => ({
    transform: [
      {
        translateY: fabAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, offset],
        }),
      },
      { scale: fabAnim },
    ],
    opacity: fabAnim,
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View style={[styles.action, makeAnimStyle(-280)]}>
        <Text style={styles.actionLabel}>Undo</Text>
        <TouchableOpacity style={[styles.actionBtn, styles.undoBtn]} onPress={() => { close(); onUndo(); }}>
          <Text style={styles.actionIcon}>↩</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.action, makeAnimStyle(-210)]}>
        <Text style={styles.actionLabel}>Edit</Text>
        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => { close(); onEdit(); }}>
          <Text style={styles.actionIcon}>✎</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.action, makeAnimStyle(-140)]}>
        <Text style={styles.actionLabel}>Fail</Text>
        <TouchableOpacity style={[styles.actionBtn, styles.failBtn]} onPress={() => { close(); onFail(); }}>
          <Text style={styles.actionIcon}>✕</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.action, makeAnimStyle(-70)]}>
        <Text style={styles.actionLabel}>Completed</Text>
        <TouchableOpacity style={[styles.actionBtn, styles.completeBtn]} onPress={() => { close(); onComplete(); }}>
          <Text style={styles.actionIcon}>✓</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity style={styles.fab} onPress={toggle} activeOpacity={0.85}>
        <Animated.Text
          style={[
            styles.fabIcon,
            {
              transform: [
                {
                  rotate: fabAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '90deg'],
                  }),
                },
              ],
            },
          ]}
        >
          {fabOpen ? '←' : '☰'}
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    alignItems: 'flex-end',
  },
  action: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionLabel: {
    color: d.text,
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: d.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtn: { backgroundColor: colors.success },
  failBtn: { backgroundColor: colors.error },
  editBtn: { backgroundColor: d.surfaceElevated },
  undoBtn: { backgroundColor: colors.warning },
  actionIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: d.surface,
    borderWidth: 1,
    borderColor: d.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    color: d.text,
    fontSize: 20,
    fontWeight: '600',
  },
});
