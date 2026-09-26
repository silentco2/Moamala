import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { RequestType } from '@moamala/shared/models';
import { TypeListPage } from './type-list-page';

const type = (id: string, en: string) =>
  ({
    id,
    key: id,
    name: { en, ar: en },
    fields: [],
    steps: [],
    active: true,
    version: 1,
  }) as unknown as RequestType;

describe('TypeListPage', () => {
  it('T4.1 lists every request type with a link to the designer', async () => {
    TestBed.configureTestingModule({
      imports: [TranslocoTestingModule.forRoot({ langs: { en: {}, ar: {} } })],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(TypeListPage);
    fixture.detectChanges();
    TestBed.tick();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/request-types')
      .flush([type('rt-a', 'Alpha Type'), type('rt-b', 'Beta Type')]);
    await fixture.whenStable();
    const rows = Array.from(
      fixture.nativeElement.querySelectorAll('[data-testid="type-row"]'),
    ) as HTMLElement[];
    expect(rows.length).toBe(2);
    expect(rows[1].getAttribute('href')).toBe('/admin/types/rt-b');
  });
});
