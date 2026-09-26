import { TestBed } from '@angular/core/testing';
import { StatusChip } from './status-chip';

describe('StatusChip', () => {
  it('T2.5 reflects the status input on the host element', () => {
    const fixture = TestBed.createComponent(StatusChip);
    fixture.componentRef.setInput('status', 'approved');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).getAttribute('data-status')).toBe('approved');

    fixture.componentRef.setInput('status', 'rejected');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).getAttribute('data-status')).toBe('rejected');
  });
});
