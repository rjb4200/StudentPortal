'use client';

import { useEffect, useState, FormEvent, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Tables } from '@/lib/supabase/database.types';

interface LegalWaiverProps {
  studentId: string;
  onComplete: () => void;
  onBack?: () => void;
  helpEmail?: string;
}

type LegalDoc = Tables<'legal_documents'>;

export function LegalWaiver({ studentId, onComplete, onBack, helpEmail }: LegalWaiverProps) {
  const [docs, setDocs] = useState<LegalDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [fullName, setFullName] = useState('');
  const [agreed, setAgreed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const [mode, setMode] = useState<'review' | 'sign'>('review');
  const docRef = useRef<HTMLDivElement>(null);

  const requiredCheckboxDocs = docs.filter((d) => d.require_checkbox);
  const singleDoc = docs.length === 1;
  const allRequiredAgreed = requiredCheckboxDocs.every((d) => agreed.has(d.id));

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

  const handleScroll = useCallback(() => {
    const el = docRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight || el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      setScrolledBottom(true);
    }
  }, []);

  useEffect(() => {
    setScrolledBottom(false);
    const el = docRef.current;
    if (el && el.scrollHeight <= el.clientHeight) {
      setScrolledBottom(true);
    }
  }, [currentDocIndex]);

  const toggleAgree = (docId: string) => {
    setAgreed((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const goToDoc = (index: number) => {
    if (index >= 0 && index < docs.length) {
      setCurrentDocIndex(index);
    }
  };

  const goToSign = () => {
    setError('');
    setMode('sign');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full legal name as signature.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await fetch('/api/onboarding/legal-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        fullName: fullName.trim(),
        agreedDocumentIds: Array.from(agreed),
      }),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.error || 'Failed to save signature.');
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

  if (docs.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-wfd-charcoal mb-1 pb-2 border-b-2 border-wfd-crimson">Legal Agreements</h2>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 mb-6 mt-2 text-sm text-orange-700">
          No legal documents are currently required. You may proceed.
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Legal Name (Signature)"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Type your full legal name"
          />
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{error}</div>
          )}
          <div className="flex gap-3">
            {onBack && (
              <Button type="button" variant="secondary" onClick={onBack} className="flex-1">Previous Step</Button>
            )}
            <Button type="submit" loading={loading} className="flex-1">Sign and Continue</Button>
          </div>
        </form>
      </div>
    );
  }

  const currentDoc = docs[currentDocIndex];
  const isLastDoc = currentDocIndex === docs.length - 1;

  return (
    <div>
      <h2 className="text-xl font-bold text-wfd-charcoal mb-1 pb-2 border-b-2 border-wfd-crimson">Legal Agreements</h2>
      <p className="text-gray-500 mb-6 mt-2">
        Please review and sign the documents below to continue.
      </p>

      {mode === 'review' && (
        <>
          {docs.length > 1 && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1.5">
                {docs.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToDoc(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === currentDocIndex ? 'bg-wfd-crimson' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Document ${i + 1}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                Doc {currentDocIndex + 1} of {docs.length}
              </span>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg mb-4">
            <h3 className="bg-wfd-charcoal text-white px-4 py-2 rounded-t-lg text-sm font-semibold">
              {currentDoc.title}
            </h3>
            <div
              ref={docRef}
              onScroll={handleScroll}
              className="p-5 max-h-80 overflow-y-auto bg-gray-50 text-sm text-gray-800 whitespace-pre-line font-serif leading-relaxed"
            >
              {currentDoc.body_text}
            </div>
            {currentDoc.require_checkbox && (
              <div className="px-4 py-3 border-t border-gray-100 bg-white rounded-b-lg">
                {!scrolledBottom && (
                  <p className="text-xs text-gray-400 mb-2 italic">
                    Scroll to the end of the document to continue.
                  </p>
                )}
                <label className={`flex items-start gap-3 ${scrolledBottom ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                  <input
                    type="checkbox"
                    checked={agreed.has(currentDoc.id)}
                    onChange={() => scrolledBottom && toggleAgree(currentDoc.id)}
                    disabled={!scrolledBottom}
                    className="mt-1 h-4 w-4 text-wfd-crimson focus:ring-wfd-crimson rounded"
                  />
                  <span className="text-sm text-gray-700">
                    I have read, understand, and agree to the {currentDoc.title}.
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {currentDocIndex > 0 && (
              <Button type="button" variant="secondary" onClick={() => goToDoc(currentDocIndex - 1)}>
                Previous
              </Button>
            )}
            {!isLastDoc && (
              <Button type="button" onClick={() => goToDoc(currentDocIndex + 1)} className="flex-1">
                Next
              </Button>
            )}
            {isLastDoc && allRequiredAgreed && !singleDoc && (
              <Button type="button" onClick={goToSign} className="flex-1">
                Sign Documents
              </Button>
            )}
          </div>
        </>
      )}

      {(mode === 'sign' || (singleDoc && allRequiredAgreed)) && (
        <div>
          {singleDoc && allRequiredAgreed && mode === 'review' && (
            <div className="border-t border-gray-200 my-6" />
          )}

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-wfd-charcoal mb-3">
              {mode === 'sign' ? 'You are about to sign:' : 'You are signing:'}
            </h3>
            <div className="space-y-1">
              {docs
                .filter((d) => d.require_checkbox && agreed.has(d.id))
                .map((d) => (
                  <div key={d.id} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-wfd-sage font-bold">&#10003;</span>
                    <span>{d.title}</span>
                  </div>
                ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Legal Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Type your full legal name"
            />

            <div className="border-t border-gray-300 pt-2">
              <div className="text-sm text-gray-400">Electronic Signature</div>
              <div className="text-base font-serif text-wfd-charcoal mt-1">
                {fullName.trim() || '________________________'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              By typing your name and clicking the button below, you are electronically
              signing all documents listed above. Your IP address and a timestamp will be
              recorded as your legal signature.
            </p>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{error}</div>
            )}

            <div className="flex gap-3">
              {mode === 'sign' && !singleDoc && (
                <Button type="button" variant="secondary" onClick={() => setMode('review')} className="flex-1">
                  Back to Documents
                </Button>
              )}
              {onBack && (
                <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
                  Previous Step
                </Button>
              )}
              <Button type="submit" loading={loading} className="flex-1">
                {docs.length > 1 ? 'Sign All Documents' : 'Sign Document'}
              </Button>
            </div>
          </form>
        </div>
      )}

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
