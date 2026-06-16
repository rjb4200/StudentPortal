import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPushoverAlert } from '@/lib/pushover';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  try {
    const supabase = createAdminClient();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DB_TIMEOUT')), 5000)
    );

    const queryPromise = supabase.from('audit_log').select('id').limit(1);

    await Promise.race([queryPromise, timeoutPromise]);

    const latency = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      latency_ms: latency,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    const latency = Date.now() - startTime;

    await sendPushoverAlert(
      'WFD EMS Portal: Health Check FAILED',
      `Health check failed after ${latency}ms. Error: ${err?.message || 'Unknown'}`,
      { priority: 2, retry: 30, expire: 3600 }
    );

    return NextResponse.json(
      { status: 'unhealthy', latency_ms: latency, error: err?.message },
      { status: 500 }
    );
  }
}
