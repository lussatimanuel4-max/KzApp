// src/storage/profile.js
// Guarda e lê o perfil do utilizador

import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_PERFIL = '@kzapp:profile';

// ─────────────────────────────
// GUARDAR PERFIL
// ─────────────────────────────
export async function guardarPerfil(perfil) {
  try {
    const dados = {
      name: perfil.name || '',
      age: perfil.age || '',
      school: perfil.school || '',
      schoolLevel: perfil.schoolLevel || '',
      province: perfil.province || '',
      gender: perfil.gender || '',
      avatar: perfil.avatar || 'avatar-1',
      createdAt: Date.now(),
    };
    await AsyncStorage.setItem(CHAVE_PERFIL, JSON.stringify(dados));
    return dados;
  } catch (error) {
    console.log('Erro ao guardar perfil:', error);
    return null;
  }
}

// ─────────────────────────────
// LER PERFIL
// ─────────────────────────────
export async function obterPerfil() {
  try {
    const json = await AsyncStorage.getItem(CHAVE_PERFIL);
    if (!json) return null;
    return JSON.parse(json);
  } catch (error) {
    console.log('Erro ao ler perfil:', error);
    return null;
  }
}

// ─────────────────────────────
// ATUALIZAR NOME
// ─────────────────────────────
export async function atualizarNomePerfil(novoNome) {
  try {
    const atual = await obterPerfil();
    if (!atual) return null;

    const atualizado = { ...atual, name: novoNome };
    await AsyncStorage.setItem(CHAVE_PERFIL, JSON.stringify(atualizado));
    return atualizado;
  } catch (error) {
    console.log('Erro ao atualizar nome:', error);
    return null;
  }
}

// ─────────────────────────────
// ATUALIZAR CAMPO GENÉRICO
// ─────────────────────────────
export async function atualizarCampoPerfil(campo, valor) {
  try {
    const atual = await obterPerfil();
    if (!atual) return null;

    const atualizado = { ...atual, [campo]: valor };
    await AsyncStorage.setItem(CHAVE_PERFIL, JSON.stringify(atualizado));
    return atualizado;
  } catch (error) {
    console.log('Erro ao atualizar campo:', error);
    return null;
  }
}

// ─────────────────────────────
// APAGAR PERFIL
// ─────────────────────────────
export async function apagarPerfil() {
  try {
    await AsyncStorage.removeItem(CHAVE_PERFIL);
    return true;
  } catch (error) {
    console.log('Erro ao apagar perfil:', error);
    return false;
  }
}