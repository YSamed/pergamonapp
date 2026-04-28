import type { LeagueTier, UserLeagueState } from '../types';

export const TIER_ORDER: LeagueTier[] = [
  'novice',
  'bronze',
  'silver',
  'gold',
  'sapphire',
  'ruby',
  'emerald',
  'amethyst',
  'obsidian',
  'diamond',
];

export const TIER_LABEL: Record<LeagueTier, string> = {
  novice: 'Acemi',
  bronze: 'Bronz',
  silver: 'Gümüş',
  gold: 'Altın',
  sapphire: 'Safir',
  ruby: 'Yakut',
  emerald: 'Zümrüt',
  amethyst: 'Ametist',
  obsidian: 'Obsidiyen',
  diamond: 'Elmas',
};

export const TIER_COLOR: Record<LeagueTier, string> = {
  novice: '#6E8096',
  bronze: '#C77D3A',
  silver: '#B8C4D1',
  gold: '#F4B544',
  sapphire: '#3B82F6',
  ruby: '#EC4899',
  emerald: '#10B981',
  amethyst: '#A855F7',
  obsidian: '#1F2937',
  diamond: '#06B6D4',
};

/** Bu kadar üst sıra promote olur (1-based, "ilk N kişi") */
export const PROMOTE_COUNT: Record<LeagueTier, number> = {
  novice: 10,
  bronze: 10,
  silver: 10,
  gold: 7,
  sapphire: 7,
  ruby: 7,
  emerald: 5,
  amethyst: 5,
  obsidian: 5,
  diamond: 0, // diamond turnuvaya yükselir; standart promote yok
};

/** Bu kadar alt sıra demote olur ("son N kişi") */
export const DEMOTE_COUNT: Record<LeagueTier, number> = {
  novice: 0,
  bronze: 5,
  silver: 5,
  gold: 5,
  sapphire: 5,
  ruby: 5,
  emerald: 5,
  amethyst: 5,
  obsidian: 7,
  diamond: 7,
};

/** Heartbeat 0 olduğunda günlük XP decay oranı (0..1) */
export const DECAY_RATE: Record<LeagueTier, number> = {
  novice: 0,
  bronze: 0,
  silver: 0,
  gold: 0,
  sapphire: 0,
  ruby: 0.05,
  emerald: 0.05,
  amethyst: 0.08,
  obsidian: 0.08,
  diamond: 0.1,
};

export const HEARTBEAT_MAX = 7;
export const COHORT_SIZE = 30;

export function nextTier(tier: LeagueTier): LeagueTier {
  const idx = TIER_ORDER.indexOf(tier);
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : tier;
}

export function prevTier(tier: LeagueTier): LeagueTier {
  const idx = TIER_ORDER.indexOf(tier);
  return idx > 0 ? TIER_ORDER[idx - 1] : tier;
}

export function isUpperTier(tier: LeagueTier): boolean {
  return DECAY_RATE[tier] > 0;
}

export function calculateOutcome(
  rank: number,
  tier: LeagueTier,
  cohortSize: number = COHORT_SIZE,
): 'promote' | 'hold' | 'demote' {
  if (rank <= PROMOTE_COUNT[tier]) return 'promote';
  if (rank > cohortSize - DEMOTE_COUNT[tier]) return 'demote';
  return 'hold';
}

/**
 * Apply nightly heartbeat tick.
 * Called once per day boundary. `hadHabitToday` reflects whether the user
 * completed at least one habit during the day that just ended.
 */
export function applyHeartbeatTick(
  state: UserLeagueState,
  hadHabitToday: boolean,
): UserLeagueState {
  const next = hadHabitToday
    ? Math.min(HEARTBEAT_MAX, state.heartbeatBank + 1)
    : Math.max(0, state.heartbeatBank - 1);

  return {
    ...state,
    heartbeatBank: next,
    heartbeatToday: false,
  };
}

/**
 * Apply apex decay if eligible.
 * Returns the amount of weeklyXP lost (0 if no decay applied).
 */
export function applyDecay(
  state: UserLeagueState,
  now: Date = new Date(),
): { state: UserLeagueState; xpLost: number } {
  if (!isUpperTier(state.currentTier)) return { state, xpLost: 0 };
  if (state.heartbeatBank > 0) return { state, xpLost: 0 };
  if (state.protectionUntil && new Date(state.protectionUntil) > now) {
    return { state, xpLost: 0 };
  }

  const rate = DECAY_RATE[state.currentTier];
  const xpLost = Math.floor(state.weeklyXP * rate);
  return {
    state: { ...state, weeklyXP: Math.max(0, state.weeklyXP - xpLost) },
    xpLost,
  };
}

export function isoWeekId(date: Date): string {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}
