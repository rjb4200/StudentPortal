import { describe, expect, it } from 'vitest';
import {
  adminRegistryUpsertBody,
  classDateRangeSchema,
  deleteStudentBody,
  instructorRegistrationBody,
  maintenancePurgeBody,
  onboardingRegistrationWithClassBody,
  scheduleCreateBody,
} from '@/lib/validation';

const uuid = '11111111-1111-4111-8111-111111111111';

describe('classDateRangeSchema', () => {
  it('accepts inclusive class date ranges', () => {
    expect(classDateRangeSchema.safeParse({ classStartDate: '2026-07-01', rideTimeEndDate: '2026-07-01' }).success).toBe(true);
  });

  it('rejects ride-time end before class start', () => {
    expect(classDateRangeSchema.safeParse({ classStartDate: '2026-07-02', rideTimeEndDate: '2026-07-01' }).success).toBe(false);
  });
});

describe('onboardingRegistrationWithClassBody', () => {
  it('requires a valid training class id', () => {
    expect(onboardingRegistrationWithClassBody.safeParse({
      fullName: 'Student One',
      email: 'student@example.com',
      phone: '',
      schoolName: '',
      instructorName: '',
      instructorContact: '',
      trainingClassId: uuid,
    }).success).toBe(true);

    expect(onboardingRegistrationWithClassBody.safeParse({
      fullName: 'Student One',
      email: 'student@example.com',
      phone: '',
      schoolName: '',
      instructorName: '',
      instructorContact: '',
      trainingClassId: 'bad-id',
    }).success).toBe(false);
  });
});

describe('instructorRegistrationBody', () => {
  const valid = {
    instructor: {
      mode: 'new' as const,
      firstName: 'Jane',
      lastName: 'Instructor',
      email: 'jane@example.com',
      mobilePhone: '859-555-1212',
      businessPhone: '',
      credentials: 'Paramedic Instructor',
      title: 'Coordinator',
      preferredContactMethod: 'email',
      preferredContactHours: 'Weekdays',
      contactInstructions: '',
    },
    site: {
      mode: 'new' as const,
      name: 'Site A',
      organizationName: 'School A',
      address: '1 Main St',
      city: 'Winchester',
      state: 'KY',
      zipCode: '40391',
      mainPhone: '',
    },
    class: {
      name: 'Summer Cohort',
      classStartDate: '2026-07-01',
      rideTimeEndDate: '2026-08-01',
      notes: '',
    },
    mou: {
      effectiveDate: '2026-06-15',
      trainingOrganizationName: 'School A',
      representativeName: 'Jane Instructor',
      representativeTitle: 'Coordinator',
      representativeSignature: 'Jane Instructor',
      mouBodySnapshot: 'This is the MOU body text for the test.',
    },
  };

  it('accepts valid instructor registrations', () => {
    expect(instructorRegistrationBody.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid class windows', () => {
    expect(instructorRegistrationBody.safeParse({
      ...valid,
      class: { ...valid.class, rideTimeEndDate: '2026-06-30' },
    }).success).toBe(false);
  });
});

describe('scheduleCreateBody', () => {
  it('validates schedule creation input', () => {
    expect(scheduleCreateBody.safeParse({ date: '2026-07-01', shiftType: 'full', startTime: '7:00 AM', endTime: '7:00 AM' }).success).toBe(true);
    expect(scheduleCreateBody.safeParse({ date: '07/01/2026', shiftType: 'full', startTime: '7:00 AM', endTime: '7:00 AM' }).success).toBe(false);
  });
});

describe('adminRegistryUpsertBody', () => {
  it('validates training class upserts and date windows', () => {
    expect(adminRegistryUpsertBody.safeParse({
      table: 'training_classes',
      data: {
        trainingSiteId: uuid,
        instructorId: uuid,
        name: 'Class A',
        classStartDate: '2026-07-01',
        rideTimeEndDate: '2026-08-01',
        notes: '',
      },
    }).success).toBe(true);

    expect(adminRegistryUpsertBody.safeParse({
      table: 'training_classes',
      data: {
        trainingSiteId: uuid,
        instructorId: uuid,
        name: 'Class A',
        classStartDate: '2026-08-01',
        rideTimeEndDate: '2026-07-01',
        notes: '',
      },
    }).success).toBe(false);
  });
});

describe('maintenance safety validation', () => {
  it('requires deliberate purge confirmation and reason', () => {
    expect(maintenancePurgeBody.safeParse({
      exportConfirmed: true,
      dryRunReviewed: true,
      confirmation: 'PURGE STUDENT DATA',
      reason: 'End of cohort cleanup after export.',
    }).success).toBe(true);

    expect(maintenancePurgeBody.safeParse({
      exportConfirmed: true,
      dryRunReviewed: true,
      confirmation: 'PURGE',
      reason: 'End of cohort cleanup after export.',
    }).success).toBe(false);

    expect(maintenancePurgeBody.safeParse({
      exportConfirmed: true,
      dryRunReviewed: true,
      confirmation: 'PURGE STUDENT DATA',
      reason: '',
    }).success).toBe(false);
  });

  it('accepts reason-aware abandoned registration deletion payloads', () => {
    expect(deleteStudentBody.safeParse({
      studentId: uuid,
      context: 'abandoned-registration',
      reason: 'Duplicate incomplete registration.',
    }).success).toBe(true);

    expect(deleteStudentBody.safeParse({
      studentId: uuid,
      context: 'unexpected-context',
      reason: 'Duplicate incomplete registration.',
    }).success).toBe(false);
  });
});
