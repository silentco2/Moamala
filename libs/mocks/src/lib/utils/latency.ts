import { delay, http } from 'msw';
import { apiError } from './responses';

const MIN_LATENCY_MS = 200;
const MAX_LATENCY_MS = 800;

/** `localStorage.mockChaos = '0.1'` makes ~10% of API calls fail with a 500. */
function chaosRate(): number {
  const rate = Number(globalThis.localStorage?.getItem('mockChaos') ?? 0);
  return Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 1) : 0;
}

/**
 * Runs before every API handler: adds realistic latency and optional chaos.
 * Returning nothing lets MSW fall through to the matching handler.
 */
export const latencyHandler = http.all('/api/*', async ({ request }) => {
  await delay(MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS));
  const isDevEndpoint = new URL(request.url).pathname.startsWith('/api/dev/');
  if (!isDevEndpoint && Math.random() < chaosRate()) {
    return apiError(500, 'errors.server');
  }
  return undefined;
});
