import {
  AppNotification,
  AuditEvent,
  RequestType,
  ServiceRequest,
  User,
} from '@moamala/shared/models';
import { createSeedRequests } from './seed-requests';
import { SEED_REQUEST_TYPES } from './seed-request-types';
import { SEED_USERS } from './seed-users';

export interface DbState {
  users: User[];
  requestTypes: RequestType[];
  requests: ServiceRequest[];
  audit: AuditEvent[];
  notifications: AppNotification[];
  seq: number;
}

const STORAGE_KEY = 'moamala.mockDb.v1';
const CHANNEL_NAME = 'moamala.mockDb';

function createSeed(): DbState {
  const now = new Date();
  const users = structuredClone(SEED_USERS);
  const requestTypes = structuredClone(SEED_REQUEST_TYPES);
  const { requests, audit, notifications } = createSeedRequests(requestTypes, users, now);
  return { users, requestTypes, requests, audit, notifications, seq: 1000 };
}

/**
 * In-memory database persisted to localStorage. Every tab keeps its own copy;
 * a BroadcastChannel tells the other tabs to reload after a write.
 */
class MockDb {
  private state: DbState;
  private readonly channel =
    typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME);

  constructor() {
    this.state = this.load() ?? this.seed();
    this.channel?.addEventListener('message', () => {
      this.state = this.load() ?? this.state;
    });
  }

  get users(): User[] {
    return this.state.users;
  }

  get requestTypes(): RequestType[] {
    return this.state.requestTypes;
  }

  get requests(): ServiceRequest[] {
    return this.state.requests;
  }

  get audit(): AuditEvent[] {
    return this.state.audit;
  }

  get notifications(): AppNotification[] {
    return this.state.notifications;
  }

  nextId(prefix: string): string {
    this.state.seq += 1;
    return `${prefix}-${this.state.seq}`;
  }

  nextSeq(): number {
    this.state.seq += 1;
    return this.state.seq;
  }

  /** Call after every mutation. */
  commit(): void {
    this.save();
    this.channel?.postMessage('changed');
  }

  reset(): void {
    this.state = this.seed();
    this.channel?.postMessage('changed');
  }

  private seed(): DbState {
    const state = createSeed();
    this.state = state;
    this.save();
    return state;
  }

  private load(): DbState | null {
    try {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as DbState) : null;
    } catch {
      return null;
    }
  }

  private save(): void {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}

export const db = new MockDb();
