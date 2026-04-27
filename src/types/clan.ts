export type Clan = {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  memberCount: number;
  weeklyScore: number;
  createdAt: string;
};

export type ClanMember = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  weeklyContribution: number;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
};

export type ClanChallenge = {
  id: string;
  clanId: string;
  title: string;
  description: string;
  targetScore: number;
  currentScore: number;
  startsAt: string;
  endsAt: string;
  isCompleted: boolean;
  bonusXP: number;
  bonusClaimedAt: string | null;
};

export type ClanOverview = {
  clan: Clan;
  members: ClanMember[];
  activeChallenge: ClanChallenge | null;
  recentActivity: ClanActivityItem[];
};

export type ClanActivityItem = {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  actionType: 'habit_complete' | 'todo_complete' | 'level_up' | 'achievement' | 'streak_milestone';
  description: string;
  xpEarned: number;
  createdAt: string;
};
