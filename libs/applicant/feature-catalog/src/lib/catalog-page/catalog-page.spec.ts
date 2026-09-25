import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { RequestType } from '@moamala/shared/models';
import { CatalogPage } from './catalog-page';

const typeOf = (id: string, en: string): RequestType => ({
  id,
  key: id,
  name: { en, ar: `${en} ar` },
  description: { en: `${en} description`, ar: '' },
  sections: [],
  fields: [],
  steps: [],
  active: true,
  version: 1,
});

const TYPES = [typeOf('t1', 'Alpha Licence'), typeOf('t2', 'Beta Permit'), typeOf('t3', 'Gamma Permit')];

async function render() {
  TestBed.configureTestingModule({
    imports: [TranslocoTestingModule.forRoot({ langs: { en: {}, ar: {} } })],
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
  const httpMock = TestBed.inject(HttpTestingController);
  const fixture = TestBed.createComponent(CatalogPage);
  fixture.detectChanges();
  TestBed.tick();
  const el = fixture.nativeElement as HTMLElement;
  const query = (id: string) => el.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
  const all = (id: string) => Array.from(el.querySelectorAll(`[data-testid="${id}"]`)) as HTMLElement[];
  const flush = async (body: unknown, opts?: { status: number; statusText: string }) => {
    httpMock.expectOne('/api/request-types?active=true').flush(body, opts);
    await fixture.whenStable();
  };
  return { fixture, query, all, flush, httpMock };
}

describe('CatalogPage', () => {
  it('T2.1 shows a loading state until the catalog arrives', async () => {
    const { query, flush } = await render();
    expect(query('catalog-loading')).not.toBeNull();
    await flush(TYPES);
    expect(query('catalog-loading')).toBeNull();
  });

  it('T2.1 renders one card per request type', async () => {
    const { all, flush } = await render();
    await flush(TYPES);
    expect(all('service-name').map((el) => el.textContent?.trim())).toEqual([
      'Alpha Licence',
      'Beta Permit',
      'Gamma Permit',
    ]);
  });

  it('T2.1 links each card to a new request for its type', async () => {
    const { all, flush } = await render();
    await flush(TYPES);
    expect(all('service-start')[1].getAttribute('href')).toBe('/applicant/requests/new?typeId=t2');
  });

  it('T2.1 filters the cards by search text', async () => {
    const { all, query, flush, fixture } = await render();
    await flush(TYPES);
    const search = query('catalog-search') as HTMLInputElement;
    search.value = 'permit';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(all('service-card').length).toBe(2);
  });

  it('T2.1 shows the empty state when nothing matches', async () => {
    const { query, flush } = await render();
    await flush([]);
    expect(query('empty-state')).not.toBeNull();
    expect(query('service-card')).toBeNull();
  });

  it('T2.1 shows an error with a working retry button', async () => {
    const { query, flush, httpMock, fixture } = await render();
    await flush({ status: 500, message: 'errors.server' }, { status: 500, statusText: 'Error' });
    expect(query('catalog-error')).not.toBeNull();
    query('catalog-retry')?.click();
    TestBed.tick();
    httpMock.expectOne('/api/request-types?active=true').flush(TYPES);
    await fixture.whenStable();
    expect(query('catalog-error')).toBeNull();
  });
});
