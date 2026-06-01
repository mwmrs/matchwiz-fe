import { http, HttpResponse } from 'msw';
import { mockUsers } from '../seed-data';

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    const user = mockUsers.find((u) => u.username === body.username);
    if (!user || body.password !== 'password') {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    return HttpResponse.json({
      token: `mock-jwt-token-${user.id}`,
      user,
    });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as { username: string; password: string; email?: string };
    const exists = mockUsers.find((u) => u.username === body.username);
    if (exists) {
      return HttpResponse.json({ message: 'Username already taken' }, { status: 409 });
    }
    const newUser = {
      id: mockUsers.length + 1,
      username: body.username,
      email: body.email,
      emailVerified: false,
      preferredLanguage: 'en',
      timezone: 'Europe/Berlin',
      theme: 'DARK' as const,
      twoFactorEnabled: false,
      emailNotifications: false,
      matchdayReminders: false,
      globalRole: 'USER' as const,
      active: false,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return HttpResponse.json(newUser, { status: 201 });
  }),
];
