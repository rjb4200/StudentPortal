import { z } from 'zod';

export const emailSchema = z.string().email().max(255).trim().toLowerCase();
export const uuidSchema = z.string().uuid();
export const nameSchema = z.string().trim().min(1).max(100);
export const phoneSchema = z.string().trim().max(30).regex(/^[\d\s\-\(\)\+\.]{7,30}$/, 'Invalid phone number format');
export const textSchema = (maxLen: number) => z.string().trim().max(maxLen);

export const legalSignatureBody = z.object({
  studentId: uuidSchema,
  fullName: nameSchema,
  agreedDocumentIds: z.array(uuidSchema).min(1),
});

export const createAuthUserBody = z.object({
  email: emailSchema,
  password: z.string().min(6).max(128),
});

export const deleteStudentBody = z.object({
  studentId: uuidSchema,
});

export const scheduleCancelBody = z.object({
  scheduleId: uuidSchema,
  note: textSchema(500).optional(),
});

export const scheduleActionBody = z.object({
  scheduleId: uuidSchema,
  action: z.enum(['approved', 'rejected', 'cancelled']),
  note: textSchema(500).optional(),
});
