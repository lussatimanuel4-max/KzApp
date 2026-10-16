// src/storage/transactions.js
// Guarda e lê as transações (entradas e saídas)

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_TRANSACTIONS = '@kzapp:transactions';

// ─────────────────────────────
// LER TODAS AS TRANSAÇÕES
// ─────────────────────────────
export async function getTransactions() {
  try {
    const json = await AsyncStorage.getItem(KEY_TRANSACTIONS);
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
async function saveAll(transactions) {
  try {
    await AsyncStorage.setItem(KEY_TRANSACTIONS, JSON.stringify(transactions));
    return transactions;
  } catch (error) {
    console.log('Erro ao guardar transações:', error);
    return null;
  }
}

// ─────────────────────────────
// ADICIONAR TRANSAÇÃO
// ─────────────────────────────
export async function addTransaction(transaction) {
  try {
    const list = await getTransactions();

    const newTransaction = {
      id: Date.now().toString(),
      type: transaction.type,
      amount: Number(transaction.amount) || 0,
      category: transaction.category || null,
      note: transaction.note || '',
      date: transaction.date || new Date().toISOString(),
      createdAt: Date.now(),
    };

    const updated = [newTransaction, ...list];
    await saveAll(updated);
    return newTransaction;
  } catch (error) {
    console.log('Erro ao adicionar transação:', error);
    return null;
  }
}

// ─────────────────────────────
// ATUALIZAR TRANSAÇÃO EXISTENTE
// ─────────────────────────────
export async function updateTransaction(id, updates) {
  try {
    const list = await getTransactions();

    const updated = list.map((tx) => {
      if (tx.id === id) {
        return {
          ...tx,
          type: updates.type !== undefined ? updates.type : tx.type,
          amount:
            updates.amount !== undefined
              ? Number(updates.amount) || 0
              : tx.amount,
          category:
            updates.category !== undefined ? updates.category : tx.category,
          note: updates.note !== undefined ? updates.note : tx.note,
          date: updates.date !== undefined ? updates.date : tx.date,
          updatedAt: Date.now(),
        };
      }
      return tx;
    });

    await saveAll(updated);
    return updated;
  } catch (error) {
    console.log('Erro ao atualizar transação:', error);
    return null;
  }
}

// ─────────────────────────────
// LER UMA TRANSAÇÃO PELO ID
// ─────────────────────────────
export async function getTransactionById(id) {
  try {
    const list = await getTransactions();
    return list.find((tx) => tx.id === id) || null;
  } catch (error) {
    console.log('Erro ao ler transação:', error);
    return null;
  }
}

// ─────────────────────────────
// APAGAR TRANSAÇÃO
// ─────────────────────────────
export async function deleteTransaction(id) {
  try {
    const list = await getTransactions();
    const updated = list.filter((item) => item.id !== id);
    await saveAll(updated);
    return updated;
  } catch (error) {
    console.log('Erro ao apagar transação:', error);
    return null;
  }
}

// ─────────────────────────────
// APAGAR TODAS
// ─────────────────────────────
export async function clearTransactions() {
  try {
    await AsyncStorage.removeItem(KEY_TRANSACTIONS);
    return true;
  } catch (error) {
    console.log('Erro ao limpar transações:', error);
    return false;
  }
}

// ─────────────────────────────
// FILTRAR POR MÊS (YYYY-MM)
// ─────────────────────────────
export async function getTransactionsByMonth(yearMonth) {
  try {
    const list = await getTransactions();
    return list.filter((item) => {
      const date = new Date(item.date);
      const itemYearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return itemYearMonth === yearMonth;
    });
  } catch (error) {
    console.log('Erro ao filtrar por mês:', error);
    return [];
  }
}

// ─────────────────────────────
// FILTRAR POR TIPO
// ─────────────────────────────
export async function getTransactionsByType(type) {
  try {
    const list = await getTransactions();
    return list.filter((item) => item.type === type);
  } catch (error) {
    console.log('Erro ao filtrar por tipo:', error);
    return [];
  }
}