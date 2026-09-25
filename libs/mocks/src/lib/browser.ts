import { setupWorker } from 'msw/browser';
import { db } from './db/db';
import { auditHandlers } from './handlers/audit.handlers';
import { authHandlers } from './handlers/auth.handlers';
import { devHandlers } from './handlers/dev.handlers';
import { notificationHandlers } from './handlers/notifications.handlers';
import { reportHandlers } from './handlers/reports.handlers';
import { requestTypeHandlers } from './handlers/request-types.handlers';
import { requestHandlers } from './handlers/requests.handlers';
import { uploadHandlers } from './handlers/uploads.handlers';
import { userHandlers } from './handlers/users.handlers';
import { realtimeHandler } from './realtime/realtime-link';
import { startSimulator } from './realtime/simulator';
import { latencyHandler } from './utils/latency';

export const handlers = [
  latencyHandler,
  ...devHandlers,
  ...authHandlers,
  ...requestTypeHandlers,
  ...requestHandlers,
  ...uploadHandlers,
  ...notificationHandlers,
  ...auditHandlers,
  ...userHandlers,
  ...reportHandlers,
  realtimeHandler,
];

declare global {
  interface Window {
    /** Dev helpers, available from the browser console. */
    moamalaMocks?: { reset(): void };
  }
}

/** Starts the MSW browser worker. Resolve before bootstrapping Angular. */
export async function startMockBackend(): Promise<void> {
  const worker = setupWorker(...handlers);
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  window.moamalaMocks = {
    reset: () => {
      db.reset();
      location.reload();
    },
  };
  startSimulator();
}
