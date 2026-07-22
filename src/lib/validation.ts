import { z } from 'zod';
import { STUDENT_SHIFT_TIME_OPTIONS, to24Hour } from '@/lib/time-formats';

export const emailSchema = z.string().email().max(255).trim().toLowerCase();
export const uuidSchema = z.string().uuid();
export const nameSchema = z.string().trim().min(1).max(100);
export const phoneSchema = z.string().trim().max(30).regex(/^[\d\s\-\(\)\+\.]{7,30}$/, 'Invalid phone number format');
export const textSchema = (maxLen: number) => z.string().trim().max(maxLen);
const optionalTextSchema = (maxLen: number) => z.string().trim().max(maxLen).optional().or(z.literal(''));

export const legalSignatureBody = z.object({
  studentId: uuidSchema,
  fullName: nameSchema,
  onboardingToken: z.string().min(32).max(256),
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
  role: z.enum(['admin', 'preceptor']),
});

const adminReasonSchema = textSchema(500).min(3, 'Reason must be at least 3 characters');

export const deleteStudentBody = z.object({
  studentId: uuidSchema,
  context: z.enum(['abandoned-registration']).optional(),
  reason: adminReasonSchema.optional(),
});

export const maintenancePurgeBody = z.object({
  exportConfirmed: z.literal(true, { error: 'Master export confirmation is required' }),
  dryRunReviewed: z.literal(true, { error: 'Dry-run review is required' }),
  confirmation: z.literal('PURGE STUDENT DATA', { error: 'Type PURGE STUDENT DATA to confirm' }),
  reason: adminReasonSchema,
});

export const scheduleCancelBody = z.object({
  scheduleId: uuidSchema,
  note: textSchema(500).optional(),
});

export const scheduleActionBody = z.object({
  scheduleId: uuidSchema,
  action: z.enum(['approved', 'rejected', 'cancelled', 'approved_and_blocked', 'rejected_and_blocked']),
  note: textSchema(500).optional(),
});

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD date format');

export const scheduleBlockBody = z.object({
  date: dateOnlySchema,
  reason: textSchema(500).optional().or(z.literal('')),
});

export const scheduleBlockRangeBody = z.object({
  startDate: dateOnlySchema,
  endDate: dateOnlySchema,
  reason: textSchema(500).optional().or(z.literal('')),
}).superRefine(({ startDate, endDate }, context) => {
  if (endDate < startDate) {
    context.addIssue({ code: 'custom', path: ['endDate'], message: 'End date must be on or after the start date.' });
    return;
  }

  const days = (Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86_400_000 + 1;
  if (days > 31) context.addIssue({ code: 'custom', path: ['endDate'], message: 'Schedule block ranges cannot exceed 31 days.' });
});

export const scheduleBlockDeleteBody = z.object({
  date: dateOnlySchema,
});

export const calendarFeedBody = z.object({
  feed_type: z.enum(['student', 'training_site', 'aggregate']),
  entity_id: uuidSchema.nullable().optional(),
});

export const calendarFeedEmailBody = z.object({
  feed_type: z.enum(['student', 'training_site', 'aggregate']),
  entity_id: uuidSchema.nullable().optional(),
  recipient: emailSchema,
});

export const messageBody = z.object({
  message: textSchema(2000).min(1, 'Message cannot be empty'),
});

export const adminMessageReplyBody = messageBody.extend({
  studentId: uuidSchema,
});

export const adminMessageThreadReadBody = z.object({
  studentId: uuidSchema,
});

export const classDateRangeSchema = z.object({
  classStartDate: dateOnlySchema,
  rideTimeEndDate: dateOnlySchema,
}).refine((value) => value.rideTimeEndDate >= value.classStartDate, {
  message: 'Ride-time end date must be on or after class start date',
  path: ['rideTimeEndDate'],
});

export const trainingClassSelectionBody = z.object({
  trainingClassId: uuidSchema,
});

export const onboardingRegistrationWithClassBody = onboardingRegistrationBody.extend({
  trainingClassId: uuidSchema,
});

const instructorDetailsSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  mobilePhone: phoneSchema,
  businessPhone: optionalTextSchema(30),
  credentials: textSchema(200).min(1),
  title: textSchema(120).min(1),
  preferredContactMethod: z.enum(['email', 'mobile_phone', 'business_phone']),
  preferredContactHours: textSchema(120).min(1),
  contactInstructions: optionalTextSchema(1000),
});

