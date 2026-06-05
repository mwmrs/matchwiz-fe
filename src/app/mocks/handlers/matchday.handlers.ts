import { http, HttpResponse } from 'msw';
import { mockMatchdays, mockMatches, mockTeams } from '../seed-data';
import type { Matchday, Match } from '../../core/api/models';

export const matchdayHandlers = [
  http.get('/api/matchdays', ({ request }) => {
    const url = new URL(request.url);
    const competitionId = url.searchParams.get('competitionId');
    const filtered = competitionId
      ? mockMatchdays.filter((m) => m.competitionId === Number(competitionId))
      : mockMatchdays;
    return HttpResponse.json(filtered);
  }),

  http.post('/api/matchdays', async ({ request }) => {
    const body = await request.json() as Partial<Matchday>;
    const newMatchday: Matchday = {
      id: mockMatchdays.length + 1,
      competitionId: body.competitionId ?? 1,
      number: body.number ?? 1,
    };
    mockMatchdays.push(newMatchday);
    return HttpResponse.json(newMatchday, { status: 201 });
  }),

  http.get('/api/matchdays/:id', ({ params }) => {
    const md = mockMatchdays.find((m) => m.id === Number(params['id']));
    if (!md) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(md);
  }),

  http.patch('/api/matchdays/:id', async ({ params, request }) => {
    const md = mockMatchdays.find((m) => m.id === Number(params['id']));
    if (!md) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const updates = await request.json() as Partial<Matchday>;
    Object.assign(md, updates);
    return HttpResponse.json(md);
  }),

  http.get('/api/matchdays/:id/matches', ({ params }) => {
    const matches = mockMatches.filter((m) => m.matchdayId === Number(params['id']));
    return HttpResponse.json(matches);
  }),

  http.post('/api/matchdays/:id/matches', async ({ params, request }) => {
    const body = await request.json() as Partial<Match>;
    const homeTeam = mockTeams.find((t) => t.id === body.homeTeamId);
    const awayTeam = mockTeams.find((t) => t.id === body.awayTeamId);
    const newMatch: Match = {
      id: mockMatches.length + 1,
      matchdayId: Number(params['id']),
      homeTeamId: body.homeTeamId ?? 1,
      awayTeamId: body.awayTeamId ?? 2,
      homeTeam,
      awayTeam,
      kickoffTime: body.kickoffTime ?? new Date().toISOString(),
      status: 'SCHEDULED',
    };
    mockMatches.push(newMatch);
    return HttpResponse.json(newMatch, { status: 201 });
  }),
];
