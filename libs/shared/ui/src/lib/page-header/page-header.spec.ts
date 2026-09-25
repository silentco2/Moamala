import { TestBed } from '@angular/core/testing';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  function render(inputs: Record<string, string>) {
    const fixture = TestBed.createComponent(PageHeader);
    Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return (id: string) => el.querySelector(`[data-testid="${id}"]`);
  }

  it('T2.1 renders the heading and subtitle inputs', () => {
    const query = render({ heading: 'Inbox', subtitle: 'Requests waiting for you' });
    expect(query('page-heading')?.textContent?.trim()).toBe('Inbox');
    expect(query('page-subtitle')?.textContent?.trim()).toBe('Requests waiting for you');
  });

  it('T2.1 omits the subtitle when it is not provided', () => {
    const query = render({ heading: 'Inbox' });
    expect(query('page-subtitle')).toBeNull();
  });
});
