import type { ClanOverview } from '../types';
import { mockClanOverview } from '../mock';

let _clanOverview: ClanOverview = { ...mockClanOverview };

export type ClanBonusReward = {
  bonusXP: number;
  challengeId: string;
  challengeTitle: string;
};

export const clanService = {
  async getClanOverview(_clanId: string): Promise<ClanOverview> {
    return _clanOverview;
  },

  async addContribution(userId: string, xpAmount: number): Promise<void> {
    const challenge = _clanOverview.activeChallenge;
    const nextChallenge = challenge
      ? {
          ...challenge,
          currentScore: challenge.currentScore + xpAmount,
          isCompleted:
            challenge.isCompleted ||
            challenge.currentScore + xpAmount >= challenge.targetScore,
        }
      : null;

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
      activeChallenge: nextChallenge,
    };
  },

  /**
   * Claim the clan challenge completion bonus once per cycle.
   * Returns the reward when the active challenge has just been completed
   * and not yet claimed; otherwise returns null.
   */
  async claimChallengeBonus(): Promise<ClanBonusReward | null> {
    const challenge = _clanOverview.activeChallenge;
    if (!challenge) return null;
    if (!challenge.isCompleted) return null;
    if (challenge.bonusClaimedAt) return null;

    _clanOverview = {
      ..._clanOverview,
      activeChallenge: {
        ...challenge,
        bonusClaimedAt: new Date().toISOString(),
      },
    };

    return {
      bonusXP: challenge.bonusXP,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
    };
  },
};
