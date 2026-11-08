// src/storage/budgets.js
// Guarda e lê os orçamentos por categoria

import AsyncStorage from '@react-native-async-storage/async-storage';
// Importamos a lista oficial de categorias (fonte única de verdade)
import { CATEGORIES, getCategoryById } from '../utils/categories';

const KEY_BUDGETS = '@kzapp:budgets';

// ─────────────────────────────
// LER TODOS OS ORÇAMENTOS
// ─────────────────────────────
export async function getBudgets() {
  try {
    const json = await AsyncStorage.getItem(KEY_BUDGETS);
    if (!json) return {};
    return JSON.parse(json);
  } catch (error) {
    console.log('Erro ao ler orçamentos:', error);
    return {};
  }
}

// ─────────────────────────────
// GUARDAR LISTA COMPLETA
// ─────────────────────────────
async function saveAll(budgets) {
  try {
    await AsyncStorage.setItem(KEY_BUDGETS, JSON.stringify(budgets));
    return budgets;
  } catch (error) {
    console.log('Erro ao guardar orçamentos:', error);
    return null;
  }
}

// ─────────────────────────────
// DEFINIR ORÇAMENTO PARA UMA CATEGORIA
// ─────────────────────────────
export async function setBudget(categoryId, amount) {
  try {
    const budgets = await getBudgets();

    budgets[categoryId] = {
      amount: Number(amount) || 0,
      updatedAt: Date.now(),
    };

    await saveAll(budgets);
    return budgets[categoryId];
  } catch (error) {
    console.log('Erro ao definir orçamento:', error);
    return null;
  }
}

// ─────────────────────────────
// LER ORÇAMENTO DE UMA CATEGORIA
// ─────────────────────────────
export async function getBudget(categoryId) {
  try {
    const budgets = await getBudgets();
    return budgets[categoryId] || null;
  } catch (error) {
    console.log('Erro ao ler orçamento:', error);
    return null;
  }
}

// ─────────────────────────────
// APAGAR ORÇAMENTO DE UMA CATEGORIA
// ─────────────────────────────
export async function deleteBudget(categoryId) {
  try {
    const budgets = await getBudgets();
    delete budgets[categoryId];
    await saveAll(budgets);
    return budgets;
  } catch (error) {
    console.log('Erro ao apagar orçamento:', error);
    return null;
  }
}

// ─────────────────────────────
// APAGAR TODOS OS ORÇAMENTOS (NOVO - usado no "Apagar tudo")
// ─────────────────────────────
export async function clearBudgets() {
  try {
    await AsyncStorage.removeItem(KEY_BUDGETS);
    return true;
  } catch (error) {
    console.log('Erro ao limpar orçamentos:', error);
    return false;
  }
}

// ─────────────────────────────
// RE-EXPORTAR CATEGORIAS (para não quebrar o BudgetScreen antigo)
// ─────────────────────────────
export { CATEGORIES, getCategoryById };