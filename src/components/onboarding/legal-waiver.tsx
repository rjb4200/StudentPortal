'use client';

import { useEffect, useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Tables } from '@/lib/supabase/database.types';

interface LegalWaiverProps {
  studentId: string;
  onComplete: () => void;
  onBack?: () => void;
}

type LegalDoc = Tables<'legal_documents'>;

export function LegalWaiver({ studentId, onComplete, onBack }: LegalWaiverProps) {
  const [docs, setDocs] = useState<LegalDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [fullName, setFullName] = useState('');
  const [agreed, setAgreed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDocs() {
      const supabase = createClient();
      const { data } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      setDocs(data ?? []);
      setLoadingDocs(false);
    }
    loadDocs();
  }, []);

  const requiredCheckboxDocs = docs.filter((d) => d.require_checkbox);

  const toggleAgree = (docId: string) => {
    setAgreed((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (requiredCheckboxDocs.length > 0 && agreed.size < requiredCheckboxDocs.length) {
      setError(`You must agree to all ${requiredCheckboxDocs.length} document(s) to continue.`);
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

  if (loadingDocs) {
    return (
      <div>
      <h2 className="text-xl font-bold text-wfd-charcoal mb-1 pb-2 border-b-2 border-wfd-crimson">Legal Agreements</h2>
      <p className="text-sm text-gray-600 mt-2">Loading legal documents...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-wfd-charcoal mb-1 pb-2 border-b-2 border-wfd-crimson">Legal Agreements</h2>
      <p className="text-gray-500 mb-6 mt-2">
        Please review and sign the documents below to continue.
      </p>

      {docs.length === 0 ? (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 mb-6 text-sm text-orange-700">
          No legal documents are currently required. You may proceed.
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {docs.map((doc, i) => (
            <div key={doc.id} className="border border-gray-200 rounded-lg">
              <h3 className="bg-wfd-charcoal text-white px-4 py-2 rounded-t-lg text-sm font-semibold">
                {doc.title}
              </h3>
              <div className="p-4 max-h-48 overflow-y-auto bg-gray-50 text-sm text-gray-700 whitespace-pre-line">
                {doc.body_text}
              </div>
              {doc.require_checkbox && (
                <div className="px-4 py-2 border-t border-gray-100 bg-white rounded-b-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed.has(doc.id)}
                      onChange={() => toggleAgree(doc.id)}
                      className="mt-1 h-4 w-4 text-wfd-crimson focus:ring-wfd-crimson rounded"
                    />
                    <span className="text-sm text-gray-700">
                      I have read, understand, and agree to the {doc.title}.
                    </span>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Legal Name (Signature)"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Type your full legal name"
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          {onBack && (
            <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
              Previous Step
            </Button>
          )}
          <Button type="submit" loading={loading} className="flex-1">
            Sign and Continue
          </Button>
        </div>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Need help? Contact your instructor or email{' '}
          <a href="mailto:jbrown@winchesterky.com" className="text-wfd-crimson hover:underline">
            jbrown@winchesterky.com
          </a>
        </p>
      </div>
    </div>
  );
}
