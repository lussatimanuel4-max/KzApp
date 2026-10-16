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
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import colors from '../theme/colors';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';

import {
  CATEGORIES,
  getBudgets,
  setBudget,
} from '../storage/budgets';
import { getTransactions } from '../storage/transactions';
import { calculateCategorySummary } from '../utils/calc';
import { formatKz, calculatePercent } from '../utils/format';

export default function BudgetScreen({ navigation }) {
  const [summary, setSummary] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [inputValue, setInputValue] = useState('');

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
      Alert.alert('Valor inválido', 'Escreve um valor maior que zero.');
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
          <Text style={styles.title}>Orçamento</Text>
        </View>

        {/* ─── CARD TOTAL ─── */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Este mês</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalSpent}>{formatKz(totalSpent)}</Text>
            <Text style={styles.totalBudget}>/ {formatKz(totalBudget)}</Text>
          </View>
          <ProgressBar
            percent={totalPercent}
            color={totalPercent > 0.8 ? colors.danger : colors.primary}
          />
          <Text style={styles.totalHint}>
            {totalBudget === 0
              ? 'Define um orçamento por categoria'
              : `${Math.round(totalPercent * 100)}% usado`}
          </Text>
        </View>

        {/* ─── CATEGORIAS ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorias</Text>
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
                  style={styles.catCard}
                  onPress={() => openModal(cat)}
                  activeOpacity={0.75}
                >
                  <View style={styles.catTop}>
                    <View style={styles.catLeft}>
                      <View style={styles.catIcon}>
                        <Image
                          source={categoryData?.image}
                          style={styles.catImage}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.catLabel}>{cat.label}</Text>
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
                        <Text style={styles.catSpent}>
                          {formatKz(cat.spent)}
                        </Text>
                        <Text style={styles.catBudget}>
                          / {formatKz(cat.budget)}
                        </Text>
                      </View>
                      <ProgressBar
                        percent={cat.percent}
                        color={percentColor}
                      />
                    </>
                  ) : (
                    <Text style={styles.catNoBudget}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>
              {selectedCat?.label || 'Categoria'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Define o orçamento mensal
            </Text>

            <View style={styles.modalInputWrapper}>
              <Text style={styles.modalCurrency}>Kz</Text>
              <TextInput
                style={styles.modalInput}
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
                style={styles.modalCancel}
                onPress={closeModal}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSave}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  totalCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 18,
  },
  totalLabel: {
    fontSize: 13,
    color: colors.textSecondary,
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
    color: colors.textPrimary,
  },
  totalBudget: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textLight,
    marginLeft: 6,
    marginBottom: 3,
  },
  totalHint: {
    fontSize: 12,
    color: colors.textSecondary,
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
    color: colors.textPrimary,
  },
  list: {
    paddingHorizontal: 20,
  },
  catCard: {
    backgroundColor: colors.card,
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
    backgroundColor: '#F0EDFF',
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
    color: colors.textPrimary,
  },
  catValues: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  catSpent: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  catBudget: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
    marginLeft: 6,
  },
  catNoBudget: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 64,
    marginBottom: 24,
  },
  modalCurrency: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textLight,
    marginRight: 10,
  },
  modalInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  modalSave: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});