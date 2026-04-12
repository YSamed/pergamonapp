export type User = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  level: number;
  totalXP: number;
  clanId: string | null;
  createdAt: string;
};
