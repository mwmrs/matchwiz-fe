import { http, HttpResponse } from 'msw';
import { mockPredictions, mockMatches } from '../seed-data';
import type { Prediction } from '../../core/api/models';

export const predictionHandlers = [
  http.get('/api/matchdays/:id/predictions', ({ params, request }) => {
    const groupId = Number(new URL(request.url).searchParams.get('groupId'));
    const matchIds = mockMatches
      .filter((m) => m.matchdayId === Number(params['id']))
      .map((m) => m.id);
    const predictions = mockPredictions.filter(
      (p) => matchIds.includes(p.matchId) && p.groupId === groupId,
    );
    return HttpResponse.json(predictions);
  }),

  http.post('/api/matchdays/:id/predictions', async ({ request }) => {
    const groupId = Number(new URL(request.url).searchParams.get('groupId'));
    const body = await request.json() as Array<{ matchId: number; predictedHomeGoals: number; predictedAwayGoals: number }>;
    const saved: Prediction[] = body.map((item, i) => {
      const existing = mockPredictions.findIndex(
        (p) => p.matchId === item.matchId && p.groupId === groupId,
      );
      const prediction: Prediction = {
        id: existing >= 0 ? mockPredictions[existing].id : mockPredictions.length + i + 1,
        userId: 1,
        groupId,
        matchId: item.matchId,
        predictedHomeGoals: item.predictedHomeGoals,
        predictedAwayGoals: item.predictedAwayGoals,
        submittedAt: new Date().toISOString(),
      };
      if (existing >= 0) {
        mockPredictions[existing] = prediction;
      } else {
        mockPredictions.push(prediction);
      }
      return prediction;
    });
    return HttpResponse.json(saved);
  }),
];
