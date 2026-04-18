export type DailyChallenge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  type: 'habit_count' | 'todo_count' | 'streak' | 'skill_focus' | 'time_based';
  target: number;
  current: number;
  expiresAt: string;
  isCompleted: boolean;
};

export type SeasonalEvent = {
  id: string;
  name: string;
  description: string;
  icon: string;
  accentColor: string;
  startDate: string;
  endDate: string;
  bonusMultiplier: number;
};

export const mockDailyChallenges: DailyChallenge[] = [
  {
    id: 'dc-1',
    title: '3 Habit Tamamla',
    description: "Bugün en az 3 habit'ini tamamla",
    icon: '🎯',
    xpReward: 30,
    type: 'habit_count',
    target: 3,
    current: 1,
    expiresAt: '2026-04-18T23:59:59Z',
    isCompleted: false,
  },
  {
    id: 'dc-2',
    title: 'Odak Ustası',
    description: "Focus skill'ine ait bir görev tamamla",
    icon: '🧠',
    xpReward: 20,
    type: 'skill_focus',
    target: 1,
    current: 0,
    expiresAt: '2026-04-18T23:59:59Z',
    isCompleted: false,
  },
  {
    id: 'dc-3',
    title: 'Erken Kuş',
    description: 'Sabah 09:00 öncesi bir görev tamamla',
    icon: '🌅',
    xpReward: 25,
    type: 'time_based',
    target: 1,
    current: 1,
    expiresAt: '2026-04-18T23:59:59Z',
    isCompleted: true,
  },
];

export const mockSeasonalEvent: SeasonalEvent = {
  id: 'se-1',
  name: 'Bahar Atılımı',
  description: 'Bahar geldi, alışkanlıklarını yenile! Tüm XP kazanımları 1.5x',
  icon: '🌸',
  accentColor: '#EC4899',
  startDate: '2026-04-15T00:00:00Z',
  endDate: '2026-04-30T23:59:59Z',
  bonusMultiplier: 1.5,
};
