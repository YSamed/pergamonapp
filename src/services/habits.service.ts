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
    const today = new Date().toISOString().slice(0, 10);
    const history = _habits[index].completionHistory ?? [];
    _habits[index] = {
      ..._habits[index],
      completedTodayAt: new Date().toISOString(),
      streak: _habits[index].streak + 1,
      completionHistory: history.includes(today) ? history : [today, ...history],
    };
    return _habits[index];
  },

  async createHabit(data: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'longestStreak' | 'completedTodayAt' | 'completionHistory'>): Promise<Habit> {
    const newHabit: Habit = {
      ...data,
      id: `habit-${Date.now()}`,
      streak: 0,
      longestStreak: 0,
      completedTodayAt: null,
      completionHistory: [],
      createdAt: new Date().toISOString(),
    };
    _habits.push(newHabit);
    return newHabit;
  },

  async getHabitById(id: string): Promise<Habit | null> {
    return _habits.find((h) => h.id === id) ?? null;
  },

  async uncompleteHabit(id: string): Promise<Habit> {
    const index = _habits.findIndex((h) => h.id === id);
    if (index === -1) throw new Error(`Habit not found: ${id}`);
    _habits[index] = {
      ..._habits[index],
      completedTodayAt: null,
      streak: Math.max(0, _habits[index].streak - 1),
    };
    return _habits[index];
  },

  async deleteHabit(id: string): Promise<void> {
    _habits = _habits.filter((h) => h.id !== id);
  },
};
