import type { User, Competition, Group, GroupMembership, Team, Matchday, Match, Prediction, RankingEntry, Notification } from '../core/api/models';

export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@matchwiz.dev',
    emailVerified: true,
    preferredLanguage: 'en',
    timezone: 'Europe/Berlin',
    theme: 'DARK',
    twoFactorEnabled: false,
    emailNotifications: true,
    matchdayReminders: true,
    globalRole: 'ADMIN',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'alice',
    email: 'alice@example.com',
    emailVerified: true,
    preferredLanguage: 'de',
    timezone: 'Europe/Berlin',
    theme: 'DARK',
    twoFactorEnabled: false,
    emailNotifications: false,
    matchdayReminders: true,
    globalRole: 'USER',
    active: true,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 3,
    username: 'bob',
    email: 'bob@example.com',
    emailVerified: false,
    preferredLanguage: 'de',
    timezone: 'Europe/Berlin',
    theme: 'DARK',
    twoFactorEnabled: false,
    emailNotifications: false,
    matchdayReminders: false,
    globalRole: 'USER',
    active: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
];

export const mockCompetitions: Competition[] = [
  {
    id: 1,
    name: 'Bundesliga',
    season: '2025/26',
    status: 'ACTIVE',
    startDate: '2025-08-15',
    endDate: '2026-05-30',
  },
  {
    id: 2,
    name: 'World Cup',
    season: '2026',
    status: 'DRAFT',
    startDate: '2026-06-11',
    endDate: '2026-07-19',
  },
];

export const mockGroups: Group[] = [
  { id: 1, competitionId: 1, name: 'Family Group', description: 'Just the family!' },
  { id: 2, competitionId: 1, name: 'Company Group', description: 'Office fun' },
  { id: 3, competitionId: 2, name: 'World Cup Friends', description: 'World Cup tips' },
];

export const mockMemberships: GroupMembership[] = [
  { id: 1, groupId: 1, userId: 1, username: 'admin', role: 'GROUP_ADMIN', approved: true, joinedAt: '2026-01-01T00:00:00Z' },
  { id: 2, groupId: 1, userId: 2, username: 'alice', role: 'MEMBER', approved: true, joinedAt: '2026-01-10T00:00:00Z' },
  { id: 3, groupId: 1, userId: 3, username: 'bob', role: 'MEMBER', approved: false, joinedAt: '2026-01-15T00:00:00Z' },
  { id: 4, groupId: 2, userId: 1, username: 'admin', role: 'GROUP_ADMIN', approved: true, joinedAt: '2026-01-01T00:00:00Z' },
  { id: 5, groupId: 3, userId: 1, username: 'admin', role: 'MEMBER', approved: true, joinedAt: '2026-01-20T00:00:00Z' },
];

export const mockTeams: Team[] = [
  { id: 1, name: 'FC Bayern München', shortName: 'FCB', logoUrl: '' },
  { id: 2, name: 'Borussia Dortmund', shortName: 'BVB', logoUrl: '' },
  { id: 3, name: 'Bayer 04 Leverkusen', shortName: 'B04', logoUrl: '' },
  { id: 4, name: 'RB Leipzig', shortName: 'RBL', logoUrl: '' },
  { id: 5, name: 'Eintracht Frankfurt', shortName: 'SGE', logoUrl: '' },
  { id: 6, name: 'VfB Stuttgart', shortName: 'VFB', logoUrl: '' },
];

export const mockMatchdays: Matchday[] = [
  { id: 1, competitionId: 1, number: 33, deadline: '2026-05-15T13:30:00Z' },
  { id: 2, competitionId: 1, number: 34, deadline: '2026-05-23T13:30:00Z' },
  { id: 3, competitionId: 2, number: 1, deadline: '2026-06-12T11:00:00Z' },
  { id: 4, competitionId: 2, number: 2, deadline: '2026-06-16T11:00:00Z' },
];

export const mockMatches: Match[] = [
  {
    id: 1,
    matchdayId: 1,
    homeTeamId: 1,
    awayTeamId: 2,
    homeTeam: mockTeams[0],
    awayTeam: mockTeams[1],
    kickoffTime: '2026-05-15T15:30:00Z',
    status: 'SCHEDULED',
  },
  {
    id: 2,
    matchdayId: 1,
    homeTeamId: 3,
    awayTeamId: 4,
    homeTeam: mockTeams[2],
    awayTeam: mockTeams[3],
    kickoffTime: '2026-05-15T15:30:00Z',
    status: 'SCHEDULED',
  },
  {
    id: 3,
    matchdayId: 1,
    homeTeamId: 5,
    awayTeamId: 6,
    homeTeam: mockTeams[4],
    awayTeam: mockTeams[5],
    kickoffTime: '2026-05-15T18:30:00Z',
    status: 'SCHEDULED',
  },
  {
    id: 4,
    matchdayId: 2,
    homeTeamId: 2,
    awayTeamId: 3,
    homeTeam: mockTeams[1],
    awayTeam: mockTeams[2],
    kickoffTime: '2026-05-23T15:30:00Z',
    status: 'SCHEDULED',
  },
];

export const mockPredictions: Prediction[] = [
  { id: 1, userId: 1, groupId: 1, matchId: 1, predictedHomeGoals: 2, predictedAwayGoals: 1, submittedAt: '2026-05-14T10:00:00Z' },
  { id: 2, userId: 1, groupId: 1, matchId: 2, predictedHomeGoals: 1, predictedAwayGoals: 1, submittedAt: '2026-05-14T10:00:00Z' },
];

export const mockRankings: RankingEntry[] = [
  { rank: 1, userId: 2, username: 'alice', totalPoints: 42, exactPredictions: 5, goalDifferencePredictions: 8, tendencyPredictions: 10 },
  { rank: 2, userId: 1, username: 'admin', totalPoints: 35, exactPredictions: 3, goalDifferencePredictions: 7, tendencyPredictions: 9 },
  { rank: 3, userId: 3, username: 'bob', totalPoints: 28, exactPredictions: 2, goalDifferencePredictions: 5, tendencyPredictions: 8 },
];

export const mockNotifications: Notification[] = [
  {
    id: 1,
    userId: 1,
    type: 'MATCHDAY_STARTS',
    title: 'Matchday 33 starts tomorrow',
    message: 'Submit your predictions before the deadline on May 15th at 13:30.',
    read: false,
    createdAt: '2026-05-14T08:00:00Z',
  },
  {
    id: 2,
    userId: 1,
    type: 'MISSING_PREDICTIONS',
    title: 'Missing predictions',
    message: 'You still have 1 prediction to submit for matchday 33.',
    read: false,
    createdAt: '2026-05-14T09:00:00Z',
  },
];
