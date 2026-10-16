// src/screens/HomeScreen.js
// Ecrã principal (aba 1) — saldo + ações + transações recentes

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import colors from '../theme/colors';
import typography from '../theme/typography';
import BalanceCard from '../components/BalanceCard';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';

import { getProfile } from '../storage/profile';
import { getTransactions } from '../storage/transactions';
import {
  calculateBalance,
  calculateTotalIn,
  calculateTotalOut,
} from '../utils/calc';
import { formatKz, getGreeting } from '../utils/format';

// ─── AVATARES ───
const AVATAR_MAP = {
  'avatar-1': require('../../assets/avatars/avatar-1.jpg'),
  'avatar-2': require('../../assets/avatars/avatar-2.jpg'),
  'avatar-3': require('../../assets/avatars/avatar-3.jpg'),
  'avatar-4': require('../../assets/avatars/avatar-4.jpg'),
  'avatar-5': require('../../assets/avatars/avatar-5.jpg'),
  'avatar-6': require('../../assets/avatars/avatar-6.jpg'),
};

// ─── DIAS DA SEMANA ───
const WEEKDAYS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

// ─── MESES ───
const MONTHS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function getTodayLabel() {
  const now = new Date();
  const weekday = WEEKDAYS[now.getDay()];
  const day = now.getDate();
  const month = MONTHS[now.getMonth()];
  return `${weekday}, ${day} ${month}`;
}

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const p = await getProfile();
    const t = await getTransactions();
    setProfile(p);
    setTransactions(t);
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

  const balance = calculateBalance(transactions);
  const totalIn = calculateTotalIn(transactions);
  const totalOut = calculateTotalOut(transactions);
  const recent = transactions.slice(0, 5);
  const greeting = getGreeting();
  const firstName = profile?.name ? profile.name.split(' ')[0] : '';
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
          <TouchableOpacity
            onPress={() => navigation.navigate('Perfil')}
            activeOpacity={0.85}
          >
            <Image source={avatarSource} style={styles.headerAvatar} />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              {greeting}, {firstName || 'Estudante'}
            </Text>
            <Text style={styles.date}>{getTodayLabel()}</Text>
          </View>
        </View>

        {/* ─── CARD DO SALDO ─── */}
        <BalanceCard
          balance={balance}
          userName={firstName || 'Estudante'}
        />

        {/* ─── AÇÕES RÁPIDAS ─── */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AddTransaction', { type: 'in' })}
          >
            <Ionicons name="arrow-down" size={20} color={colors.white} />
            <Text style={typography.button}>Recebi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.danger }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AddTransaction', { type: 'out' })}
          >
            <Ionicons name="arrow-up" size={20} color={colors.white} />
            <Text style={typography.button}>Gastei</Text>
          </TouchableOpacity>
        </View>

        {/* ─── RESUMO ─── */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#E8F8F4' }]}>
              <Ionicons name="trending-up" size={18} color={colors.success} />
            </View>
            <Text style={typography.label}>Recebi</Text>
            <Text
              style={[
                typography.subtitle,
                { color: colors.success, marginTop: 4 },
              ]}
            >
              {formatKz(totalIn)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FFF0F0' }]}>
              <Ionicons name="trending-down" size={18} color={colors.danger} />
            </View>
            <Text style={typography.label}>Gastei</Text>
            <Text
              style={[
                typography.subtitle,
                { color: colors.danger, marginTop: 4 },
              ]}
            >
              {formatKz(totalOut)}
            </Text>
          </View>
        </View>

        {/* ─── TRANSAÇÕES RECENTES ─── */}
        <View style={styles.sectionHeader}>
          <Text style={typography.title}>O que fiz</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Histórico')}>
            <Text
              style={[
                typography.label,
                { color: colors.primary, fontFamily: 'InterBold' },
              ]}
            >
              Ver mais
            </Text>
          </TouchableOpacity>
        </View>

        {recent.length === 0 ? (
          <EmptyState
            image={require('../../assets/illustrations/empty-home.png')}
            title="Ainda não fizeste nada"
            message="Regista a primeira coisa que recebeste ou gastaste."
            actionLabel="Adicionar"
            onAction={() =>
              navigation.navigate('AddTransaction', { type: 'out' })
            }
          />
        ) : (
          <View style={styles.list}>
            {recent.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onPress={() =>
                  navigation.navigate('AddTransaction', { edit: tx })
                }
              />
            ))}
          </View>
        )}

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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.white,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontFamily: 'InterExtraBold',
    fontSize: 17,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  date: {
    fontFamily: 'InterMedium',
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  summaryCard: {
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
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 20,
  },
});