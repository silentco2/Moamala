import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { RequestType } from '@moamala/shared/models';
import { TypeDesignerPage } from './type-designer-page';

const l = (en: string) => ({ en, ar: `${en} ar` });

const EXISTING: RequestType = {
  id: 'rt-1',
  key: 'fixture_type',
  name: l('Fixture type'),
  description: l('Fixture description'),
  sections: [{ id: 'main', title: l('Main') }],
  fields: [
    { key: 'alpha', type: 'text', section: 'main', label: l('Alpha'), required: true },
    { key: 'beta', type: 'number', section: 'main', label: l('Beta'), min: 1, max: 5 },
  ],
  steps: [{ id: 'review', name: l('Review'), role: 'reviewer', slaHours: 24, actions: ['forward', 'reject'] }],
  active: true,
  version: 2,
};

function render(id?: string) {
  TestBed.configureTestingModule({
    imports: [
      TranslocoTestingModule.forRoot({
        langs: { en: { validation: { keyTaken: 'Key already taken' } } },
        translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        preloadLangs: true,
      }),
    ],
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
  vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  const httpMock = TestBed.inject(HttpTestingController);
  const fixture = TestBed.createComponent(TypeDesignerPage);
  if (id) fixture.componentRef.setInput('id', id);
  fixture.detectChanges();
  TestBed.tick();
  const el = fixture.nativeElement as HTMLElement;
  const all = (testId: string) => Array.from(el.querySelectorAll(`[data-testid="${testId}"]`)) as HTMLElement[];
  const click = (testId: string, index = 0) => {
    all(testId)[index].click();
    fixture.detectChanges();
  };
  const type = (input: HTMLInputElement, value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const fieldKeys = () => all('field-key').map((input) => (input as HTMLInputElement).value);
  const flushAvailability = (available: boolean) =>
    httpMock
      .match((req) => req.url === '/api/request-types/key-availability')
      .forEach((req) => req.flush({ key: req.request.params.get('key'), available }));
  return { fixture, el, all, click, type, fieldKeys, httpMock, flushAvailability };
}

describe('TypeDesignerPage', () => {
  afterEach(() => vi.useRealTimers());

  it('T4.1 starts a new type with one section, one field and one step', () => {
    const { all } = render();
    expect(all('section-row').length).toBe(1);
    expect(all('field-row').length).toBe(1);
    expect(all('step-row').length).toBe(1);
  });

  it('T4.1 adds and removes field rows', () => {
    const { all, click } = render();
    click('add-field');
    click('add-field');
    expect(all('field-row').length).toBe(3);
    click('remove-field', 0);
    expect(all('field-row').length).toBe(2);
    click('add-step');
    expect(all('step-row').length).toBe(2);
  });

  it('T4.1 reorders fields by drag and drop', () => {
    const { fixture, all, click, type, fieldKeys } = render();
    click('add-field');
    type(all('field-key')[0] as HTMLInputElement, 'first');
    type(all('field-key')[1] as HTMLInputElement, 'second');
    fixture.debugElement
      .query(By.css('[data-testid="fields-list"]'))
      .triggerEventHandler('cdkDropListDropped', { previousIndex: 0, currentIndex: 1 });
    fixture.detectChanges();
    expect(fieldKeys()).toEqual(['second', 'first']);
  });

  it('T4.1 loads an existing type into the form', async () => {
    const { fixture, all, fieldKeys, httpMock } = render('rt-1');
    httpMock.expectOne('/api/request-types/rt-1').flush(EXISTING);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fieldKeys()).toEqual(['alpha', 'beta']);
    expect(all('step-row').length).toBe(1);
    expect((all('type-key')[0] as HTMLInputElement).value).toBe('fixture_type');
  });

  it('T4.1 saves an existing type with PUT', async () => {
    vi.useFakeTimers();
    const { fixture, click, httpMock, flushAvailability } = render('rt-1');
    httpMock.expectOne('/api/request-types/rt-1').flush(EXISTING);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(1000);
    flushAvailability(true);
    fixture.detectChanges();
    click('save-type');
    const req = httpMock.expectOne('/api/request-types/rt-1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toMatchObject({ key: 'fixture_type', fields: [{ key: 'alpha' }, { key: 'beta' }] });
  });

  it('T4.3 reports a key that is already taken', async () => {
    vi.useFakeTimers();
    const { fixture, all, type, flushAvailability, el } = render();
    const key = all('type-key')[0] as HTMLInputElement;
    type(key, 'building_permit');
    key.dispatchEvent(new Event('blur'));
    await vi.advanceTimersByTimeAsync(1000);
    flushAvailability(false);
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="key-error"]')?.textContent).toContain('Key already taken');
  });

  it('T4.4 previews the designed form live', () => {
    const { all, type } = render();
    const labelEn = all('field-row')[0].querySelector('[data-testid="localized-en"]') as HTMLInputElement;
    type(all('field-key')[0] as HTMLInputElement, 'previewField');
    type(labelEn, 'Preview Label');
    const preview = all('preview')[0];
    expect(preview.querySelector('[data-key="previewField"]')?.textContent).toContain('Preview Label');
  });
});
