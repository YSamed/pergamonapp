import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../../theme';
import type { SeasonalEvent } from '../../mock';

const d = colors.dark;

type Props = {
  event: SeasonalEvent;
};

export const SeasonalEventBanner = ({ event }: Props) => {
  const shimmer = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Shimmer loop
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ).start();

    // Badge pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const daysLeft = Math.ceil(
    (new Date(event.endDate).getTime() - Date.now()) / 86400000,
  );

  return (
    <View style={[styles.banner, { borderColor: `${event.accentColor}30` }]}>
      {/* Accent glow */}
      <View
        style={[
          styles.accentGlow,
          { backgroundColor: event.accentColor },
        ]}
      />

      {/* Shimmer overlay */}
      <Animated.View
        style={[
          styles.shimmer,
          {
            opacity: shimmer.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.08, 0],
            }),
            transform: [
              {
                translateX: shimmer.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-200, 400],
                }),
              },
            ],
          },
        ]}
      />

      <View style={styles.content}>
        {/* Event icon */}
        <Animated.View
          style={[
            styles.iconWrap,
            {
              backgroundColor: `${event.accentColor}18`,
              borderColor: `${event.accentColor}35`,
              transform: [{ scale: pulseScale }],
              shadowColor: event.accentColor,
            },
          ]}
        >
          <Text style={styles.icon}>{event.icon}</Text>
        </Animated.View>

        {/* Text */}
        <View style={styles.textWrap}>
          <Text style={styles.name}>{event.name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        </View>

        {/* Multiplier badge */}
        <View
          style={[
            styles.multiplierBadge,
            {
              backgroundColor: `${event.accentColor}15`,
              borderColor: `${event.accentColor}30`,
            },
          ]}
        >
          <Text style={[styles.multiplierText, { color: event.accentColor }]}>
            {event.bonusMultiplier}x
          </Text>
          <Text style={[styles.multiplierLabel, { color: `${event.accentColor}BB` }]}>
            XP
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={[styles.daysLeftPill, { backgroundColor: `${event.accentColor}12` }]}>
          <Text style={[styles.daysLeftText, { color: event.accentColor }]}>
            {daysLeft} gün kaldı
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: d.surface,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  accentGlow: {
    position: 'absolute',
    top: -60,
    left: '10%',
    width: '80%',
    height: 100,
    borderRadius: 50,
    opacity: 0.08,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 200,
    backgroundColor: '#FFFFFF',
    transform: [{ skewX: '-20deg' }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  icon: {
    fontSize: 26,
  },
  textWrap: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: d.text,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 12,
    fontWeight: '500',
    color: d.textSecondary,
    lineHeight: 17,
  },
  multiplierBadge: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 1,
  },
  multiplierText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  multiplierLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysLeftPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  daysLeftText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
