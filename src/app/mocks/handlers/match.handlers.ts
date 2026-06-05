import { http, HttpResponse } from 'msw';
import { mockMatches, mockTeams } from '../seed-data';
import type { Match } from '../../core/api/models';

export const matchHandlers = [
  http.patch('/api/matches/:id', async ({ params, request }) => {
    const match = mockMatches.find((m) => m.id === Number(params['id']));
    if (!match) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const updates = await request.json() as Partial<Match>;
    Object.assign(match, updates);
    if (updates.homeTeamId) match.homeTeam = mockTeams.find((t) => t.id === updates.homeTeamId);
    if (updates.awayTeamId) match.awayTeam = mockTeams.find((t) => t.id === updates.awayTeamId);
    return HttpResponse.json(match);
  }),
];
