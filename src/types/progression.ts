import type { SkillId } from './task';

export type Skill = {
  id: SkillId;
  label: string;
  description: string;
  icon: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
};

export type XPEvent = {
  id: string;
  userId: string;
  sourceType: 'habit' | 'todo' | 'achievement' | 'clan_challenge' | 'streak_bonus';
  sourceId: string;
  xpAmount: number;
  skillId: SkillId | null;
  createdAt: string;
};

export type StreakRecord = {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
};

export type Achievement = {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
};

export type UserProgress = {
  user: {
    id: string;
    level: number;
    totalXP: number;
    xpToNextLevel: number;
  };
  streak: StreakRecord;
  skills: Skill[];
  recentXPEvents: XPEvent[];
  achievements: Achievement[];
};
