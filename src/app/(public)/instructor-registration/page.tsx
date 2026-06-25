'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  mobilePhone: '',
  businessPhone: '',
  credentials: '',
  title: '',
  preferredContactMethod: 'email',
  preferredContactHours: '',
  contactInstructions: '',
  siteName: '',
  organizationName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  mainPhone: '',
  className: '',
  classStartDate: '',
  rideTimeEndDate: '',
  notes: '',
};

export default function InstructorRegistrationPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const response = await fetch('/api/instructor/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instructor: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          mobilePhone: form.mobilePhone,
          businessPhone: form.businessPhone,
          credentials: form.credentials,
          title: form.title,
          preferredContactMethod: form.preferredContactMethod,
          preferredContactHours: form.preferredContactHours,
          contactInstructions: form.contactInstructions,
        },
        site: {
          name: form.siteName,
          organizationName: form.organizationName,
          address: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          mainPhone: form.mainPhone,
        },
        class: {
          name: form.className,
          classStartDate: form.classStartDate,
          rideTimeEndDate: form.rideTimeEndDate,
          notes: form.notes,
        },
      }),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success !== true) {
      setError(result?.error || 'Unable to submit registration.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-wfd-sage/30 bg-wfd-sage/10 p-5 text-center">
          <h2 className="text-xl font-bold text-wfd-charcoal">Registration Submitted</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Your instructor, training site, and class information has been submitted for admin review. Students will not see this class until it is approved.
          </p>
        </div>
        <Link href="/" className="block text-center text-sm font-semibold text-wfd-crimson hover:underline">
          Return to portal home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-wfd-charcoal font-serif mb-1">Instructor Registration</h2>
      <p className="text-gray-500 text-sm mb-6">
        Submit your instructor contact information, training site, and class date window for admin approval.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-wfd-crimson">Instructor</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input label="First name" required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} />
            <Input label="Last name" required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
            <Input label="Email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
            <Input label="Mobile phone" type="tel" required value={form.mobilePhone} onChange={(e) => update('mobilePhone', e.target.value)} />
            <Input label="Business phone (optional)" type="tel" value={form.businessPhone} onChange={(e) => update('businessPhone', e.target.value)} />
            <Input label="Credentials/certifications" required value={form.credentials} onChange={(e) => update('credentials', e.target.value)} />
            <Input label="Position/title" required value={form.title} onChange={(e) => update('title', e.target.value)} />
            <label className="block text-sm font-medium text-gray-700">
              Preferred contact method
              <select
                required
                value={form.preferredContactMethod}
                onChange={(e) => update('preferredContactMethod', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson"
              >
                <option value="email">Email</option>
                <option value="mobile_phone">Mobile phone</option>
                <option value="business_phone">Business phone</option>
              </select>
            </label>
            <Input label="Preferred contact hours" required value={form.preferredContactHours} onChange={(e) => update('preferredContactHours', e.target.value)} />
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Additional contact instructions (optional)
            <textarea value={form.contactInstructions} onChange={(e) => update('contactInstructions', e.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" />
          </label>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-wfd-crimson">Training Site</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input label="Training site name" required value={form.siteName} onChange={(e) => update('siteName', e.target.value)} />
            <Input label="Organization/school name" required value={form.organizationName} onChange={(e) => update('organizationName', e.target.value)} />
            <Input label="Address" required value={form.address} onChange={(e) => update('address', e.target.value)} />
            <Input label="City" required value={form.city} onChange={(e) => update('city', e.target.value)} />
            <Input label="State" required value={form.state} onChange={(e) => update('state', e.target.value)} />
            <Input label="ZIP code" required value={form.zipCode} onChange={(e) => update('zipCode', e.target.value)} />
            <Input label="Main site phone (optional)" type="tel" value={form.mainPhone} onChange={(e) => update('mainPhone', e.target.value)} />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-wfd-crimson">Class</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input label="Class name" required value={form.className} onChange={(e) => update('className', e.target.value)} />
            <Input label="Beginning-of-class date" type="date" required value={form.classStartDate} onChange={(e) => update('classStartDate', e.target.value)} />
            <Input label="End-of-ride-time date" type="date" required value={form.rideTimeEndDate} onChange={(e) => update('rideTimeEndDate', e.target.value)} />
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Class notes/instructions (optional)
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" />
          </label>
        </section>

        {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Button type="submit" loading={submitting} className="w-full">Submit for Admin Review</Button>
      </form>
    </div>
  );
}
