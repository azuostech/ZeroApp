import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/src/lib/supabase/server';
import { getCurrentProfile } from '@/src/modules/profile/application/profile-service';
import { loadFinancialMonth, saveFinancialMonth, validateMonthYear } from '@/src/modules/finance/application/finance-service';

export async function GET(request) {
  const month = request.nextUrl.searchParams.get('month');
  const year = request.nextUrl.searchParams.get('year');

  if (!validateMonthYear(month, year)) {
    return NextResponse.json({ error: 'invalid_month_or_year' }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { user, profile } = await getCurrentProfile(supabase);

  if (!user || !profile) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (profile.status !== 'active') return NextResponse.json({ error: 'inactive_account' }, { status: 403 });

  try {
    const data = await loadFinancialMonth({
      supabase,
      userId: user.id,
      month,
      year
    });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await request.json();
  const { month, year, data } = body || {};

  if (!validateMonthYear(month, year)) {
    return NextResponse.json({ error: 'invalid_month_or_year' }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { user, profile } = await getCurrentProfile(supabase);

  if (!user || !profile) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (profile.status !== 'active') return NextResponse.json({ error: 'inactive_account' }, { status: 403 });

  try {
    await saveFinancialMonth({
      supabase,
      userId: user.id,
      month,
      year,
      data
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
