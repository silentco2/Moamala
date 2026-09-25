import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Action, provideStore, Store } from '@ngrx/store';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { AuthStore } from '@moamala/core/auth';
import { INBOX_FEATURE_KEY, inboxReducer } from '@moamala/review/data-access';
import { RequestDetail, RequestType, ServiceRequest } from '@moamala/shared/models';
import { DecisionPanel } from './decision-panel';

const l = (en: string) => ({ en, ar: en });

function detail(assigneeId: string | null): RequestDetail {
  const request = {
    id: 'req-5',
    refNo: 'FX-5',
    typeId: 'rt-1',
    status: assigneeId ? 'in_review' : 'submitted',
    currentStepId: 'step-2',
    assigneeId,
  } as ServiceRequest;
  const type = {
    id: 'rt-1',
    steps: [
      { id: 'step-1', name: l('First'), role: 'reviewer', slaHours: 1, actions: ['forward'] },
      { id: 'step-2', name: l('Fixture Approval'), role: 'approver', slaHours: 1, actions: ['approve', 'return', 'reject'] },
    ],
  } as unknown as RequestType;
  return { request, type, events: [], users: [] };
}

function render(assigneeId: string | null = 'u-me') {
  TestBed.configureTestingModule({
    imports: [
      TranslocoTestingModule.forRoot({
        langs: { en: { validation: { required: 'Required', minLength: 'Too short' } } },
        translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        preloadLangs: true,
      }),
    ],
    providers: [
      provideStore({ [INBOX_FEATURE_KEY]: inboxReducer }),
      { provide: AuthStore, useValue: { user: signal({ id: 'u-me' }) } },
    ],
  });
  const store = TestBed.inject(Store);
  const dispatch = vi.spyOn(store, 'dispatch');
  const fixture = TestBed.createComponent(DecisionPanel);
  fixture.componentRef.setInput('detail', detail(assigneeId));
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const choose = (action: string) => {
    (el.querySelector(`[data-testid="decision-option"][data-value="${action}"] input`) as HTMLInputElement).click();
    fixture.detectChanges();
  };
  const type = (text: string) => {
    const comment = el.querySelector('[data-testid="decision-comment"]') as HTMLTextAreaElement;
    comment.value = text;
    comment.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const submit = () => {
    (el.querySelector('[data-testid="decision-form"]') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };
  const decided = () =>
    dispatch.mock.calls
      .map(([action]) => action as unknown as Action)
      .filter((action) => action.type === '[Inbox] Decide');
  return { fixture, store, dispatch, el, choose, type, submit, decided };
}

describe('DecisionPanel', () => {
  it('T3.5 offers only the actions allowed at the current step', () => {
    const { el } = render();
    const options = Array.from(el.querySelectorAll('[data-testid="decision-option"]'));
    expect(options.map((option) => option.getAttribute('data-value'))).toEqual(['approve', 'return', 'reject']);
  });

  it('T3.5 requires a justification before rejecting', () => {
    const { choose, submit, decided, el } = render();
    choose('reject');
    submit();
    expect(decided()).toEqual([]);
    expect(el.querySelector('[data-testid="comment-error"]')?.textContent).toContain('Required');
  });

  it('T3.5 enforces the minimum justification length', () => {
    const { choose, type, submit, decided, el } = render();
    choose('approve');
    type('short');
    submit();
    expect(decided()).toEqual([]);
    expect(el.querySelector('[data-testid="comment-error"]')?.textContent).toContain('Too short');
  });

  it('T3.5 dispatches the decision when the form is valid', () => {
    const { choose, type, submit, decided } = render();
    choose('reject');
    type('Use is not permitted in this district');
    submit();
    expect(decided()).toEqual([
      expect.objectContaining({ requestId: 'req-5', action: 'reject', comment: 'Use is not permitted in this district' }),
    ]);
  });

  it('T3.5 shows validation errors returned by the API', () => {
    const { fixture, store, el, choose } = render();
    choose('approve');
    store.dispatch({ type: '[Inbox] Decide', requestId: 'req-5', action: 'approve', comment: 'x' } as Action);
    store.dispatch({
      type: '[Inbox] Decide Failure',
      requestId: 'req-5',
      error: { status: 422, message: 'errors.validation', fieldErrors: { comment: ['validation.minLength'] } },
    } as Action);
    fixture.detectChanges();
    el.querySelector('[data-testid="decision-comment"]')?.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="comment-error"]')?.textContent).toContain('Too short');
  });

  it('T3.5 lets the user claim an unclaimed request first', () => {
    const { el, dispatch } = render(null);
    expect(el.querySelector('[data-testid="decision-form"]')).toBeNull();
    (el.querySelector('[data-testid="claim"]') as HTMLButtonElement).click();
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: '[Inbox] Claim', requestId: 'req-5' }));
  });
});
