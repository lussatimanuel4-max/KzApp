// src/storage/goals.js
// Guarda e lê as metas de poupança

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_GOALS = '@kzapp:goals';

// ─────────────────────────────
// LER TODAS AS METAS
// ─────────────────────────────
export async function getGoals() {
  try {
    const json = await AsyncStorage.getItem(KEY_GOALS);
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
async function saveAll(goals) {
  try {
    await AsyncStorage.setItem(KEY_GOALS, JSON.stringify(goals));
    return goals;
  } catch (error) {
    console.log('Erro ao guardar metas:', error);
    return null;
  }
}

// ─────────────────────────────
// CRIAR NOVA META
// ─────────────────────────────
export async function addGoal(goal) {
  try {
    const list = await getGoals();

    const newGoal = {
      id: Date.now().toString(),
      title: goal.title || 'Nova meta',
      target: Number(goal.target) || 0,
      saved: Number(goal.saved) || 0,
      deadline: goal.deadline || null,
      createdAt: Date.now(),
    };

    const updated = [newGoal, ...list];
    await saveAll(updated);
    return newGoal;
  } catch (error) {
    console.log('Erro ao criar meta:', error);
    return null;
  }
}

// ─────────────────────────────
// ADICIONAR DINHEIRO A UMA META
// ─────────────────────────────
export async function addToGoal(goalId, amount) {
  try {
    const numericAmount = Number(amount);

    // Bloqueia valores negativos ou zero
    if (!numericAmount || numericAmount <= 0) {
      return null;
    }

    const list = await getGoals();
    const updated = list.map((goal) => {
      if (goal.id === goalId) {
        return { ...goal, saved: (goal.saved || 0) + numericAmount };
      }
      return goal;
    });
    await saveAll(updated);
    return updated;
  } catch (error) {
    console.log('Erro ao adicionar à meta:', error);
    return null;
  }
}

// ─────────────────────────────
// LER UMA META PELO ID
// ─────────────────────────────
export async function getGoalById(goalId) {
  try {
    const list = await getGoals();
    return list.find((goal) => goal.id === goalId) || null;
  } catch (error) {
    console.log('Erro ao ler meta:', error);
    return null;
  }
}

// ─────────────────────────────
// APAGAR META
// ─────────────────────────────
export async function deleteGoal(goalId) {
  try {
    const list = await getGoals();
    const updated = list.filter((goal) => goal.id !== goalId);
    await saveAll(updated);
    return updated;
  } catch (error) {
    console.log('Erro ao apagar meta:', error);
    return null;
  }
}

// ─────────────────────────────
// APAGAR TODAS AS METAS
// ─────────────────────────────
export async function clearGoals() {
  try {
    await AsyncStorage.removeItem(KEY_GOALS);
    return true;
  } catch (error) {
    console.log('Erro ao limpar metas:', error);
    return false;
  }
}