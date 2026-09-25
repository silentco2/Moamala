import { UPLOAD_ALLOWED_MIME, UPLOAD_MAX_BYTES } from '@moamala/shared/models';

export type FileValidationError = 'fileSize' | 'fileType';

export interface FileRules {
  maxBytes: number;
  allowedMime: readonly string[];
}

export const DEFAULT_FILE_RULES: FileRules = {
  maxBytes: UPLOAD_MAX_BYTES,
  allowedMime: UPLOAD_ALLOWED_MIME,
};

// TODO(T2.4): return 'fileSize' when the file is larger than `rules.maxBytes`, 'fileType' when
//   its MIME type is not allowed, otherwise null. Check size first.
//   Hint: validate before uploading so the user gets instant feedback; the API enforces the same
//   limits and answers 422 if the client check is skipped.
//   Docs: https://developer.mozilla.org/docs/Web/API/File
export function validateFile(
  _file: File,
  _rules: FileRules = DEFAULT_FILE_RULES,
): FileValidationError | null {
  return null;
}
