import { Localized } from './i18n';

export type Role = 'applicant' | 'reviewer' | 'approver' | 'admin';

export const ROLES: readonly Role[] = ['applicant', 'reviewer', 'approver', 'admin'];

export interface User {
  id: string;
  name: Localized;
  email: string;
  role: Role;
  department?: string;
}
