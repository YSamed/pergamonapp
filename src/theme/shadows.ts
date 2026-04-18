import { Platform, ViewStyle } from 'react-native';

type Shadow = Pick<ViewStyle, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'>;

function shadow(opacity: number, radius: number, offsetY: number, elevation: number): Shadow {
  if (Platform.OS === 'android') {
    return { elevation };
  }
  return {
    shadowColor: 'colors.black',
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
}

export const shadows = {
  sm: shadow(0.06, 3, 1, 2),
  md: shadow(0.10, 6, 3, 4),
  lg: shadow(0.15, 12, 6, 8),
} as const;
