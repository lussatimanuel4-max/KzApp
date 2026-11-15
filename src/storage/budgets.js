// src/storage/budgets.js
// Guarda e lê os orçamentos por categoria

import AsyncStorage from '@react-native-async-storage/async-storage';
// Importamos a lista oficial de categorias (fonte única de verdade)
import { CATEGORIES, obterCategoriaPorId } from '../utils/categories';

const CHAVE_ORCAMENTOS = '@kzapp:budgets';

// ─────────────────────────────
// LER TODOS OS ORÇAMENTOS
// ─────────────────────────────
export async function obterOrcamentos() {
  try {
    const json = await AsyncStorage.getItem(CHAVE_ORCAMENTOS);
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
async function guardarTodos(orcamentos) {
  try {
    await AsyncStorage.setItem(CHAVE_ORCAMENTOS, JSON.stringify(orcamentos));
    return orcamentos;
  } catch (error) {
    console.log('Erro ao guardar orçamentos:', error);
    return null;
  }
}

// ─────────────────────────────
// DEFINIR ORÇAMENTO PARA UMA CATEGORIA
// ─────────────────────────────
export async function definirOrcamento(idCategoria, valor) {
  try {
    const orcamentos = await obterOrcamentos();

    orcamentos[idCategoria] = {
      amount: Number(valor) || 0,
      updatedAt: Date.now(),
    };

    await guardarTodos(orcamentos);
    return orcamentos[idCategoria];
  } catch (error) {
    console.log('Erro ao definir orçamento:', error);
    return null;
  }
}

// ─────────────────────────────
// LER ORÇAMENTO DE UMA CATEGORIA
// ─────────────────────────────
export async function obterOrcamento(idCategoria) {
  try {
    const orcamentos = await obterOrcamentos();
    return orcamentos[idCategoria] || null;
  } catch (error) {
    console.log('Erro ao ler orçamento:', error);
    return null;
  }
}

// ─────────────────────────────
// APAGAR ORÇAMENTO DE UMA CATEGORIA
// ─────────────────────────────
export async function apagarOrcamento(idCategoria) {
  try {
    const orcamentos = await obterOrcamentos();
    delete orcamentos[idCategoria];
    await guardarTodos(orcamentos);
    return orcamentos;
  } catch (error) {
    console.log('Erro ao apagar orçamento:', error);
    return null;
  }
}

// ─────────────────────────────
// APAGAR TODOS OS ORÇAMENTOS
// ─────────────────────────────
export async function limparOrcamentos() {
  try {
    await AsyncStorage.removeItem(CHAVE_ORCAMENTOS);
    return true;
  } catch (error) {
    console.log('Erro ao limpar orçamentos:', error);
    return false;
  }
}

// ─────────────────────────────
// RE-EXPORTAR CATEGORIAS (para não quebrar o BudgetScreen antigo)
// ─────────────────────────────
export { CATEGORIES, obterCategoriaPorId };