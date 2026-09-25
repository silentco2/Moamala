import { Role, User } from '@moamala/shared/models';
import { db } from '../db/db';
import { forbidden, unauthorized } from './responses';

const TOKEN_TTL_MS = 8 * 3_600_000;

interface TokenPayload {
  sub: string;
  role: Role;
  exp: number;
}

const encode = (value: object) =>
  btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

const decode = (segment: string): unknown =>
  JSON.parse(atob(segment.replace(/-/g, '+').replace(/_/g, '/')));

/** Issues an unsigned JWT-shaped token. Good enough for a mock, never for production. */
export function issueToken(user: User): string {
  const payload: TokenPayload = { sub: user.id, role: user.role, exp: Date.now() + TOKEN_TTL_MS };
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.mock`;
}

export function userFromToken(token: string | null | undefined): User | null {
  if (!token) return null;
  try {
    const payload = decode(token.split('.')[1] ?? '') as TokenPayload;
    if (payload.exp < Date.now()) return null;
    return db.users.find((user) => user.id === payload.sub) ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolves the caller from the `Authorization: Bearer <token>` header.
 * Returns the user, or a 401/403 response the handler should return as-is.
 */
export function requireUser(request: Request, roles?: readonly Role[]): User | Response {
  const header = request.headers.get('Authorization') ?? '';
  const user = userFromToken(header.startsWith('Bearer ') ? header.slice(7) : null);
  if (!user) return unauthorized();
  if (roles && !roles.includes(user.role)) return forbidden();
  return user;
}

export const STAFF_ROLES: readonly Role[] = ['reviewer', 'approver', 'admin'];
