import { TestBed } from '@angular/core/testing';
import { SLA_TICK_MS, SlaBadge } from './sla-badge';

const HOUR = 3_600_000;

describe('SlaBadge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  function render(dueInMs: number) {
    const fixture = TestBed.createComponent(SlaBadge);
    fixture.componentRef.setInput('dueAt', new Date(Date.now() + dueInMs).toISOString());
    fixture.componentRef.setInput('warningHours', 12);
    fixture.detectChanges();
    const state = () => (fixture.nativeElement as HTMLElement).getAttribute('data-state');
    return { fixture, state };
  }

  it('T3.6 reports ok, warning and overdue states', () => {
    expect(render(20 * HOUR).state()).toBe('ok');
    expect(render(2 * HOUR).state()).toBe('warning');
    expect(render(-HOUR).state()).toBe('overdue');
  });

  it('T3.6 moves to the next state as time passes', () => {
    const { fixture, state } = render(12 * HOUR + SLA_TICK_MS / 2);
    expect(state()).toBe('ok');
    vi.advanceTimersByTime(SLA_TICK_MS);
    fixture.detectChanges();
    expect(state()).toBe('warning');
  });

  it('T3.6 shows the remaining time', () => {
    const { fixture } = render(3 * HOUR + 20 * 60_000);
    const time = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="sla-time"]');
    expect(time?.textContent?.trim()).toBe('3h 20m');
  });

  it('T3.6 stops its timer when destroyed', () => {
    const { fixture, state } = render(5 * HOUR);
    expect(state()).toBe('warning');
    const before = vi.getTimerCount();
    fixture.destroy();
    expect(vi.getTimerCount()).toBeLessThan(before);
  });
});
