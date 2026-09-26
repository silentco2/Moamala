import { TestBed } from '@angular/core/testing';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { LANG_STORAGE_KEY, LanguageService } from './language.service';

describe('LanguageService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', 'en');
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ar: {} },
          translocoConfig: { availableLangs: ['en', 'ar'], defaultLang: 'en' },
        }),
      ],
    });
  });

  it('T1.5 switches the lang and dir signals', () => {
    const service = TestBed.inject(LanguageService);
    service.use('ar');
    expect(service.lang()).toBe('ar');
    expect(service.dir()).toBe('rtl');
    service.use('en');
    expect(service.dir()).toBe('ltr');
  });

  it('T1.5 sets dir and lang on the <html> element', () => {
    TestBed.inject(LanguageService).use('ar');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('lang')).toBe('ar');
  });

  it('T1.5 activates the language in Transloco', () => {
    TestBed.inject(LanguageService).use('ar');
    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('ar');
  });

  it('T1.5 persists the choice', () => {
    TestBed.inject(LanguageService).use('ar');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('ar');
  });

  it('T1.5 restores the persisted language', () => {
    localStorage.setItem(LANG_STORAGE_KEY, 'ar');
    const service = TestBed.inject(LanguageService);
    service.restore();
    expect(service.lang()).toBe('ar');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  });
});
