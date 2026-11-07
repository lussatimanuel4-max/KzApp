// src/components/AddActionSheet.js
// Bottom sheet para escolher: Recebi ou Gastei

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

export default function AddActionSheet({ visible, onClose, onSelect }) {
  const { colors, typography } = useTheme();

  function handleSelect(type) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    // Pequeno delay para o modal fechar antes de navegar
    setTimeout(() => {
      onSelect(type);
    }, 150);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: colors.sheetBg }]}>
              {/* ─── HANDLE ─── */}
              <View style={[styles.handle, { backgroundColor: colors.divider }]} />

              {/* ─── TÍTULO ─── */}
              <Text style={[typography.h3, { marginBottom: 20 }]}>
                O que aconteceu?
              </Text>

              {/* ─── CARDS ─── */}
              <View style={styles.optionsRow}>
                {/* Recebi */}
                <TouchableOpacity
                  style={[styles.optionCard, { backgroundColor: colors.successSoft }]}
                  onPress={() => handleSelect('in')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.optionIcon, { backgroundColor: colors.success }]}>
                    <Ionicons
                      name="arrow-down"
                      size={28}
                      color={colors.white}
                    />
                  </View>
                  <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                    Recebi
                  </Text>
                  <Text style={[styles.optionHint, { color: colors.textSecondary }]}>
                    Dinheiro que entrou
                  </Text>
                </TouchableOpacity>

                {/* Gastei */}
                <TouchableOpacity
                  style={[styles.optionCard, { backgroundColor: colors.dangerSoft }]}
                  onPress={() => handleSelect('out')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.optionIcon, { backgroundColor: colors.danger }]}>
                    <Ionicons
                      name="arrow-up"
                      size={28}
                      color={colors.white}
                    />
                  </View>
                  <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                    Gastei
                  </Text>
                  <Text style={[styles.optionHint, { color: colors.textSecondary }]}>
                    Dinheiro que saiu
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ─── CANCELAR ─── */}
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.primary }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelText, { color: colors.white }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    alignItems: 'flex-start',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  optionLabel: {
    fontFamily: 'InterExtraBold',
    fontSize: 17,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  optionHint: {
    fontFamily: 'InterMedium',
    fontSize: 12,
  },
  cancelButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: 'InterBold',
    fontSize: 15,
  },
});