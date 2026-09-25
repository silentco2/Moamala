import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { AuthStore } from '@moamala/core/auth';
import { RealtimeService } from '@moamala/core/realtime';
import {
  AuditEvent,
  RequestDetail,
  RequestStatus,
  RequestType,
  ServiceRequest,
} from '@moamala/shared/models';
import { CURRENT_ROLE } from '@moamala/shared/util-common';
import { NEVER } from 'rxjs';
import { RequestDetailPage } from './request-detail-page';

const l = (en: string) => ({ en, ar: en });

const TYPE: RequestType = {
  id: 'rt-1',
  key: 'test',
  name: l('Fixture Permit'),
  description: l(''),
  sections: [{ id: 's1', title: l('Fixture Section') }],
  fields: [
    { key: 'ownerName', type: 'text', section: 's1', label: l('Owner') },
    {
      key: 'district',
      type: 'select',
      section: 's1',
      label: l('District'),
      options: [{ value: 'north', label: l('Northern Fixture District') }],
    },
    {
      key: 'secret',
      type: 'text',
      section: 's1',
      label: l('Hidden'),
      visibleIf: { field: 'district', equals: 'south' },
    },
  ],
  steps: [
    { id: 'step-1', name: l('Fixture Step'), role: 'reviewer', slaHours: 24, actions: ['forward'] },
  ],
  active: true,
  version: 1,
};

function detail(status: RequestStatus, events: AuditEvent[] = []): RequestDetail {
  const request: ServiceRequest = {
    id: 'req-9',
    refNo: 'FX-2026-00009',
    typeId: 'rt-1',
    applicantId: 'u-app',
    data: { ownerName: 'Fixture Owner', district: 'north', secret: 'x' },
    attachments: [],
    status,
    currentStepId: status === 'in_review' ? 'step-1' : null,
    assigneeId: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  };
  return {
    request,
    type: TYPE,
    events,
    users: [{ id: 'u-rev', name: l('Fixture Reviewer'), email: 'r@test', role: 'reviewer' }],
  };
}

const event = (action: AuditEvent['action'], comment?: string): AuditEvent => ({
  id: `e-${action}`,
  requestId: 'req-9',
  actorId: 'u-rev',
  action,
  comment,
  at: '2026-01-02T00:00:00Z',
});

function render(value: RequestDetail) {
  TestBed.configureTestingModule({
    imports: [TranslocoTestingModule.forRoot({ langs: { en: {}, ar: {} } })],
    providers: [
      provideRouter([]),
      { provide: CURRENT_ROLE, useValue: signal('applicant') },
      { provide: AuthStore, useValue: { user: signal(null) } },
      { provide: RealtimeService, useValue: { send: vi.fn(), on: () => NEVER } },
    ],
  });
  const fixture = TestBed.createComponent(RequestDetailPage);
  fixture.componentRef.setInput('detail', value);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const query = (id: string) => el.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
  return { fixture, el, query };
}

describe('RequestDetailPage', () => {
  it('T2.6 shows the reference number and the localized type name', () => {
    const { query, el } = render(detail('submitted'));
    expect(query('detail-ref')?.textContent?.trim()).toBe('FX-2026-00009');
    expect(el.textContent).toContain('Fixture Permit');
  });

  it('T2.6 shows the returned banner with the reviewer comment and an edit link', () => {
    const { query } = render(
      detail('returned', [event('submitted'), event('returned', 'Fix the deed please')]),
    );
    expect(query('returned-banner')).not.toBeNull();
    expect(query('banner-comment')?.textContent?.trim()).toBe('Fix the deed please');
    expect(query('edit-request')?.getAttribute('href')).toBe('/applicant/requests/req-9/edit');
  });

  it('T2.6 switches the banner on status', () => {
    const { query } = render(detail('approved', [event('approved', 'Looks good')]));
    expect(query('approved-banner')).not.toBeNull();
    expect(query('returned-banner')).toBeNull();
  });

  it('T2.6 lists visible field values with display labels', () => {
    const { el } = render(detail('submitted'));
    const values = Array.from(el.querySelectorAll('[data-testid="field-value"]'));
    expect(values.map((node) => node.getAttribute('data-key'))).toEqual(['ownerName', 'district']);
    expect(values[1].textContent).toContain('Northern Fixture District');
  });

  it('T2.6 renders the audit trail in the timeline', () => {
    const { el } = render(
      detail('returned', [event('created'), event('submitted'), event('returned', 'x')]),
    );
    expect(el.querySelectorAll('[data-testid="timeline-item"]').length).toBe(3);
    expect(el.textContent).toContain('Fixture Reviewer');
  });
});
