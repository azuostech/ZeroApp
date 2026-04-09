import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/src/lib/supabase/server';
import { getCurrentProfile } from '@/src/modules/profile/application/profile-service';
import { validateMonthYear } from '@/src/modules/finance/application/finance-service';
import {
  parseStructureOperation,
  replicateStructureOperation
} from '@/src/modules/finance/application/structure-sync-service';

export async function POST(request) {
  const body = await request.json();
  const currentMonth = body?.month;
  const currentYear = body?.year;
  const operation = body?.operation;

  if (!validateMonthYear(currentMonth, currentYear)) {
    return NextResponse.json({ error: 'invalid_month_or_year' }, { status: 400 });
  }

  const parsed = parseStructureOperation(operation);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.reason }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { user, profile } = await getCurrentProfile(supabase);

  if (!user || !profile) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (profile.status !== 'active') {
    return NextResponse.json({ error: 'inactive_account' }, { status: 403 });
  }

  try {
    const result = await replicateStructureOperation({
      supabase,
      userId: user.id,
      currentMonth,
      currentYear,
      operation: parsed.value
    });

    return NextResponse.json({
      ok: true,
      affectedMonths: result.affectedMonths
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
