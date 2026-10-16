// src/storage/appState.js
// Guarda o estado geral do app (se o user já criou perfil, se já viu onboarding, etc.)

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PROFILE_CREATED = '@kzapp:profileCreated';
const KEY_ONBOARDING_SEEN = '@kzapp:onboardingSeen';

// ─────────────────────────────
// VERIFICAR SE O PERFIL JÁ FOI CRIADO
// ─────────────────────────────
export async function isProfileCreated() {
  try {
    const value = await AsyncStorage.getItem(KEY_PROFILE_CREATED);
    return value === 'true';
  } catch (error) {
    console.log('Erro ao verificar perfil:', error);
    return false;
  }
}

// ─────────────────────────────
// MARCAR PERFIL COMO CRIADO
// ─────────────────────────────
export async function markProfileCreated() {
  try {
    await AsyncStorage.setItem(KEY_PROFILE_CREATED, 'true');
    return true;
  } catch (error) {
    console.log('Erro ao marcar perfil:', error);
    return false;
  }
}

// ─────────────────────────────
// VERIFICAR SE O ONBOARDING JÁ FOI VISTO
// ─────────────────────────────
export async function hasSeenOnboarding() {
  try {
    const value = await AsyncStorage.getItem(KEY_ONBOARDING_SEEN);
    return value === 'true';
  } catch (error) {
    console.log('Erro ao verificar onboarding:', error);
    return false;
  }
}

// ─────────────────────────────
// MARCAR ONBOARDING COMO VISTO
// ─────────────────────────────
export async function markOnboardingSeen() {
  try {
    await AsyncStorage.setItem(KEY_ONBOARDING_SEEN, 'true');
    return true;
  } catch (error) {
    console.log('Erro ao marcar onboarding:', error);
    return false;
  }
}

// ─────────────────────────────
// RESET (apagar tudo — usado no "Apagar dados")
// ─────────────────────────────
export async function resetAppState() {
  try {
    await AsyncStorage.removeItem(KEY_PROFILE_CREATED);
    await AsyncStorage.removeItem(KEY_ONBOARDING_SEEN);
    return true;
  } catch (error) {
    console.log('Erro ao resetar appState:', error);
    return false;
  }
}