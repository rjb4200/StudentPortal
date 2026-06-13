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

export default function DashboardPage() {
  const [student, setStudent] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'preceptors' | 'messages'>('calendar');
  const [loading, setLoading] = useState(true);

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

      const { data: schedules } = await supabase
        .from('schedules')
        .select('*')
        .eq('student_id', student.id)
        .order('date', { ascending: true });

      setSchedules(schedules ?? []);
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
  );
}
