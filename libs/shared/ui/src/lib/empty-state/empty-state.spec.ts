import { TestBed } from '@angular/core/testing';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('T2.1 renders the heading, message and icon inputs', () => {
    const fixture = TestBed.createComponent(EmptyState);
    fixture.componentRef.setInput('heading', 'No requests');
    fixture.componentRef.setInput('message', 'Start one from the catalog');
    fixture.componentRef.setInput('icon', 'search_off');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="empty-state-heading"]')?.textContent?.trim()).toBe(
      'No requests',
    );
    expect(el.querySelector('[data-testid="empty-state-message"]')?.textContent?.trim()).toBe(
      'Start one from the catalog',
    );
    expect(el.querySelector('mat-icon')?.textContent?.trim()).toBe('search_off');
  });
});
