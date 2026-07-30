export const MAX_FILE_SIZE = 15 * 1024 * 1024;
export const MAX_IMAGE_SIDE = 6000;
export const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

export interface ApiError {
  error: string;
  code?: string;
}
export interface ProcessingStatus {
  status: 'processing' | 'complete' | 'error';
  message?: string;
}
