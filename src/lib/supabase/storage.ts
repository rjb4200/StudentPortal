import { createClient } from './client';

const BUCKET_NAME = 'onboarding-assets';

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const IMAGE_MAX_SIZE = 5 * 1024 * 1024;

const DOC_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const DOC_MAX_SIZE = 10 * 1024 * 1024;

export function getPublicUrl(path: string) {
  return createClient().storage.from(BUCKET_NAME).getPublicUrl(path).data.publicUrl;
}

export async function uploadQuizPhoto(file: File) {
  if (!IMAGE_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF.');
  }
  if (file.size > IMAGE_MAX_SIZE) {
    throw new Error('File too large. Maximum size: 5MB.');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const path = `quiz-photos/${filename}`;

  const { error } = await createClient().storage.from(BUCKET_NAME).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  return getPublicUrl(path);
}

export async function uploadResourceDoc(file: File) {
  if (!DOC_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: PDF, DOC, DOCX, TXT.');
  }
  if (file.size > DOC_MAX_SIZE) {
    throw new Error('File too large. Maximum size: 10MB.');
  }

  const ext = file.name.split('.').pop() || 'pdf';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const path = `resource-docs/${filename}`;

  const { error } = await createClient().storage.from(BUCKET_NAME).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  return getPublicUrl(path);
}
