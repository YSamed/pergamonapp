import type { UserProgress, XPEvent } from '../types';
import { mockProgress } from '../mock';

let _progress: UserProgress = { ...mockProgress };

export const progressService = {
  async getUserProgress(): Promise<UserProgress> {
    return _progress;
  },

  async addXPEvent(event: Omit<XPEvent, 'id' | 'createdAt'>): Promise<UserProgress> {
    const newEvent: XPEvent = {
      ...event,
      id: `xp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    _progress = {
      ..._progress,
      user: {
        ..._progress.user,
        totalXP: _progress.user.totalXP + event.xpAmount,
      },
      recentXPEvents: [newEvent, ..._progress.recentXPEvents].slice(0, 20),
    };

    if (event.skillId) {
      _progress = {
        ..._progress,
        skills: _progress.skills.map((s) =>
          s.id === event.skillId ? { ...s, xp: s.xp + event.xpAmount } : s,
        ),
      };
    }

    return _progress;
  },
};
