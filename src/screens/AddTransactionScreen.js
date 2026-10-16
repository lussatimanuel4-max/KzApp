// src/screens/AddTransactionScreen.js
// Ecrã para adicionar ou editar um movimento

import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import colors from '../theme/colors';
import typography from '../theme/typography';
import CategoryPicker from '../components/CategoryPicker';
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../storage/transactions';

export default function AddTransactionScreen({ navigation, route }) {
  const editTransaction = route?.params?.edit || null;
  const initialType = editTransaction?.type || route?.params?.type || 'out';
  const isEditing = !!editTransaction;

  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState(
    editTransaction?.amount ? String(editTransaction.amount) : ''
  );
  const [category, setCategory] = useState(editTransaction?.category || null);
  const [note, setNote] = useState(editTransaction?.note || '');
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar' : type === 'in' ? 'Recebi' : 'Gastei',
    });
  }, [navigation, type, isEditing]);

  function handleTypeChange(newType) {
    setType(newType);
    if (newType === 'in') {
      setCategory(null);
    }
  }

  function formatAmountInput(text) {
    const cleaned = text.replace(/[^0-9]/g, '');
    setAmount(cleaned);
  }

  function displayAmount() {
    if (!amount) return '';
    return Number(amount)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  async function handleSave() {
    const numeric = Number(amount);

    if (!numeric || numeric <= 0) {
      Alert.alert('Valor inválido', 'Escreve um valor maior que zero.');
      return;
    }

    if (type === 'out' && !category) {
      Alert.alert('Categoria obrigatória', 'Escolhe uma categoria.');
      return;
    }

    setLoading(true);

    if (isEditing) {
      const result = await updateTransaction(editTransaction.id, {
        type,
        amount: numeric,
        category: type === 'out' ? category : null,
        note: note.trim(),
      });

      setLoading(false);

      if (!result) {
        Alert.alert('Erro', 'Não foi possível atualizar. Tenta novamente.');
        return;
      }
    } else {
      const result = await addTransaction({
        type,
        amount: numeric,
        category: type === 'out' ? category : null,
        note: note.trim(),
        date: new Date().toISOString(),
      });

      setLoading(false);

      if (!result) {
        Alert.alert('Erro', 'Não foi possível guardar. Tenta novamente.');
        return;
      }
    }

    navigation.goBack();
  }

  function confirmDelete() {
    Alert.alert(
      'Apagar',
      'Tens a certeza que queres apagar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(editTransaction.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── TIPO ─── */}
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'in' && styles.typeButtonInActive,
              ]}
              onPress={() => handleTypeChange('in')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="arrow-down"
                size={18}
                color={type === 'in' ? colors.white : colors.success}
              />
              <Text
                style={[
                  styles.typeText,
                  { color: type === 'in' ? colors.white : colors.success },
                ]}
              >
                Recebi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'out' && styles.typeButtonOutActive,
              ]}
              onPress={() => handleTypeChange('out')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={type === 'out' ? colors.white : colors.danger}
              />
              <Text
                style={[
                  styles.typeText,
                  { color: type === 'out' ? colors.white : colors.danger },
                ]}
              >
                Gastei
              </Text>
            </TouchableOpacity>
          </View>

          {/* ─── VALOR ─── */}
          <View style={styles.amountWrapper}>
            <Text style={typography.label}>Quanto?</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountCurrency}>Kz</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
                value={displayAmount()}
                onChangeText={formatAmountInput}
                maxLength={12}
              />
            </View>
          </View>

          {/* ─── CATEGORIA (só saída) ─── */}
          {type === 'out' && (
            <View style={styles.block}>
              <Text style={[typography.subtitle, { marginBottom: 12 }]}>
                Em quê?
              </Text>
              <CategoryPicker selected={category} onSelect={setCategory} />
            </View>
          )}

          {/* ─── NOTA ─── */}
          <View style={styles.block}>
            <Text style={[typography.subtitle, { marginBottom: 12 }]}>
              Nota (se quiseres)
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ex: Lancha na escola"
                placeholderTextColor={colors.textLight}
                value={note}
                onChangeText={setNote}
                maxLength={60}
              />
            </View>
          </View>

          {/* ─── BOTÃO APAGAR (só em edição) ─── */}
          {isEditing && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={confirmDelete}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={styles.deleteText}>Apagar</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* ─── BOTÃO GUARDAR ─── */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.saveText}>
              {loading
                ? 'A guardar...'
                : isEditing
                ? 'Atualizar'
                : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 32,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonInActive: {
    backgroundColor: colors.success,
  },
  typeButtonOutActive: {
    backgroundColor: colors.danger,
  },
  typeText: {
    fontFamily: 'InterBold',
    fontSize: 15,
    letterSpacing: 0.1,
  },
  amountWrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  amountCurrency: {
    fontFamily: 'InterBold',
    fontSize: 28,
    color: colors.textLight,
    marginRight: 8,
  },
  amountInput: {
    fontFamily: 'InterExtraBold',
    fontSize: 40,
    color: colors.textPrimary,
    minWidth: 100,
    textAlign: 'center',
    letterSpacing: -1,
  },
  block: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 26,
    paddingHorizontal: 20,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'InterRegular',
    fontSize: 15,
    color: colors.textPrimary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF0F0',
    marginTop: 8,
  },
  deleteText: {
    fontFamily: 'InterBold',
    fontSize: 15,
    color: colors.danger,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontFamily: 'InterBold',
    fontSize: 16,
    color: colors.white,
    letterSpacing: 0.2,
  },
});