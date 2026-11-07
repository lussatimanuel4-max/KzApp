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
  RefreshControl,
  Linking, // Importante para abrir o link do site
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { getProfile, updateProfileName } from '../storage/profile';
import { getTransactions, clearTransactions } from '../storage/transactions';
import { clearGoals } from '../storage/goals';
import { resetAppState } from '../storage/appState';
import { calculateBalance } from '../utils/calc';
import { formatKz } from '../utils/format';
import CustomAlert from '../components/CustomAlert';

// ─── AVATARES DISPONÍVEIS ───
const AVATAR_MAP = {
  'avatar-1': require('../../assets/avatars/avatar-1.jpg'),
  'avatar-2': require('../../assets/avatars/avatar-2.jpg'),
  'avatar-3': require('../../assets/avatars/avatar-3.jpg'),
  'avatar-4': require('../../assets/avatars/avatar-4.jpg'),
  'avatar-5': require('../../assets/avatars/avatar-5.jpg'),
  'avatar-6': require('../../assets/avatars/avatar-6.jpg'),
};

// ─── LINK DO WEBSITE (A TUA PLAY STORE) ───
const UPDATE_URL = 'https://lussatimanuel4-max.github.io/KzApp/';

export default function ProfileScreen({ navigation, onLogout }) {
  const { colors, typography } = useTheme();
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(0);
  const [totalTx, setTotalTx] = useState(0);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // ─── ESTADO DO CUSTOM ALERT ───
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    isDestructive: false,
    buttons: [],
  });

  function showAlert(title, message, isDestructive = false, buttons = null) {
    setAlertConfig({
      visible: true,
      title,
      message,
      isDestructive,
      buttons: buttons || [{ text: 'Entendido', style: 'default' }],
    });
  }

  function closeAlert() {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }

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
      showAlert('Nome inválido', 'Escreve pelo menos 2 letras.');
      return;
    }

    await updateProfileName(trimmed);
    setEditing(false);
    await loadData();
  }

  function confirmReset() {
    showAlert(
      'Apagar tudo',
      'Isto vai apagar o teu perfil, movimentos e objetivos. Não há como recuperar.',
      true,
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

  // ─── ABRIR O SITE DE ATUALIZAÇÕES ───
  async function handleCheckUpdates() {
    try {
      const supported = await Linking.canOpenURL(UPDATE_URL);
      if (supported) {
        await Linking.openURL(UPDATE_URL);
      } else {
        showAlert('Erro', 'Não foi possível abrir o link de atualizações.', true);
      }
    } catch (error) {
      showAlert('Erro', 'Ocorreu um erro ao tentar abrir o site.', true);
    }
  }

  const avatarSource =
    AVATAR_MAP[profile?.avatar] || AVATAR_MAP['avatar-1'];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
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
        <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
          <Image
            source={avatarSource}
            style={[styles.avatar, { borderColor: colors.card }]}
          />

          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                style={[styles.nameInput, { backgroundColor: colors.card, color: colors.textPrimary }]}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                maxLength={30}
              />
              <TouchableOpacity
                style={[styles.iconBtnPrimary, { backgroundColor: colors.primary }]}
                onPress={saveName}
              >
                <Ionicons name="checkmark" size={20} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtnGhost, { backgroundColor: colors.card }]}
                onPress={() => setEditing(false)}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {profile?.name || 'Estudante'}
            </Text>
          )}

          <Text style={[styles.userRole, { color: colors.textSecondary }]}>
            Estudante
          </Text>

          {!editing && (
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.card }]}
              onPress={startEditing}
              activeOpacity={0.8}
            >
              <Ionicons
                name="pencil-outline"
                size={14}
                color={colors.primary}
              />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>
                Editar perfil
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ─── ESTATÍSTICAS ─── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconWrapper, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="wallet-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Tenho agora
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatKz(balance)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconWrapper, { backgroundColor: colors.accentSoft }]}>
              <Ionicons
                name="stats-chart-outline"
                size={18}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Movimentos
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {totalTx}
            </Text>
          </View>
        </View>

        {/* ─── MENU: PROCURAR ATUALIZAÇÕES ─── */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={handleCheckUpdates}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: colors.info + '20' }]}>
                <Ionicons
                  name="cloud-download-outline"
                  size={20}
                  color={colors.info}
                />
              </View>
              <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                Procurar Atualizações
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* ─── MENU: SOBRE ─── */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Sobre')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: colors.accentSoft }]}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                Sobre o KzApp
              </Text>
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
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={confirmReset}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: colors.dangerSoft }]}>
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
        <Text style={[styles.footer, { color: colors.textLight }]}>
          Versão Beta
        </Text>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── CUSTOM ALERT ─── */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        isDestructive={alertConfig.isDestructive}
        buttons={alertConfig.buttons.map((btn) => ({
          ...btn,
          onPress: () => {
            closeAlert();
            if (btn.onPress) btn.onPress();
          },
        }))}
        onRequestClose={closeAlert}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
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
    borderRadius: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    marginBottom: 16,
  },
  userName: {
    fontFamily: 'InterExtraBold',
    fontSize: 24,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  userRole: {
    fontFamily: 'InterMedium',
    fontSize: 13,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    fontFamily: 'InterBold',
    fontSize: 13,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 10,
    height: 52,
    fontFamily: 'InterBold',
    fontSize: 15,
    minWidth: 160,
  },
  iconBtnPrimary: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnGhost: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontFamily: 'InterMedium',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'InterExtraBold',
    fontSize: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontFamily: 'InterBold',
    fontSize: 15,
  },
  footer: {
    fontFamily: 'InterRegular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
});