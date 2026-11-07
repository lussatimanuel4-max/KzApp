// src/screens/HistoryScreen.js
// Ecrã de histórico (aba 2) — lista completa agrupada por dia, com filtro por mês

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../context/ThemeContext';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';
import CustomAlert from '../components/CustomAlert';

import {
  getTransactions,
  deleteTransaction,
} from '../storage/transactions';
import { groupTransactionsByDay } from '../utils/calc';
import { 
  getDayLabel, 
  formatKz, 
  getAvailableMonths, 
  getMonthLabelShort,
  formatMonthYear,
} from '../utils/format';

const FILTERS = [
  { id: 'all', label: 'Tudo' },
  { id: 'in', label: 'Recebi' },
  { id: 'out', label: 'Gastei' },
];

export default function HistoryScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Estado do filtro por mês
  const [selectedMonth, setSelectedMonth] = useState(null); // null = Todos
  const [monthModalVisible, setMonthModalVisible] = useState(false);

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
    const list = await getTransactions();
    setTransactions(list);
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

  function handleFilterChange(newFilter) {
    if (newFilter !== filter) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFilter(newFilter);
    }
  }

  function handlePress(transaction) {
    navigation.navigate('AddTransaction', { edit: transaction });
  }

  function confirmDelete(id) {
    showAlert(
      'Apagar',
      'Tens a certeza que queres apagar?',
      true,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(id);
            await loadData();
          },
        },
      ]
    );
  }

  // 1. Filtrar por tipo (Tudo / Recebi / Gastei)
  const filteredByType =
    filter === 'all'
      ? transactions
      : transactions.filter((tx) => tx.type === filter);

  // 2. Filtrar por mês (se estiver selecionado)
  const filtered = selectedMonth
    ? filteredByType.filter((tx) => {
        const date = new Date(tx.date || tx.createdAt);
        return (
          date.getFullYear() === selectedMonth.year &&
          date.getMonth() === selectedMonth.monthIndex
        );
      })
    : filteredByType;

  // 3. Agrupar por dia
  const grouped = groupTransactionsByDay(filtered);

  const sections = grouped.map((group) => {
    const total = group.items.reduce((sum, tx) => {
      const amount = Number(tx.amount) || 0;
      return tx.type === 'in' ? sum + amount : sum - amount;
    }, 0);

    return {
      title: getDayLabel(group.date),
      total,
      data: group.items,
    };
  });

  // 4. Calcular meses disponíveis
  const availableMonths = useMemo(() => getAvailableMonths(transactions), [transactions]);

  function openMonthModal() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMonthModalVisible(true);
  }

  function selectMonth(month) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMonth(month);
    setMonthModalVisible(false);
  }

  const monthLabel = selectedMonth
    ? getMonthLabelShort(selectedMonth.year, selectedMonth.monthIndex)
    : 'Este mês';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* ─── CABEÇALHO ─── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={typography.h2}>O que fiz</Text>
          
          {/* Botão do filtro de mês */}
          <TouchableOpacity
            style={[styles.monthButton, { backgroundColor: colors.surface }]}
            onPress={openMonthModal}
            activeOpacity={0.7}
          >
            <Text style={[styles.monthButtonText, { color: colors.textPrimary }]}>
              {monthLabel}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AddTransaction', { type: 'out' })}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* ─── FILTROS (Tipo) ─── */}
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filter,
                { backgroundColor: colors.surface },
                active && { backgroundColor: colors.primary },
              ]}
              onPress={() => handleFilterChange(f.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: active ? colors.white : colors.textSecondary },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── LISTA ─── */}
      {sections.length === 0 ? (
        <EmptyState
          image={require('../../assets/illustrations/empty-history.png')}
          title="Ainda não fizeste nada"
          message={
            filter === 'all'
              ? 'Ainda não registaste nada. Bora começar.'
              : 'Não há nada deste tipo.'
          }
          actionLabel={filter === 'all' ? 'Adicionar' : null}
          onAction={
            filter === 'all'
              ? () => navigation.navigate('AddTransaction', { type: 'out' })
              : null
          }
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {section.title}
              </Text>
              <Text
                style={[
                  styles.sectionTotal,
                  {
                    color: section.total >= 0 ? colors.success : colors.danger,
                  },
                ]}
              >
                {section.total >= 0 ? '+' : '-'}
                {formatKz(Math.abs(section.total))}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              onPress={() => handlePress(item)}
              onLongPress={() => confirmDelete(item.id)}
            />
          )}
        />
      )}

      {/* ─── MODAL: FILTRO POR MÊS ─── */}
      <Modal
        visible={monthModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMonthModalVisible(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
          onPress={() => setMonthModalVisible(false)}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={[styles.modalSheet, { backgroundColor: colors.sheetBg }]}
            activeOpacity={1}
          >
            <View style={[styles.modalHandle, { backgroundColor: colors.divider }]} />

            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Filtrar por mês
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {/* Opção "Ver Todos" */}
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  !selectedMonth && { backgroundColor: colors.accentSoft },
                ]}
                onPress={() => selectMonth(null)}
              >
                <View style={styles.modalOptionLeft}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={!selectedMonth ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.modalOptionText,
                      {
                        color: !selectedMonth ? colors.primary : colors.textPrimary,
                        fontFamily: !selectedMonth ? 'InterBold' : 'InterMedium',
                      },
                    ]}
                  >
                    Ver Todos
                  </Text>
                </View>
                {!selectedMonth && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>

              {/* Meses Disponíveis */}
              {availableMonths.map((month) => {
                const isActive =
                  selectedMonth &&
                  selectedMonth.year === month.year &&
                  selectedMonth.monthIndex === month.monthIndex;

                return (
                  <TouchableOpacity
                    key={`${month.year}-${month.monthIndex}`}
                    style={[
                      styles.modalOption,
                      isActive && { backgroundColor: colors.accentSoft },
                    ]}
                    onPress={() => selectMonth(month)}
                  >
                    <View style={styles.modalOptionLeft}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={isActive ? colors.primary : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.modalOptionText,
                          {
                            color: isActive ? colors.primary : colors.textPrimary,
                            fontFamily: isActive ? 'InterBold' : 'InterMedium',
                          },
                        ]}
                      >
                        {formatMonthYear(month.year, month.monthIndex)}
                      </Text>
                    </View>
                    {isActive && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}

              {availableMonths.length === 0 && (
                <Text style={[styles.emptyMonthsText, { color: colors.textSecondary }]}>
                  Ainda não tens movimentos registados.
                </Text>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  monthButtonText: {
    fontFamily: 'InterBold',
    fontSize: 12,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filter: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
  },
  filterText: {
    fontFamily: 'InterBold',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'InterBold',
    fontSize: 14,
  },
  sectionTotal: {
    fontFamily: 'InterBold',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'InterExtraBold',
    fontSize: 20,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
  },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalOptionText: {
    fontSize: 15,
  },
  emptyMonthsText: {
    fontFamily: 'InterRegular',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});