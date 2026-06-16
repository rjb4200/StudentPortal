import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
  }

  const supabase = createClient();

  const { data } = await supabase
    .from('portal_settings')
    .select('value')
    .eq('key', key)
    .single();

  return NextResponse.json({ key, value: data?.value ?? null });
}
