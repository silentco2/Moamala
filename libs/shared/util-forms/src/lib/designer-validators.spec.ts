import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import {
  fieldKeyValidator,
  minMaxValidator,
  typeKeyValidator,
  uniqueKeyValidator,
} from './designer-validators';

describe('designer validators', () => {
  afterEach(() => vi.useRealTimers());

  it('T4.3 typeKeyValidator accepts snake_case keys only', () => {
    expect(typeKeyValidator(new FormControl('building_permit'))).toBeNull();
    expect(typeKeyValidator(new FormControl('Building-Permit'))).toEqual({ typeKey: true });
    expect(typeKeyValidator(new FormControl(''))).toBeNull();
  });

  it('T4.3 fieldKeyValidator accepts camelCase keys only', () => {
    expect(fieldKeyValidator(new FormControl('ownerName'))).toBeNull();
    expect(fieldKeyValidator(new FormControl('owner_name'))).toEqual({ fieldKey: true });
  });

  it('T4.3 minMaxValidator flags min greater than max on the group', () => {
    const group = new FormGroup(
      { min: new FormControl<number | null>(5), max: new FormControl<number | null>(2) },
      { validators: minMaxValidator },
    );
    expect(group.errors).toEqual({ minMax: true });
    group.controls.max.setValue(null);
    expect(group.errors).toBeNull();
  });

  it('T4.3 uniqueKeyValidator reports taken keys after the debounce', async () => {
    vi.useFakeTimers();
    const isAvailable = vi.fn((key: string) => of(key !== 'taken'));
    const control = new FormControl('', { asyncValidators: uniqueKeyValidator(isAvailable, 300) });

    control.setValue('tak');
    control.setValue('taken');
    expect(control.status).toBe('PENDING');
    await vi.advanceTimersByTimeAsync(300);

    expect(isAvailable).toHaveBeenCalledTimes(1);
    expect(isAvailable).toHaveBeenCalledWith('taken');
    expect(control.errors).toEqual({ keyTaken: true });
  });
});
