import type { UserProgress } from '../types';

export const mockProgress: UserProgress = {
  user: {
    id: 'user-1',
    level: 7,
    totalXP: 3250,
    xpToNextLevel: 500, // Level 7→8 için kalan XP
  },
  streak: {
    userId: 'user-1',
    currentStreak: 12,
    longestStreak: 21,
    lastActiveDate: '2026-04-11',
  },
  skills: [
    { id: 'fitness',    label: 'Fitness',    description: 'Enhance your physical strength and endurance.',     icon: '🏋️', xp: 42,  level: 1, currentStreak: 1, longestStreak: 1 },
    { id: 'focus',      label: 'Focus',      description: 'Improve your concentration and mental clarity.',    icon: '🧠', xp: 40,  level: 1, currentStreak: 1, longestStreak: 1 },
    { id: 'discipline', label: 'Discipline', description: 'Build self-control and consistent habits.',         icon: '🔥', xp: 40,  level: 1, currentStreak: 1, longestStreak: 1 },
    { id: 'coding',     label: 'Coding',     description: 'Strengthen your programming and problem-solving.',  icon: '💻', xp: 940, level: 6, currentStreak: 3, longestStreak: 9 },
    { id: 'health',     label: 'Health',     description: 'Take care of your body and well-being.',            icon: '❤️', xp: 430, level: 3, currentStreak: 0, longestStreak: 5 },
    { id: 'learning',   label: 'Learning',   description: 'Expand your knowledge and skills continuously.',    icon: '📚', xp: 390, level: 3, currentStreak: 5, longestStreak: 14 },
    { id: 'mindset',    label: 'Mindset',    description: 'Cultivate a growth-oriented and resilient mindset.', icon: '🧠', xp: 280, level: 2, currentStreak: 0, longestStreak: 3 },
  ],
  recentXPEvents: [
    {
      id: 'xp-1',
      userId: 'user-1',
      sourceType: 'habit',
      sourceId: 'habit-1',
      xpAmount: 10,
      skillId: 'discipline',
      createdAt: '2026-04-11T07:30:00Z',
    },
    {
      id: 'xp-2',
      userId: 'user-1',
      sourceType: 'todo',
      sourceId: 'todo-1',
      xpAmount: 10,
      skillId: 'coding',
      createdAt: '2026-04-11T14:00:00Z',
    },
    {
      id: 'xp-3',
      userId: 'user-1',
      sourceType: 'streak_bonus',
      sourceId: 'streak-10',
      xpAmount: 25,
      skillId: null,
      createdAt: '2026-04-10T23:59:00Z',
    },
  ],
  achievements: [
    {
      id: 'ach-1',
      key: 'first_habit',
      title: 'İlk Adım',
      description: 'İlk habitini tamamladın',
      icon: '🌱',
      unlockedAt: '2025-02-01T08:30:00Z',
    },
    {
      id: 'ach-2',
      key: 'streak_7',
      title: '7 Gün Seri',
      description: '7 gün üst üste aktif kaldın',
      icon: '🔥',
      unlockedAt: '2025-02-08T23:59:00Z',
    },
    {
      id: 'ach-3',
      key: 'level_5',
      title: 'Seviye 5',
      description: '5. seviyeye ulaştın',
      icon: '⭐',
      unlockedAt: '2025-03-15T12:00:00Z',
    },
    {
      id: 'ach-4',
      key: 'streak_30',
      title: '30 Gün Seri',
      description: '30 gün üst üste aktif kal',
      icon: '💎',
      unlockedAt: null, // henüz kazanılmadı
    },
  ],
};
