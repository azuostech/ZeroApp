import { NextResponse } from 'next/server';
import { loadMonthlySummaryRequest } from '@/src/modules/finance/application/monthly-summary-request';
import { buildMonthlySummaryPdf } from '@/src/modules/finance/application/monthly-summary-export';

export const runtime = 'nodejs';

const MONTHLY_BLOCK_KEYS = new Set(['receitas', 'pagar-primeiro', 'doar', 'contas', 'investimentos', 'desfrute']);

function expandedBlockKeys(value) {
  return String(value || '').split(',').map((key) => key.trim()).filter((key) => MONTHLY_BLOCK_KEYS.has(key));
}

export async function GET(request) {
  const month = request.nextUrl.searchParams.get('month'); const year = request.nextUrl.searchParams.get('year'); const requestedUserId = request.nextUrl.searchParams.get('user_id'); const expandedBlocks = expandedBlockKeys(request.nextUrl.searchParams.get('expanded_blocks'));
  try {
    const loaded = await loadMonthlySummaryRequest({ month, year, requestedUserId });
    if (!loaded.ok) return NextResponse.json({ error: loaded.error }, { status: loaded.status });
    const clientName = loaded.context.targetProfile?.full_name || loaded.context.targetProfile?.email || 'cliente';
    const pdf = await buildMonthlySummaryPdf({ summary: loaded.summary, clientName, expandedBlockKeys: expandedBlocks });
    return new NextResponse(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="resumo-financeiro-${year}-${month}.pdf"`, 'Cache-Control': 'private, no-store' } });
  } catch (error) { console.error('[finance/month/export] failed:', error); return NextResponse.json({ error: 'monthly_export_failed' }, { status: 500 }); }
}
