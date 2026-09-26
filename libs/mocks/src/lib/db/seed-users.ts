import { User } from '@moamala/shared/models';

export const SEED_USERS: User[] = [
  {
    id: 'u-app-1',
    name: { en: 'Omar Haddad', ar: 'عمر حداد' },
    email: 'omar@applicant.demo',
    role: 'applicant',
  },
  {
    id: 'u-app-2',
    name: { en: 'Layla Nasser', ar: 'ليلى ناصر' },
    email: 'layla@applicant.demo',
    role: 'applicant',
  },
  {
    id: 'u-rev-1',
    name: { en: 'Sara Al-Mansouri', ar: 'سارة المنصوري' },
    email: 'sara@reviewer.demo',
    role: 'reviewer',
    department: 'Permits',
  },
  {
    id: 'u-rev-2',
    name: { en: 'Khalid Farouk', ar: 'خالد فاروق' },
    email: 'khalid@reviewer.demo',
    role: 'reviewer',
    department: 'Licensing',
  },
  {
    id: 'u-apr-1',
    name: { en: 'Mona Youssef', ar: 'منى يوسف' },
    email: 'mona@approver.demo',
    role: 'approver',
    department: 'Permits',
  },
  {
    id: 'u-apr-2',
    name: { en: 'Faisal Al-Qahtani', ar: 'فيصل القحطاني' },
    email: 'faisal@approver.demo',
    role: 'approver',
    department: 'Licensing',
  },
  {
    id: 'u-adm-1',
    name: { en: 'Huda Saleh', ar: 'هدى صالح' },
    email: 'huda@admin.demo',
    role: 'admin',
    department: 'Digital Services',
  },
  {
    id: 'u-adm-2',
    name: { en: 'Tariq Ibrahim', ar: 'طارق إبراهيم' },
    email: 'tariq@admin.demo',
    role: 'admin',
    department: 'Digital Services',
  },
];
