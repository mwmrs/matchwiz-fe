import { http, HttpResponse } from 'msw';
import { mockUsers, mockMemberships } from '../seed-data';

export function getUserFromToken(request: Request): typeof mockUsers[0] | null {
  const auth = request.headers.get('Authorization');
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  const match = token.match(/mock-jwt-token-(\d+)/);
  if (!match) return null;
  return mockUsers.find((u) => u.id === parseInt(match[1])) ?? null;
}

export const userHandlers = [
  http.get('/api/users', () => {
    return HttpResponse.json(mockUsers);
  }),

  http.post('/api/users/:id/approve', ({ params }) => {
    const user = mockUsers.find((u) => u.id === Number(params['id']));
    if (!user) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    user.active = true;
    return HttpResponse.json(user);
  }),

  http.get('/api/users/me', ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json(user);
  }),

  http.get('/api/users/me/memberships', ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const memberships = mockMemberships.filter((m) => m.userId === user.id);
    return HttpResponse.json(memberships);
  }),

  http.patch('/api/users/me', async ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const updates = await request.json() as Partial<typeof mockUsers[0]>;
    Object.assign(user, updates);
    return HttpResponse.json(user);
  }),
];
