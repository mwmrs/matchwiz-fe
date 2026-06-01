import { http, HttpResponse } from 'msw';
import { mockUsers } from '../seed-data';

function getUserFromToken(request: Request): typeof mockUsers[0] | null {
  const auth = request.headers.get('Authorization');
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  const match = token.match(/mock-jwt-token-(\d+)/);
  if (!match) return null;
  return mockUsers.find((u) => u.id === parseInt(match[1])) ?? null;
}

export const userHandlers = [
  http.get('/api/users/me', ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json(user);
  }),

  http.patch('/api/users/me', async ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const updates = await request.json() as Partial<typeof mockUsers[0]>;
    Object.assign(user, updates);
    return HttpResponse.json(user);
  }),
];
