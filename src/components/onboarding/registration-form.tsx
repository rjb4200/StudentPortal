'use client';

import { useEffect, useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { emailSchema, phoneSchema } from '@/lib/validation';
import type { Tables } from '@/lib/supabase/database.types';

interface RegistrationFormProps {
  onComplete: (studentId: string, onboardingToken: string) => void;
  onBack?: () => void;
  helpEmail?: string;
}

type RegField = Tables<'registration_fields'>;

const BUILT_IN_FIELD_KEYS = [
  'full_name',
  'email',
  'phone',
  'school_name',
  'instructor_name',
  'instructor_contact',
];

const getFieldValue = (form: Record<string, string>, key: string) => (form[key] ?? '').trim();

export function RegistrationForm({ onComplete, onBack, helpEmail }: RegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingFields, setLoadingFields] = useState(true);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<RegField[]>([]);
  const [form, setForm] = useState<Record<string, string>>({
    full_name: '',
    email: '',
    phone: '',
    school_name: '',
    instructor_name: '',
    instructor_contact: '',
  });

  useEffect(() => {
    async function loadFields() {
      const supabase = createClient();
      const { data } = await supabase
        .from('registration_fields')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      const sorted = (data ?? []).sort((a, b) => {
        const aIsBuiltIn = BUILT_IN_FIELD_KEYS.includes(a.field_key);
        const bIsBuiltIn = BUILT_IN_FIELD_KEYS.includes(b.field_key);
        if (aIsBuiltIn && bIsBuiltIn) {
          return BUILT_IN_FIELD_KEYS.indexOf(a.field_key) - BUILT_IN_FIELD_KEYS.indexOf(b.field_key);
        }
        if (aIsBuiltIn) return -1;
        if (bIsBuiltIn) return 1;
        const orderDiff = a.sort_order - b.sort_order;
        if (orderDiff !== 0) return orderDiff;
        return a.field_key.localeCompare(b.field_key);
      });
      setFields(sorted);

      const initial: Record<string, string> = {
        full_name: '',
        email: '',
        phone: '',
        school_name: '',
        instructor_name: '',
        instructor_contact: '',
      };
      for (const f of sorted) {
        if (!initial[f.field_key]) initial[f.field_key] = '';
      }
      setForm(initial);
      setLoadingFields(false);
    }
    loadFields();
  }, []);

  const updateValue = (field_key: string, value: string) =>
    setForm((prev) => ({ ...prev, [field_key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const emailResult = emailSchema.safeParse(getFieldValue(form, 'email'));
    if (!emailResult.success) {
      setError(`Email: ${emailResult.error.issues[0].message}`);
      setLoading(false);
      return;
    }

    const phone = getFieldValue(form, 'phone');
    if (phone) {
      const phoneResult = phoneSchema.safeParse(phone);
      if (!phoneResult.success) {
        setError(`Phone: ${phoneResult.error.issues[0].message}`);
        setLoading(false);
        return;
      }
    }

    try {
      const supabase = createClient();
      const res = await fetch('/api/onboarding/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: getFieldValue(form, 'full_name'),
          email: emailResult.data,
          phone,
          schoolName: getFieldValue(form, 'school_name'),
          instructorName: getFieldValue(form, 'instructor_name'),
          instructorContact: getFieldValue(form, 'instructor_contact'),
        }),
      });
      const registration = await res.json();

      if (!res.ok || !registration.success) {
        if (res.status === 409) {
          setError('A student with this email is already registered.');
          setLoading(false);
          return;
        }
        setError(registration.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      const studentId = registration.studentId as string;
      const onboardingToken = registration.onboardingToken as string;

      const customFields = fields.filter(
        (f) => !BUILT_IN_FIELD_KEYS.includes(f.field_key) && form[f.field_key]
      );

      if (customFields.length > 0) {
        await supabase.from('student_field_values').insert(
          customFields.map((f) => ({
            student_id: studentId,
            field_id: f.id,
            value: getFieldValue(form, f.field_key),
          }))
        );
      }

      onComplete(studentId, onboardingToken);
    } catch (err: any) {
      setError('Unable to connect. Please check your connection and try again.');
      setLoading(false);
    }
  };

  if (loadingFields) {
    return (
      <div>
      <h2 className="text-xl font-bold text-wfd-charcoal mb-1 pb-2 border-b-2 border-wfd-crimson">Student Registration</h2>
      <p className="text-sm text-gray-600 mt-2">Loading registration form...</p>
      </div>
    );
  }

  const renderField = (field: RegField) => {
    if (field.field_type === 'textarea') {
      return (
        <label key={field.id} className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.is_required && <span className="text-red-500 ml-1">*</span>}
          <textarea
            required={field.is_required}
            value={form[field.field_key] ?? ''}
            onChange={(e) => updateValue(field.field_key, e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson"
            rows={3}
          />
        </label>
      );
    }

    if (field.field_type === 'select' && field.options) {
      const options = field.options.split(',').map((o) => o.trim());
      return (
        <label key={field.id} className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.is_required && <span className="text-red-500 ml-1">*</span>}
          <select
            required={field.is_required}
            value={form[field.field_key] ?? ''}
            onChange={(e) => updateValue(field.field_key, e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson"
          >
            <option value="">Select...</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
      );
    }

    return (
      <Input
        key={field.id}
        label={field.label + (field.is_required ? '' : ' (optional)')}
        type={field.field_type === 'tel' ? 'tel' : field.field_type === 'email' ? 'email' : 'text'}
        required={field.is_required}
        value={form[field.field_key] ?? ''}
        onChange={(e) => updateValue(field.field_key, e.target.value)}
        placeholder={field.placeholder ?? undefined}
        autoComplete={field.field_type === 'email' ? 'email' : field.field_type === 'tel' ? 'tel' : undefined}
      />
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-wfd-charcoal mb-1 pb-2 border-b-2 border-wfd-crimson">Student Registration</h2>
      <p className="text-gray-500 mb-6 mt-2">Enter your information to begin onboarding.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(renderField)}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Continue to Legal Agreements
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Need help? Contact your instructor or email{' '}
          <a href={`mailto:${helpEmail ?? 'jbrown@winchesterky.com'}`} className="text-wfd-crimson hover:underline">
            {helpEmail ?? 'jbrown@winchesterky.com'}
          </a>
        </p>
      </div>
    </div>
  );
}
