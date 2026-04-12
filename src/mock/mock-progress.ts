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
    { id: 'discipline', label: 'Disiplin', icon: '⚔️', xp: 820, level: 5 },
    { id: 'coding', label: 'Kodlama', icon: '💻', xp: 940, level: 6 },
    { id: 'focus', label: 'Odak', icon: '🎯', xp: 610, level: 4 },
    { id: 'health', label: 'Sağlık', icon: '❤️', xp: 430, level: 3 },
    { id: 'learning', label: 'Öğrenme', icon: '📚', xp: 390, level: 3 },
    { id: 'mindset', label: 'Zihinsel Güç', icon: '🧠', xp: 280, level: 2 },
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
