import PDFDocument from 'pdfkit';

const MONTHS = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const percentage = (value) => `${Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

export function buildMonthlySummaryPdf({ summary, clientName, expandedBlockKeys = [] }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 36, right: 36, bottom: 42, left: 36 }, info: { Title: `Resumo Financeiro ${summary.month}/${summary.year}`, Author: 'Finanças do Zero' } });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    const monthName = MONTHS[Number(summary.month)] || summary.month;
    const left = 36; const width = 467;
    const columns = [{ x: 36, width: 222 }, { x: 258, width: 100 }, { x: 358, width: 100 }, { x: 458, width: 45 }];
    let y = 204;
    const drawHeader = () => {
      doc.rect(left, y, width, 25).fill('#176B32');
      ['Bloco', 'Previsto', 'Pago', '% pago'].forEach((label, index) => doc.fillColor('#fff').font('Helvetica-Bold').fontSize(8).text(label, columns[index].x + 7, y + 9, { width: columns[index].width - 11, align: index ? 'right' : 'left' }));
      y += 25;
    };
    const newTablePage = () => {
      doc.addPage();
      doc.fillColor('#176B32').font('Helvetica-Bold').fontSize(9).text('FINANÇAS DO ZERO', left, 36, { characterSpacing: 1 });
      doc.fillColor('#17231C').fontSize(17).text('Resumo Financeiro Mensal', left, 57);
      doc.fillColor('#5D6B62').font('Helvetica').fontSize(9).text(`${clientName || 'Cliente'} · ${monthName} de ${summary.year}`, left, 80);
      y = 108;
      drawHeader();
    };
    const ensureSpace = (height) => { if (y + height > 748) newTablePage(); };
    const drawCells = (values, { fill = '#fff', boldFirst = true, detail = false } = {}) => {
      const height = detail ? 24 : 27;
      ensureSpace(height);
      doc.rect(left, y, width, height).fill(fill);
      values.forEach((value, index) => doc.fillColor('#17231C').font(index === 0 && boldFirst ? 'Helvetica-Bold' : 'Helvetica').fontSize(detail ? 7.8 : 8.5).text(String(value), columns[index].x + (detail && index === 0 ? 18 : 7), y + (detail ? 8 : 9), { width: columns[index].width - (detail && index === 0 ? 24 : 11), align: index ? 'right' : 'left', lineBreak: false, ellipsis: true }));
      y += height;
    };

    doc.fillColor('#176B32').font('Helvetica-Bold').fontSize(9).text('FINANÇAS DO ZERO', { characterSpacing: 1 });
    doc.moveDown(.7).fillColor('#17231C').fontSize(23).text('Resumo Financeiro Mensal');
    doc.fillColor('#5D6B62').font('Helvetica').fontSize(10).text(`${clientName || 'Cliente'} · ${monthName} de ${summary.year}`);
    const cards = [
      { label: 'Receita prevista', value: summary.totals.plannedRevenue, color: '#17231C' },
      { label: 'Receita paga', value: summary.totals.paidRevenue, color: '#00B84D' },
      { label: 'Saldo previsto', value: summary.totals.plannedBalance, color: summary.totals.plannedBalance < 0 ? '#D93636' : '#00B84D' },
      { label: 'Saldo pago', value: summary.totals.paidBalance, color: summary.totals.paidBalance < 0 ? '#D93636' : '#00B84D' }
    ];
    cards.forEach(({ label, value, color }, index) => {
      const x = left + index * 119;
      doc.roundedRect(x, 116, 110, 58, 8).fillAndStroke('#FFFFFF', '#E2E8E3');
      doc.fillColor('#5D6B62').font('Helvetica').fontSize(7.5).text(label, x + 9, 128, { width: 92 });
      doc.fillColor(color).font('Helvetica-Bold').fontSize(11.5).text(money(value), x + 9, 144, { width: 92, lineBreak: false, ellipsis: true });
    });

    drawHeader();
    summary.blocks.forEach((block) => {
      const open = expandedBlockKeys.includes(block.key);
      drawCells([`${open ? '⌄' : '›'}  ${block.label}`, money(block.planned), money(block.paid), percentage(block.paidPercentage)], { fill: block.key === 'receitas' ? '#EAF7ED' : '#fff' });
      if (!open) return;
      if (!block.entries.length) {
        drawCells(['   Nenhum lançamento neste bloco.', '—', '—', '—'], { fill: '#F7F9F7', boldFirst: false, detail: true });
        return;
      }
      block.entries.forEach((entry, index) => {
        const label = `${entry.groupLabel ? `${entry.groupLabel} · ` : ''}${entry.label}`;
        drawCells([label, money(entry.planned), money(entry.paid), entry.realized ? '✓' : '—'], { fill: index % 2 ? '#F7F9F7' : '#FAFBFA', boldFirst: false, detail: true });
      });
    });
    drawCells(['Total de saídas', money(summary.totals.plannedExpenses), money(summary.totals.paidExpenses), '—'], { fill: '#F3F5F3' });
    drawCells(['Saldo', money(summary.totals.plannedBalance), money(summary.totals.paidBalance), '—'], { fill: '#EAF7ED' });
    ensureSpace(28);
    doc.fillColor('#65736A').font('Helvetica').fontSize(8).text('Valores pagos consideram somente lançamentos marcados como realizados.', left, y + 14);
    doc.end();
  });
}
