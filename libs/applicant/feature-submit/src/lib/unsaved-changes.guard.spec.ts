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
  it('T2.3 lets the user leave when nothing is unsaved', async () => {
    const { result, dialog } = run({ hasUnsavedChanges: () => false }, false);
    expect(await resolve(result)).toBe(true);
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('T2.3 asks for confirmation when there are unsaved changes', async () => {
    const { result, dialog } = run({ hasUnsavedChanges: () => true }, false);
    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(await resolve(result)).toBe(false);
  });

  it('T2.3 leaves when the user confirms', async () => {
    const { result } = run({ hasUnsavedChanges: () => true }, true);
    expect(await resolve(result)).toBe(true);
  });

  it('T2.3 stays when the dialog is dismissed', async () => {
    const { result } = run({ hasUnsavedChanges: () => true }, undefined);
    expect(await resolve(result)).toBe(false);
  });
});
