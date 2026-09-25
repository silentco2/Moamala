import { validateFile } from './file-validation';

const fileOf = (size: number, type: string) => new File([new Uint8Array(size)], 'doc', { type });

describe('validateFile', () => {
  const rules = { maxBytes: 1000, allowedMime: ['application/pdf'] };

  it('T2.4 accepts an allowed file within the size limit', () => {
    expect(validateFile(fileOf(1000, 'application/pdf'), rules)).toBeNull();
    expect(validateFile(fileOf(10, 'text/plain'), rules)).not.toBeNull();
  });

  it('T2.4 rejects files over the size limit', () => {
    expect(validateFile(fileOf(1001, 'application/pdf'), rules)).toBe('fileSize');
  });

  it('T2.4 rejects unsupported MIME types', () => {
    expect(validateFile(fileOf(10, 'image/gif'), rules)).toBe('fileType');
  });

  it('T2.4 reports size before type', () => {
    expect(validateFile(fileOf(2000, 'image/gif'), rules)).toBe('fileSize');
  });
});
