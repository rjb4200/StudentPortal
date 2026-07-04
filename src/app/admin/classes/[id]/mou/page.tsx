'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminNavigation } from '@/components/admin/admin-navigation';
import { Button } from '@/components/ui/button';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function MouPrintPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const [mou, setMou] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient() as any;
      const { data, error: mouError } = await supabase
        .from('class_mous')
        .select('*, training_classes!inner(id, name, class_start_date, ride_time_end_date, training_sites!inner(name, organization_name), instructors!inner(first_name, last_name, email)), admin_accounts!wfems_signed_by(full_name, rank)')
        .eq('training_class_id', classId)
        .single();

      if (mouError || !data) {
        setError('MOU not found for this class.');
        setLoading(false);
        return;
      }
      setMou(data);
      setLoading(false);
    }
    load();
  }, [classId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wfd-crimson" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AdminNavigation />
        <div className="rounded-lg border border-wfd-crimson/30 bg-wfd-crimson/10 p-6 text-center mt-8">
          <h1 className="text-xl font-bold text-wfd-charcoal">{error}</h1>
          <Button variant="secondary" className="mt-4" onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const tc = Array.isArray(mou.training_classes) ? mou.training_classes[0] : mou.training_classes;
  const site = Array.isArray(tc?.training_sites) ? tc.training_sites[0] : tc?.training_sites;
  const instructor = Array.isArray(tc?.instructors) ? tc.instructors[0] : tc?.instructors;
  const adminSigner = Array.isArray(mou.admin_accounts) ? mou.admin_accounts[0] : mou.admin_accounts;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <AdminNavigation printHidden />
      <div className="flex items-center justify-between mb-6 no-print">
        <Button variant="secondary" onClick={() => window.print()}>Print MOU</Button>
        <button onClick={() => router.back()} className="text-sm text-wfd-crimson hover:underline">Back</button>
      </div>

      <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8 print:shadow-none print:border-none print:p-0">
        <div className="text-center mb-6 border-b-2 border-wfd-crimson pb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img
              src="https://ejjsahtohaydoogtilgp.supabase.co/storage/v1/object/public/branding/wfd-logo-1848.jpg"
              alt="WFD Logo"
              className="h-16 w-auto rounded"
            />
            <div className="text-left">
              <h1 className="text-xl font-bold text-wfd-crimson">Winchester Fire/EMS</h1>
              <p className="text-xs text-gray-500">44 N Maple Street, Winchester, KY 40392</p>
              <p className="text-xs font-semibold text-wfd-sage uppercase tracking-wide">Division of EMS — Student Portal</p>
            </div>
          </div>
          <h2 className="text-2xl font-black text-wfd-charcoal font-serif uppercase tracking-wide">Memorandum of Understanding</h2>
        </div>

        <div className="mb-6 space-y-2 text-sm">
          <p><span className="font-bold text-wfd-charcoal">Effective Date:</span> {formatDate(mou.effective_date)}</p>
          <p><span className="font-bold text-wfd-charcoal">Training Organization:</span> {mou.training_organization_name || 'Not specified'}</p>
          <p><span className="font-bold text-wfd-charcoal">Training Site:</span> {site?.name ?? 'Not specified'}</p>
          <p><span className="font-bold text-wfd-charcoal">Class:</span> {tc?.name} ({tc?.class_start_date} to {tc?.ride_time_end_date})</p>
          <p><span className="font-bold text-wfd-charcoal">Instructor:</span> {instructor ? `${instructor.first_name} ${instructor.last_name} (${instructor.email})` : 'Not specified'}</p>
        </div>

        <div className="border-t border-gray-200 pt-6 mb-8">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-serif">
            {mou.mou_body_snapshot}
          </div>
        </div>

        <div className="border-t-2 border-wfd-crimson pt-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-bold text-wfd-charcoal uppercase text-xs tracking-wide">Training Organization Representative</p>
              <div className="mt-4 border-b border-gray-400 pb-1">
                <p className="font-bold text-wfd-charcoal text-lg">{mou.representative_name}</p>
                <p className="text-sm text-gray-500">{mou.representative_title}</p>
              </div>
              <p className="mt-2 text-xs text-gray-400">Signed: {formatDate(mou.representative_signed_at)}</p>
            </div>
            <div>
              <p className="font-bold text-wfd-charcoal uppercase text-xs tracking-wide">Winchester Fire/EMS</p>
              <div className="mt-4 border-b border-gray-400 pb-1">
                <p className="font-bold text-wfd-charcoal text-lg">{adminSigner?.full_name || 'Winchester Fire/EMS'}</p>
                <p className="text-sm text-gray-500">{adminSigner?.rank || ''}</p>
              </div>
              <p className="mt-2 text-xs text-gray-400">Signed: {formatDate(mou.wfems_signed_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
