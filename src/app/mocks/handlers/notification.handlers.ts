import { http, HttpResponse } from 'msw';
import { mockNotifications } from '../seed-data';

export const notificationHandlers = [
  http.get('/api/notifications', () => {
    return HttpResponse.json(mockNotifications);
  }),

  http.patch('/api/notifications/:id/read', ({ params }) => {
    const notification = mockNotifications.find((n) => n.id === Number(params['id']));
    if (!notification) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    notification.read = true;
    return HttpResponse.json(notification);
  }),
];
