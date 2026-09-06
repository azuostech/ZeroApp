import { NextResponse } from 'next/server';
import { loadMonthlySummaryRequest } from '@/src/modules/finance/application/monthly-summary-request';
import { recordAdminAudit } from '@/src/modules/admin/application/admin-audit-service';

export async function GET(request) {
  const month = request.nextUrl.searchParams.get('month');
  const year = request.nextUrl.searchParams.get('year');
  const requestedUserId = request.nextUrl.searchParams.get('user_id');
  try {
    const loaded = await loadMonthlySummaryRequest({ month, year, requestedUserId });
    if (!loaded.ok) return NextResponse.json({ error: loaded.error }, { status: loaded.status });
    if (loaded.context.impersonating) await recordAdminAudit({ supabase: loaded.supabase, adminUserId: loaded.context.user.id, targetUserId: loaded.context.targetUserId, action: 'read', resource: 'financial_month_summary', resourceId: `${year}-${month}`, metadata: { month, year } });
    return NextResponse.json({ summary: loaded.summary, recipient: { name: loaded.context.targetProfile?.full_name || '', email: loaded.context.targetProfile?.email || (loaded.context.impersonating ? '' : loaded.context.user?.email) || '' } });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'monthly_summary_failed' }, { status: 500 });
  }
}
