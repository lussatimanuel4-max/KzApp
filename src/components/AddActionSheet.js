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

  function lidarComSelecao(tipo) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    // Pequeno delay para o modal fechar antes de navegar
    setTimeout(() => {
      onSelect(tipo);
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
        <View style={[styles.sobreposicao, { backgroundColor: colors.sobreposicao }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.folha, { backgroundColor: colors.fundoModal }]}>
              {/* ─── HANDLE ─── */}
              <View style={[styles.pega, { backgroundColor: colors.divisoria }]} />

              {/* ─── TÍTULO ─── */}
              <Text style={[typography.h3, { marginBottom: 20 }]}>
                O que aconteceu?
              </Text>

              {/* ─── CARDS ─── */}
              <View style={styles.linhaOpcoes}>
                {/* Recebi */}
                <TouchableOpacity
                  style={[styles.cartaoOpcao, { backgroundColor: colors.sucessoSuave }]}
                  onPress={() => lidarComSelecao('in')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.iconeOpcao, { backgroundColor: colors.sucesso }]}>
                    <Ionicons
                      name="arrow-down"
                      size={28}
                      color={colors.branco}
                    />
                  </View>
                  <Text style={[styles.rotuloOpcao, { color: colors.textoPrimario }]}>
                    Recebi
                  </Text>
                  <Text style={[styles.dicaOpcao, { color: colors.textoSecundario }]}>
                    Dinheiro que entrou
                  </Text>
                </TouchableOpacity>

                {/* Gastei */}
                <TouchableOpacity
                  style={[styles.cartaoOpcao, { backgroundColor: colors.perigoSuave }]}
                  onPress={() => lidarComSelecao('out')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.iconeOpcao, { backgroundColor: colors.perigo }]}>
                    <Ionicons
                      name="arrow-up"
                      size={28}
                      color={colors.branco}
                    />
                  </View>
                  <Text style={[styles.rotuloOpcao, { color: colors.textoPrimario }]}>
                    Gastei
                  </Text>
                  <Text style={[styles.dicaOpcao, { color: colors.textoSecundario }]}>
                    Dinheiro que saiu
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ─── CANCELAR ─── */}
              <TouchableOpacity
                style={[styles.botaoCancelar, { backgroundColor: colors.primaria }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.textoCancelar, { color: colors.branco }]}>
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
  sobreposicao: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  folha: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  pega: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  linhaOpcoes: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cartaoOpcao: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    alignItems: 'flex-start',
  },
  iconeOpcao: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  rotuloOpcao: {
    fontFamily: 'InterExtraBold',
    fontSize: 17,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  dicaOpcao: {
    fontFamily: 'InterMedium',
    fontSize: 12,
  },
  botaoCancelar: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCancelar: {
    fontFamily: 'InterBold',
    fontSize: 15,
  },
});