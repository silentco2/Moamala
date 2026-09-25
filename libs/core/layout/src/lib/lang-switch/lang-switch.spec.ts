import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LanguageService } from '@moamala/core/i18n';
import { Lang } from '@moamala/shared/models';
import { LangSwitch } from './lang-switch';

describe('LangSwitch', () => {
  function render(current: Lang) {
    const language = { lang: signal<Lang>(current), use: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: LanguageService, useValue: language }] });
    const fixture = TestBed.createComponent(LangSwitch);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('[data-testid="lang-switch"]') as HTMLElement;
    return { fixture, language, button };
  }

  it('T1.5 switches to the other language on click', () => {
    const { button, language } = render('en');
    button.click();
    expect(language.use).toHaveBeenCalledWith('ar');
  });

  it('T1.5 labels the button with the target language', () => {
    const { button } = render('ar');
    expect(button.textContent).toContain('English');
    expect(button.getAttribute('lang')).toBe('en');
  });
});
