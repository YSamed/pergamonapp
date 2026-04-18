export type ClanMemberStatus = 'done' | 'missed';

export type ClanPageMember = {
  id: string;
  name: string;
  avatar: string;
  color: string;
  status: ClanMemberStatus;
  isCurrentUser?: boolean;
};

export type ClanPageActivity = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
};

export type ClanLeaderboardEntry = {
  id: string;
  rank: number;
  name: string;
  score: number;
  isCurrentClan?: boolean;
};

export const mockClanPage = {
  emptyState: {
    title: 'Bir Klanın Yok',
    description: 'Arkadaşlarınla birlikte habit yap, birbirinizi motive edin',
    infoLines: [
      'Klanlar haftalık liglerde yarışır',
      'Birlikte hedef belirle, birlikte kazan',
    ],
  },
  dashboard: {
    name: 'Disiplin Ekibi 🔥',
    league: 'Gold League',
    level: 12,
    dailyScore: 248,
    weeklyCurrent: 240,
    weeklyTarget: 300,
    pressureTitle: 'Bugün 5 kişi tamamladı, 2 kişi tamamlamadı',
    pressureSubtitle: 'Sen hariç herkes yaptı',
    members: [
      { id: 'm1', name: 'Ali', avatar: 'A', color: '#0F766E', status: 'done', isCurrentUser: true },
      { id: 'm2', name: 'Ayse', avatar: 'AY', color: '#2563EB', status: 'done' },
      { id: 'm3', name: 'Burak', avatar: 'B', color: '#7C3AED', status: 'done' },
      { id: 'm4', name: 'Elif', avatar: 'E', color: '#EA580C', status: 'done' },
      { id: 'm5', name: 'Can', avatar: 'C', color: '#BE123C', status: 'missed' },
      { id: 'm6', name: 'Mina', avatar: 'M', color: '#166534', status: 'missed' },
    ] as ClanPageMember[],
    activity: [
      {
        id: 'a1',
        icon: '🔥',
        title: 'Ali 3 habit tamamladı',
        subtitle: 'Bugün 42 XP kazandı',
      },
      {
        id: 'a2',
        icon: '🚀',
        title: 'Ayşe 7 günlük streak yaptı',
        subtitle: 'Takım momentumu yükseliyor',
      },
      {
        id: 'a3',
        icon: '🏅',
        title: 'Burak bonus görevi bitirdi',
        subtitle: 'Lig puanına +18 katkı',
      },
    ] as ClanPageActivity[],
    leaderboard: [
      { id: 'l1', rank: 1, name: 'Sabah Ekibi', score: 312 },
      { id: 'l2', rank: 2, name: 'Disiplin Ekibi', score: 240, isCurrentClan: true },
      { id: 'l3', rank: 3, name: 'Odak Birliği', score: 218 },
    ] as ClanLeaderboardEntry[],
  },
};
