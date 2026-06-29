import { describe, expect, it } from 'vitest';
import {
  adminRegistryUpsertBody,
  classDateRangeSchema,
  instructorRegistrationBody,
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
