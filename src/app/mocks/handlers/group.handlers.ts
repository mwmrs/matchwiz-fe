import { http, HttpResponse } from 'msw';
import { mockGroups, mockMemberships } from '../seed-data';
import { getUserFromToken } from './user.handlers';
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

  http.post('/api/groups/:id/join', ({ params, request }) => {
    const user = getUserFromToken(request);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const groupId = Number(params['id']);
    const existing = mockMemberships.find((m) => m.groupId === groupId && m.userId === user.id);
    if (existing) return HttpResponse.json({ message: 'Already a member or request pending' }, { status: 409 });
    const membership = {
      id: mockMemberships.length + 1,
      groupId,
      userId: user.id,
      username: user.username,
      role: 'MEMBER' as const,
      approved: false,
      joinedAt: new Date().toISOString(),
    };
    mockMemberships.push(membership);
    return HttpResponse.json(membership, { status: 201 });
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
];
