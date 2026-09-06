import { createServerSupabase } from '@/src/lib/supabase/server';
import { resolveImpersonationContext } from '@/src/modules/admin/application/admin-impersonation-service';
import { loadFinancialMonth, validateMonthYear } from './finance-service';
import { buildMonthlyFinancialSummary } from './monthly-summary-service';

export async function loadMonthlySummaryRequest({ month, year, requestedUserId }) {
  if (!validateMonthYear(month, year)) return { ok: false, status: 400, error: 'invalid_month_or_year' };
  const supabase = await createServerSupabase();
  const context = await resolveImpersonationContext({ supabase, requestedUserId });
  if (!context.ok) return context;
  if (!context.isAdmin && context.profile.status !== 'active') return { ok: false, status: 403, error: 'inactive_account' };
  const data = await loadFinancialMonth({ supabase, userId: context.targetUserId, month, year });
  return { ok: true, supabase, context, summary: buildMonthlyFinancialSummary({ data, month, year }) };
}
