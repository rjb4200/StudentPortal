import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { studentId, ruleId } = await request.json();

    if (!studentId || !ruleId) {
      return NextResponse.json({ error: 'studentId and ruleId required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const [studentRes, ruleRes] = await Promise.all([
      supabase.from('students').select('full_name, email').eq('id', studentId).single(),
      supabase.from('quiz_rules').select('title').eq('id', ruleId).single(),
    ]);

    if (!studentRes.data) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    if (!ruleRes.data) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    const { error } = await supabase.from('quiz_flags').upsert(
      {
        student_id: studentId,
        rule_id: ruleId,
        rule_title: ruleRes.data.title,
        student_name: studentRes.data.full_name,
        student_email: studentRes.data.email,
        attempt_count: 0,
        acknowledged: false,
        acknowledged_by: null,
        acknowledged_at: null,
      },
      {
        onConflict: 'student_id,rule_id',
        ignoreDuplicates: false,
      }
    );

    if (error && !error.message?.includes('duplicate')) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
