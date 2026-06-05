import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth.handlers';
import { userHandlers } from './handlers/user.handlers';
import { competitionHandlers } from './handlers/competition.handlers';
import { groupHandlers } from './handlers/group.handlers';
import { matchdayHandlers } from './handlers/matchday.handlers';
import { predictionHandlers } from './handlers/prediction.handlers';
import { rankingHandlers } from './handlers/ranking.handlers';
import { notificationHandlers } from './handlers/notification.handlers';
import { teamHandlers } from './handlers/team.handlers';
import { matchHandlers } from './handlers/match.handlers';

export const worker = setupWorker(
  ...authHandlers,
  ...userHandlers,
  ...competitionHandlers,
  ...groupHandlers,
  ...matchdayHandlers,
  ...predictionHandlers,
  ...rankingHandlers,
  ...notificationHandlers,
  ...teamHandlers,
  ...matchHandlers,
);
