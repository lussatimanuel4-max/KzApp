// src/screens/HistoryScreen.js
// Ecrã de histórico (aba 2) — lista completa agrupada por dia

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import colors from '../theme/colors';
import typography from '../theme/typography';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';

import {
  getTransactions,
  deleteTransaction,
} from '../storage/transactions';
import { groupTransactionsByDay } from '../utils/calc';
import { getDayLabel, formatKz } from '../utils/format';

const FILTERS = [
  { id: 'all', label: 'Tudo' },
  { id: 'in', label: 'Recebi' },
  { id: 'out', label: 'Gastei' },
];

export default function HistoryScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

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
    Alert.alert(
      'Apagar',
      'Tens a certeza que queres apagar?',
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

  const filtered =
    filter === 'all'
      ? transactions
      : transactions.filter((tx) => tx.type === filter);

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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ─── CABEÇALHO ─── */}
      <View style={styles.header}>
        <Text style={typography.h2}>O que fiz</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTransaction', { type: 'out' })}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* ─── FILTROS ─── */}
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[styles.filter, active && styles.filterActive]}
              onPress={() => handleFilterChange(f.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.filterText, active && styles.filterTextActive]}
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
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text
                style={[
                  styles.sectionTotal,
                  {
                    color:
                      section.total >= 0 ? colors.success : colors.danger,
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
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
    backgroundColor: colors.surface,
  },
  filterActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
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
    color: colors.textSecondary,
  },
  sectionTotal: {
    fontFamily: 'InterBold',
    fontSize: 13,
  },
});