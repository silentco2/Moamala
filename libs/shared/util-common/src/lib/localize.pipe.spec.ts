import { LocalizePipe } from './localize.pipe';

describe('LocalizePipe', () => {
  const pipe = new LocalizePipe();

  it('T1.5 returns the value for the requested language', () => {
    expect(pipe.transform({ en: 'Permit', ar: 'تصريح' }, 'ar')).toBe('تصريح');
    expect(pipe.transform({ en: 'Permit', ar: 'تصريح' }, 'en')).toBe('Permit');
  });

  it('T1.5 falls back to English when the translation is empty', () => {
    expect(pipe.transform({ en: 'Permit', ar: '' }, 'ar')).toBe('Permit');
  });

  it('T1.5 returns an empty string for a missing value', () => {
    expect(pipe.transform(null, 'en')).toBe('');
    expect(pipe.transform({ en: 'Permit', ar: 'تصريح' }, 'en')).not.toBe('');
  });
});
