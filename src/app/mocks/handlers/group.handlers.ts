import { http, HttpResponse } from 'msw';
import { mockGroups, mockMemberships } from '../seed-data';
import type { Group } from '../../core/api/models';

export const groupHandlers = [
  http.get('/api/groups', ({ request }) => {
    const url = new URL(request.url);
    const competitionId = url.searchParams.get('competitionId');
    const filtered = competitionId
      ? mockGroups.filter((g) => g.competitionId === Number(competitionId))
      : mockGroups;
    return HttpResponse.json(filtered);
  }),

  http.post('/api/groups', async ({ request }) => {
    const body = await request.json() as Partial<Group>;
    const newGroup: Group = {
      id: mockGroups.length + 1,
      competitionId: body.competitionId ?? 1,
      name: body.name ?? '',
      description: body.description,
    };
    mockGroups.push(newGroup);
    return HttpResponse.json(newGroup, { status: 201 });
  }),

  http.get('/api/groups/:id', ({ params }) => {
    const group = mockGroups.find((g) => g.id === Number(params['id']));
    if (!group) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(group);
  }),

  http.patch('/api/groups/:id', async ({ params, request }) => {
    const group = mockGroups.find((g) => g.id === Number(params['id']));
    if (!group) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const updates = await request.json() as Partial<Group>;
    Object.assign(group, updates);
    return HttpResponse.json(group);
  }),

  http.delete('/api/groups/:id', ({ params }) => {
    const idx = mockGroups.findIndex((g) => g.id === Number(params['id']));
    if (idx !== -1) mockGroups.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/groups/:id/members', ({ params }) => {
    const members = mockMemberships.filter((m) => m.groupId === Number(params['id']));
    return HttpResponse.json(members);
  }),

  http.delete('/api/groups/:id/members/:userId', ({ params }) => {
    const idx = mockMemberships.findIndex(
      (m) => m.groupId === Number(params['id']) && m.userId === Number(params['userId']),
    );
    if (idx !== -1) mockMemberships.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/groups/:id/members/:userId/approve', ({ params }) => {
    const member = mockMemberships.find(
      (m) => m.groupId === Number(params['id']) && m.userId === Number(params['userId']),
    );
    if (!member) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    member.approved = true;
    return HttpResponse.json(member);
  }),

  http.post('/api/groups/:id/invitations', async ({ params, request }) => {
    const body = await request.json() as { email: string };
    return HttpResponse.json(
      {
        id: 1,
        groupId: Number(params['id']),
        email: body.email,
        token: 'mock-token-' + Date.now(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { status: 201 },
    );
  }),
];
