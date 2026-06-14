'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CalendarGrid } from '@/components/dashboard/calendar-grid';
import { ShiftModal } from '@/components/dashboard/shift-modal';
import { PreceptorGallery } from '@/components/dashboard/preceptor-gallery';
import { EvaluationForm } from '@/components/dashboard/evaluation-form';
import { Messages } from '@/components/dashboard/messages';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [student, setStudent] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'preceptors' | 'messages'>('calendar');
  const [loading, setLoading] = useState(true);
  const [welcomeMsg, setWelcomeMsg] = useState<{ title: string; body: string } | null>(null);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('id', user.id)
      .single();

    if (student) {
      setStudent(student);

      const [{ data: schedules }, { data: welcome }] = await Promise.all([
        supabase.from('schedules').select('*').eq('student_id', student.id).order('date', { ascending: true }),
        supabase.from('message_templates').select('title, body').eq('template_type', 'welcome').eq('is_active', true).limit(1),
      ]);

      setSchedules(schedules ?? []);
      if (welcome?.[0]) setWelcomeMsg(welcome[0]);
    }
    setLoading(false);
  };

  const handleDateClick = (date: string) => {
    const existing = schedules.find((s) => s.date === date);
    if (existing) return;
    const today = new Date().toISOString().split('T')[0];
    if (date < today) return;
    setSelectedDate(date);
    setShowShiftModal(true);
  };

  const handleShiftSubmit = async (shiftType: 'full' | 'day' | 'night') => {
    if (!selectedDate || !student) return;

    const { data: schedule } = await supabase
      .from('schedules')
      .insert({
        student_id: student.id,
        date: selectedDate,
        shift_type: shiftType,
        status: 'pending',
      })
      .select()
      .single();

    if (schedule) {
      setSchedules((prev) => [...prev, schedule]);
    }
    setShowShiftModal(false);
    setSelectedDate(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wfd-crimson" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wfd-charcoal">
            Welcome, {student?.full_name}
          </h1>
          <p className="text-gray-500">
            {student?.school_name}
            {student?.status === 'certified' && (
              <Badge variant="green" className="ml-2">Certified</Badge>
            )}
            {student?.status === 'pending' && (
              <Badge variant="gold" className="ml-2">Pending Approval</Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-wfd-crimson text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('preceptors')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'preceptors'
                ? 'bg-wfd-crimson text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Preceptors
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'messages'
                ? 'bg-wfd-crimson text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Messages
          </button>
        </div>
      </div>

      {student?.status === 'pending' ? (
        <div className="space-y-6">
          <Card className="p-6 bg-amber-50 border-amber-200">
            <h2 className="text-lg font-bold text-amber-900 mb-3">Account Pending Approval</h2>
            <p className="text-sm text-amber-800 leading-relaxed mb-4">
              Your onboarding has been received and is awaiting administrative review. Once approved, you&apos;ll be able to request shifts, view preceptor profiles, and message administrators.
            </p>
            <p className="text-sm text-amber-700">
              You&apos;ll receive an email when your account has been approved.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-wfd-charcoal mb-3">Calendar Feed</h3>
            <p className="text-sm text-gray-500 mb-2">
              Subscribe to your personal calendar to see scheduled shifts once approved.
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 truncate">
                /api/calendar/{student?.id}.ics
              </code>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/api/calendar/${student?.id}.ics`;
                  navigator.clipboard.writeText(url);
                }}
                className="text-xs text-wfd-crimson hover:underline whitespace-nowrap"
              >
                Copy
              </button>
            </div>
          </Card>
        </div>
      ) : (
        <div>
        {welcomeMsg && !welcomeDismissed && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-blue-900 mb-1">{welcomeMsg.title}</h3>
              <p className="text-sm text-blue-800 whitespace-pre-line">{welcomeMsg.body}</p>
            </div>
            <button
              onClick={() => setWelcomeDismissed(true)}
              className="text-blue-400 hover:text-blue-600 text-lg leading-none shrink-0"
            >
              ×
            </button>
          </div>
        </Card>
      )}

      {student?.status === 'certified' && !student?.password_changed && (
        <PasswordChangePrompt studentId={student?.id} onChanged={() => setStudent({ ...student, password_changed: true })} />
      )}

      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CalendarGrid
              schedules={schedules}
              onDateClick={handleDateClick}
            />
          </div>
          <div>
            <Card className="p-4">
              <h3 className="font-semibold text-wfd-charcoal mb-3">iCal Feed</h3>
              <p className="text-sm text-gray-500 mb-2">
                Subscribe in Google Calendar or Apple Calendar to see your shifts.
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 truncate">
                  /api/calendar/{student?.id}.ics
                </code>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/api/calendar/${student?.id}.ics`;
                    navigator.clipboard.writeText(url);
                  }}
                  className="text-xs text-wfd-crimson hover:underline whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'preceptors' && (
        <div className="space-y-6">
          <PreceptorGallery />
          <EvaluationForm studentId={student?.id} />
        </div>
      )}

      {activeTab === 'messages' && <Messages studentId={student?.id} />}

      <ShiftModal
        open={showShiftModal}
        onClose={() => {
          setShowShiftModal(false);
          setSelectedDate(null);
        }}
        date={selectedDate}
        onSubmit={handleShiftSubmit}
      />
    </div>
      )}
    </div>
  );
}

function PasswordChangePrompt({ studentId, onChanged }: { studentId: string; onChanged: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async () => {
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setChanging(true); setError('');
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) { setError(updateError.message); setChanging(false); return; }

    await supabase.from('students').update({ password_changed: true }).eq('id', studentId);
    setChanging(false);
    onChanged();
  };

  return (
    <Card className="p-4 bg-amber-50 border-amber-200">
      <h3 className="font-bold text-amber-900 mb-1">Change Your Password</h3>
      <p className="text-sm text-amber-800 mb-3">Your account uses a temporary password. Please set a new one.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="px-3 py-1.5 border border-amber-300 rounded-lg text-sm" />
        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="px-3 py-1.5 border border-amber-300 rounded-lg text-sm" />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      <Button onClick={handleChange} loading={changing} size="sm" className="mt-2">Update Password</Button>
    </Card>
  );
}
