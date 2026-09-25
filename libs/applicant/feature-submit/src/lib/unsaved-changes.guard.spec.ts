import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { firstValueFrom, isObservable, Observable, of } from 'rxjs';
import { HasUnsavedChanges, unsavedChangesGuard } from './unsaved-changes.guard';

function run(component: HasUnsavedChanges, dialogResult: boolean | undefined) {
  const dialog = { open: vi.fn(() => ({ afterClosed: () => of(dialogResult) })) };
  TestBed.configureTestingModule({
    imports: [TranslocoTestingModule.forRoot({ langs: { en: {} } })],
    providers: [{ provide: MatDialog, useValue: dialog }],
  });
  const result = TestBed.runInInjectionContext(() =>
    unsavedChangesGuard(
      component,
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
      {} as RouterStateSnapshot,
    ),
  );
  return { result, dialog };
}

const resolve = async (value: unknown) =>
  isObservable(value) ? firstValueFrom(value as Observable<boolean>) : value;

describe('unsavedChangesGuard', () => {
  it('T2.3 only asks for confirmation when there are unsaved changes', async () => {
    const clean = run({ hasUnsavedChanges: () => false }, false);
    expect(await resolve(clean.result)).toBe(true);
    expect(clean.dialog.open).not.toHaveBeenCalled();

    TestBed.resetTestingModule();
    const dirty = run({ hasUnsavedChanges: () => true }, false);
    expect(dirty.dialog.open).toHaveBeenCalledTimes(1);
    expect(await resolve(dirty.result)).toBe(false);
  });

  it('T2.3 resolves with the dialog result', async () => {
    const confirmed = run({ hasUnsavedChanges: () => true }, true);
    expect(await resolve(confirmed.result)).toBe(true);

    TestBed.resetTestingModule();
    const dismissed = run({ hasUnsavedChanges: () => true }, undefined);
    expect(await resolve(dismissed.result)).toBe(false);
  });
});
