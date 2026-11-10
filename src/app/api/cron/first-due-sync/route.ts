import { NextRequest, NextResponse } from 'next/server';
import { runFirstDueSyncJob } from '@/lib/first-due/run';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get('authorization') !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runFirstDueSyncJob(new Date());
  const failed = 'status' in result && result.status === 'failure';

  return NextResponse.json(result, { status: failed ? 500 : 200 });
}
