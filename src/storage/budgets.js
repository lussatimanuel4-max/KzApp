// src/storage/budgets.js
// Guarda e lê os orçamentos por categoria

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_BUDGETS = '@kzapp:budgets';

// Categorias oficiais do KzApp (com imagens)
export const CATEGORIES = [
  { id: 'lanche',     label: 'Lanche',            image: require('../../assets/categories/lanche.png') },
  { id: 'transporte', label: 'Transporte',        image: require('../../assets/categories/transporte.png') },
  { id: 'material',   label: 'Material escolar',  image: require('../../assets/categories/material.png') },
  { id: 'fasciculos', label: 'Fascículos',        image: require('../../assets/categories/fasciculos.png') },
  { id: 'propinas',   label: 'Propinas',          image: require('../../assets/categories/propinas.png') },
  { id: 'internet',   label: 'Internet',          image: require('../../assets/categories/internet.png') },
];

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
// APAGAR TODOS OS ORÇAMENTOS
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
// OBTER CATEGORIA PELO ID
// ─────────────────────────────
export function getCategoryById(categoryId) {
  return CATEGORIES.find((cat) => cat.id === categoryId) || null;
}