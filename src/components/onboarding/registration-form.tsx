'use client';

import { useEffect, useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Tables } from '@/lib/supabase/database.types';

interface RegistrationFormProps {
  onComplete: (studentId: string) => void;
  onBack?: () => void;
  helpEmail?: string;
}

type RegField = Tables<'registration_fields'>;

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

      const sorted = (data ?? []).sort((a, b) => a.sort_order - b.sort_order);
      setFields(sorted);

      const initial: Record<string, string> = { full_name: '', email: '' };
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

    try {
      const supabase = createClient();
      const { data: studentId, error: registrationError } = await (supabase as any).rpc(
        'register_onboarding_student',
        {
          p_full_name: form.full_name,
          p_email: form.email,
          p_phone: form.phone || '',
          p_school_name: form.school_name || '',
          p_instructor_name: form.instructor_name || '',
          p_instructor_contact: form.instructor_contact || '',
        }
      );

      if (registrationError) {
        if (registrationError.code === '23505') {
          setError('A student with this email is already registered.');
          setLoading(false);
          return;
        }
        setError(registrationError.message);
        setLoading(false);
        return;
      }

      const customFields = fields.filter(
        (f) => !['full_name', 'email', 'phone', 'school_name', 'instructor_name', 'instructor_contact'].includes(f.field_key) && form[f.field_key]
      );

      if (customFields.length > 0) {
        await supabase.from('student_field_values').insert(
          customFields.map((f) => ({
            student_id: studentId,
            field_id: f.id,
            value: form[f.field_key],
          }))
        );
      }

      onComplete(studentId);
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
        type={field.field_type === 'tel' ? 'tel' : 'text'}
        required={field.is_required}
        value={form[field.field_key] ?? ''}
        onChange={(e) => updateValue(field.field_key, e.target.value)}
        placeholder={field.placeholder ?? undefined}
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
