import { TestBed } from '@angular/core/testing';
import { Timeline, TimelineItem } from './timeline';

const ITEMS: TimelineItem[] = [
  { id: '1', icon: 'add', title: 'Created', actor: 'Layla', at: '2026-01-01T08:00:00Z', tone: 'neutral' },
  {
    id: '2',
    icon: 'undo',
    title: 'Returned',
    actor: 'Khalid',
    at: '2026-01-02T08:00:00Z',
    comment: 'Missing deed',
    tone: 'warning',
  },
  { id: '3', icon: 'send', title: 'Resubmitted', actor: 'Layla', at: '2026-01-03T08:00:00Z', tone: 'neutral' },
];

describe('Timeline', () => {
  function render(items: TimelineItem[]) {
    const fixture = TestBed.createComponent(Timeline);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return (id: string) => Array.from(el.querySelectorAll(`[data-testid="${id}"]`));
  }

  it('T2.6 renders one entry per item in order', () => {
    const all = render(ITEMS);
    expect(all('timeline-title').map((el) => el.textContent?.trim())).toEqual([
      'Created',
      'Returned',
      'Resubmitted',
    ]);
  });

  it('T2.6 shows comments only for items that have one', () => {
    const all = render(ITEMS);
    const comments = all('timeline-comment');
    expect(comments.length).toBe(1);
    expect(comments[0].textContent?.trim()).toBe('Missing deed');
  });

  it('T2.6 renders nothing for an empty list', () => {
    expect(render([])('timeline-item').length).toBe(0);
  });
});
