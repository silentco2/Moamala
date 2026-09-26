import { delay, http, HttpResponse } from 'msw';
import { Attachment, UPLOAD_ALLOWED_MIME, UPLOAD_MAX_BYTES } from '@moamala/shared/models';
import { db } from '../db/db';
import { requireUser } from '../utils/auth';
import { unprocessable } from '../utils/responses';

/** Extra delay on top of the global latency so upload progress is visible. */
const UPLOAD_DELAY_MS = 1500;

export const uploadHandlers = [
  http.post('/api/uploads', async ({ request }) => {
    const user = requireUser(request, ['applicant']);
    if (user instanceof Response) return user;
    const file = (await request.formData()).get('file');
    if (!(file instanceof File)) return unprocessable({ file: ['validation.required'] });
    if (file.size > UPLOAD_MAX_BYTES) return unprocessable({ file: ['validation.fileSize'] });
    if (!UPLOAD_ALLOWED_MIME.includes(file.type)) {
      return unprocessable({ file: ['validation.fileType'] });
    }
    await delay(UPLOAD_DELAY_MS);
    const id = db.nextId('att');
    db.commit();
    return HttpResponse.json<Attachment>(
      { id, name: file.name, size: file.size, mime: file.type, url: `/api/uploads/${id}` },
      { status: 201 },
    );
  }),

  http.get('/api/uploads/:id', () =>
    HttpResponse.text('Mock file content', { headers: { 'Content-Type': 'text/plain' } }),
  ),
];
