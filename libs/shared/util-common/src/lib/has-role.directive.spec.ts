import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Role } from '@moamala/shared/models';
import { HasRole } from './has-role.directive';
import { CURRENT_ROLE } from './tokens';

@Component({
  imports: [HasRole],
  template: `
    <p *moHasRole="'admin'" data-testid="admin-only">admin</p>
    <p *moHasRole="['reviewer', 'approver']" data-testid="staff-only">staff</p>
  `,
})
class Host {}

describe('HasRole', () => {
  const role = signal<Role | null>(null);

  function render() {
    TestBed.configureTestingModule({ providers: [{ provide: CURRENT_ROLE, useValue: role }] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return fixture;
  }

  const query = (fixture: ReturnType<typeof render>, id: string) =>
    (fixture.nativeElement as HTMLElement).querySelector(`[data-testid="${id}"]`);

  it('T1.6 renders the template only for an allowed role', () => {
    role.set('admin');
    const fixture = render();
    expect(query(fixture, 'admin-only')).not.toBeNull();
    expect(query(fixture, 'staff-only')).toBeNull();
  });

  it('T1.6 accepts a list of roles', () => {
    role.set('approver');
    const fixture = render();
    expect(query(fixture, 'staff-only')).not.toBeNull();
    expect(query(fixture, 'admin-only')).toBeNull();
  });

  it('T1.6 reacts to role changes without duplicating the view', () => {
    role.set(null);
    const fixture = render();
    expect(query(fixture, 'admin-only')).toBeNull();

    role.set('admin');
    fixture.detectChanges();
    role.set('admin');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-testid="admin-only"]').length).toBe(1);

    role.set('applicant');
    fixture.detectChanges();
    expect(query(fixture, 'admin-only')).toBeNull();
  });
});
