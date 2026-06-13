'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { approveStudent } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export function DailyOps() {
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [tickerEvents, setTickerEvents] = useState<any[]>([]);
  const [approving, setApproving] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [welcomePreview, setWelcomePreview] = useState<{ title: string; body: string; is_active: boolean } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [
      { data: pending },
      { data: allStudents },
      { data: allSchedules },
      { data: recentEvals },
      { data: allTemplates },
      { data: welcomeMsg },
    ] = await Promise.all([
      supabase.from('students').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('students').select('*').order('created_at', { ascending: false }),
      supabase.from('schedules').select('*, students!inner(full_name, email)').order('created_at', { ascending: false }),
      supabase.from('evaluations').select('*, students!inner(full_name), preceptors!inner(full_name)').order('created_at', { ascending: false }).limit(10),
      supabase.from('message_templates').select('*').order('created_at', { ascending: false }),
      supabase.from('message_templates').select('*').eq('template_type', 'welcome').limit(1),
    ]);

    setPendingStudents(pending ?? []);
    setStudents(allStudents ?? []);
    setSchedules(allSchedules ?? []);
    setTickerEvents(
      (recentEvals ?? []).map((e: any) => ({
        type: 'evaluation',
        text: `${e.students?.full_name} evaluated ${e.preceptors?.full_name} (${e.overall_rating}/5)`,
        time: e.created_at,
      }))
    );
    setTemplates(allTemplates ?? []);
    if (welcomeMsg?.[0]) {
      setWelcomePreview({ title: welcomeMsg[0].title, body: welcomeMsg[0].body, is_active: welcomeMsg[0].is_active });
    }
  };

  const handleApprove = async (student: any) => {
    setApproving(student.id);
    try {
      await approveStudent(student.id, student.email);
      await loadAll();
      setTickerEvents((prev) => [
        { type: 'approval', text: `Approved: ${student.full_name}`, time: new Date().toISOString() },
        ...prev,
      ]);
    } catch (e) {
      console.error('Approval failed:', e);
    }
    setApproving(null);
  };

  const handleScheduleAction = async (scheduleId: string, status: 'approved' | 'rejected') => {
    await supabase.from('schedules').update({ status }).eq('id', scheduleId);
    await loadAll();
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeStudentId) return;
    await supabase.from('messages').insert({
      student_id: activeStudentId,
      sender: 'admin',
      message_text: replyText.trim(),
    });
    setReplyText('');
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('student_id', activeStudentId)
      .order('created_at', { ascending: true });
    setMessages(msgs ?? []);
  };

  const handleKillSwitch = async (student: any) => {
    const newState = !student.is_blacklisted;
    if (newState && !confirm(`Are you sure you want to blacklist ${student.full_name}? This will prevent them from accessing the portal.`)) {
      return;
    }
    await supabase
      .from('students')
      .update({ is_blacklisted: newState })
      .eq('id', student.id);
    await loadAll();
  };

  const handleNoShow = async (student: any) => {
    const newCount = (student.no_show_count || 0) + 1;
    await supabase
      .from('students')
      .update({ no_show_count: newCount })
      .eq('id', student.id);
    await loadAll();
  };

  const handleDeleteStudent = async (student: any) => {
    if (!confirm(`Are you sure you want to permanently delete ${student.full_name} (${student.email})? This will remove their student record, schedules, evaluations, and messages. This cannot be undone.`)) {
      return;
    }
    if (!confirm(`FINAL WARNING: All data for ${student.full_name} will be permanently deleted. Proceed?`)) {
      return;
    }
    const adminClient = createAdminClient();
    try { await adminClient.auth.admin.deleteUser(student.id); } catch {}
    try {
      await supabase.from('students').delete().eq('id', student.id);
      await loadAll();
    } catch {}
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    setBroadcasting(true);
    const certifiedStudents = students.filter((s: any) => s.status === 'certified' && !s.is_blacklisted);
    if (certifiedStudents.length === 0) {
      alert('No certified students to broadcast to.');
      setBroadcasting(false);
      return;
    }
    const { data: broadcast } = await supabase.from('broadcasts').insert({
      title: broadcastTitle.trim(),
      body: broadcastBody.trim(),
      sent_by: 'admin',
    }).select('id').single();
    if (broadcast) {
      await supabase.from('messages').insert(
        certifiedStudents.map((s: any) => ({
          student_id: s.id,
          sender: 'admin' as const,
          message_text: broadcastTitle.trim() + '\n\n' + broadcastBody.trim(),
          broadcast_id: broadcast.id,
        }))
      );
      await supabase.from('broadcasts').update({ recipient_count: certifiedStudents.length }).eq('id', broadcast.id);
    }
    setBroadcastTitle(''); setBroadcastBody(''); setShowBroadcast(false); setBroadcasting(false);
    await loadAll();
  };

  const handleSaveTemplate = async () => {
    if (!templateTitle.trim() || !templateBody.trim()) return;
    setSavingTemplate(true);
    const payload: any = { title: templateTitle.trim(), body: templateBody.trim(), template_type: 'general', updated_at: new Date().toISOString() };
    if (editingTemplateId) {
      await supabase.from('message_templates').update(payload).eq('id', editingTemplateId);
    } else {
      await supabase.from('message_templates').insert({ ...payload, is_active: true, template_type: 'general' });
    }
    setTemplateTitle(''); setTemplateBody(''); setEditingTemplateId(null); setSavingTemplate(false);
    await loadAll();
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    await supabase.from('message_templates').delete().eq('id', id);
    await loadAll();
  };

  const useTemplate = (body: string, target: 'reply' | 'broadcast') => {
    if (target === 'reply') setReplyText(body);
    else setBroadcastBody(body);
  };

  const loadMessages = async (studentId: string) => {
    setActiveStudentId(studentId);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true });
    setMessages(data ?? []);
  };

  const filteredSchedules = schedules.filter((s: any) => s.status === 'pending');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Student Approval Queue */}
      <Card className="p-4">
        <h3 className="font-bold text-wfd-charcoal mb-3">Student Approval Queue</h3>
        {pendingStudents.length === 0 ? (
          <p className="text-gray-400 text-sm">No pending students.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pendingStudents.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{s.full_name}</p>
                  <p className="text-xs text-gray-500">{s.school_name} — {s.instructor_name}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleApprove(s)}
                  loading={approving === s.id}
                  className="ml-3 flex-shrink-0"
                >
                  Approve
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Schedule Request Management */}
      <Card className="p-4">
        <h3 className="font-bold text-wfd-charcoal mb-3">Schedule Requests</h3>
        {filteredSchedules.length === 0 ? (
          <p className="text-gray-400 text-sm">No pending shift requests.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredSchedules.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{s.students?.full_name}</p>
                  <p className="text-xs text-gray-500">
                    {s.date} — {s.shift_type}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleScheduleAction(s.id, 'approved')}>
                    Approve
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleScheduleAction(s.id, 'rejected')}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Threaded Messaging */}
      <Card className="p-4 lg:col-span-2">
        <h3 className="font-bold text-wfd-charcoal mb-3">Student Messages</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 border-r border-gray-200 pr-2 max-h-64 overflow-y-auto">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => loadMessages(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeStudentId === s.id
                    ? 'bg-wfd-crimson text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {s.full_name}
              </button>
            ))}
          </div>
          <div className="md:col-span-3">
            {activeStudentId ? (
              <div className="flex flex-col h-64">
                <div className="flex-1 overflow-y-auto space-y-2 mb-2">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`text-sm px-3 py-1.5 rounded-lg max-w-[80%] ${
                        m.sender === 'admin'
                          ? 'bg-wfd-charcoal text-white ml-auto'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {m.message_text}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder="Reply..."
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-wfd-charcoal outline-none text-gray-900"
                  />
                  <select
                    onChange={(e) => { if (e.target.value) useTemplate(e.target.value, 'reply'); e.target.value = ''; }}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600"
                    defaultValue=""
                  >
                    <option value="" disabled>Templates...</option>
                    {templates.filter((t: any) => t.template_type === 'general').map((t: any) => (
                      <option key={t.id} value={t.body}>{t.title}</option>
                    ))}
                  </select>
                  <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                    Send
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowBroadcast(true)}>
                    Broadcast
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-8 text-center">Select a student to view messages.</p>
            )}
          </div>
        </div>
      </Card>

      {/* Student Roster with Actions */}
      <Card className="p-4 lg:col-span-2">
        <h3 className="font-bold text-wfd-charcoal mb-3">Student Roster</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2 px-3 font-medium text-gray-500">Student</th>
                <th className="py-2 px-3 font-medium text-gray-500">Status</th>
                <th className="py-2 px-3 font-medium text-gray-500">No-Shows</th>
                <th className="py-2 px-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <a href={`/admin/accounts?edit=${s.id}`} className="font-medium text-wfd-crimson hover:underline">{s.full_name}</a>
                    <p className="text-xs text-gray-400">{s.email}</p>
                  </td>
                  <td className="py-2 px-3">
                    <Badge variant={s.status === 'certified' ? 'green' : s.status === 'pending' ? 'gold' : 'gray'}>
                      {s.status}
                    </Badge>
                    {s.is_blacklisted && <Badge variant="red" className="ml-1">Blacklisted</Badge>}
                    {(s.no_show_count >= 3) && (
                      <Badge variant="red" className="ml-1">{s.no_show_count} no-shows</Badge>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <Button variant="secondary" size="sm" onClick={() => handleNoShow(s)}>
                      +No-Show ({s.no_show_count || 0})
                    </Button>
                  </td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => handleKillSwitch(s)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        s.is_blacklisted
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {s.is_blacklisted ? 'Reactivate' : 'Blacklist'}
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(s)}
                      className="px-3 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 ml-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4 lg:col-span-2">
        <h3 className="font-bold text-wfd-charcoal mb-3">Recent Activity</h3>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {tickerEvents.map((evt, i) => (
            <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${
                evt.type === 'approval' ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              {evt.text}
              <span className="text-xs text-gray-400">
                {new Date(evt.time).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Message Templates */}
      <Card className="p-4 lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-wfd-charcoal">Message Templates</h3>
          <Button type="button" size="sm" variant="secondary" onClick={() => setShowTemplates(!showTemplates)}>
            {showTemplates ? 'Hide' : 'Manage'}
          </Button>
        </div>
        {showTemplates && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {templates.filter((t: any) => t.template_type !== 'welcome').map((t: any) => (
                <div key={t.id} className="rounded-lg border border-gray-200 p-2 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-gray-500 truncate">{t.body.substring(0, 60)}...</p>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" size="sm" variant="secondary" onClick={() => { setEditingTemplateId(t.id); setTemplateTitle(t.title); setTemplateBody(t.body); }}>Edit</Button>
                    <Button type="button" size="sm" variant="danger" onClick={() => handleDeleteTemplate(t.id)}>Del</Button>
                  </div>
                </div>
              ))}
              {templates.filter((t: any) => t.template_type !== 'welcome').length === 0 && <p className="text-sm text-gray-500">No templates.</p>}
            </div>
            <div className="space-y-2">
              <Input label="Template Title" value={templateTitle} onChange={(e) => setTemplateTitle(e.target.value)} />
              <label className="block text-sm font-medium text-gray-700">
                Body
                <textarea value={templateBody} onChange={(e) => setTemplateBody(e.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" />
              </label>
              <Button type="button" onClick={handleSaveTemplate} loading={savingTemplate}>
                {editingTemplateId ? 'Update Template' : 'Create Template'}
              </Button>
              {editingTemplateId && <Button type="button" variant="secondary" size="sm" onClick={() => { setEditingTemplateId(null); setTemplateTitle(''); setTemplateBody(''); }}>Cancel</Button>}
            </div>
          </div>
        )}
      </Card>

      {/* Welcome Message Preview */}
      <Card className="p-4 lg:col-span-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-wfd-charcoal text-sm">Welcome Message</h3>
            {welcomePreview ? (
              <div className="mt-1">
                <p className="text-sm font-medium truncate">{welcomePreview.title}</p>
                <p className="text-xs text-gray-500 truncate">{welcomePreview.body.substring(0, 100)}{welcomePreview.body.length > 100 ? '...' : ''}</p>
                {!welcomePreview.is_active && <span className="text-xs text-orange-600 font-medium">(inactive)</span>}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1">No welcome message configured.</p>
            )}
          </div>
          <a href="/admin/setup" className="text-xs text-wfd-crimson hover:underline whitespace-nowrap shrink-0">
            Edit in Onboarding Setup →
          </a>
        </div>
      </Card>

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowBroadcast(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-wfd-charcoal mb-4">Send Broadcast to All Students</h3>
            <div className="space-y-3">
              <Input label="Title" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
              <label className="block text-sm font-medium text-gray-700">
                Message
                <textarea value={broadcastBody} onChange={(e) => setBroadcastBody(e.target.value)} className="mt-1 min-h-32 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" />
              </label>
              <select onChange={(e) => { if (e.target.value) useTemplate(e.target.value, 'broadcast'); e.target.value = ''; }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600" defaultValue="">
                <option value="" disabled>Insert template...</option>
                {templates.filter((t: any) => t.template_type === 'general').map((t: any) => (
                  <option key={t.id} value={t.body}>{t.title}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button type="button" onClick={handleSendBroadcast} loading={broadcasting}>
                  Send to {students.filter((s: any) => s.status === 'certified' && !s.is_blacklisted).length} students
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowBroadcast(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
