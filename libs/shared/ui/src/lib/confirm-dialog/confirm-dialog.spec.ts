import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';

const DATA: ConfirmDialogData = {
  title: 'Discard draft?',
  message: 'Your edits will be lost.',
  confirmLabel: 'Discard',
  cancelLabel: 'Keep editing',
};

describe('ConfirmDialog', () => {
  async function open() {
    const ref = TestBed.inject(MatDialog).open<ConfirmDialog, ConfirmDialogData, boolean>(
      ConfirmDialog,
      { data: DATA },
    );
    ref.componentRef?.changeDetectorRef.detectChanges();
    await Promise.resolve();
    const root = ref.componentRef?.location.nativeElement as HTMLElement;
    const query = (id: string) => root.querySelector(`[data-testid="${id}"]`) as HTMLElement;
    return { ref, query };
  }

  afterEach(() => TestBed.inject(MatDialog).closeAll());

  it('T2.3 renders the injected texts', async () => {
    const { query } = await open();
    expect(query('confirm-title').textContent?.trim()).toBe(DATA.title);
    expect(query('confirm-message').textContent?.trim()).toBe(DATA.message);
    expect(query('confirm-ok').textContent?.trim()).toBe(DATA.confirmLabel);
    expect(query('confirm-cancel').textContent?.trim()).toBe(DATA.cancelLabel);
  });

  it('T2.3 closes with true on confirm and false on cancel', async () => {
    const first = await open();
    const confirmed = firstValueFrom(first.ref.afterClosed());
    first.query('confirm-ok').click();
    expect(await confirmed).toBe(true);

    const second = await open();
    const cancelled = firstValueFrom(second.ref.afterClosed());
    second.query('confirm-cancel').click();
    expect(await cancelled).toBe(false);
  });
});
