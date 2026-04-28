import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { HEARTBEAT_MAX } from '../../modules/league';

type Props = {
  filled: number;
  today: boolean;
};

const HEART_SIZE = 22;

export const HeartbeatBar = ({ filled, today }: Props) => {
  const pulse = useRef(new Animated.Value(0)).current;
  const safeFilled = Math.max(0, Math.min(HEARTBEAT_MAX, filled));
  const pulseIndex = today ? -1 : safeFilled;

  useEffect(() => {
    if (today) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [today, pulse]);

  const pulseStyle = {
    opacity: pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    }),
    transform: [
      {
        scale: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1.12],
        }),
      },
    ],
  };

  return (
    <View style={styles.row}>
      {Array.from({ length: HEARTBEAT_MAX }).map((_, i) => {
        const isFilled = i < safeFilled;
        const isPulse = i === pulseIndex;
        const heartColor = isFilled ? colors.streak : colors.textMuted;
        const iconName = isFilled ? 'heart' : 'heart-outline';
        if (isPulse) {
          return (
            <Animated.View key={i} style={[styles.heart, pulseStyle]}>
              <Ionicons name="heart-outline" size={HEART_SIZE} color={colors.streak} />
            </Animated.View>
          );
        }
        return (
          <View key={i} style={styles.heart}>
            <Ionicons name={iconName} size={HEART_SIZE} color={heartColor} />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heart: {
    width: HEART_SIZE + 4,
    height: HEART_SIZE + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
