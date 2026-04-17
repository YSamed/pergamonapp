import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing } from '../../theme';

type Props = {
  children: React.ReactNode;
  onDelete: () => void | Promise<void>;
  onComplete?: () => void | Promise<void>;
  disabled?: boolean;
  disableComplete?: boolean;
};

const d = colors.dark;
const MAX_SWIPE = 132;
const DELETE_THRESHOLD = 96;
const COMPLETE_THRESHOLD = 84;
const OFFSCREEN_X = -Dimensions.get('window').width;
const OFFSCREEN_RIGHT_X = Dimensions.get('window').width;

export const SwipeToDeleteRow = ({
  children,
  onDelete,
  onComplete,
  disabled = false,
  disableComplete = false,
}: Props) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isActing, setIsActing] = useState(false);

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
      speed: 18,
    }).start();
  };

  const commitDelete = () => {
    if (isActing) return;
    setIsActing(true);

    Animated.timing(translateX, {
      toValue: OFFSCREEN_X,
      duration: 180,
      useNativeDriver: true,
    }).start(async ({ finished }) => {
      if (finished) {
        await onDelete();
      }
      translateX.setValue(0);
      setIsActing(false);
    });
  };

  const commitComplete = () => {
    if (!onComplete || isActing) return;
    setIsActing(true);

    Animated.timing(translateX, {
      toValue: OFFSCREEN_RIGHT_X,
      duration: 180,
      useNativeDriver: true,
    }).start(async ({ finished }) => {
      if (finished) {
        await onComplete();
      }
      translateX.setValue(0);
      setIsActing(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        !disabled &&
        !isActing &&
        Math.abs(gestureState.dx) > 8 &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        const minX = -MAX_SWIPE;
        const maxX = onComplete && !disableComplete ? MAX_SWIPE : 0;
        const nextX = Math.max(minX, Math.min(gestureState.dx, maxX));
        translateX.setValue(nextX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (onComplete && !disableComplete && gestureState.dx >= COMPLETE_THRESHOLD) {
          commitComplete();
          return;
        }
        if (gestureState.dx <= -DELETE_THRESHOLD) {
          commitDelete();
          return;
        }
        resetPosition();
      },
      onPanResponderTerminate: resetPosition,
    }),
  ).current;

  return (
    <View style={styles.root}>
      <View style={styles.completeBackground}>
        <Text style={styles.completeText}>Complete</Text>
      </View>
      <View style={styles.deleteBackground}>
        <Text style={styles.deleteText}>Delete</Text>
      </View>
      <Animated.View
        style={[styles.foreground, { transform: [{ translateX }] }]}
        {...(!disabled ? panResponder.panHandlers : {})}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    marginBottom: spacing.sm,
    borderRadius: 30,
    overflow: 'hidden',
  },
  completeBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    backgroundColor: '#214E44',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    backgroundColor: '#7A2032',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  completeText: {
    color: '#E7FFF8',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  deleteText: {
    color: '#FFE7EC',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  foreground: {
    borderRadius: 30,
    overflow: 'hidden',
  },
});
