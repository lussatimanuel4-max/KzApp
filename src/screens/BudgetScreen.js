// src/screens/BudgetScreen.js
// Ecrã de orçamento (aba 3, parte 1) — orçamento por categoria

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import CustomAlert from '../components/CustomAlert';

import {
  CATEGORIES,
  getBudgets,
  setBudget,
} from '../storage/budgets';
import { getTransactions } from '../storage/transactions';
import { calculateCategorySummary } from '../utils/calc';
import { formatKz, calculatePercent } from '../utils/format';

export default function BudgetScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [summary, setSummary] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [inputValue, setInputValue] = useState('');

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
    const transactions = await getTransactions();
    const budgets = await getBudgets();
    const result = calculateCategorySummary(transactions, budgets, CATEGORIES);
    setSummary(result);
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

  function openModal(cat) {
    setSelectedCat(cat);
    setInputValue(cat.budget > 0 ? String(cat.budget) : '');
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setSelectedCat(null);
    setInputValue('');
  }

  async function handleSave() {
    const numeric = Number(inputValue);

    if (!numeric || numeric <= 0) {
      showAlert('Valor inválido', 'Escreve um valor maior que zero.');
      return;
    }

    await setBudget(selectedCat.id, numeric);
    closeModal();
    await loadData();
  }

  function displayInput() {
    if (!inputValue) return '';
    return Number(inputValue)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function handleInputChange(text) {
    const cleaned = text.replace(/[^0-9]/g, '');
    setInputValue(cleaned);
  }

  const totalBudget = summary.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = summary.reduce((sum, cat) => sum + cat.spent, 0);
  const totalPercent = calculatePercent(totalSpent, totalBudget);

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
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Orçamento
          </Text>
        </View>

        {/* ─── CARD TOTAL ─── */}
        <View style={[styles.totalCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            Este mês
          </Text>
          <View style={styles.totalRow}>
            <Text style={[styles.totalSpent, { color: colors.textPrimary }]}>
              {formatKz(totalSpent)}
            </Text>
            <Text style={[styles.totalBudget, { color: colors.textLight }]}>
              / {formatKz(totalBudget)}
            </Text>
          </View>
          <ProgressBar
            percent={totalPercent}
            color={totalPercent > 0.8 ? colors.danger : colors.primary}
          />
          <Text style={[styles.totalHint, { color: colors.textSecondary }]}>
            {totalBudget === 0
              ? 'Define um orçamento por categoria'
              : `${Math.round(totalPercent * 100)}% usado`}
          </Text>
        </View>

        {/* ─── CATEGORIAS ─── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Categorias
          </Text>
        </View>

        {summary.length === 0 ? (
          <EmptyState
            icon="wallet-outline"
            title="Sem categorias"
            message="Não foi possível carregar as categorias."
          />
        ) : (
          <View style={styles.list}>
            {summary.map((cat) => {
              const categoryData = CATEGORIES.find((c) => c.id === cat.id);
              const hasBudget = cat.budget > 0;
              const percentColor =
                cat.percent > 0.8
                  ? colors.danger
                  : cat.percent > 0.5
                  ? colors.warning
                  : colors.success;

              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catCard, { backgroundColor: colors.card }]}
                  onPress={() => openModal(cat)}
                  activeOpacity={0.75}
                >
                  <View style={styles.catTop}>
                    <View style={styles.catLeft}>
                      <View style={[styles.catIcon, { backgroundColor: colors.accentSoft }]}>
                        <Image
                          source={categoryData?.image}
                          style={styles.catImage}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={[styles.catLabel, { color: colors.textPrimary }]}>
                        {cat.label}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.textLight}
                    />
                  </View>

                  {hasBudget ? (
                    <>
                      <View style={styles.catValues}>
                        <Text style={[styles.catSpent, { color: colors.textPrimary }]}>
                          {formatKz(cat.spent)}
                        </Text>
                        <Text style={[styles.catBudget, { color: colors.textLight }]}>
                          / {formatKz(cat.budget)}
                        </Text>
                      </View>
                      <ProgressBar
                        percent={cat.percent}
                        color={percentColor}
                      />
                    </>
                  ) : (
                    <Text style={[styles.catNoBudget, { color: colors.textLight }]}>
                      Sem orçamento definido
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── MODAL DE DEFINIR ORÇAMENTO ─── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.sheetBg }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.divider }]} />

            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {selectedCat?.label || 'Categoria'}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Define o orçamento mensal
            </Text>

            <View style={[styles.modalInputWrapper, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalCurrency, { color: colors.textLight }]}>
                Kz
              </Text>
              <TextInput
                style={[styles.modalInput, { color: colors.textPrimary }]}
                placeholder="0"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
                value={displayInput()}
                onChangeText={handleInputChange}
                maxLength={12}
                autoFocus
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalCancel, { backgroundColor: colors.surface }]}
                onPress={closeModal}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSave, { backgroundColor: colors.primary }]}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalSaveText, { color: colors.white }]}>
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  totalCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 18,
  },
  totalLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  totalSpent: {
    fontSize: 24,
    fontWeight: '800',
  },
  totalBudget: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
    marginBottom: 3,
  },
  totalHint: {
    fontSize: 12,
    marginTop: 10,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 20,
  },
  catCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  catTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catImage: {
    width: 30,
    height: 30,
  },
  catLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  catValues: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  catSpent: {
    fontSize: 15,
    fontWeight: '700',
  },
  catBudget: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  catNoBudget: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 64,
    marginBottom: 24,
  },
  modalCurrency: {
    fontSize: 22,
    fontWeight: '700',
    marginRight: 10,
  },
  modalInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalSave: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '700',
  },
});