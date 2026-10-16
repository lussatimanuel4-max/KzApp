// src/screens/ProfileScreen.js
// Ecrã de perfil — estilo Silicon Valley

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import colors from '../theme/colors';
import typography from '../theme/typography';
import { getProfile, updateProfileName } from '../storage/profile';
import { getTransactions, clearTransactions } from '../storage/transactions';
import { clearGoals } from '../storage/goals';
import { resetAppState } from '../storage/appState';
import { calculateBalance } from '../utils/calc';
import { formatKz } from '../utils/format';

// ─── AVATARES DISPONÍVEIS ───
const AVATAR_MAP = {
  'avatar-1': require('../../assets/avatars/avatar-1.jpg'),
  'avatar-2': require('../../assets/avatars/avatar-2.jpg'),
  'avatar-3': require('../../assets/avatars/avatar-3.jpg'),
  'avatar-4': require('../../assets/avatars/avatar-4.jpg'),
  'avatar-5': require('../../assets/avatars/avatar-5.jpg'),
  'avatar-6': require('../../assets/avatars/avatar-6.jpg'),
};

export default function ProfileScreen({ navigation, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(0);
  const [totalTx, setTotalTx] = useState(0);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const p = await getProfile();
    const t = await getTransactions();
    setProfile(p);
    setBalance(calculateBalance(t));
    setTotalTx(t.length);
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function startEditing() {
    setNameInput(profile?.name || '');
    setEditing(true);
  }

  async function saveName() {
    const trimmed = nameInput.trim();

    if (trimmed.length < 2) {
      Alert.alert('Nome inválido', 'Escreve pelo menos 2 letras.');
      return;
    }

    await updateProfileName(trimmed);
    setEditing(false);
    await loadData();
  }

  function confirmReset() {
    Alert.alert(
      'Apagar tudo',
      'Isto vai apagar o teu perfil, movimentos e objetivos. Não há como recuperar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar tudo',
          style: 'destructive',
          onPress: async () => {
            await clearTransactions();
            await clearGoals();
            await resetAppState();
            if (onLogout) onLogout();
          },
        },
      ]
    );
  }

  const avatarSource =
    AVATAR_MAP[profile?.avatar] || AVATAR_MAP['avatar-1'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ─── CABEÇALHO ─── */}
        <View style={styles.header}>
          <Text style={typography.h2}>Perfil</Text>
        </View>

        {/* ─── CARD DO USER ─── */}
        <View style={styles.userCard}>
          <Image source={avatarSource} style={styles.avatar} />

          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                maxLength={30}
              />
              <TouchableOpacity
                style={styles.iconBtnPrimary}
                onPress={saveName}
              >
                <Ionicons name="checkmark" size={20} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtnGhost}
                onPress={() => setEditing(false)}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.userName}>
              {profile?.name || 'Estudante'}
            </Text>
          )}

          <Text style={styles.userRole}>Estudante</Text>

          {!editing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={startEditing}
              activeOpacity={0.8}
            >
              <Ionicons
                name="pencil-outline"
                size={14}
                color={colors.primary}
              />
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ─── ESTATÍSTICAS ─── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="wallet-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.statLabel}>Tenho agora</Text>
            <Text style={styles.statValue}>{formatKz(balance)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <Ionicons
                name="stats-chart-outline"
                size={18}
                color={colors.primary}
              />
            </View>
            <Text style={styles.statLabel}>Movimentos</Text>
            <Text style={styles.statValue}>{totalTx}</Text>
          </View>
        </View>

        {/* ─── MENU: SOBRE ─── */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Sobre')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.menuLabel}>Sobre o KzApp</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* ─── MENU: APAGAR ─── */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={confirmReset}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#FFF0F0' }]}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.danger }]}>
                Apagar tudo
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* ─── RODAPÉ ─── */}
        <Text style={styles.footer}>Versão Beta</Text>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  userCard: {
    alignItems: 'center',
    paddingVertical: 28,
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.white,
    marginBottom: 16,
  },
  userName: {
    fontFamily: 'InterExtraBold',
    fontSize: 24,
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  userRole: {
    fontFamily: 'InterMedium',
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  editButtonText: {
    fontFamily: 'InterBold',
    fontSize: 13,
    color: colors.primary,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    backgroundColor: colors.white,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 10,
    height: 52,
    fontFamily: 'InterBold',
    fontSize: 15,
    color: colors.textPrimary,
    minWidth: 160,
  },
  iconBtnPrimary: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnGhost: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontFamily: 'InterMedium',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'InterExtraBold',
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontFamily: 'InterBold',
    fontSize: 15,
    color: colors.textPrimary,
  },
  footer: {
    fontFamily: 'InterRegular',
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 24,
  },
});