export type CommunityStory = {
  id: string;
  label: string;
  avatar: string;
  color: string;
  isAdd?: boolean;
};

export type CommunityTab = 'feed' | 'group' | 'friends';

export type CommunityPost = {
  id: string;
  tab: CommunityTab;
  author: string;
  role: string;
  minutesAgo: number;
  avatar: string;
  avatarColor: string;
  content: string;
  likes: number;
  comments: number;
  gallery?: string[];
};

export type CommunityGroupThread = {
  id: string;
  name: string;
  previewSender: string;
  previewText: string;
  time: string;
  unreadCount: number;
  avatar: string;
  avatarColor: string;
};

export type CommunityFriend = {
  id: string;
  name: string;
  status: string;
  isOnline?: boolean;
  avatar: string;
  avatarColor: string;
};

export const mockCommunityStories: CommunityStory[] = [
  { id: 'add-story', label: 'Add Story', avatar: '+', color: '#111827', isAdd: true },
  { id: 'kierra', label: 'Kierra', avatar: 'KF', color: '#0F766E' },
  { id: 'lewis', label: 'Lewis', avatar: 'LJ', color: '#2563EB' },
  { id: 'sena', label: 'Sena', avatar: 'SK', color: '#9333EA' },
  { id: 'arda', label: 'Arda', avatar: 'AD', color: '#EA580C' },
  { id: 'maya', label: 'Maya', avatar: 'MN', color: '#BE123C' },
];

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post-1',
    tab: 'feed',
    author: 'Kierra Franci',
    role: 'Discipline Club',
    minutesAgo: 50,
    avatar: 'KF',
    avatarColor: '#0F766E',
    content:
      "Akşam challenge'ı için hazır hissediyorum. Bugün seriyi bozmak yok, herkes check-in atsın.",
    likes: 17,
    comments: 2,
  },
  {
    id: 'post-2',
    tab: 'group',
    author: 'Lewis Jones',
    role: 'Fitness Squad',
    minutesAgo: 120,
    avatar: 'LJ',
    avatarColor: '#2563EB',
    content:
      'Bugünkü grup antrenmanı beklediğimden sert geçti. Yarın sabah koşu için kim geliyor?',
    likes: 26,
    comments: 8,
    gallery: ['RUN', 'GYM', 'CREW'],
  },
  {
    id: 'post-3',
    tab: 'friends',
    author: 'Sena Kaya',
    role: 'Friend Activity',
    minutesAgo: 185,
    avatar: 'SK',
    avatarColor: '#9333EA',
    content:
      'Pomodoro serisini 8 tura çıkardım. Akşam 21:00 odak odası açıyorum, katılmak isteyen yazsın.',
    likes: 9,
    comments: 4,
  },
  {
    id: 'post-4',
    tab: 'feed',
    author: 'Arda Demir',
    role: 'Coding Arena',
    minutesAgo: 240,
    avatar: 'AD',
    avatarColor: '#EA580C',
    content:
      "Yeni haftalık sprint başladı. Bu hafta herkes bitirdiği task'ın ekran görüntüsünü paylaşsın.",
    likes: 31,
    comments: 11,
  },
];

export const mockCommunityGroupThreads: CommunityGroupThread[] = [
  {
    id: 'group-1',
    name: 'Disiplin Tayfa',
    previewSender: 'rudy',
    previewText: 'Bugun check-in ekranini atan var mi? herkes durum yazsin.',
    time: '09.10',
    unreadCount: 17,
    avatar: 'DT',
    avatarColor: '#0F766E',
  },
  {
    id: 'group-2',
    name: 'Kickoff Crew',
    previewSender: 'yusuf',
    previewText: 'Bu tempoyla gidersek haftayi rahat kapatiriz.',
    time: '05.14',
    unreadCount: 2,
    avatar: 'KC',
    avatarColor: '#2563EB',
  },
  {
    id: 'group-3',
    name: 'Goal Diggers',
    previewSender: 'steven',
    previewText: 'Sabah rutini challenge puanlari birazdan guncelleniyor.',
    time: '00.45',
    unreadCount: 23,
    avatar: 'GD',
    avatarColor: '#7C3AED',
  },
  {
    id: 'group-4',
    name: 'The Focus Network',
    previewSender: 'richko',
    previewText: 'Aksam odak odasini 21.00 icin sabitledim, gelin.',
    time: '00.43',
    unreadCount: 10,
    avatar: 'FN',
    avatarColor: '#EA580C',
  },
  {
    id: 'group-5',
    name: 'Habit Enthusiasts',
    previewSender: 'sam',
    previewText: 'Yeni haftalik hedef cok iyi, bu kez tam cekecegiz.',
    time: '00.20',
    unreadCount: 4,
    avatar: 'HE',
    avatarColor: '#BE123C',
  },
  {
    id: 'group-6',
    name: 'Match Day Heroes',
    previewSender: 'surya',
    previewText: 'Yarin sabah herkes streak screenshot paylassin.',
    time: '00.32',
    unreadCount: 8,
    avatar: 'MH',
    avatarColor: '#166534',
  },
];

export const mockCommunityFriends: CommunityFriend[] = [
  {
    id: 'friend-1',
    name: 'Gretchen Culhane',
    status: 'Active at 08.45',
    avatar: 'GC',
    avatarColor: '#0F766E',
  },
  {
    id: 'friend-2',
    name: 'Craig Siphron',
    status: 'Active at 05.24',
    avatar: 'CS',
    avatarColor: '#2563EB',
  },
  {
    id: 'friend-3',
    name: 'Kaiya Franci',
    status: 'Active',
    isOnline: true,
    avatar: 'KF',
    avatarColor: '#7C3AED',
  },
  {
    id: 'friend-4',
    name: 'Allison George',
    status: 'Active',
    isOnline: true,
    avatar: 'AG',
    avatarColor: '#EA580C',
  },
  {
    id: 'friend-5',
    name: 'Talan Philips',
    status: 'Active at 03.21',
    avatar: 'TP',
    avatarColor: '#BE123C',
  },
  {
    id: 'friend-6',
    name: 'Marcus Gouse',
    status: 'Active yesterday',
    avatar: 'MG',
    avatarColor: '#166534',
  },
];
