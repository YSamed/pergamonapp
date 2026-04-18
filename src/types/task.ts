export type Difficulty = 'easy' | 'medium' | 'hard';

export type SkillId =
  | 'strength'
  | 'focus'
  | 'discipline'
  | 'coding'
  | 'communication'
  | 'health'
  | 'learning'
  | 'mindset'
  | 'career'
  | 'social'
  | 'fitness';

export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export type Habit = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  difficulty: Difficulty;
  xpReward: number;
  skillIds: SkillId[];
  frequency: HabitFrequency;
  /** Days of week for weekly habits: 0=Sun, 1=Mon, ... 6=Sat */
  frequencyDays: number[];
  streak: number;
  longestStreak: number;
  completedTodayAt: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isOngoing?: boolean;
  /** ISO date strings of past completions e.g. ["2026-04-10", "2026-04-11"] */
  completionHistory: string[];
  isActive: boolean;
  createdAt: string;
};

export type TodoPriority = 'low' | 'medium' | 'high';

export type Todo = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: TodoPriority;
  difficulty: Difficulty;
  xpReward: number;
  skillIds: SkillId[];
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
};
