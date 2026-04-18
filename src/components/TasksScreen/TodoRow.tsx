import React, { useEffect, useRef } from 'react';
import { colors } from '../../theme';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  type GestureResponderEvent,
} from 'react-native';
import { spacing } from '../../theme';
import type { Todo } from '../../types';
import { SwipeToDeleteRow } from './SwipeToDeleteRow';
import LottieView from 'lottie-react-native';

type Props = {
  todo: Todo;
  onComplete: (id: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onPress?: (id: string) => void;
};

const tickAnimation = require('../../assets/tick-success.json');
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

export const TodoRow = ({ todo, onComplete, onDelete, onPress }: Props) => {
  const isCompleted = !!todo.completedAt;
  const progress = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isCompleted ? 1 : 0,
      duration: 320,
      useNativeDriver: false,
    }).start();
  }, [isCompleted, progress]);

  const handleCompletePress = (event: GestureResponderEvent) => {
    event.stopPropagation?.();
    void onComplete(todo.id);
  };

  return (
    <SwipeToDeleteRow onDelete={() => onDelete(todo.id)}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => onPress?.(todo.id)}
        activeOpacity={0.8}
      >
        <View style={styles.leadingContent}>
          <TouchableOpacity style={styles.iconBox} onPress={handleCompletePress} activeOpacity={0.8}>
            <AnimatedLottieView
              source={tickAnimation}
              loop={false}
              progress={progress}
              style={styles.tickAnimation}
            />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{todo.title}</Text>
        </View>
      </TouchableOpacity>
    </SwipeToDeleteRow>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'colors.surface',
    borderRadius: 30,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'colors.border',
    gap: spacing.sm,
  },
  leadingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'colors.surfaceElevated',
    borderWidth: 1,
    borderColor: 'colors.border',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tickAnimation: {
    width: 32,
    height: 32,
  },
  title: {
    flex: 1,
    color: 'colors.text',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
});
