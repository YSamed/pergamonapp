import type {
  League,
  LeagueParticipant,
  UserLeagueState,
} from '../types';

const now = new Date();
const monday = new Date(now);
const dayOffset = (now.getDay() + 6) % 7; // 0=Mon...6=Sun
monday.setDate(now.getDate() - dayOffset);
monday.setHours(0, 0, 0, 0);
const sunday = new Date(monday);
sunday.setDate(monday.getDate() + 6);
sunday.setHours(23, 59, 59, 999);

const todayKey = now.toISOString().slice(0, 10);

const NAMES = [
  'Furkan', 'Ayşe', 'Burak', 'Elif', 'Can', 'Zeynep', 'Mert', 'İrem',
  'Onur', 'Selin', 'Kaan', 'Deniz', 'Ece', 'Eren', 'Sude', 'Berk',
  'Naz', 'Yiğit', 'Lara', 'Doruk', 'Mira', 'Bartu', 'Defne', 'Kerem',
  'Su', 'Arda', 'Esra', 'Tolga', 'Beren', 'Yağmur',
];

const FURKAN_INDEX = 0;
const FURKAN_RANK = 12; // mid-pack ama promote bölgesine yakın değil

function buildParticipants(): LeagueParticipant[] {
  // Top: high XP descending; bottom: low XP. Furkan rank 12 = ~mid.
  const xpAtRank = (rank: number): number => {
    if (rank === 1) return 540;
    if (rank <= 5) return 540 - (rank - 1) * 35; // 540, 505, 470, 435, 400
    if (rank <= 10) return 400 - (rank - 5) * 18; // 382, 364, 346, 328, 310
    if (rank <= 20) return 310 - (rank - 10) * 12;
    return Math.max(20, 190 - (rank - 20) * 14);
  };

  return NAMES.map((name, i) => {
    const rank = i === FURKAN_INDEX ? FURKAN_RANK : i + 1 < FURKAN_RANK ? i + 1 : i + 2;
    return {
      userId: i === FURKAN_INDEX ? 'user-1' : `user-l-${i}`,
      displayName: name,
      avatarUrl: null,
      weeklyXP: xpAtRank(rank),
      rank,
      heartbeatToday: rank % 4 !== 0, // çoğu aktif
      outcome: null,
    };
  }).sort((a, b) => a.rank - b.rank);
}

export const mockGoldLeague: League = {
  id: 'league-gold-w18',
  tier: 'gold',
  weekId: '2026-W18',
  startsAt: monday.toISOString(),
  endsAt: sunday.toISOString(),
  participants: buildParticipants(),
};

export const mockUserLeagueState: UserLeagueState = {
  userId: 'user-1',
  currentTier: 'gold',
  highestTier: 'gold',
  currentLeagueId: 'league-gold-w18',
  weeklyXP: 280,
  heartbeatBank: 5,
  protectionUntil: null,
  freezesAvailable: 1,
  freezesUsedThisWeek: 0,
  history: [
    {
      weekId: '2026-W17',
      startTier: 'silver',
      endTier: 'gold',
      finalRank: 4,
      weeklyXP: 380,
      outcome: 'promote',
    },
    {
      weekId: '2026-W16',
      startTier: 'silver',
      endTier: 'silver',
      finalRank: 11,
      weeklyXP: 290,
      outcome: 'hold',
    },
    {
      weekId: '2026-W15',
      startTier: 'bronze',
      endTier: 'silver',
      finalRank: 6,
      weeklyXP: 320,
      outcome: 'promote',
    },
    {
      weekId: '2026-W14',
      startTier: 'bronze',
      endTier: 'bronze',
      finalRank: 14,
      weeklyXP: 240,
      outcome: 'hold',
    },
  ],
  lastTickAt: null,
  todayDateKey: todayKey,
  heartbeatToday: true, // demo: bugün bir habit yapıldı
};
