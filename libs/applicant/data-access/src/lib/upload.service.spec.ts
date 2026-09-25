import { HttpEventType, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Attachment } from '@moamala/shared/models';
import { UploadProgress, UploadService } from './upload.service';

const file = new File(['%PDF'], 'plan.pdf', { type: 'application/pdf' });
const attachment: Attachment = {
  id: 'att-9',
  name: 'plan.pdf',
  size: 4,
  mime: 'application/pdf',
  url: '/api/uploads/att-9',
};

describe('UploadService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }),
  );

  it('T2.4 posts the file as multipart form data', () => {
    TestBed.inject(UploadService).upload(file).subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne('/api/uploads');
    expect(req.request.method).toBe('POST');
    expect((req.request.body as FormData).get('file')).toBe(file);
    expect(req.request.reportProgress).toBe(true);
  });

  it('T2.4 reports progress and the uploaded attachment', () => {
    const events: UploadProgress[] = [];
    TestBed.inject(UploadService)
      .upload(file)
      .subscribe((event) => events.push(event));
    const req = TestBed.inject(HttpTestingController).expectOne('/api/uploads');
    req.event({ type: HttpEventType.Sent });
    req.event({ type: HttpEventType.UploadProgress, loaded: 1, total: 3 });
    req.flush(attachment);
    expect(events).toEqual([
      { state: 'progress', percent: 33 },
      { state: 'done', attachment },
    ]);
  });

  it('T2.4 cancels the request when unsubscribed', () => {
    const subscription = TestBed.inject(UploadService).upload(file).subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne('/api/uploads');
    subscription.unsubscribe();
    expect(req.cancelled).toBe(true);
  });
});
