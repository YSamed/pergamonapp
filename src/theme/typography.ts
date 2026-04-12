import { TextStyle } from 'react-native';

type Typography = {
  body: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  overline: TextStyle;
};

export const typography: Typography = {
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  h2: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  overline: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
};
