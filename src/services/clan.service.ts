import type { ClanOverview } from '../types';
import { mockClanOverview } from '../mock';

let _clanOverview: ClanOverview = { ...mockClanOverview };

export const clanService = {
  async getClanOverview(_clanId: string): Promise<ClanOverview> {
    return _clanOverview;
  },

  async addContribution(userId: string, xpAmount: number): Promise<void> {
    _clanOverview = {
      ..._clanOverview,
      clan: {
        ..._clanOverview.clan,
        weeklyScore: _clanOverview.clan.weeklyScore + xpAmount,
      },
      members: _clanOverview.members.map((m) =>
        m.userId === userId
          ? { ...m, weeklyContribution: m.weeklyContribution + xpAmount }
          : m,
      ),
    };
  },
};
