import { http, HttpResponse } from 'msw';
import { mockTeams } from '../seed-data';
import type { Team } from '../../core/api/models';

export const teamHandlers = [
  http.get('/api/teams', () => {
    return HttpResponse.json(mockTeams);
  }),

  http.post('/api/teams', async ({ request }) => {
    const body = await request.json() as Partial<Team>;
    const newTeam: Team = {
      id: mockTeams.length + 1,
      name: body.name ?? '',
      shortName: body.shortName ?? '',
      logoUrl: body.logoUrl,
    };
    mockTeams.push(newTeam);
    return HttpResponse.json(newTeam, { status: 201 });
  }),

  http.patch('/api/teams/:id', async ({ params, request }) => {
    const team = mockTeams.find((t) => t.id === Number(params['id']));
    if (!team) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const updates = await request.json() as Partial<Team>;
    Object.assign(team, updates);
    return HttpResponse.json(team);
  }),

  http.delete('/api/teams/:id', ({ params }) => {
    const idx = mockTeams.findIndex((t) => t.id === Number(params['id']));
    if (idx !== -1) mockTeams.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
