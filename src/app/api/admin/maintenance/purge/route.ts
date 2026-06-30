import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { auditLog } from '@/lib/audit';
import { canAccessAdmin } from '@/lib/roles';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';
import { maintenancePurgeBody } from '@/lib/validation';

const DELETE_TABLES = ['messages', 'admin_notes', 'evaluations', 'schedules', 'students'] as const;
const PRESERVED_CATEGORIES = ['preceptors', 'audit_log', 'instructors', 'training_sites', 'training_classes'];

async function getAdminUser(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const authClient = createServerClient(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () =>
          cookieHeader
            .split(';')
            .filter(Boolean)
            .map((c) => {
              const [name, ...rest] = c.trim().split('=');
              return { name, value: rest.join('=') };
            })
            .filter((cookie) => cookie.name),
        setAll: () => {},
      },
    }
  );

  const { data: { user } } = await authClient.auth.getUser();
  return canAccessAdmin(user) ? user : null;
}

async function getPurgeSummary(supabase: ReturnType<typeof createAdminClient>) {
  const counts: Record<typeof DELETE_TABLES[number], number> = {
    messages: 0,
    admin_notes: 0,
    evaluations: 0,
    schedules: 0,
    students: 0,
  };

  for (const table of DELETE_TABLES) {
    const { count, error } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true });

    if (error) throw new Error(`Failed to count ${table}: ${error.message}`);
    counts[table] = count ?? 0;
  }

  return {
    counts,
    totalRecords: Object.values(counts).reduce((sum, value) => sum + value, 0),
    preservedCategories: PRESERVED_CATEGORIES,
  };
}

export async function GET(request: NextRequest) {
  const user = await getAdminUser(request);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const summary = await getPurgeSummary(createAdminClient());
    return NextResponse.json(summary);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to build purge summary' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAdminUser(request);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = maintenancePurgeBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const supabase = createAdminClient();
  let summary;
  try {
    summary = await getPurgeSummary(supabase);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to build purge summary' }, { status: 500 });
  }

  for (const table of DELETE_TABLES) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      await auditLog(
        `Maintenance purge failed at ${table}; reason="${parsed.data.reason}"; impact=${JSON.stringify(summary.counts)}`,
        user.email || user.id || 'unknown'
      );
      return NextResponse.json({ error: `Failed to purge ${table}: ${error.message}` }, { status: 500 });
    }
  }

  await auditLog(
    `Maintenance purge completed; reason="${parsed.data.reason}"; impact=${JSON.stringify(summary.counts)}; preserved=${PRESERVED_CATEGORIES.join(', ')}`,
    user.email || user.id || 'unknown'
  );

  return NextResponse.json({ success: true, summary });
}
