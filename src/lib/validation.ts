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

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD date format');

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

export const instructorRegistrationBody = z.object({
  instructor: z.object({
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
  }),
  site: z.object({
    name: textSchema(160).min(1),
    organizationName: textSchema(160).min(1),
    address: textSchema(200).min(1),
    city: textSchema(100).min(1),
    state: textSchema(40).min(1),
    zipCode: textSchema(20).min(1),
    mainPhone: optionalTextSchema(30),
  }),
  class: z.object({
    name: textSchema(160).min(1),
    classStartDate: dateOnlySchema,
    rideTimeEndDate: dateOnlySchema,
    notes: optionalTextSchema(1000),
  }),
}).refine((value) => value.class.rideTimeEndDate >= value.class.classStartDate, {
  message: 'Ride-time end date must be on or after class start date',
  path: ['class', 'rideTimeEndDate'],
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
    data: z.object({
      name: textSchema(160).min(1),
      organizationName: textSchema(160).min(1),
      address: textSchema(200).min(1),
      city: textSchema(100).min(1),
      state: textSchema(40).min(1),
      zipCode: textSchema(20).min(1),
      mainPhone: optionalTextSchema(30),
      status: z.enum(['pending', 'active', 'rejected', 'suspended', 'archived']).optional(),
    }),
  }),
  z.object({
    table: z.literal('instructors'),
    id: uuidSchema.optional(),
    data: z.object({
      trainingSiteId: uuidSchema.optional().or(z.literal('')),
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
  startTime: textSchema(20).min(1),
  endTime: textSchema(20).min(1),
});
