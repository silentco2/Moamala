import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReportSummary } from '@moamala/shared/models';
import { ReportsModule } from '../reports.module';
import { REPORTS_REFRESH_MS, ReportsPage } from './reports-page';

const SUMMARY: ReportSummary = {
  totals: { draft: 1, submitted: 2, in_review: 3, returned: 4, approved: 17, rejected: 5 },
  byType: [
    { typeId: 'rt-a', count: 9, avgHoursToDecision: 12 },
    { typeId: 'rt-b', count: 4, avgHoursToDecision: 30 },
  ],
  slaBreaches: 6,
  generatedAt: '2026-01-01T10:00:00Z',
};

function render() {
  TestBed.configureTestingModule({
    imports: [ReportsModule],
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
  const httpMock = TestBed.inject(HttpTestingController);
  const fixture = TestBed.createComponent(ReportsPage);
  fixture.detectChanges();
  return { fixture, httpMock, el: fixture.nativeElement as HTMLElement };
}

describe('ReportsPage (legacy module)', () => {
  afterEach(() => vi.useRealTimers());

  it('T4.6 renders the summary with the async pipe', () => {
    const { fixture, httpMock, el } = render();
    httpMock.expectOne('/api/reports/summary').flush(SUMMARY);
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="report-total-approved"]')?.textContent).toContain('17');
    expect(el.querySelector('[data-testid="report-sla-breaches"]')?.textContent).toContain('6');
    expect(el.querySelectorAll('[data-testid="report-type-row"]').length).toBe(2);
  });

  it('T4.6 refreshes on an interval and stops after destroy', async () => {
    vi.useFakeTimers();
    const { fixture, httpMock } = render();
    httpMock.expectOne('/api/reports/summary').flush(SUMMARY);
    await vi.advanceTimersByTimeAsync(REPORTS_REFRESH_MS);
    httpMock.expectOne('/api/reports/summary').flush(SUMMARY);
    fixture.destroy();
    await vi.advanceTimersByTimeAsync(REPORTS_REFRESH_MS * 3);
    httpMock.expectNone('/api/reports/summary');
  });
});
