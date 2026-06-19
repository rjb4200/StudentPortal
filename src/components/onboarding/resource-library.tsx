'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';

interface ResourceLibraryProps {
  onComplete: () => void;
  onBack?: () => void;
  helpEmail?: string;
}

type ResCategory = Tables<'resource_categories'>;
type ResDoc = Tables<'resource_documents'>;

export function ResourceLibrary({ onComplete, onBack, helpEmail }: ResourceLibraryProps) {
  const [categories, setCategories] = useState<ResCategory[]>([]);
  const [documents, setDocuments] = useState<ResDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const [{ data: catData, error: catError }, { data: docData, error: docError }] = await Promise.all([
        supabase.from('resource_categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('resource_documents').select('*').eq('is_active', true).order('sort_order'),
      ]);

      if (catError || docError) {
        setError('Unable to load resources.');
        setLoading(false);
        return;
      }

      setCategories(catData ?? []);
      setDocuments(docData ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div>
      <h2 className="text-xl font-bold text-wfd-charcoal mb-1 pb-2 border-b-2 border-wfd-crimson">Resource Library</h2>
      <p className="text-sm text-gray-600 mt-2">Loading resources...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-xl font-bold text-wfd-charcoal mb-2">Resource Library</h2>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const categoriesWithDocs = categories
    .map((cat) => ({
      ...cat,
      docs: documents.filter((d) => d.category_id === cat.id),
    }))
    .filter((cat) => cat.docs.length > 0);

  return (
    <div>
      <h2 className="text-xl font-bold text-wfd-charcoal mb-1 pb-2 border-b-2 border-wfd-crimson">Resource Library</h2>
      <p className="text-gray-500 mb-6 mt-2">
        Download and review these essential documents before your rotation. You&apos;ll be tested on
        this material in the Policy and Protocol Review.
      </p>

      {categoriesWithDocs.length === 0 ? (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 mb-6 text-sm text-orange-700">
          No resource documents are currently available. You may proceed.
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {categoriesWithDocs.map((section) => (
            <div key={section.id}>
              <h3 className="text-sm font-semibold text-wfd-crimson uppercase tracking-wide mb-3">
                {section.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.docs.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <a
                      href={item.file_url ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 hover:bg-red-50 transition-colors group"
                    >
                      <svg
                        className="w-8 h-8 text-wfd-crimson group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-wfd-charcoal group-hover:text-wfd-crimson">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-400">{item.file_type} Document</div>
                      </div>
                    </a>
                    {item.map_embed_url && (
                      <iframe
                        src={item.map_embed_url}
                        width="100%"
                        height="300"
                        style={{ border: 0, borderRadius: '0 0 0.5rem 0.5rem' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600">
          <strong className="text-wfd-charcoal">Important:</strong> The Policy and Protocol Review will test
          your understanding of station layouts, safety protocols, and department SOGs. Make sure you
          review all documents before proceeding.
        </p>
      </div>

      <div className="flex gap-3">
        {onBack && (
          <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
            Previous Step
          </Button>
        )}
        <Button onClick={onComplete} className="flex-1">
          I&apos;ve Reviewed All Documents
        </Button>
      </div>

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
