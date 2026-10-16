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
import colors from '../theme/colors';
import typography from '../theme/typography';

export default function AddActionSheet({ visible, onClose, onSelect }) {
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
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* ─── HANDLE ─── */}
              <View style={styles.handle} />

              {/* ─── TÍTULO ─── */}
              <Text style={[typography.h3, { marginBottom: 20 }]}>
                O que aconteceu?
              </Text>

              {/* ─── CARDS ─── */}
              <View style={styles.optionsRow}>
                {/* Recebi */}
                <TouchableOpacity
                  style={[styles.optionCard, styles.optionIn]}
                  onPress={() => handleSelect('in')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.optionIcon, styles.optionIconIn]}>
                    <Ionicons
                      name="arrow-down"
                      size={28}
                      color={colors.white}
                    />
                  </View>
                  <Text style={styles.optionLabel}>Recebi</Text>
                  <Text style={styles.optionHint}>Dinheiro que entrou</Text>
                </TouchableOpacity>

                {/* Gastei */}
                <TouchableOpacity
                  style={[styles.optionCard, styles.optionOut]}
                  onPress={() => handleSelect('out')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.optionIcon, styles.optionIconOut]}>
                    <Ionicons
                      name="arrow-up"
                      size={28}
                      color={colors.white}
                    />
                  </View>
                  <Text style={styles.optionLabel}>Gastei</Text>
                  <Text style={styles.optionHint}>Dinheiro que saiu</Text>
                </TouchableOpacity>
              </View>

              {/* ─── CANCELAR ─── */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
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
    backgroundColor: colors.divider,
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
  optionIn: {
    backgroundColor: '#E8F8F4',
  },
  optionOut: {
    backgroundColor: '#FFF0F0',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  optionIconIn: {
    backgroundColor: colors.success,
  },
  optionIconOut: {
    backgroundColor: colors.danger,
  },
  optionLabel: {
    fontFamily: 'InterExtraBold',
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  optionHint: {
    fontFamily: 'InterMedium',
    fontSize: 12,
    color: colors.textSecondary,
  },
  cancelButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: 'InterBold',
    fontSize: 15,
    color: colors.white,
  },
});