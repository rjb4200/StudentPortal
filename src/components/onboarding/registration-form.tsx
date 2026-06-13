'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RegistrationFormProps {
  onComplete: (studentId: string) => void;
}

export function RegistrationForm({ onComplete }: RegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    school_name: '',
    instructor_name: '',
    instructor_contact: '',
  });

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
          p_phone: form.phone,
          p_school_name: form.school_name,
          p_instructor_name: form.instructor_name,
          p_instructor_contact: form.instructor_contact,
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

      onComplete(studentId);
    } catch (err: any) {
      setError('Unable to connect. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div>
      <h2 className="text-xl font-bold text-wfd-charcoal mb-2">Student Registration</h2>
      <p className="text-gray-500 mb-6">Enter your information to begin onboarding.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            required
            value={form.full_name}
            onChange={(e) => update('full_name', e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
          <Input
            label="School / Program"
            required
            value={form.school_name}
            onChange={(e) => update('school_name', e.target.value)}
          />
          <Input
            label="Instructor Name"
            required
            value={form.instructor_name}
            onChange={(e) => update('instructor_name', e.target.value)}
          />
          <Input
            label="Instructor Contact (email or phone)"
            required
            value={form.instructor_contact}
            onChange={(e) => update('instructor_contact', e.target.value)}
          />
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
    </div>
  );
}
