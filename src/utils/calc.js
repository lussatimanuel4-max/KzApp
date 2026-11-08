// src/utils/calc.js
// Funções de cálculo para o KzApp

// ─────────────────────────────
// SALDO TOTAL
// Entradas - Saídas
// ─────────────────────────────
export function calculateBalance(transactions) {
  if (!Array.isArray(transactions)) return 0;

  return transactions.reduce((total, tx) => {
    const amount = Number(tx.amount) || 0;
    return tx.type === 'in' ? total + amount : total - amount;
  }, 0);
}

// ─────────────────────────────
// TOTAL DE ENTRADAS
// ─────────────────────────────
export function calculateTotalIn(transactions) {
  if (!Array.isArray(transactions)) return 0;

  return transactions
    .filter((tx) => tx.type === 'in')
    .reduce((total, tx) => total + (Number(tx.amount) || 0), 0);
}

// ─────────────────────────────
// TOTAL DE SAÍDAS
// ─────────────────────────────
export function calculateTotalOut(transactions) {
  if (!Array.isArray(transactions)) return 0;

  return transactions
    .filter((tx) => tx.type === 'out')
    .reduce((total, tx) => total + (Number(tx.amount) || 0), 0);
}

// ─────────────────────────────
// VARIAÇÃO DE HOJE
// Entradas de hoje - Saídas de hoje
// ─────────────────────────────
export function calculateTodayChange(transactions) {
  if (!Array.isArray(transactions)) return 0;

  const today = new Date();

  const isToday = (dateInput) => {
    const d = new Date(dateInput);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  return transactions
    .filter((tx) => isToday(tx.date || tx.createdAt))
    .reduce((total, tx) => {
      const amount = Number(tx.amount) || 0;
      return tx.type === 'in' ? total + amount : total - amount;
    }, 0);
}

// ─────────────────────────────
// TOTAL GASTO NUMA CATEGORIA
// ─────────────────────────────
export function calculateCategorySpent(transactions, categoryId) {
  if (!Array.isArray(transactions)) return 0;

  return transactions
    .filter((tx) => tx.type === 'out' && tx.category === categoryId)
    .reduce((total, tx) => total + (Number(tx.amount) || 0), 0);
}

// ─────────────────────────────
// AGRUPAR TRANSAÇÕES POR DIA
// Devolve: [{ dateKey, date, items }, ...]
// ─────────────────────────────
export function groupTransactionsByDay(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return [];

  const groups = {};

  transactions.forEach((tx) => {
    const date = new Date(tx.date || tx.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    if (!groups[key]) {
      groups[key] = {
        dateKey: key,
        date: date,
        items: [],
      };
    }

    groups[key].items.push(tx);
  });

  return Object.values(groups).sort((a, b) => b.date - a.date);
}

// ─────────────────────────────
// TOTAL GUARDADO EM TODAS AS METAS
// ─────────────────────────────
export function calculateTotalSaved(goals) {
  if (!Array.isArray(goals)) return 0;

  return goals.reduce((total, goal) => total + (Number(goal.saved) || 0), 0);
}

// ─────────────────────────────
// PROGRESSO DE UMA META (0 a 1)
// ─────────────────────────────
export function calculateGoalProgress(goal) {
  if (!goal) return 0;

  const saved = Number(goal.saved) || 0;
  const target = Number(goal.target) || 0;

  if (target === 0) return 0;
  const percent = saved / target;
  return percent > 1 ? 1 : percent;
}

// ─────────────────────────────
// DIAS ATÉ UMA DATA
// ─────────────────────────────
export function daysUntil(dateInput) {
  if (!dateInput) return null;

  const target = new Date(dateInput);
  const today = new Date();
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

  return diff;
}

// ─────────────────────────────
// RESUMO DO ORÇAMENTO POR CATEGORIA (NOVO)
// Usado no BudgetScreen para cruzar gastos e orçamentos
// ─────────────────────────────
export function calculateCategorySummary(transactions, budgets, categories) {
  if (!Array.isArray(transactions)) return [];

  return categories.map((cat) => {
    const spent = transactions
      .filter((tx) => tx.type === 'out' && tx.category === cat.id)
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

    const budgetData = budgets[cat.id];
    const budgetAmount = budgetData ? Number(budgetData.amount) || 0 : 0;
    
    const percent = budgetAmount > 0 ? spent / budgetAmount : 0;

    return {
      id: cat.id,
      label: cat.label,
      spent,
      budget: budgetAmount,
      percent: percent > 1 ? 1 : percent, // Limita a 100%
    };
  });
}