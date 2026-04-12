/**
 * Level sistemi — XP eşikleri
 * Her level bir öncekine göre ~%20 daha fazla XP gerektirir.
 */

const BASE_XP = 100;
const GROWTH = 1.2;

/** Belirli bir level'a ulaşmak için gereken toplam XP */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP * Math.pow(GROWTH, level - 2));
}

/** Kümülatif XP'den mevcut level'ı hesapla */
export function calculateLevel(totalXP: number): number {
  let level = 1;
  while (xpRequiredForLevel(level + 1) <= totalXP) {
    level++;
  }
  return level;
}

/** Mevcut level içindeki ilerleme yüzdesi (0–1) */
export function levelProgress(totalXP: number): number {
  const level = calculateLevel(totalXP);
  const currentLevelXP = xpRequiredForLevel(level);
  const nextLevelXP = xpRequiredForLevel(level + 1);
  if (nextLevelXP === currentLevelXP) return 1;
  return (totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP);
}

/** Sonraki level için kalan XP */
export function xpToNextLevel(totalXP: number): number {
  const level = calculateLevel(totalXP);
  return xpRequiredForLevel(level + 1) - totalXP;
}
