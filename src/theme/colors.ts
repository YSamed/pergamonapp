export const colors = {
  // Midnight Discipline Base Palette
  background: '#1a1a1a', // Near-black canvas
  surface: '#101C28', // Surface/1
  surfaceElevated: '#152435', // Surface/2
  border: '#233447', // Line subtle / Borders

  // Text Hierarchy
  text: '#F5F7FB', // Text/high (Headlines)
  textSecondary: '#9EB0C5', // Text/med (Supporting)
  textMuted: '#6E8096', // Text/low (Utility)

  // Chromatic Roles (The 三人組)
  primary: '#4ED8C7', // aqua
  accent: '#F4B544', // amber
  error: '#FF6B6B', // coral

  // Semantic mappings
  xp: '#F4B544', // amber
  level: '#4ED8C7', // aqua
  streak: '#FF6B6B', // coral

  success: '#4ED8C7',
  warning: '#F4B544',

  // Overlay
  overlay: 'rgba(0,0,0,0.6)',

  // Legacy/Compatibility object (pointing to new base)
  dark: {
    background: '#071019',
    surface: '#101C28',
    surfaceElevated: '#152435',
    border: '#233447',
    text: '#F5F7FB',
    textSecondary: '#9EB0C5',
    textMuted: '#6E8096',
    primary: '#4ED8C7',
    primaryDim: '#4ED8C720',
    xp: '#F4B544',
    xpBar: '#F4B544',
    streakBar: '#FF6B6B',
    cardBorder: '#233447',
  },
} as const;
