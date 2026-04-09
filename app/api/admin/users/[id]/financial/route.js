import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/src/lib/supabase/server';
import { getCurrentProfile } from '@/src/modules/profile/application/profile-service';
import { getUserFinancialHistory } from '@/src/modules/admin/application/admin-service';

export async function GET(_request, { params }) {
  const { id } = params;
  const supabase = await createServerSupabase();
  const { profile } = await getCurrentProfile(supabase);

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const data = await getUserFinancialHistory({ supabase, userId: id });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
