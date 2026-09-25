import { http } from 'msw';
import { db } from '../db/db';
import { noContent } from '../utils/responses';

export const devHandlers = [
  http.post('/api/dev/reset', () => {
    db.reset();
    return noContent();
  }),
];
