import { http, HttpResponse } from 'msw';
import { mockRankings } from '../seed-data';

export const rankingHandlers = [
  http.get('/api/groups/:id/rankings', () => {
    return HttpResponse.json(mockRankings);
  }),
];
