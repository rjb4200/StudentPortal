import { z } from 'zod';

export const emailSchema = z.string().email().max(255).trim().toLowerCase();
export const uuidSchema = z.string().uuid();
export const nameSchema = z.string().trim().min(1).max(100);
export const phoneSchema = z.string().trim().max(30).regex(/^[\d\s\-\(\)\+\.]{7,30}$/, 'Invalid phone number format');
export const textSchema = (maxLen: number) => z.string().trim().max(maxLen);
const optionalTextSchema = (maxLen: number) => z.string().trim().max(maxLen).optional().or(z.literal(''));

export const legalSignatureBody = z.object({
  studentId: uuidSchema,
  fullName: nameSchema,
  agreedDocumentIds: z.array(uuidSchema).min(1),
});

export const onboardingRegistrationBody = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: optionalTextSchema(30),
  schoolName: optionalTextSchema(100),
  instructorName: optionalTextSchema(100),
  instructorContact: optionalTextSchema(100),
});

export const onboardingCompleteBody = z.object({
  studentId: uuidSchema,
  onboardingToken: z.string().min(32).max(256),
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