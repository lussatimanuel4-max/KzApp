
// src/utils/calc.js
// Funções de cálculo para o KzApp

// ─────────────────────────────
// SALDO TOTAL
// Entradas - Saídas
// ─────────────────────────────
export function calcularSaldo(transacoes) {
  if (!Array.isArray(transacoes)) return 0;

  return transacoes.reduce((total, tx) => {
    const valor = Number(tx.amount) || 0;
    return tx.type === 'in' ? total + valor : total - valor;
  }, 0);
}

// ─────────────────────────────
// TOTAL DE ENTRADAS
// ─────────────────────────────
export function calcularTotalEntradas(transacoes) {
  if (!Array.isArray(transacoes)) return 0;

  return transacoes
    .filter((tx) => tx.type === 'in')
    .reduce((total, tx) => total + (Number(tx.amount) || 0), 0);
}

// ─────────────────────────────
// TOTAL DE SAÍDAS
// ─────────────────────────────
export function calcularTotalSaidas(transacoes) {
  if (!Array.isArray(transacoes)) return 0;

  return transacoes
    .filter((tx) => tx.type === 'out')
    .reduce((total, tx) => total + (Number(tx.amount) || 0), 0);
}

// ─────────────────────────────
// VARIAÇÃO DE HOJE
// Entradas de hoje - Saídas de hoje
// ─────────────────────────────
export function calcularVariacaoHoje(transacoes) {
  if (!Array.isArray(transacoes)) return 0;

  const hoje = new Date();

  const eHoje = (dataEntrada) => {
    const d = new Date(dataEntrada);
    return (
      d.getDate() === hoje.getDate() &&
      d.getMonth() === hoje.getMonth() &&
      d.getFullYear() === hoje.getFullYear()
    );
  };

  return transacoes
    .filter((tx) => eHoje(tx.date || tx.createdAt))
    .reduce((total, tx) => {
      const valor = Number(tx.amount) || 0;
      return tx.type === 'in' ? total + valor : total - valor;
    }, 0);
}

// ─────────────────────────────
// TOTAL GASTO NUMA CATEGORIA
// ─────────────────────────────
export function calcularGastoPorCategoria(transacoes, idCategoria) {
  if (!Array.isArray(transacoes)) return 0;

  return transacoes
    .filter((tx) => tx.type === 'out' && tx.category === idCategoria)
    .reduce((total, tx) => total + (Number(tx.amount) || 0), 0);
}

// ─────────────────────────────
// AGRUPAR TRANSAÇÕES POR DIA
// Devolve: [{ dateKey, date, items }, ...]
// ─────────────────────────────
export function agruparTransacoesPorDia(transacoes) {
  if (!Array.isArray(transacoes) || transacoes.length === 0) return [];

  const grupos = {};

  transacoes.forEach((tx) => {
    const data = new Date(tx.date || tx.createdAt);
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;

    if (!grupos[chave]) {
      grupos[chave] = {
        dateKey: chave,
        date: data,
        items: [],
      };
    }

    grupos[chave].items.push(tx);
  });

  return Object.values(grupos).sort((a, b) => b.date - a.date);
}

// ─────────────────────────────
// TOTAL GUARDADO EM TODAS AS METAS
// ─────────────────────────────
export function calcularTotalGuardado(metas) {
  if (!Array.isArray(metas)) return 0;

  return metas.reduce((total, meta) => total + (Number(meta.saved) || 0), 0);
}

// ─────────────────────────────
// PROGRESSO DE UMA META (0 a 1)
// ─────────────────────────────
export function calcularProgressoMeta(meta) {
  if (!meta) return 0;

  const guardado = Number(meta.saved) || 0;
  const alvo = Number(meta.target) || 0;

  if (alvo === 0) return 0;
  const percentagem = guardado / alvo;
  return percentagem > 1 ? 1 : percentagem;
}

// ─────────────────────────────
// DIAS ATÉ UMA DATA
// ─────────────────────────────
export function diasAte(dataEntrada) {
  if (!dataEntrada) return null;

  const alvo = new Date(dataEntrada);
  const hoje = new Date();
  const diferenca = Math.ceil((alvo - hoje) / (1000 * 60 * 60 * 24));

  return diferenca;
}

// ─────────────────────────────
// RESUMO DO ORÇAMENTO POR CATEGORIA
// Usado no BudgetScreen para cruzar gastos e orçamentos
// ─────────────────────────────
export function calcularResumoCategorias(transacoes, orcamentos, categorias) {
  if (!Array.isArray(transacoes)) return [];

  return categorias.map((cat) => {
    const gasto = transacoes
      .filter((tx) => tx.type === 'out' && tx.category === cat.id)
      .reduce((soma, tx) => soma + (Number(tx.amount) || 0), 0);

    const dadosOrcamento = orcamentos[cat.id];
    const valorOrcamento = dadosOrcamento ? Number(dadosOrcamento.amount) || 0 : 0;
    
    const percentagem = valorOrcamento > 0 ? gasto / valorOrcamento : 0;

    return {
      id: cat.id,
      label: cat.label,
      spent: gasto,
      budget: valorOrcamento,
      percent: percentagem > 1 ? 1 : percentagem,
    };
  });
}