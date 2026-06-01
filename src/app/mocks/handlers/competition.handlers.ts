import { http, HttpResponse } from 'msw';
import { mockCompetitions } from '../seed-data';
import type { Competition } from '../../core/api/models';

export const competitionHandlers = [
  http.get('/api/competitions', () => {
    return HttpResponse.json(mockCompetitions);
  }),

  http.post('/api/competitions', async ({ request }) => {
    const body = await request.json() as Partial<Competition>;
    const newComp: Competition = {
      id: mockCompetitions.length + 1,
      name: body.name ?? '',
      season: body.season ?? '',
      status: 'DRAFT',
      startDate: body.startDate,
      endDate: body.endDate,
    };
    mockCompetitions.push(newComp);
    return HttpResponse.json(newComp, { status: 201 });
  }),

  http.get('/api/competitions/:id', ({ params }) => {
    const comp = mockCompetitions.find((c) => c.id === Number(params['id']));
    if (!comp) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(comp);
  }),

  http.patch('/api/competitions/:id', async ({ params, request }) => {
    const comp = mockCompetitions.find((c) => c.id === Number(params['id']));
    if (!comp) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const updates = await request.json() as Partial<Competition>;
    Object.assign(comp, updates);
    return HttpResponse.json(comp);
  }),

  http.get('/api/competitions/:id/scoring-rules', ({ params }) => {
    return HttpResponse.json({
      competitionId: Number(params['id']),
      exactResultPoints: 5,
      goalDifferencePoints: 3,
      tendencyPoints: 2,
    });
  }),

  http.put('/api/competitions/:id/scoring-rules', async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({ competitionId: Number(params['id']), ...body as object });
  }),
];
