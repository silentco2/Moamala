import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { ApplicantStore } from '@moamala/applicant/data-access';
import { ServiceRequest } from '@moamala/shared/models';
import { MyRequestsPage } from './my-requests-page';

const request = (id: string, status: ServiceRequest['status']): ServiceRequest => ({
  id,
  refNo: `TST-${id}`,
  typeId: 'rt-1',
  applicantId: 'u-1',
  data: {},
  attachments: [],
  status,
  currentStepId: null,
  assigneeId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

function render(inputs: Record<string, unknown> = {}) {
  const store = {
    requests: signal([request('a', 'in_review'), request('b', 'returned')]),
    total: signal(12),
    loading: signal(false),
    loadMyRequests: vi.fn(),
  };
  TestBed.configureTestingModule({
    imports: [TranslocoTestingModule.forRoot({ langs: { en: {}, ar: {} } })],
    providers: [provideRouter([]), { provide: ApplicantStore, useValue: store }],
  });
  const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  const fixture = TestBed.createComponent(MyRequestsPage);
  Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
  fixture.detectChanges();
  TestBed.tick();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, store, navigate, el };
}

describe('MyRequestsPage', () => {
  it('T2.5 loads requests for the query params', () => {
    const { store } = render({ status: 'returned', page: 2, q: 'BP' });
    expect(store.loadMyRequests).toHaveBeenLastCalledWith({
      page: 2,
      pageSize: 10,
      status: 'returned',
      q: 'BP',
    });
  });

  it('T2.5 defaults to the first page', () => {
    const { store } = render();
    expect(store.loadMyRequests).toHaveBeenLastCalledWith({ page: 1, pageSize: 10 });
  });

  it('T2.5 reloads when the query params change', () => {
    const { fixture, store } = render({ status: 'draft' });
    fixture.componentRef.setInput('status', 'approved');
    fixture.detectChanges();
    TestBed.tick();
    expect(store.loadMyRequests).toHaveBeenLastCalledWith({ page: 1, pageSize: 10, status: 'approved' });
  });

  it('T2.5 renders one row per request', () => {
    const { el } = render();
    const rows = Array.from(el.querySelectorAll('[data-testid="request-row"]'));
    expect(rows.length).toBe(2);
    expect(rows[1].textContent).toContain('TST-b');
  });

  it('T2.5 changes the status filter through the URL and resets the page', () => {
    const { el, navigate } = render({ page: 3 });
    (el.querySelector('[data-testid="status-filter-returned"] button') as HTMLElement).click();
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { status: 'returned', page: 1 },
        queryParamsHandling: 'merge',
      }),
    );
  });

  it('T2.5 clears the status when "All" is selected', () => {
    const { el, navigate } = render({ status: 'draft' });
    (el.querySelector('[data-testid="status-filter-all"] button') as HTMLElement).click();
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({ queryParams: { status: null, page: 1 } }),
    );
  });

  it('T2.5 searches through the URL', () => {
    const { el, navigate } = render();
    const input = el.querySelector('[data-testid="search-input"]') as HTMLInputElement;
    input.value = 'CL-2026';
    input.dispatchEvent(new Event('input'));
    el.querySelector('[data-testid="search-form"]')?.dispatchEvent(new Event('submit'));
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({ queryParams: { q: 'CL-2026', page: 1 } }),
    );
  });
});
