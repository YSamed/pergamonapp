import type { League, LeagueOutcome, UserLeagueState } from '../types';
import { mockGoldLeague, mockUserLeagueState } from '../mock';
import {
  applyDecay,
  applyHeartbeatTick,
  calculateOutcome,
  COHORT_SIZE,
  HEARTBEAT_MAX,
  nextTier,
  prevTier,
} from '../modules/league';

let _league: League = {
  ...mockGoldLeague,
  participants: mockGoldLeague.participants.map((p) => ({ ...p })),
};
let _state: UserLeagueState = { ...mockUserLeagueState };

const todayKey = () => new Date().toISOString().slice(0, 10);

function rerank() {
  const sorted = [..._league.participants].sort((a, b) => b.weeklyXP - a.weeklyXP);
  sorted.forEach((p, i) => {
    p.rank = i + 1;
  });
  _league = { ..._league, participants: sorted };
}

export type LeagueWeekResult = {
  outcome: LeagueOutcome;
  fromTier: typeof _state.currentTier;
  toTier: typeof _state.currentTier;
  finalRank: number;
  weeklyXP: number;
};

export const leagueService = {
  async getCurrentLeague(_userId?: string): Promise<League> {
    return _league;
  },

  async getUserState(_userId?: string): Promise<UserLeagueState> {
    return _state;
  },

  /**
   * Görev tamamlamada çağrılır. Weekly XP'yi hem leaderboard satırında hem
   * kullanıcı state'inde günceller.
   */
  async contributeXP(userId: string, xp: number): Promise<UserLeagueState> {
    _state = { ..._state, weeklyXP: _state.weeklyXP + xp };
    _league = {
      ..._league,
      participants: _league.participants.map((p) =>
        p.userId === userId ? { ...p, weeklyXP: p.weeklyXP + xp } : p,
      ),
    };
    rerank();
    return _state;
  },

  /**
   * Habit completion'da çağrılır. Bugünkü heartbeat'i true yapar
   * (gün başına 1 sayar, idempotent).
   */
  async markHabitDone(userId: string): Promise<UserLeagueState> {
    const today = todayKey();
    if (_state.todayDateKey !== today) {
      _state = { ..._state, todayDateKey: today, heartbeatToday: true };
    } else if (!_state.heartbeatToday) {
      _state = { ..._state, heartbeatToday: true };
    }
    _league = {
      ..._league,
      participants: _league.participants.map((p) =>
        p.userId === userId ? { ...p, heartbeatToday: true } : p,
      ),
    };
    return _state;
  },

  /**
   * Gece yarısı (veya app focus'ta gün sınırı geçmişse) çağrılır.
   * Heartbeat tick + decay uygular. xpLost varsa caller'a haber verir.
   */
  async runMidnightTick(): Promise<{ xpLost: number; ticked: boolean }> {
    const today = todayKey();
    if (_state.todayDateKey === today && _state.lastTickAt) {
      // Aynı gün, zaten tick atılmış
      return { xpLost: 0, ticked: false };
    }
    const hadHabit = _state.heartbeatToday;
    let next = applyHeartbeatTick(_state, hadHabit);
    const decay = applyDecay(next);
    next = decay.state;
    next = {
      ...next,
      todayDateKey: today,
      lastTickAt: new Date().toISOString(),
      heartbeatToday: false,
    };
    _state = next;
    return { xpLost: decay.xpLost, ticked: true };
  },

  /**
   * Pazar 23:59 — bu hafta kapansın, outcome hesaplansın.
   * Mock için manuel tetiklenir (geliştirici menüsünden veya test için).
   */
  async simulateWeekEnd(): Promise<LeagueWeekResult> {
    rerank();
    const me = _league.participants.find((p) => p.userId === _state.userId);
    if (!me) throw new Error('User not in league');
    const outcome = calculateOutcome(me.rank, _state.currentTier, COHORT_SIZE);
    const fromTier = _state.currentTier;
    const toTier =
      outcome === 'promote'
        ? nextTier(fromTier)
        : outcome === 'demote'
          ? prevTier(fromTier)
          : fromTier;

    const protectionMs = 48 * 60 * 60 * 1000;
    const protectionUntil =
      outcome === 'promote'
        ? new Date(Date.now() + protectionMs).toISOString()
        : null;

    _state = {
      ..._state,
      currentTier: toTier,
      highestTier:
        outcome === 'promote' && toTier !== fromTier ? toTier : _state.highestTier,
      weeklyXP: 0,
      heartbeatBank: HEARTBEAT_MAX,
      protectionUntil,
      freezesAvailable: 1,
      freezesUsedThisWeek: 0,
      history: [
        {
          weekId: _league.weekId,
          startTier: fromTier,
          endTier: toTier,
          finalRank: me.rank,
          weeklyXP: me.weeklyXP,
          outcome,
        },
        ..._state.history,
      ].slice(0, 8),
    };

    // Reset leaderboard for next week (mock: same names, weeklyXP=0)
    _league = {
      ..._league,
      tier: toTier,
      weekId: nextWeekId(_league.weekId),
      participants: _league.participants.map((p) => ({
        ...p,
        weeklyXP: 0,
        rank: 0,
        heartbeatToday: false,
        outcome: null,
      })),
    };

    return {
      outcome,
      fromTier,
      toTier,
      finalRank: me.rank,
      weeklyXP: me.weeklyXP,
    };
  },

  /**
   * Donma günü kullan. Heartbeat azalmaz, decay durur.
   * Haftada 1 ücretsiz; premium artırır (faz E+).
   */
  async useFreeze(_userId: string): Promise<{ ok: boolean; until: string | null }> {
    if (_state.freezesAvailable <= 0) {
      return { ok: false, until: null };
    }
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    _state = {
      ..._state,
      freezesAvailable: _state.freezesAvailable - 1,
      freezesUsedThisWeek: _state.freezesUsedThisWeek + 1,
      protectionUntil: until,
    };
    return { ok: true, until };
  },
};

function nextWeekId(weekId: string): string {
  const m = weekId.match(/^(\d{4})-W(\d{2})$/);
  if (!m) return weekId;
  const year = parseInt(m[1]!, 10);
  const week = parseInt(m[2]!, 10);
  if (week >= 52) return `${year + 1}-W01`;
  return `${year}-W${String(week + 1).padStart(2, '0')}`;
}
