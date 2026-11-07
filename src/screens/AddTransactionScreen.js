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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import CategoryPicker from '../components/CategoryPicker';
import CustomAlert from '../components/CustomAlert';
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../storage/transactions';

export default function AddTransactionScreen({ navigation, route }) {
  const { colors, typography } = useTheme();
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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar' : type === 'in' ? 'Recebi' : 'Gastei',
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.textPrimary,
      headerTitleStyle: { fontFamily: 'InterBold', fontWeight: 'normal' },
    });
  }, [navigation, type, isEditing, colors]);

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
      showAlert('Valor inválido', 'Escreve um valor maior que zero.');
      return;
    }

    if (type === 'out' && !category) {
      showAlert('Categoria obrigatória', 'Escolhe uma categoria.');
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
        showAlert('Erro', 'Não foi possível atualizar. Tenta novamente.', true);
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
        showAlert('Erro', 'Não foi possível guardar. Tenta novamente.', true);
        return;
      }
    }

    navigation.goBack();
  }

  function confirmDelete() {
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
            await deleteTransaction(editTransaction.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
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
                { backgroundColor: colors.surface },
                type === 'in' && { backgroundColor: colors.success },
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
                { backgroundColor: colors.surface },
                type === 'out' && { backgroundColor: colors.danger },
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
              <Text style={[styles.amountCurrency, { color: colors.textLight }]}>
                Kz
              </Text>
              <TextInput
                style={[styles.amountInput, { color: colors.textPrimary }]}
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
              <Text style={[typography.subtitle, { marginBottom: 12, color: colors.textPrimary }]}>
                Em quê?
              </Text>
              <CategoryPicker selected={category} onSelect={setCategory} />
            </View>
          )}

          {/* ─── NOTA ─── */}
          <View style={styles.block}>
            <Text style={[typography.subtitle, { marginBottom: 12, color: colors.textPrimary }]}>
              Nota (se quiseres)
            </Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
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
              style={[styles.deleteButton, { backgroundColor: colors.dangerSoft }]}
              onPress={confirmDelete}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={[styles.deleteText, { color: colors.danger }]}>
                Apagar
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* ─── BOTÃO GUARDAR ─── */}
        <View style={[styles.footer, { borderTopColor: colors.divider }]}>
          <TouchableOpacity
            style={[
              styles.saveButton, 
              loading && styles.saveButtonDisabled,
              { backgroundColor: colors.primary, shadowColor: colors.primary }
            ]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={[styles.saveText, { color: colors.white }]}>
              {loading
                ? 'A guardar...'
                : isEditing
                ? 'Atualizar'
                : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>

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

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
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
    marginRight: 8,
  },
  amountInput: {
    fontFamily: 'InterExtraBold',
    fontSize: 40,
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
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
    marginTop: 8,
  },
  deleteText: {
    fontFamily: 'InterBold',
    fontSize: 15,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
    letterSpacing: 0.2,
  },
});