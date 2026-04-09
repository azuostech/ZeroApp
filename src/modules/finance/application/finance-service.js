import { cloneDefaultFinancialData, normalizeFinancialData } from '@/src/modules/finance/domain/defaults';

export function validateMonthYear(month, year) {
  const isMonthOk = typeof month === 'string' && /^(0[1-9]|1[0-2])$/.test(month);
  const isYearOk = typeof year === 'string' && /^\d{4}$/.test(year);
  return isMonthOk && isYearOk;
}

export async function loadFinancialMonth({ supabase, userId, month, year }) {
  const { data, error } = await supabase
    .from('financial_data')
    .select('data')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle();

  if (error) throw new Error(error.message || 'Erro ao carregar dados');

  if (!data?.data || Object.keys(data.data).length === 0) {
    return cloneDefaultFinancialData();
  }

  return normalizeFinancialData(data.data);
}

export async function saveFinancialMonth({ supabase, userId, month, year, data }) {
  const normalized = normalizeFinancialData(data);

  const { error } = await supabase.from('financial_data').upsert(
    {
      user_id: userId,
      month,
      year,
      data: normalized,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id,month,year' }
  );

  if (error) throw new Error(error.message || 'Erro ao salvar dados');
}
