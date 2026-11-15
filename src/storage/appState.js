// src/storage/appState.js
// Guarda o estado geral do app (se o user já criou perfil, se já viu onboarding, etc.)

import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_PERFIL_CRIADO = '@kzapp:profileCreated';
const CHAVE_ONBOARDING_VISTO = '@kzapp:onboardingSeen';

// ─────────────────────────────
// VERIFICAR SE O PERFIL JÁ FOI CRIADO
// ─────────────────────────────
export async function perfilFoiCriado() {
  try {
    const valor = await AsyncStorage.getItem(CHAVE_PERFIL_CRIADO);
    return valor === 'true';
  } catch (error) {
    console.log('Erro ao verificar perfil:', error);
    return false;
  }
}

// ─────────────────────────────
// MARCAR PERFIL COMO CRIADO
// ─────────────────────────────
export async function marcarPerfilCriado() {
  try {
    await AsyncStorage.setItem(CHAVE_PERFIL_CRIADO, 'true');
    return true;
  } catch (error) {
    console.log('Erro ao marcar perfil:', error);
    return false;
  }
}

// ─────────────────────────────
// VERIFICAR SE O ONBOARDING JÁ FOI VISTO
// ─────────────────────────────
export async function onboardingFoiVisto() {
  try {
    const valor = await AsyncStorage.getItem(CHAVE_ONBOARDING_VISTO);
    return valor === 'true';
  } catch (error) {
    console.log('Erro ao verificar onboarding:', error);
    return false;
  }
}

// ─────────────────────────────
// MARCAR ONBOARDING COMO VISTO
// ─────────────────────────────
export async function marcarOnboardingVisto() {
  try {
    await AsyncStorage.setItem(CHAVE_ONBOARDING_VISTO, 'true');
    return true;
  } catch (error) {
    console.log('Erro ao marcar onboarding:', error);
    return false;
  }
}

// ─────────────────────────────
// RESET (apagar tudo — usado no "Apagar dados")
// ─────────────────────────────
export async function redefinirEstadoApp() {
  try {
    await AsyncStorage.removeItem(CHAVE_PERFIL_CRIADO);
    await AsyncStorage.removeItem(CHAVE_ONBOARDING_VISTO);
    return true;
  } catch (error) {
    console.log('Erro ao redefinir estado do app:', error);
    return false;
  }
}