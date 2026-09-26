import { SlaCountdownPipe } from './sla-countdown.pipe';

describe('SlaCountdownPipe', () => {
  const pipe = new SlaCountdownPipe();
  const now = Date.parse('2026-03-01T12:00:00Z');
  const inMinutes = (minutes: number) => new Date(now + minutes * 60_000).toISOString();

  it('T2.5 formats durations longer than a day as days and hours', () => {
    expect(pipe.transform(inMinutes(2 * 24 * 60 + 4 * 60 + 30), now)).toBe('2d 4h');
  });

  it('T2.5 formats durations under a day as hours and minutes', () => {
    expect(pipe.transform(inMinutes(3 * 60 + 20), now)).toBe('3h 20m');
  });

  it('T2.5 formats durations under an hour as minutes', () => {
    expect(pipe.transform(inMinutes(45), now)).toBe('45m');
    expect(pipe.transform(inMinutes(0.5), now)).toBe('0m');
  });

  it('T2.5 prefixes overdue durations with a minus sign', () => {
    expect(pipe.transform(inMinutes(-(5 * 60 + 10)), now)).toBe('-5h 10m');
  });

  it('T2.5 returns an empty string without a due date', () => {
    expect(pipe.transform(undefined, now)).toBe('');
    expect(pipe.transform(inMinutes(90), now)).not.toBe('');
  });
});
