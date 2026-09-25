import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { ApplicantStore, UploadService } from '@moamala/applicant/data-access';
import { RequestType, ServiceRequest } from '@moamala/shared/models';
import { EMPTY } from 'rxjs';
import { AUTOSAVE_DEBOUNCE_MS, SubmitPage } from './submit-page';

const draft = {
  id: 'req-1',
  refNo: 'FX-1',
  typeId: 'rt-1',
  status: 'draft',
  data: { fullName: 'Saved Name' },
  attachments: [],
} as unknown as ServiceRequest;

const type = {
  id: 'rt-1',
  name: { en: 'Fixture', ar: 'Fixture' },
  sections: [{ id: 's', title: { en: 'S', ar: 'S' } }],
  fields: [{ key: 'fullName', type: 'text', section: 's', label: { en: 'Name', ar: 'Name' } }],
  steps: [],
} as unknown as RequestType;

function render(inputs: Record<string, string>) {
  const store = {
    draft: signal<ServiceRequest | null>(draft),
    draftType: signal<RequestType | null>(type),
    savingDraft: signal(false),
    savedAt: signal<string | null>(null),
    openDraft: vi.fn(() => Promise.resolve()),
    saveDraft: vi.fn(),
    submit: vi.fn(),
    addAttachment: vi.fn(),
    removeAttachment: vi.fn(),
  };
  TestBed.configureTestingModule({
    imports: [TranslocoTestingModule.forRoot({ langs: { en: {}, ar: {} } })],
    providers: [
      provideRouter([]),
      { provide: ApplicantStore, useValue: store },
      { provide: UploadService, useValue: { upload: () => EMPTY } },
    ],
  });
  const fixture = TestBed.createComponent(SubmitPage);
  Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
  fixture.detectChanges();
  TestBed.tick();
  return { fixture, store, page: fixture.debugElement.componentInstance };
}

describe('SubmitPage', () => {
  afterEach(() => vi.useRealTimers());

  it('T2.3 opens the draft for the route params', () => {
    const { store } = render({ id: 'req-1' });
    expect(store.openDraft).toHaveBeenCalledWith({ requestId: 'req-1', typeId: undefined });
  });

  it('T2.3 opens a new draft for a type', () => {
    const { store } = render({ typeId: 'rt-1' });
    expect(store.openDraft).toHaveBeenCalledWith({ requestId: undefined, typeId: 'rt-1' });
  });

  it('T2.3 starts from the saved draft data', () => {
    const { page } = render({ id: 'req-1' });
    expect(page.formValue()).toEqual({ fullName: 'Saved Name' });
  });

  it('T2.3 autosaves once after the user stops typing', async () => {
    vi.useFakeTimers();
    const { page, store } = render({ id: 'req-1' });
    page.formValue.set({ fullName: 'Om' });
    TestBed.tick();
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS / 2);
    page.formValue.set({ fullName: 'Omar' });
    TestBed.tick();
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
    expect(store.saveDraft).toHaveBeenCalledTimes(1);
    expect(store.saveDraft).toHaveBeenCalledWith({ fullName: 'Omar' });
  });

  it('T2.3 reports unsaved changes', () => {
    const { page } = render({ id: 'req-1' });
    expect(page.hasUnsavedChanges()).toBe(false);
    page.formValue.set({ fullName: 'Changed' });
    expect(page.hasUnsavedChanges()).toBe(true);
  });
});
