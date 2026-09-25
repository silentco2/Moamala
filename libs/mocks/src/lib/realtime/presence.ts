/** requestId -> clientId -> userId, stored in localStorage so every tab sees the same map. */
type PresenceMap = Record<string, Record<string, string>>;

const STORAGE_KEY = 'moamala.mockPresence';

function read(): PresenceMap {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) ?? '{}') as PresenceMap;
  } catch {
    return {};
  }
}

function write(map: PresenceMap): void {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(map));
}

const viewersOf = (map: PresenceMap, requestId: string) => [
  ...new Set(Object.values(map[requestId] ?? {})),
];

export function presenceJoin(requestId: string, clientId: string, userId: string): string[] {
  const map = read();
  map[requestId] = { ...map[requestId], [clientId]: userId };
  write(map);
  return viewersOf(map, requestId);
}

export function presenceLeave(requestId: string, clientId: string): string[] {
  const map = read();
  const { [clientId]: _removed, ...rest } = map[requestId] ?? {};
  map[requestId] = rest;
  write(map);
  return viewersOf(map, requestId);
}

/** Removes a disconnected client everywhere; returns the updated viewer list per request. */
export function leaveAll(clientId: string): [string, string[]][] {
  const map = read();
  const affected = Object.keys(map).filter((requestId) => clientId in map[requestId]);
  affected.forEach((requestId) => {
    const { [clientId]: _removed, ...rest } = map[requestId];
    map[requestId] = rest;
  });
  write(map);
  return affected.map((requestId) => [requestId, viewersOf(map, requestId)]);
}
