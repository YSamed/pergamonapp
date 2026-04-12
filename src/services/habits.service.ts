import type { Habit } from '../types';
import { mockHabits } from '../mock';

// Mock state — ileride gerçek API çağrısıyla değiştirilecek
let _habits = [...mockHabits];

export const habitsService = {
  async getTodayHabits(): Promise<Habit[]> {
    const today = new Date().getDay(); // 0=Sun...6=Sat
    return _habits.filter((h) => {
      if (!h.isActive) return false;
      if (h.frequency === 'daily') return true;
      if (h.frequency === 'weekly') return h.frequencyDays.includes(today);
      return false;
    });
  },

  async getAllHabits(): Promise<Habit[]> {
    return _habits.filter((h) => h.isActive);
  },

  async completeHabit(id: string): Promise<Habit> {
    const index = _habits.findIndex((h) => h.id === id);
    if (index === -1) throw new Error(`Habit not found: ${id}`);

    _habits[index] = {
      ..._habits[index],
      completedTodayAt: new Date().toISOString(),
      streak: _habits[index].streak + 1,
    };
    return _habits[index];
  },

  async createHabit(data: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'longestStreak' | 'completedTodayAt'>): Promise<Habit> {
    const newHabit: Habit = {
      ...data,
      id: `habit-${Date.now()}`,
      streak: 0,
      longestStreak: 0,
      completedTodayAt: null,
      createdAt: new Date().toISOString(),
    };
    _habits.push(newHabit);
    return newHabit;
  },

  async deleteHabit(id: string): Promise<void> {
    _habits = _habits.filter((h) => h.id !== id);
  },
};
