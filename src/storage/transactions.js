// src/storage/transactions.js
// Guarda e lê as transações (entradas e saídas)

import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_TRANSACOES = '@kzapp:transactions';

// ─────────────────────────────
// LER TODAS AS TRANSAÇÕES
// ─────────────────────────────
export async function obterTransacoes() {
  try {
    const json = await AsyncStorage.getItem(CHAVE_TRANSACOES);
    if (!json) return [];
    return JSON.parse(json);
  } catch (error) {
    console.log('Erro ao ler transações:', error);
    return [];
  }
}

// ─────────────────────────────
// GUARDAR LISTA COMPLETA (uso interno)
// ─────────────────────────────
async function guardarTodas(transacoes) {
  try {
    await AsyncStorage.setItem(CHAVE_TRANSACOES, JSON.stringify(transacoes));
    return transacoes;
  } catch (error) {
    console.log('Erro ao guardar transações:', error);
    return null;
  }
}

// ─────────────────────────────
// ADICIONAR TRANSAÇÃO
// ─────────────────────────────
export async function adicionarTransacao(transacao) {
  try {
    const lista = await obterTransacoes();

    const novaTransacao = {
      id: Date.now().toString(),
      type: transacao.type,
      amount: Number(transacao.amount) || 0,
      category: transacao.category || null,
      note: transacao.note || '',
      date: transacao.date || new Date().toISOString(),
      createdAt: Date.now(),
    };

    const atualizada = [novaTransacao, ...lista];
    await guardarTodas(atualizada);
    return novaTransacao;
  } catch (error) {
    console.log('Erro ao adicionar transação:', error);
    return null;
  }
}

// ─────────────────────────────
// ATUALIZAR TRANSAÇÃO EXISTENTE
// ─────────────────────────────
export async function atualizarTransacao(id, atualizacoes) {
  try {
    const lista = await obterTransacoes();

    const atualizada = lista.map((tx) => {
      if (tx.id === id) {
        return {
          ...tx,
          type: atualizacoes.type !== undefined ? atualizacoes.type : tx.type,
          amount:
            atualizacoes.amount !== undefined
              ? Number(atualizacoes.amount) || 0
              : tx.amount,
          category:
            atualizacoes.category !== undefined ? atualizacoes.category : tx.category,
          note: atualizacoes.note !== undefined ? atualizacoes.note : tx.note,
          date: atualizacoes.date !== undefined ? atualizacoes.date : tx.date,
          updatedAt: Date.now(),
        };
      }
      return tx;
    });

    await guardarTodas(atualizada);
    return atualizada;
  } catch (error) {
    console.log('Erro ao atualizar transação:', error);
    return null;
  }
}

// ─────────────────────────────
// LER UMA TRANSAÇÃO PELO ID
// ─────────────────────────────
export async function obterTransacaoPorId(id) {
  try {
    const lista = await obterTransacoes();
    return lista.find((tx) => tx.id === id) || null;
  } catch (error) {
    console.log('Erro ao ler transação:', error);
    return null;
  }
}

// ─────────────────────────────
// APAGAR TRANSAÇÃO
// ─────────────────────────────
export async function apagarTransacao(id) {
  try {
    const lista = await obterTransacoes();
    const atualizada = lista.filter((item) => item.id !== id);
    await guardarTodas(atualizada);
    return atualizada;
  } catch (error) {
    console.log('Erro ao apagar transação:', error);
    return null;
  }
}

// ─────────────────────────────
// APAGAR TODAS
// ─────────────────────────────
export async function limparTransacoes() {
  try {
    await AsyncStorage.removeItem(CHAVE_TRANSACOES);
    return true;
  } catch (error) {
    console.log('Erro ao limpar transações:', error);
    return false;
  }
}

// ─────────────────────────────
// FILTRAR POR MÊS (YYYY-MM)
// ─────────────────────────────
export async function obterTransacoesPorMes(anoMes) {
  try {
    const lista = await obterTransacoes();
    return lista.filter((item) => {
      const data = new Date(item.date);
      const itemAnoMes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      return itemAnoMes === anoMes;
    });
  } catch (error) {
    console.log('Erro ao filtrar por mês:', error);
    return [];
  }
}

// ─────────────────────────────
// FILTRAR POR TIPO
// ─────────────────────────────
export async function obterTransacoesPorTipo(tipo) {
  try {
    const lista = await obterTransacoes();
    return lista.filter((item) => item.type === tipo);
  } catch (error) {
    console.log('Erro ao filtrar por tipo:', error);
    return [];
  }
}