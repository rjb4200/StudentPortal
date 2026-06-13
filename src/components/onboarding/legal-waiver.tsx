'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LegalWaiverProps {
  studentId: string;
  onComplete: () => void;
}

const HIPAA_TEXT = `HIPAA & CONFIDENTIALITY AGREEMENT

As a student participating in clinical rotations with the Winchester Fire Department (WFD) Division of EMS, you may have access to Protected Health Information (PHI) and other confidential patient data. By signing below, you acknowledge and agree to the following:

1. All patient information encountered during your rotation is strictly confidential.
2. You will not disclose, copy, or remove any patient information from WFD facilities.
3. You will comply with all HIPAA regulations and WFD privacy policies.
4. Any breach of confidentiality may result in immediate termination of your rotation and potential legal action.
5. This obligation extends beyond the duration of your rotation.`;

const LIABILITY_TEXT = `LIABILITY WAIVER AND RELEASE

In consideration of being permitted to participate in clinical rotations with the Winchester Fire Department Division of EMS, I hereby:

1. Acknowledge the inherent risks associated with emergency medical services and fire department operations.
2. Assume full responsibility for any personal injury or property damage that may occur during my rotation.
3. Release and discharge the Winchester Fire Department, its officers, employees, and agents from any and all claims arising from my participation.
4. Agree to follow all safety protocols, policies, and directives from WFD personnel.
5. Certify that I am covered by my educational institution's liability insurance.`;

export function LegalWaiver({ studentId, onComplete }: LegalWaiverProps) {
  const [fullName, setFullName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('You must agree to both documents to continue.');
      return;
    }
    if (!fullName.trim()) {
      setError('Please enter your full legal name as signature.');
      return;
    }

    setLoading(true);
    setError('');

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from('students')
      .update({
        legal_signature: fullName.trim(),
        signature_ip: 'client',
        signature_timestamp: new Date().toISOString(),
      })
      .eq('id', studentId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    onComplete();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-wfd-charcoal mb-2">Legal Agreements</h2>
      <p className="text-gray-500 mb-6">
        Please review and sign both documents below to continue.
      </p>

      <div className="space-y-4 mb-6">
        <div className="border border-gray-200 rounded-lg">
          <h3 className="bg-wfd-charcoal text-white px-4 py-2 rounded-t-lg text-sm font-semibold">
            HIPAA & Confidentiality Agreement
          </h3>
          <div className="p-4 max-h-48 overflow-y-auto bg-gray-50 text-sm text-gray-700 whitespace-pre-line">
            {HIPAA_TEXT}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg">
          <h3 className="bg-wfd-charcoal text-white px-4 py-2 rounded-t-lg text-sm font-semibold">
            Liability Waiver and Release
          </h3>
          <div className="p-4 max-h-48 overflow-y-auto bg-gray-50 text-sm text-gray-700 whitespace-pre-line">
            {LIABILITY_TEXT}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Legal Name (Signature)"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Type your full legal name"
        />

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 text-wfd-crimson focus:ring-wfd-crimson rounded"
          />
          <span className="text-sm text-gray-700">
            I have read, understand, and agree to both the HIPAA Confidentiality Agreement and the
            Liability Waiver and Release. I understand that my typed name constitutes an electronic
            signature.
          </span>
        </label>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Sign and Continue
        </Button>
      </form>
    </div>
  );
}
