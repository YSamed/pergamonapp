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

  /** Aggregate stats for all skills used in SkillStatisticsScreen */
  async getStatistics(period: 'week' | 'month' | 'allTime'): Promise<SkillStatistics> {
    const skills = await this.getAllSkills();
    const allLinked = await Promise.all(
      skills.map(async (s) => ({
        skill: s,
        tasks: await this.getLinkedTasks(s.id),
      }))
    );

    const now = new Date();
    const periodStart = new Date();
    if (period === 'week') periodStart.setDate(now.getDate() - 7);
    else if (period === 'month') periodStart.setMonth(now.getMonth() - 1);
    else periodStart.setFullYear(2000); // all time

    const inPeriod = (dateStr: string) => new Date(dateStr) >= periodStart;

    const skillStats: SkillStatData[] = allLinked.map(({ skill, tasks }) => {
      const periodDates = tasks
        .flatMap((t) => t.completionHistory)
        .filter(inPeriod);
      const xpInPeriod = tasks.reduce((sum, t) => {
        const count = t.completionHistory.filter(inPeriod).length;
        return sum + count * t.xpReward;
      }, 0);
      return {
        skill,
        xpInPeriod,
        uniqueDaysActive: [...new Set(periodDates)].length,
      };
    });

    const totalXP = skillStats.reduce((s, x) => s + x.xpInPeriod, 0);
    const avgLevel =
      skills.length > 0
        ? skills.reduce((s, sk) => s + sk.level, 0) / skills.length
        : 0;
    const totalHistoricalXP = skills.reduce((s, sk) => s + sk.xp, 0);

    // Success rate: completed tasks / total tasks (all time for now)
    const allTasks = allLinked.flatMap((x) => x.tasks);
    const completedCount = allTasks.filter((t) => t.isCompleted).length;
    const totalCount = allTasks.length;
    const successRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return {
      skillStats,
      totalXP,
      avgLevel,
      totalHistoricalXP,
      successRate,
    };
  },
};

export type SkillStatData = {
  skill: import('../types').Skill;
  xpInPeriod: number;
  uniqueDaysActive: number;
};

export type SkillStatistics = {
  skillStats: SkillStatData[];
  totalXP: number;
  avgLevel: number;
  totalHistoricalXP: number;
  successRate: number;
};
