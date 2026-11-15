// src/storage/goals.js
// Guarda e lê as metas de poupança

import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_METAS = '@kzapp:goals';

// ─────────────────────────────
// LER TODAS AS METAS
// ─────────────────────────────
export async function obterMetas() {
  try {
    const json = await AsyncStorage.getItem(CHAVE_METAS);
    if (!json) return [];
    return JSON.parse(json);
  } catch (error) {
    console.log('Erro ao ler metas:', error);
    return [];
  }
}

// ─────────────────────────────
// GUARDAR LISTA COMPLETA
// ─────────────────────────────
async function guardarTodas(metas) {
  try {
    await AsyncStorage.setItem(CHAVE_METAS, JSON.stringify(metas));
    return metas;
  } catch (error) {
    console.log('Erro ao guardar metas:', error);
    return null;
  }
}

// ─────────────────────────────
// CRIAR NOVA META
// ─────────────────────────────
export async function adicionarMeta(meta) {
  try {
    const lista = await obterMetas();

    const novaMeta = {
      id: Date.now().toString(),
      title: meta.title || 'Nova meta',
      target: Number(meta.target) || 0,
      saved: Number(meta.saved) || 0,
      deadline: meta.deadline || null,
      createdAt: Date.now(),
    };

    const atualizada = [novaMeta, ...lista];
    await guardarTodas(atualizada);
    return novaMeta;
  } catch (error) {
    console.log('Erro ao criar meta:', error);
    return null;
  }
}

// ─────────────────────────────
// ADICIONAR DINHEIRO A UMA META
// ─────────────────────────────
export async function adicionarValorMeta(idMeta, valor) {
  try {
    const valorNumerico = Number(valor);

    // Bloqueia valores negativos ou zero
    if (!valorNumerico || valorNumerico <= 0) {
      return null;
    }

    const lista = await obterMetas();
    const atualizada = lista.map((meta) => {
      if (meta.id === idMeta) {
        return { ...meta, saved: (meta.saved || 0) + valorNumerico };
      }
      return meta;
    });
    await guardarTodas(atualizada);
    return atualizada;
  } catch (error) {
    console.log('Erro ao adicionar à meta:', error);
    return null;
  }
}

// ─────────────────────────────
// LER UMA META PELO ID
// ─────────────────────────────
export async function obterMetaPorId(idMeta) {
  try {
    const lista = await obterMetas();
    return lista.find((meta) => meta.id === idMeta) || null;
  } catch (error) {
    console.log('Erro ao ler meta:', error);
    return null;
  }
}

// ─────────────────────────────
// APAGAR META
// ─────────────────────────────
export async function apagarMeta(idMeta) {
  try {
    const lista = await obterMetas();
    const atualizada = lista.filter((meta) => meta.id !== idMeta);
    await guardarTodas(atualizada);
    return atualizada;
  } catch (error) {
    console.log('Erro ao apagar meta:', error);
    return null;
  }
}

// ─────────────────────────────
// APAGAR TODAS AS METAS
// ─────────────────────────────
export async function limparMetas() {
  try {
    await AsyncStorage.removeItem(CHAVE_METAS);
    return true;
  } catch (error) {
    console.log('Erro ao limpar metas:', error);
    return false;
  }
}