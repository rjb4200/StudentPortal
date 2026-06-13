'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { approveStudent } from '@/lib/auth';

export function DailyOps() {
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [notePriority, setNotePriority] = useState<'normal' | 'high_accessibility'>('normal');
  const [tickerEvents, setTickerEvents] = useState<any[]>([]);
  const [approving, setApproving] = useState<string | null>(null);

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
    ] = await Promise.all([
      supabase.from('students').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('students').select('*').order('created_at', { ascending: false }),
      supabase.from('schedules').select('*, students!inner(full_name, email)').order('created_at', { ascending: false }),
      supabase.from('evaluations').select('*, students!inner(full_name), preceptors!inner(full_name)').order('created_at', { ascending: false }).limit(10),
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

  const handleAddNote = async (studentId: string) => {
    if (!noteText.trim()) return;
    await supabase.from('admin_notes').insert({
      student_id: studentId,
      note_text: noteText.trim(),
      priority: notePriority,
    });
    setNoteText('');
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
                  <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                    Send
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
                <th className="py-2 px-3 font-medium text-gray-500">Notes</th>
                <th className="py-2 px-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <p className="font-medium">{s.full_name}</p>
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
                    <div className="flex items-center gap-1">
                      <select
                        value={notePriority}
                        onChange={(e) => setNotePriority(e.target.value as any)}
                        className="text-xs border border-gray-200 rounded px-1 py-0.5"
                      >
                        <option value="normal">Normal</option>
                        <option value="high_accessibility">High Pri</option>
                      </select>
                      <input
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add note..."
                        className="text-xs border border-gray-200 rounded px-2 py-0.5 w-24"
                      />
                      <button
                        onClick={() => handleAddNote(s.id)}
                        className="text-xs text-wfd-crimson hover:underline"
                      >
                        Save
                      </button>
                    </div>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Active Students Ticker */}
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
    </div>
  );
}
