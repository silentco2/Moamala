import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { AuditEvent, Page, RequestType } from '@moamala/shared/models';
import { AuditLogPage } from './audit-log-page';

const TYPES = [
  { id: 'rt-1', steps: [{ id: 's1' }, { id: 's2' }] },
  { id: 'rt-2', steps: [{ id: 'x1' }] },
] as unknown as RequestType[];

const page = (count: number, total: number, pageNumber = 1): Page<AuditEvent> => ({
  items: Array.from({ length: count }, (_, index) => ({
    id: `e-${pageNumber}-${index}`,
    requestId: 'req-1',
    actorId: 'u-1',
    action: 'approved',
    at: '2026-01-01T00:00:00Z',
  })),
  total,
  page: pageNumber,
  pageSize: 50,
});

function render() {
  TestBed.configureTestingModule({
    imports: [TranslocoTestingModule.forRoot({ langs: { en: {}, ar: {} } })],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  const httpMock = TestBed.inject(HttpTestingController);
  const fixture = TestBed.createComponent(AuditLogPage);
  fixture.detectChanges();
  TestBed.tick();
  httpMock.match('/api/request-types').forEach((req) => req.flush(TYPES));
  httpMock.match('/api/users').forEach((req) => req.flush([]));
  const auditRequests = (): TestRequest[] => httpMock.match((req) => req.url === '/api/audit');
  const refresh = () => {
    fixture.detectChanges();
    TestBed.tick();
  };
  return {
    fixture,
    httpMock,
    page: fixture.debugElement.componentInstance,
    auditRequests,
    refresh,
  };
}

describe('AuditLogPage', () => {
  it('T6.1 loads the first page of events', () => {
    const { fixture, auditRequests } = render();
    const [req] = auditRequests();
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('50');
    req.flush(page(50, 128));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-testid="audit-total"]')?.textContent,
    ).toContain('128');
  });

  it('T6.1 sends filters to the server and starts over at page 1', () => {
    const { page: instance, auditRequests, refresh } = render();
    auditRequests()[0].flush(page(50, 128));
    instance.action.set('approved');
    instance.actorId.set('u-rev-1');
    refresh();
    const last = auditRequests().at(-1);
    expect(last?.request.params.get('action')).toBe('approved');
    expect(last?.request.params.get('actorId')).toBe('u-rev-1');
    expect(last?.request.params.get('page')).toBe('1');
  });

  it('T6.1 appends the next page on loadMore()', () => {
    const { page: instance, auditRequests, refresh } = render();
    auditRequests()[0].flush(page(50, 60));
    instance.loadMore();
    refresh();
    const [next] = auditRequests();
    expect(next.request.params.get('page')).toBe('2');
    next.flush(page(10, 60, 2));
    expect(instance.events().length).toBe(60);
  });

  it('T6.1 resets the step filter when the request type changes', () => {
    const { page: instance } = render();
    instance.typeId.set('rt-1');
    instance.stepId.set('s2');
    expect(instance.stepId()).toBe('s2');
    instance.typeId.set('rt-2');
    expect(instance.stepId()).toBeNull();
  });
});
