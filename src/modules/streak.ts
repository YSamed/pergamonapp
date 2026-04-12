/**
 * Streak hesaplama mantığı
 * lastActiveDate: 'YYYY-MM-DD' formatında
 */

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isYesterday(date: Date, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return isSameDay(date, yesterday);
}

type StreakUpdateResult = {
  newStreak: number;
  isStreakBroken: boolean;
  isMilestone: boolean;
};

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

export function updateStreak(
  currentStreak: number,
  lastActiveDateStr: string,
): StreakUpdateResult {
  const today = new Date();
  const lastActive = new Date(lastActiveDateStr);

  // Bugün zaten aktifse streak değişmez
  if (isSameDay(lastActive, today)) {
    return { newStreak: currentStreak, isStreakBroken: false, isMilestone: false };
  }

  // Dün aktif idiyse streak devam eder
  if (isYesterday(lastActive, today)) {
    const newStreak = currentStreak + 1;
    const isMilestone = STREAK_MILESTONES.includes(newStreak);
    return { newStreak, isStreakBroken: false, isMilestone };
  }

  // Daha eskiyse streak sıfırlanır
  return { newStreak: 1, isStreakBroken: true, isMilestone: false };
}
