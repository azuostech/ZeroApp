import { normalizeFinancialData } from '../domain/defaults';

export const MONTHLY_BLOCKS = [
  { key: 'receitas', label: 'Receitas', type: 'revenue' },
  { key: 'pagar-primeiro', label: 'Se Pagar Primeiro', type: 'expense' },
  { key: 'doar', label: 'Doação', type: 'expense' },
  { key: 'contas', label: 'Contas', type: 'expense' },
  { key: 'investimentos', label: 'Investimentos', type: 'expense' },
  { key: 'desfrute', label: 'Desfrute', type: 'expense' }
];

function money(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const raw = String(value || '').trim().replace(/[^\d,.-]/g, '');
  if (!raw) return 0;
  const parsed = Number(raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function realized(item) {
  return item?.realized === true || ['true', '1', 'sim', 'yes'].includes(String(item?.realized || '').toLowerCase());
}

function round(value) { return Math.round((value + Number.EPSILON) * 100) / 100; }
function percentage(value, revenue) { return revenue ? Math.round((value / revenue) * 1000) / 10 : 0; }

function itemSummary(item, groupLabel = '') {
  const planned = money(item?.valor_previsto ?? item?.valor);
  const paid = realized(item) ? money(item?.valor_realizado) : 0;
  return { label: String(item?.nome || 'Sem descrição').trim() || 'Sem descrição', groupLabel, planned, paid, realized: realized(item) };
}

export function buildMonthlyFinancialSummary({ data, month, year }) {
  const financial = normalizeFinancialData(data);
  const blocks = MONTHLY_BLOCKS.map((config) => {
    const entries = config.key === 'contas'
      ? (financial.contas || []).flatMap((group) => (group.subcats || []).map((item) => itemSummary(item, group?.nome || '')))
      : (financial[config.key] || []).map((item) => itemSummary(item));
    const planned = round(entries.reduce((sum, item) => sum + item.planned, 0));
    const paid = round(entries.reduce((sum, item) => sum + item.paid, 0));
    return { ...config, entries, planned, paid, paidPercentage: 0, plannedPercentage: 0 };
  });
  const revenue = blocks.find((block) => block.key === 'receitas');
  const expenseBlocks = blocks.filter((block) => block.type === 'expense');
  const plannedExpenses = round(expenseBlocks.reduce((sum, block) => sum + block.planned, 0));
  const paidExpenses = round(expenseBlocks.reduce((sum, block) => sum + block.paid, 0));
  blocks.forEach((block) => {
    block.plannedPercentage = percentage(block.planned, revenue.planned);
    block.paidPercentage = percentage(block.paid, revenue.paid);
  });
  return {
    month: String(month), year: String(year), blocks,
    totals: {
      plannedRevenue: revenue.planned, paidRevenue: revenue.paid,
      plannedExpenses, paidExpenses,
      plannedBalance: round(revenue.planned - plannedExpenses),
      paidBalance: round(revenue.paid - paidExpenses)
    }
  };
}
