import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { FileDropzone } from './file-dropzone';

const pdf = new File(['%PDF'], 'plan.pdf', { type: 'application/pdf' });

function dragEvent(type: string, files: File[] = []): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { files } });
  return event;
}

function render(disabled = false) {
  const fixture = TestBed.createComponent(FileDropzone);
  fixture.componentRef.setInput('disabled', disabled);
  fixture.detectChanges();
  const emitted: File[][] = [];
  const output = fixture.debugElement.componentInstance.filesSelected as Observable<File[]>;
  output.subscribe((files) => emitted.push(files));
  const zone = fixture.nativeElement.querySelector('[data-testid="dropzone"]') as HTMLElement;
  return { fixture, emitted, zone };
}

const input = (fixture: ComponentFixture<FileDropzone>) =>
  fixture.nativeElement.querySelector('[data-testid="dropzone-input"]') as HTMLInputElement;

describe('FileDropzone', () => {
  it('T2.4 emits dropped files', () => {
    const { zone, emitted } = render();
    zone.dispatchEvent(dragEvent('drop', [pdf]));
    expect(emitted).toEqual([[pdf]]);
  });

  it('T2.4 emits files picked through the file input', () => {
    const { fixture, emitted } = render();
    Object.defineProperty(input(fixture), 'files', { value: [pdf] });
    input(fixture).dispatchEvent(new Event('change'));
    expect(emitted).toEqual([[pdf]]);
  });

  it('T2.4 highlights while a file is dragged over', () => {
    const { fixture, zone } = render();
    zone.dispatchEvent(dragEvent('dragover'));
    fixture.detectChanges();
    expect(zone.classList).toContain('file-dropzone--active');
    zone.dispatchEvent(dragEvent('dragleave'));
    fixture.detectChanges();
    expect(zone.classList).not.toContain('file-dropzone--active');
  });

  it('T2.4 ignores drops while disabled', () => {
    const { zone, emitted } = render(true);
    zone.dispatchEvent(dragEvent('drop', [pdf]));
    expect(emitted).toEqual([]);
  });
});
