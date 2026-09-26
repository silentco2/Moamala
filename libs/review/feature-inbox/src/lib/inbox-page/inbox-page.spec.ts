import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Action, provideStore, Store } from '@ngrx/store';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { INBOX_FEATURE_KEY, inboxReducer } from '@moamala/review/data-access';
import { ServiceRequest } from '@moamala/shared/models';
import { CURRENT_ROLE } from '@moamala/shared/util-common';
import { InboxPage } from './inbox-page';

const request = (id: string, assigneeId: string | null = null) =>
  ({
    id,
    refNo: `FX-${id}`,
    typeId: 'rt-1',
    status: assigneeId ? 'in_review' : 'submitted',
    currentStepId: 'step-1',
    assigneeId,
    dueAt: '2030-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
  }) as ServiceRequest;

function render() {
  TestBed.configureTestingModule({
    imports: [TranslocoTestingModule.forRoot({ langs: { en: {}, ar: {} } })],
    providers: [
      provideRouter([]),
      provideStore({ [INBOX_FEATURE_KEY]: inboxReducer }),
      { provide: CURRENT_ROLE, useValue: signal('approver') },
    ],
  });
  const store = TestBed.inject(Store);
  const dispatch = vi.spyOn(store, 'dispatch');
  const fixture = TestBed.createComponent(InboxPage);
  fixture.detectChanges();
  store.dispatch({
    type: '[Inbox] Load Inbox Success',
    requests: [request('a'), request('b'), request('c', 'u-other')],
  } as Action);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const all = (id: string) =>
    Array.from(el.querySelectorAll(`[data-testid="${id}"]`)) as HTMLElement[];
  return { fixture, dispatch, el, all };
}

describe('InboxPage', () => {
  it('T3.4 loads the inbox on init', () => {
    const { dispatch } = render();
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: '[Inbox] Load Inbox' }));
  });

  it('T3.4 renders a row per inbox request', () => {
    const { all } = render();
    const rows = all('inbox-row');
    expect(rows.length).toBe(3);
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('FX-a'),
      expect.stringContaining('FX-b'),
      expect.stringContaining('FX-c'),
    ]);
  });

  it('T3.4 claims unclaimed requests', () => {
    const { all, dispatch } = render();
    expect(all('claim').length).toBe(2);
    all('claim')[1].click();
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: '[Inbox] Claim', requestId: 'b' }),
    );
  });

  it('T3.4 bulk approves the selected requests with a justification', () => {
    const { fixture, all, dispatch, el } = render();
    all('select-row')[0].querySelector('input')?.click();
    all('select-row')[2].querySelector('input')?.click();
    fixture.detectChanges();

    const comment = el.querySelector('[data-testid="bulk-comment"]') as HTMLInputElement;
    comment.value = 'All documents verified';
    comment.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (el.querySelector('[data-testid="bulk-approve"]') as HTMLButtonElement).click();

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: '[Inbox] Bulk Decide',
        requestIds: ['a', 'c'],
        action: 'approve',
        comment: 'All documents verified',
      }),
    );
  });

  it('T3.4 hides the bulk bar until something is selected', () => {
    const { fixture, all, el } = render();
    expect(el.querySelector('[data-testid="bulk-bar"]')).toBeNull();
    all('select-row')[0].querySelector('input')?.click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="bulk-bar"]')).not.toBeNull();
  });
});
