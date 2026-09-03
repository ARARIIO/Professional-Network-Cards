export type Card = {
  id: string;
  userId: string;
  name: string;
  role: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  bio: string | null;
  skills: string[];
  avatarUrl: string | null;
  backgroundColor: string;
  linkedin: string | null;
  github: string | null;
  twitter: string | null;
  slug: string;
  isPublic: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicCard = {
  name: string;
  role: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  bio: string | null;
  skills: string[];
  avatarUrl: string | null;
  backgroundColor: string;
  linkedin: string | null;
  github: string | null;
  twitter: string | null;
};

export type User = {
  id: string;
  email: string;
  name: string;
  card: Card | null;
  contactsCount: number;
};

export type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  bio: string | null;
  skills: string[];
  createdAt: string;
};

export type DayView = {
  date: string;
  count: number;
};

export type RecentViewer = {
  viewedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
};

export type CardAnalytics = {
  totalViews: number;
  lastSevenDaysViews: DayView[];
  recentViewers: RecentViewer[];
};

export type AuthPayload = {
  token: string;
  user: User;
};

export const CARD_FIELDS = `
  id
  userId
  name
  role
  email
  phone
  website
  bio
  skills
  avatarUrl
  backgroundColor
  linkedin
  github
  twitter
  slug
  isPublic
  viewsCount
  createdAt
  updatedAt
`;

export const PUBLIC_CARD_FIELDS = `
  name
  role
  email
  phone
  website
  bio
  skills
  avatarUrl
  backgroundColor
  linkedin
  github
  twitter
`;

export const USER_FIELDS = `
  id
  email
  name
  contactsCount
  card {
    ${CARD_FIELDS}
  }
`;
