import { NextResponse } from 'next/server';
import { loadMonthlySummaryRequest } from '@/src/modules/finance/application/monthly-summary-request';
import { buildMonthlySummaryPdf } from '@/src/modules/finance/application/monthly-summary-export';
import { sendEmail } from '@/src/lib/email/email-service';

export const runtime = 'nodejs';

function escapeHtml(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const month = String(body?.month || ''); const year = String(body?.year || ''); const requestedUserId = body?.user_id;
  try {
    const loaded = await loadMonthlySummaryRequest({ month, year, requestedUserId });
    if (!loaded.ok) return NextResponse.json({ error: loaded.error }, { status: loaded.status });
    const recipient = String(loaded.context.targetProfile?.email || (loaded.context.impersonating ? '' : loaded.context.user?.email) || '').trim();
    if (!recipient) return NextResponse.json({ error: 'recipient_email_missing' }, { status: 409 });
    const clientName = loaded.context.targetProfile?.full_name || recipient;
    const pdf = await buildMonthlySummaryPdf({ summary: loaded.summary, clientName });
    const subject = `Resumo financeiro de ${month}/${year} - Finanças do Zero`;
    const sent = await sendEmail({ userId: loaded.context.targetUserId, to: recipient, subject, emailType: 'monthly_financial_summary', html: `<p>Olá, ${escapeHtml(clientName)}.</p><p>Seu resumo financeiro de <strong>${month}/${year}</strong> está pronto.</p><p>O relatório em PDF segue anexado.</p>`, emailSnapshot: { month, year, ...loaded.summary.totals }, attachments: [{ filename: `resumo-financeiro-${year}-${month}.pdf`, content: pdf }] });
    if (!sent.success) return NextResponse.json({ error: sent.error || 'monthly_email_failed' }, { status: 502 });
    return NextResponse.json({ ok: true, recipient });
  } catch (error) { console.error('[finance/month/email] failed:', error); return NextResponse.json({ error: 'monthly_email_failed' }, { status: 500 }); }
}
