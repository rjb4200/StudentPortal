'use client';

import { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type Tab = 'admins' | 'preceptors' | 'students';

const STATIONS = ['Station 1 - Downtown HQ', 'Station 2 - West Side', 'Station 3 - Industrial'];

function AccountsPageInner() {
  const editId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('edit') : null;
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>('admins');
  const [loading, setLoading] = useState(true);
  const [adminAccounts, setAdminAccounts] = useState<any[]>([]);
  const [preceptors, setPreceptors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  const [editing, setEditing] = useState<any>(null);
  const [editType, setEditType] = useState<'admin' | 'preceptor' | 'student' | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [formPassword, setFormPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (editId && !loading) {
      const found = [...adminAccounts, ...preceptors, ...students].find(a => a.id === editId);
      if (found && adminAccounts.find(a => a.id === editId)) startEdit(found, 'admin');
      else if (found && preceptors.find(a => a.id === editId)) startEdit(found, 'preceptor');
      else if (found) startEdit(found, 'student');
    }
  }, [editId, loading]);

  async function loadAll() {
    setLoading(true);
    const [{ data: admins }, { data: precs }, { data: studs }] = await Promise.all([
      supabase.from('admin_accounts').select('*').order('full_name'),
      supabase.from('preceptors').select('*').order('full_name'),
      supabase.from('students').select('*').order('full_name'),
    ]);
    setAdminAccounts(admins ?? []);
    setPreceptors(precs ?? []);
    setStudents(studs ?? []);
    setLoading(false);
  }

  function startEdit(row: any, type: 'admin' | 'preceptor' | 'student') {
    setEditing(row);
    setEditType(type);
    setForm({ ...row, password: '' });
    setFormPassword('');
    setMessage(null);
  }

  function cancelEdit() {
    setEditing(null); setEditType(null); setForm({}); setMessage(null);
  }

  function startNew(type: 'admin' | 'preceptor') {
    if (type === 'admin') {
      setEditing(null); setEditType('admin');
      setForm({ full_name: '', email: '', notify_onboarding_complete: true, notify_evaluation_flagged: true, notify_daily_report: false, is_active: true });
      setFormPassword('');
    } else {
      setEditing(null); setEditType('preceptor');
      setForm({ full_name: '', email: '', station_unit: STATIONS[0], bio: '', image_url: '', specialty_tags: '', notify_evaluation: false, notify_schedule_approved: false, is_active: true });
      setFormPassword('');
    }
    setMessage(null);
  }

  async function saveEdit() {
    setSaving(true); setMessage(null);

    if (editType === 'student') {
      const { error } = await supabase.from('students').update({
        full_name: form.full_name, email: form.email, phone: form.phone || null,
        school_name: form.school_name, instructor_name: form.instructor_name,
        instructor_contact: form.instructor_contact, status: form.status,
        is_blacklisted: form.is_blacklisted, no_show_count: Number(form.no_show_count) || 0,
      }).eq('id', editing.id);
      if (error) { setMessage('Error: ' + error.message); setSaving(false); return; }
      setMessage('Student updated.');
      setSaving(false); cancelEdit(); await loadAll(); return;
    }

    const adminClient = createAdminClient();

    if (editType === 'admin') {
      if (!form.full_name.trim() || !form.email.trim()) { setMessage('Name and email required.'); setSaving(false); return; }

      let authUserId = editing?.auth_user_id;
      if (!authUserId && !editing) {
        const { data: user, error: createErr } = await adminClient.auth.admin.createUser({
          email: form.email, password: formPassword || undefined,
          email_confirm: true, user_metadata: { role: 'admin' },
        });
        if (createErr) { setMessage('Error creating auth user: ' + createErr.message); setSaving(false); return; }
        authUserId = user?.user?.id;
      } else if (formPassword && editing) {
        await adminClient.auth.admin.updateUserById(authUserId, { password: formPassword });
      }

      const payload: any = {
        full_name: form.full_name.trim(), email: form.email.trim(), is_active: form.is_active,
        notify_onboarding_complete: form.notify_onboarding_complete,
        notify_evaluation_flagged: form.notify_evaluation_flagged,
        notify_daily_report: form.notify_daily_report,
        updated_at: new Date().toISOString(),
      };
      if (authUserId) payload.auth_user_id = authUserId;

      const result = editing
        ? await supabase.from('admin_accounts').update(payload).eq('id', editing.id)
        : await supabase.from('admin_accounts').insert({ ...payload, auth_user_id: authUserId });

      if (result.error) { setMessage('Error: ' + result.error.message); setSaving(false); return; }
      setMessage('Admin account saved.');
    }

    if (editType === 'preceptor') {
      if (!form.full_name.trim() || !form.email.trim()) { setMessage('Name and email required.'); setSaving(false); return; }

      let authUserId = editing?.auth_user_id;
      if (!authUserId && !editing) {
        const { data: user, error: createErr } = await adminClient.auth.admin.createUser({
          email: form.email, password: formPassword || undefined,
          email_confirm: true, user_metadata: { role: 'preceptor' },
        });
        if (createErr) { setMessage('Error creating auth user: ' + createErr.message); setSaving(false); return; }
        authUserId = user?.user?.id;
      } else if (formPassword && editing) {
        await adminClient.auth.admin.updateUserById(authUserId, { password: formPassword });
      }

      const payload: any = {
        full_name: form.full_name.trim(), email: form.email.trim(), is_active: form.is_active,
        bio: form.bio || null, image_url: form.image_url || null,
        station_unit: form.station_unit || null,
        specialty_tags: form.specialty_tags ? form.specialty_tags.split(',').map((t: string) => t.trim()).filter(Boolean) : null,
        notify_evaluation: form.notify_evaluation,
        notify_schedule_approved: form.notify_schedule_approved,
        updated_at: new Date().toISOString(),
      };
      if (authUserId) payload.auth_user_id = authUserId;

      const result = editing
        ? await supabase.from('preceptors').update(payload).eq('id', editing.id)
        : await supabase.from('preceptors').insert({ ...payload, auth_user_id: authUserId });

      if (result.error) { setMessage('Error: ' + result.error.message); setSaving(false); return; }
      setMessage('Preceptor account saved.');
    }

    setSaving(false); cancelEdit(); await loadAll();
  }

  async function disableAccount(type: 'admin' | 'preceptor', id: string) {
    if (!confirm('Disable this account?')) return;
    const table = type === 'admin' ? 'admin_accounts' : 'preceptors';
    await supabase.from(table).update({ is_active: false }).eq('id', id);
    await loadAll();
  }

  async function deleteAccount(type: 'admin' | 'preceptor', row: any) {
    if (!confirm(`Delete ${row.full_name} (${row.email}) permanently?`)) return;
    if (!confirm('FINAL WARNING: This cannot be undone. Proceed?')) return;

    const adminClient = createAdminClient();
    if (row.auth_user_id) { try { await adminClient.auth.admin.deleteUser(row.auth_user_id); } catch {} }

    const table = type === 'admin' ? 'admin_accounts' : 'preceptors';
    await supabase.from(table).delete().eq('id', row.id);
    await loadAll();
  }

  const filteredStudents = students.filter(s =>
    !studentSearch || s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wfd-crimson" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-sm text-wfd-crimson hover:underline">← Back to Admin Command Center</Link>
      </div>
      <h1 className="text-2xl font-bold text-wfd-charcoal">Account Management</h1>

      {editing || editType ? (
        <div className="rounded-xl border border-wfd-crimson bg-white p-6">
          <h3 className="text-lg font-bold text-wfd-charcoal mb-4">
            {editing ? `Edit ${editType === 'admin' ? 'Admin' : editType === 'preceptor' ? 'Preceptor' : 'Student'}: ${editing.full_name || editing.email}` : `Add ${editType === 'admin' ? 'Admin' : 'Preceptor'}`}
          </h3>
          {message && <div className="mb-3 rounded-lg border border-green-200 bg-green-50 p-2 text-sm text-green-800">{message}</div>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Full Name" value={form.full_name || ''} onChange={e => setForm({...form, full_name: e.target.value})} />
            <Input label="Email" type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
            {(editType === 'admin' || editType === 'preceptor') && (
              <Input label={`Password ${editing ? '(leave blank to keep)' : ''}`} type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} />
            )}

            {editType === 'student' && (
              <>
                <Input label="Phone" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                <Input label="School / Program" value={form.school_name || ''} onChange={e => setForm({...form, school_name: e.target.value})} />
                <Input label="Instructor Name" value={form.instructor_name || ''} onChange={e => setForm({...form, instructor_name: e.target.value})} />
                <Input label="Instructor Contact" value={form.instructor_contact || ''} onChange={e => setForm({...form, instructor_contact: e.target.value})} />
                <label className="block text-sm font-medium text-gray-700">
                  Status
                  <select value={form.status || 'pending'} onChange={e => setForm({...form, status: e.target.value})} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900">
                    <option value="pending">Pending</option>
                    <option value="certified">Certified</option>
                    <option value="expired">Expired</option>
                  </select>
                </label>
                <div className="flex items-end gap-6 pb-2">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_blacklisted || false} onChange={e => setForm({...form, is_blacklisted: e.target.checked})} className="h-4 w-4" /> Blacklisted</label>
                  <Input label="No-Shows" type="number" value={form.no_show_count ?? 0} onChange={e => setForm({...form, no_show_count: Number(e.target.value)})} />
                </div>
              </>
            )}

            {editType === 'preceptor' && (
              <>
                <label className="block text-sm font-medium text-gray-700">
                  Station
                  <select value={form.station_unit || STATIONS[0]} onChange={e => setForm({...form, station_unit: e.target.value})} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900">
                    {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <Input label="Image URL" value={form.image_url || ''} onChange={e => setForm({...form, image_url: e.target.value})} />
                <Input label="Specialty Tags (comma-separated)" value={form.specialty_tags || ''} onChange={e => setForm({...form, specialty_tags: e.target.value})} />
                <label className="block text-sm font-medium text-gray-700 col-span-2">
                  Bio
                  <textarea value={form.bio || ''} onChange={e => setForm({...form, bio: e.target.value})} className="mt-1 min-h-20 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900" />
                </label>
                <div className="flex items-end gap-4 pb-2 col-span-2">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.notify_evaluation || false} onChange={e => setForm({...form, notify_evaluation: e.target.checked})} className="h-4 w-4" /> Evaluation alerts</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.notify_schedule_approved || false} onChange={e => setForm({...form, notify_schedule_approved: e.target.checked})} className="h-4 w-4" /> Schedule alerts</label>
                </div>
              </>
            )}

            {(editType === 'admin' || editType === 'preceptor') && (
              <div className="flex items-end gap-4 pb-2 col-span-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active !== false} onChange={e => setForm({...form, is_active: e.target.checked})} className="h-4 w-4" /> Active</label>
              </div>
            )}

            {editType === 'admin' && (
              <div className="flex items-end gap-4 pb-2 col-span-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.notify_onboarding_complete || false} onChange={e => setForm({...form, notify_onboarding_complete: e.target.checked})} className="h-4 w-4" /> Onboarding alerts</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.notify_evaluation_flagged || false} onChange={e => setForm({...form, notify_evaluation_flagged: e.target.checked})} className="h-4 w-4" /> Evaluation alerts</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.notify_daily_report || false} onChange={e => setForm({...form, notify_daily_report: e.target.checked})} className="h-4 w-4" /> Daily report</label>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={saveEdit} loading={saving}>Save</Button>
            {editing && (editType === 'admin' || editType === 'preceptor') && <Button variant="danger" onClick={() => deleteAccount(editType, editing)}>Delete Account</Button>}
            <Button variant="secondary" onClick={cancelEdit}>Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2 border-b border-gray-200">
            {(['admins', 'preceptors', 'students'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px capitalize ${tab === t ? 'border-wfd-crimson text-wfd-crimson' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'admins' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{adminAccounts.length} admin account(s)</p>
                <Button size="sm" onClick={() => startNew('admin')}>Add Admin</Button>
              </div>
              {adminAccounts.map(a => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{a.full_name}</p>
                    <p className="text-xs text-gray-500">{a.email} {!a.is_active && <span className="text-orange-600">(inactive)</span>}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(a, 'admin')}>Edit</Button>
                    <Button size="sm" variant="secondary" onClick={() => disableAccount('admin', a.id)}>Disable</Button>
                    <Button size="sm" variant="danger" onClick={() => deleteAccount('admin', a)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'preceptors' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{preceptors.length} preceptor(s)</p>
                <Button size="sm" onClick={() => startNew('preceptor')}>Add Preceptor</Button>
              </div>
              {preceptors.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.full_name}</p>
                    <p className="text-xs text-gray-500">{p.email || 'No email'} — {p.station_unit || 'Unassigned'}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(p, 'preceptor')}>Edit</Button>
                    <Button size="sm" variant="secondary" onClick={() => disableAccount('preceptor', p.id)}>Disable</Button>
                    <Button size="sm" variant="danger" onClick={() => deleteAccount('preceptor', p)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'students' && (
            <div className="space-y-3">
              <Input placeholder="Search students..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
              {filteredStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.full_name}</p>
                    <p className="text-xs text-gray-500">{s.email} — {s.school_name} — <Badge variant={s.status === 'certified' ? 'green' : s.status === 'pending' ? 'gold' : 'gray'}>{s.status}</Badge></p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(s, 'student')}>Edit</Button>
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && <p className="text-sm text-gray-500">No students found.</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wfd-crimson" /></div>}>
      <AccountsPageInner />
    </Suspense>
  );
}