const trainingSiteDetailsSchema = z.object({
  name: textSchema(160).min(1),
  organizationName: textSchema(160).min(1),
  address: textSchema(200).min(1),
  city: textSchema(100).min(1),
  state: textSchema(40).min(1),
  zipCode: textSchema(20).min(1),
  mainPhone: optionalTextSchema(30),
});

const trainingClassDetailsSchema = z.object({
  name: textSchema(160).min(1),
  classStartDate: dateOnlySchema,
  rideTimeEndDate: dateOnlySchema,
  notes: optionalTextSchema(1000),
});

const mouSchema = z.object({
  effectiveDate: dateOnlySchema,
  trainingOrganizationName: textSchema(200).min(1),
  representativeName: textSchema(200).min(1),
  representativeTitle: textSchema(200).min(1),
  representativeSignature: textSchema(200).min(1),
  mouBodySnapshot: z.string().min(1),
});

export const instructorRegistrationBody = z.object({
  site: z.discriminatedUnion('mode', [
    z.object({ mode: z.literal('existing'), trainingSiteId: uuidSchema }),
    trainingSiteDetailsSchema.extend({ mode: z.literal('new') }),
  ]),
  instructor: z.discriminatedUnion('mode', [
    z.object({ mode: z.literal('existing'), instructorId: uuidSchema }),
    instructorDetailsSchema.extend({ mode: z.literal('new') }),
  ]),
  class: trainingClassDetailsSchema,
  mou: mouSchema,
}).refine((value) => value.class.rideTimeEndDate >= value.class.classStartDate, {
  message: 'Ride-time end date must be on or after class start date',
  path: ['class', 'rideTimeEndDate'],
}).refine((value) => !(value.site.mode === 'new' && value.instructor.mode === 'existing'), {
  message: 'Register a new instructor when registering a new TEI.',
  path: ['instructor'],
});

export const registryStatusBody = z.object({
  table: z.enum(['training_sites', 'instructors', 'training_classes']),
  id: uuidSchema,
  status: z.enum(['active', 'rejected', 'suspended', 'archived']),
});

export const adminRegistryUpsertBody = z.discriminatedUnion('table', [
  z.object({
    table: z.literal('training_sites'),
    id: uuidSchema.optional(),
    data: trainingSiteDetailsSchema.extend({
      status: z.enum(['pending', 'active', 'rejected', 'suspended', 'archived']).optional(),
    }),
  }),
  z.object({
    table: z.literal('instructors'),
    id: uuidSchema.optional(),
    data: instructorDetailsSchema.extend({
      trainingSiteId: uuidSchema,
      status: z.enum(['pending', 'active', 'rejected', 'suspended', 'archived']).optional(),
    }),
  }),
  z.object({
    table: z.literal('training_classes'),
    id: uuidSchema.optional(),
    data: z.object({
      trainingSiteId: uuidSchema,
      instructorId: uuidSchema,
      name: textSchema(160).min(1),
      level: optionalTextSchema(50),
      classStartDate: dateOnlySchema,
      rideTimeEndDate: dateOnlySchema,
      notes: optionalTextSchema(1000),
      status: z.enum(['pending', 'active', 'rejected', 'suspended', 'archived']).optional(),
    }).refine((value) => value.rideTimeEndDate >= value.classStartDate, {
      message: 'Ride-time end date must be on or after class start date',
      path: ['rideTimeEndDate'],
    }),
  }),
]);

export const scheduleCreateBody = z.object({
  date: dateOnlySchema,
  shiftType: z.enum(['full', 'day', 'custom']),
  startTime: z.string().refine((time) => STUDENT_SHIFT_TIME_OPTIONS.includes(time), 'Shift times must be between 7:00 AM and 10:00 PM'),
  endTime: z.string().refine((time) => STUDENT_SHIFT_TIME_OPTIONS.includes(time), 'Shift times must be between 7:00 AM and 10:00 PM'),
}).superRefine((value, ctx) => {
  const expected = value.shiftType === 'day'
    ? ['7:00 AM', '7:00 PM']
    : value.shiftType === 'full'
      ? ['7:00 AM', '10:00 PM']
      : null;
  if (expected && (value.startTime !== expected[0] || value.endTime !== expected[1])) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Preset shift times cannot be changed', path: ['startTime'] });
  }
  if (value.shiftType === 'custom' && to24Hour(value.endTime) <= to24Hour(value.startTime)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End time must be later than start time', path: ['endTime'] });
  }
});
