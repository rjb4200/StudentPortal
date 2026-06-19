'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { QuizConfig } from '@/components/admin/quiz-config';
import { RegistrationFieldsConfig } from '@/components/admin/registration-fields-config';
import { LegalDocsConfig } from '@/components/admin/legal-docs-config';
import { ResourceLibraryConfig } from '@/components/admin/resource-library-config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { canAccessAdmin } from '@/lib/roles';
import Link from 'next/link';

export default function SetupPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [rejected, setRejected] = useState(false);
  const [welcomeId, setWelcomeId] = useState<string | null>(null);
  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeBody, setWelcomeBody] = useState('');
  const [welcomeActive, setWelcomeActive] = useState(false);
  const [savingWelcome, setSavingWelcome] = useState(false);
  const [completionId, setCompletionId] = useState<string | null>(null);
  const [completionTitle, setCompletionTitle] = useState('');
  const [completionBody, setCompletionBody] = useState('');
  const [completionActive, setCompletionActive] = useState(false);
  const [savingCompletion, setSavingCompletion] = useState(false);
  const [helpEmail, setHelpEmail] = useState('');
  const [savingHelpEmail, setSavingHelpEmail] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!canAccessAdmin(data?.user)) {
        setRejected(true);
        setLoading(false);
        return;
      }
      loadWelcome();
      loadHelpEmail();
      setLoading(false);
    });
  }, []);

  async function loadHelpEmail() {
    const { data } = await supabase
      .from('portal_settings')
      .select('value')
      .eq('key', 'help_email')
      .single();
    if (data?.value) setHelpEmail(data.value);
  }

  async function handleSaveHelpEmail() {
    setSavingHelpEmail(true);
    const { data: existing } = await supabase
      .from('portal_settings')
      .select('key')
      .eq('key', 'help_email')
      .single();
    if (existing) {
      await supabase.from('portal_settings').update({
        value: helpEmail, updated_at: new Date().toISOString(),
      }).eq('key', 'help_email');
    } else {
      await supabase.from('portal_settings').insert({
        key: 'help_email', value: helpEmail,
      });
    }
    setSavingHelpEmail(false);
  }

  async function loadWelcome() {
    const { data } = await supabase
      .from('message_templates')
      .select('*')
      .eq('template_type', 'welcome')
      .limit(1);
    if (data?.[0]) {
      setWelcomeId(data[0].id);
      setWelcomeTitle(data[0].title);
      setWelcomeBody(data[0].body);
      setWelcomeActive(data[0].is_active);
    }
    const { data: completion } = await supabase
      .from('message_templates')
      .select('*')
      .eq('template_type', 'completion')
      .limit(1);
    if (completion?.[0]) {
      setCompletionId(completion[0].id);
      setCompletionTitle(completion[0].title);
      setCompletionBody(completion[0].body);
      setCompletionActive(completion[0].is_active);
    }
  }

  async function handleSaveWelcome() {
    setSavingWelcome(true);
    if (welcomeId) {
      await supabase.from('message_templates').update({
        title: welcomeTitle, body: welcomeBody, is_active: welcomeActive, updated_at: new Date().toISOString(),
      }).eq('id', welcomeId);
    } else {
      const { data } = await supabase.from('message_templates').insert({
        title: welcomeTitle, body: welcomeBody, is_active: welcomeActive, template_type: 'welcome',
      }).select('id').single();
      if (data) setWelcomeId(data.id);
    }
    setSavingWelcome(false);
  }

  async function handleSaveCompletion() {
    setSavingCompletion(true);
    if (completionId) {
      await supabase.from('message_templates').update({
        title: completionTitle, body: completionBody, is_active: completionActive, updated_at: new Date().toISOString(),
      }).eq('id', completionId);
    } else {
      const { data } = await supabase.from('message_templates').insert({
        title: completionTitle, body: completionBody, is_active: completionActive, template_type: 'completion',
      }).select('id').single();
      if (data) setCompletionId(data.id);
    }
    setSavingCompletion(false);
  }

  if (rejected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-wfd-crimson mb-2">Access Denied</h1>
          <p className="text-gray-500">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wfd-crimson" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-sm text-wfd-crimson hover:underline">
          ← Back to Admin Command Center
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-wfd-charcoal">Onboarding Setup</h1>
      <p className="text-gray-500 -mt-3">Configure the student onboarding experience. Changes appear immediately.</p>

      <QuizConfig />
      <RegistrationFieldsConfig />
      <LegalDocsConfig />
      <ResourceLibraryConfig />

      <Card className="p-4">
        <h3 className="font-bold text-wfd-charcoal mb-3">Welcome Message</h3>
        <p className="text-sm text-gray-500 mb-3">Shown to students on their dashboard after completing onboarding.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Title" value={welcomeTitle} onChange={(e) => setWelcomeTitle(e.target.value)} />
          <textarea value={welcomeBody} onChange={(e) => setWelcomeBody(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" rows={3} />
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={welcomeActive} onChange={(e) => setWelcomeActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-wfd-crimson" /> Active
          </label>
          <Button type="button" onClick={handleSaveWelcome} loading={savingWelcome}>Save Welcome Message</Button>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-bold text-wfd-charcoal mb-3">Completion Message</h3>
        <p className="text-sm text-gray-500 mb-3">Shown to students on the final screen after completing the Policy and Protocol Review.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Title" value={completionTitle} onChange={(e) => setCompletionTitle(e.target.value)} />
          <textarea value={completionBody} onChange={(e) => setCompletionBody(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" rows={5} />
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={completionActive} onChange={(e) => setCompletionActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-wfd-crimson" /> Active
          </label>
          <Button type="button" onClick={handleSaveCompletion} loading={savingCompletion}>Save Completion Message</Button>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-bold text-wfd-charcoal mb-3">Help Email</h3>
        <p className="text-sm text-gray-500 mb-3">Contact email shown on every onboarding step for student assistance.</p>
        <div className="flex gap-3">
          <Input label="Email address" type="email" value={helpEmail} onChange={(e) => setHelpEmail(e.target.value)} className="flex-1" />
          <Button type="button" onClick={handleSaveHelpEmail} loading={savingHelpEmail} className="self-end">Save</Button>
        </div>
      </Card>
    </div>
  );
}
