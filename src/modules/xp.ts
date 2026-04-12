import type { Difficulty } from '../types';

const XP_TABLE: Record<Difficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 20,
};

export function getBaseXP(difficulty: Difficulty): number {
  return XP_TABLE[difficulty];
}

/** Streak bonus: belirli milestone'larda ekstra XP */
export function getStreakBonus(streak: number): number {
  if (streak >= 30) return 50;
  if (streak >= 14) return 25;
  if (streak >= 7) return 15;
  if (streak >= 3) return 5;
  return 0;
}

/** Günlük toplam XP'nin üst sınırı — abuse prevention */
export const DAILY_XP_CAP = 300;
