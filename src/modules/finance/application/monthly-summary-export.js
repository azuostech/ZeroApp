import PDFDocument from 'pdfkit';

const MONTHS = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function buildMonthlySummaryPdf({ summary, clientName }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 36, right: 36, bottom: 42, left: 36 }, info: { Title: `Resumo Financeiro ${summary.month}/${summary.year}`, Author: 'Finanças do Zero' } });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk)); doc.on('error', reject); doc.on('end', () => resolve(Buffer.concat(chunks)));
    const monthName = MONTHS[Number(summary.month)] || summary.month;
    doc.fillColor('#176B32').font('Helvetica-Bold').fontSize(9).text('FINANÇAS DO ZERO', { characterSpacing: 1 });
    doc.moveDown(.7).fillColor('#17231C').fontSize(23).text('Resumo Financeiro Mensal');
    doc.fillColor('#5D6B62').font('Helvetica').fontSize(10).text(`${clientName || 'Cliente'} · ${monthName} de ${summary.year}`);
    const cards = [['Receita prevista', summary.totals.plannedRevenue], ['Receita paga', summary.totals.paidRevenue], ['Saldo pago', summary.totals.paidBalance]];
    cards.forEach(([label, value], i) => { const x = 36 + i * 174; doc.roundedRect(x, 116, 158, 58, 8).fill(i === 1 ? '#F5F7F5' : '#EAF7ED'); doc.fillColor('#5D6B62').font('Helvetica').fontSize(8).text(label, x + 11, 128); doc.fillColor('#176B32').font('Helvetica-Bold').fontSize(14).text(money(value), x + 11, 144); });
    let y = 204; const widths = [145, 116, 116, 90]; const xs = [36, 181, 297, 413];
    const header = () => { doc.rect(36, y, 467, 25).fill('#176B32'); ['Bloco', 'Previsto', 'Pago', '% pago'].forEach((label, i) => doc.fillColor('#fff').font('Helvetica-Bold').fontSize(8).text(label, xs[i] + 8, y + 9, { width: widths[i] - 12, align: i ? 'right' : 'left' })); y += 25; };
    const row = (label, planned, paid, pct, fill = '#fff') => { if (y > 720) { doc.addPage(); y = 42; header(); } doc.rect(36, y, 467, 27).fill(fill); [label, money(planned), money(paid), `${Number(pct || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`].forEach((value, i) => doc.fillColor('#17231C').font(i ? 'Helvetica' : 'Helvetica-Bold').fontSize(8.5).text(value, xs[i] + 8, y + 9, { width: widths[i] - 12, align: i ? 'right' : 'left' })); y += 27; };
    header(); summary.blocks.forEach((block) => row(block.label, block.planned, block.paid, block.paidPercentage, block.key === 'receitas' ? '#EAF7ED' : '#fff'));
    row('Total de saídas', summary.totals.plannedExpenses, summary.totals.paidExpenses, 0, '#F3F5F3'); row('Saldo', summary.totals.plannedBalance, summary.totals.paidBalance, 0, '#EAF7ED');
    doc.fillColor('#65736A').font('Helvetica').fontSize(8).text('Valores pagos consideram somente lançamentos marcados como realizados.', 36, y + 16);
    doc.end();
  });
}
