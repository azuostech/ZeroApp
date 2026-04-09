export const DEFAULT_FINANCIAL_DATA = {
  receitas: [
    { nome: 'Salário 1', valor: '' },
    { nome: 'Salário 2', valor: '' },
    { nome: 'Aluguel', valor: '' },
    { nome: 'Aposentadoria', valor: '' }
  ],
  'pagar-primeiro': [
    { nome: 'Lucro Primeiro', valor: '' },
    { nome: 'Reserva de Liquidez', valor: '' },
    { nome: 'Outros pagamentos', valor: '' }
  ],
  doar: [
    { nome: 'Dízimos', valor: '' },
    { nome: 'Ofertas', valor: '' },
    { nome: 'Outras doações', valor: '' }
  ],
  contas: [
    {
      nome: 'Habitação',
      subcats: [
        { nome: 'Aluguel', valor: '' },
        { nome: 'Condomínio', valor: '' },
        { nome: 'Energia', valor: '' },
        { nome: 'Água', valor: '' }
      ]
    },
    {
      nome: 'Transporte',
      subcats: [
        { nome: 'Combustível', valor: '' },
        { nome: 'Seguro auto', valor: '' },
        { nome: 'Estacionamento', valor: '' }
      ]
    },
    {
      nome: 'Saúde',
      subcats: [
        { nome: 'Plano de saúde', valor: '' },
        { nome: 'Medicamentos', valor: '' },
        { nome: 'Consultas', valor: '' }
      ]
    },
    {
      nome: 'Educação',
      subcats: [
        { nome: 'Mensalidade', valor: '' },
        { nome: 'Cursos', valor: '' },
        { nome: 'Material', valor: '' }
      ]
    },
    {
      nome: 'Alimentação',
      subcats: [
        { nome: 'Supermercado', valor: '' },
        { nome: 'Restaurante', valor: '' }
      ]
    },
    {
      nome: 'Cuidados Pessoais',
      subcats: [
        { nome: 'Salão', valor: '' },
        { nome: 'Academia', valor: '' }
      ]
    },
    {
      nome: 'Impostos',
      subcats: [
        { nome: 'IPTU', valor: '' },
        { nome: 'IPVA', valor: '' }
      ]
    },
    {
      nome: 'Bancos',
      subcats: [
        { nome: 'Tarifas', valor: '' },
        { nome: 'Anuidades', valor: '' }
      ]
    },
    {
      nome: 'Cartões',
      subcats: [
        { nome: 'Cartão 1', valor: '' },
        { nome: 'Cartão 2', valor: '' }
      ]
    }
  ],
  investimentos: [
    { nome: 'Carteira de Investimentos', valor: '' },
    { nome: 'Consórcio', valor: '' },
    { nome: 'Cotas', valor: '' }
  ],
  desfrute: [
    { nome: 'Viagem', valor: '' },
    { nome: 'Jantar', valor: '' },
    { nome: 'Lazer', valor: '' }
  ]
};

export function cloneDefaultFinancialData() {
  return JSON.parse(JSON.stringify(DEFAULT_FINANCIAL_DATA));
}

export function normalizeFinancialData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return cloneDefaultFinancialData();
  }
  return data;
}
