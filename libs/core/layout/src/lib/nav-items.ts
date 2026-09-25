import { Role } from '@moamala/shared/models';

export interface NavItem {
  /** Transloco key. */
  labelKey: string;
  icon: string;
  route: string;
  roles: readonly Role[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  { labelKey: 'nav.catalog', icon: 'storefront', route: '/applicant/catalog', roles: ['applicant'] },
  { labelKey: 'nav.myRequests', icon: 'description', route: '/applicant/requests', roles: ['applicant'] },
  { labelKey: 'nav.inbox', icon: 'inbox', route: '/review/inbox', roles: ['reviewer', 'approver'] },
  { labelKey: 'nav.types', icon: 'tune', route: '/admin/types', roles: ['admin'] },
  { labelKey: 'nav.users', icon: 'group', route: '/admin/users', roles: ['admin'] },
  { labelKey: 'nav.reports', icon: 'insights', route: '/admin/reports', roles: ['admin'] },
  { labelKey: 'nav.audit', icon: 'history', route: '/admin/audit', roles: ['admin'] },
  {
    labelKey: 'nav.notifications',
    icon: 'notifications',
    route: '/notifications',
    roles: ['applicant', 'reviewer', 'approver', 'admin'],
  },
];
