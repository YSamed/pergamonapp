export type LeagueTier =
  | 'novice'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'sapphire'
  | 'ruby'
  | 'emerald'
  | 'amethyst'
  | 'obsidian'
  | 'diamond';

export type LeagueOutcome = 'promote' | 'hold' | 'demote' | 'freeze';

export type LeagueParticipant = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  /** Bu hafta kazanılan toplam league XP */
  weeklyXP: number;
  /** Tier içindeki sıralama (1 = en üst) */
  rank: number;
  /** Bugün en az 1 habit completion oldu mu */
  heartbeatToday: boolean;
  outcome: LeagueOutcome | null;
};

export type League = {
  id: string;
  tier: LeagueTier;
  /** ISO week, e.g. "2026-W18" */
  weekId: string;
  /** Pazartesi 00:00 Türkiye saati */
  startsAt: string;
  /** Pazar 23:59 Türkiye saati */
  endsAt: string;
  participants: LeagueParticipant[];
};

export type LeagueHistoryEntry = {
  weekId: string;
  startTier: LeagueTier;
  endTier: LeagueTier;
  finalRank: number;
  weeklyXP: number;
  outcome: LeagueOutcome;
};

export type UserLeagueState = {
  userId: string;
  currentTier: LeagueTier;
  highestTier: LeagueTier;
  currentLeagueId: string | null;
  /** Bu hafta kazanılan league XP (bireysel kopya, leaderboard ile aynı) */
  weeklyXP: number;
  /** 0..7 arası — bugünkü habit aktivasyonuna göre artar/azalır */
  heartbeatBank: number;
  /** Decay'siz koruma süresi sonu (ISO) — yeni promote sonrası verilir */
  protectionUntil: string | null;
  /** Bu hafta için kalan ücretsiz freeze hakları */
  freezesAvailable: number;
  freezesUsedThisWeek: number;
  /** Son 8 haftanın özet history'si */
  history: LeagueHistoryEntry[];
  /** Son midnight tick zamanı — duplicate decay'i engellemek için */
  lastTickAt: string | null;
  /** Bugünün tarih damgası (YYYY-MM-DD) — heartbeatToday için referans */
  todayDateKey: string;
  /** Bugün heartbeat (≥1 habit completion) alındı mı */
  heartbeatToday: boolean;
};
