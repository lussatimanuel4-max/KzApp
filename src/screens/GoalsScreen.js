// src/screens/GoalsScreen.js
// Ecrã de metas (aba 3) — o que quero juntar

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import colors from '../theme/colors';
import typography from '../theme/typography';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';

import {
  getGoals,
  addGoal,
  addToGoal,
  deleteGoal,
} from '../storage/goals';
import {
  calculateTotalSaved,
  calculateGoalProgress,
} from '../utils/calc';
import { formatKz } from '../utils/format';

export default function GoalsScreen({ navigation }) {
  const [goals, setGoals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [addModal, setAddModal] = useState(false);
  const [moneyModal, setMoneyModal] = useState(false);
  const [activeGoal, setActiveGoal] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [moneyInput, setMoneyInput] = useState('');

  async function loadData() {
    const list = await getGoals();
    setGoals(list);
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

  async function handleAddGoal() {
    const target = Number(newTarget);

    if (newTitle.trim().length < 2) {
      Alert.alert('Nome inválido', 'Escreve um nome para o objetivo.');
      return;
    }

    if (!target || target <= 0) {
      Alert.alert('Valor inválido', 'Define um valor maior que zero.');
      return;
    }

    await addGoal({
      title: newTitle.trim(),
      target,
      saved: 0,
      deadline: null,
    });

    setNewTitle('');
    setNewTarget('');
    setAddModal(false);
    await loadData();
  }

  async function handleAddMoney() {
    const amount = Number(moneyInput);

    if (!amount || amount <= 0) {
      Alert.alert('Valor inválido', 'Escreve um valor maior que zero.');
      return;
    }

    await addToGoal(activeGoal.id, amount);
    setMoneyInput('');
    setMoneyModal(false);
    setActiveGoal(null);
    await loadData();
  }

  function confirmDelete(goal) {
    Alert.alert(
      'Apagar objetivo',
      `Queres apagar "${goal.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            await deleteGoal(goal.id);
            await loadData();
          },
        },
      ]
    );
  }

  function displayMoney() {
    if (!moneyInput) return '';
    return Number(moneyInput)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function displayTarget() {
    if (!newTarget) return '';
    return Number(newTarget)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  const totalSaved = calculateTotalSaved(goals);

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
          <Text style={typography.h2}>O que quero</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* ─── CARD TOTAL ─── */}
        <View style={styles.totalCard}>
          <Text style={typography.label}>Já juntei</Text>
          <Text
            style={[
              typography.h2,
              { color: colors.primary, marginTop: 6 },
            ]}
          >
            {formatKz(totalSaved)}
          </Text>
        </View>

        {/* ─── LISTA ─── */}
        {goals.length === 0 ? (
          <EmptyState
            image={require('../../assets/illustrations/empty-goals.png')}
            title="Ainda não tens objetivos"
            message="Cria o teu primeiro objetivo e começa a juntar."
            actionLabel="Novo objetivo"
            onAction={() => setAddModal(true)}
          />
        ) : (
          <View style={styles.list}>
            {goals.map((goal) => {
              const percent = calculateGoalProgress(goal);
              const done = percent >= 1;

              return (
                <TouchableOpacity
                  key={goal.id}
                  style={styles.goalCard}
                  activeOpacity={0.85}
                  onPress={() => {
                    setActiveGoal(goal);
                    setMoneyInput('');
                    setMoneyModal(true);
                  }}
                  onLongPress={() => confirmDelete(goal)}
                >
                  <View style={styles.goalTop}>
                    <View style={styles.goalLeft}>
                      <View
                        style={[
                          styles.goalIcon,
                          done && { backgroundColor: '#E8F8F4' },
                        ]}
                      >
                        <Ionicons
                          name={done ? 'checkmark' : 'flag-outline'}
                          size={20}
                          color={done ? colors.success : colors.primary}
                        />
                      </View>
                      <Text
                        style={[typography.subtitle, { flex: 1 }]}
                        numberOfLines={1}
                      >
                        {goal.title}
                      </Text>
                    </View>

                    {done && (
                      <View style={styles.doneBadge}>
                        <Text style={styles.doneText}>Consegui!</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.goalValues}>
                    <Text style={[typography.subtitle, { fontSize: 16 }]}>
                      {formatKz(goal.saved)}
                    </Text>
                    <Text style={[typography.label, { marginLeft: 6 }]}>
                      / {formatKz(goal.target)}
                    </Text>
                  </View>

                  <ProgressBar
                    percent={percent}
                    color={done ? colors.success : colors.primary}
                  />

                  <Text
                    style={[
                      typography.caption,
                      { marginTop: 8, color: colors.textLight },
                    ]}
                  >
                    {Math.round(percent * 100)}% • toca para juntar
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── MODAL: NOVO OBJETIVO ─── */}
      <Modal
        visible={addModal}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <Text style={[typography.h3, { marginBottom: 4 }]}>
              Novo objetivo
            </Text>
            <Text style={[typography.body, { marginBottom: 20 }]}>
              O que queres conquistar?
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="flag-outline"
                size={20}
                color={colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ex: Comprar PC"
                placeholderTextColor={colors.textLight}
                value={newTitle}
                onChangeText={setNewTitle}
                maxLength={40}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.currency}>Kz</Text>
              <TextInput
                style={styles.input}
                placeholder="Quanto precisas?"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
                value={displayTarget()}
                onChangeText={(t) =>
                  setNewTarget(t.replace(/[^0-9]/g, ''))
                }
                maxLength={12}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setAddModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSave}
                onPress={handleAddGoal}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSaveText}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── MODAL: JUNTAR DINHEIRO ─── */}
      <Modal
        visible={moneyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setMoneyModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <Text style={[typography.h3, { marginBottom: 4 }]}>
              {activeGoal?.title || 'Objetivo'}
            </Text>
            <Text style={[typography.body, { marginBottom: 20 }]}>
              Quanto queres juntar agora?
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.currency}>Kz</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
                value={displayMoney()}
                onChangeText={(t) =>
                  setMoneyInput(t.replace(/[^0-9]/g, ''))
                }
                maxLength={12}
                autoFocus
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setMoneyModal(false);
                  setActiveGoal(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSave}
                onPress={handleAddMoney}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSaveText}>Juntar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  totalCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
  },
  list: {
    paddingHorizontal: 20,
  },
  goalCard: {
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
  goalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  goalIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBadge: {
    backgroundColor: '#E8F8F4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  doneText: {
    fontFamily: 'InterBold',
    fontSize: 11,
    color: colors.success,
  },
  goalValues: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 26,
    paddingHorizontal: 20,
    height: 52,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  currency: {
    fontFamily: 'InterBold',
    fontSize: 18,
    color: colors.textLight,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'InterRegular',
    fontSize: 16,
    color: colors.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  modalCancel: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontFamily: 'InterBold',
    fontSize: 15,
    color: colors.textSecondary,
  },
  modalSave: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontFamily: 'InterBold',
    fontSize: 15,
    color: colors.white,
  },
});