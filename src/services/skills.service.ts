import type { Skill } from '../types';
import type { Habit, Todo } from '../types';
import { progressService } from './progress.service';
import { habitsService } from './habits.service';
import { todosService } from './todos.service';

export type LinkedTask = {
  id: string;
  title: string;
  type: 'habit' | 'todo';
  xpReward: number;
  isCompleted: boolean;
  isFailed: boolean;
  /** YYYY-MM-DD strings of all past completions */
  completionHistory: string[];
};

export const skillsService = {
  async getAllSkills(): Promise<Skill[]> {
    const progress = await progressService.getUserProgress();
    return progress.skills;
  },

  async getSkillById(skillId: string): Promise<Skill | null> {
    const skills = await this.getAllSkills();
    return skills.find((s) => s.id === skillId) ?? null;
  },

  async getLinkedTasks(skillId: string): Promise<LinkedTask[]> {
    const [habits, todos] = await Promise.all([
      habitsService.getAllHabits(),
      todosService.getAllTodos(),
    ]);

    const linkedHabits: LinkedTask[] = habits
      .filter((h: Habit) => h.skillIds.includes(skillId as any))
      .map((h: Habit) => {
        const history = h.completionHistory ?? [];
        const today = new Date().toISOString().slice(0, 10);
        const fullHistory = h.completedTodayAt
          ? (history.includes(today) ? history : [today, ...history])
          : history;
        return {
          id: h.id,
          title: h.title,
          type: 'habit' as const,
          xpReward: h.xpReward,
          isCompleted: !!h.completedTodayAt,
          isFailed: false,
          completionHistory: fullHistory,
        };
      });

    const linkedTodos: LinkedTask[] = todos
      .filter((t: Todo) => t.skillIds.includes(skillId as any))
      .map((t: Todo) => {
        const completedDate =
          t.completedAt && t.completedAt !== 'failed'
            ? [t.completedAt.slice(0, 10)]
            : [];
        return {
          id: t.id,
          title: t.title,
          type: 'todo' as const,
          xpReward: t.xpReward,
          isCompleted: !!t.completedAt && t.completedAt !== 'failed',
          isFailed: t.completedAt === 'failed',
          completionHistory: completedDate,
        };
      });

    return [...linkedHabits, ...linkedTodos];
  },

  /** Merge all completionHistory dates from linked tasks for a skill */
  async getCompletedDates(skillId: string): Promise<string[]> {
    const tasks = await this.getLinkedTasks(skillId);
    const all = tasks.flatMap((t) => t.completionHistory);
    return [...new Set(all)];
  },
};
