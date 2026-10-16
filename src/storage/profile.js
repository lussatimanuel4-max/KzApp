// src/storage/profile.js
// Guarda e lê o perfil do utilizador

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PROFILE = '@kzapp:profile';

// ─────────────────────────────
// GUARDAR PERFIL
// ─────────────────────────────
export async function saveProfile(profile) {
  try {
    const data = {
      name: profile.name || '',
      age: profile.age || '',
      school: profile.school || '',
      schoolLevel: profile.schoolLevel || '',
      province: profile.province || '',
      gender: profile.gender || '',
      avatar: profile.avatar || 'avatar-1',
      createdAt: Date.now(),
    };
    await AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(data));
    return data;
  } catch (error) {
    console.log('Erro ao guardar perfil:', error);
    return null;
  }
}

// ─────────────────────────────
// LER PERFIL
// ─────────────────────────────
export async function getProfile() {
  try {
    const json = await AsyncStorage.getItem(KEY_PROFILE);
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
export async function updateProfileName(newName) {
  try {
    const current = await getProfile();
    if (!current) return null;

    const updated = { ...current, name: newName };
    await AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.log('Erro ao atualizar nome:', error);
    return null;
  }
}

// ─────────────────────────────
// ATUALIZAR CAMPO GENÉRICO
// ─────────────────────────────
export async function updateProfileField(field, value) {
  try {
    const current = await getProfile();
    if (!current) return null;

    const updated = { ...current, [field]: value };
    await AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.log('Erro ao atualizar campo:', error);
    return null;
  }
}

// ─────────────────────────────
// APAGAR PERFIL
// ─────────────────────────────
export async function deleteProfile() {
  try {
    await AsyncStorage.removeItem(KEY_PROFILE);
    return true;
  } catch (error) {
    console.log('Erro ao apagar perfil:', error);
    return false;
  }
}