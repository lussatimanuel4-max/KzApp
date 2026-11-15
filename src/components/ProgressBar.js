// src/components/ProgressBar.js
// Barra de progresso (usada em orçamento e metas)

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ProgressBar({ percent = 0, color }) {
  const { colors } = useTheme();
  
  // Garantir que percent está entre 0 e 1
  const percentagemSegura = Math.max(0, Math.min(Number(percent) || 0, 1));
  const larguraPercentagem = `${percentagemSegura * 100}%`;
  
  // Fallback para o primário se não for passada cor
  const corPreenchimento = color || colors.primaria;

  return (
    <View style={[styles.trilho, { backgroundColor: colors.superficie }]}>
      <View
        style={[
          styles.preenchimento,
          { width: larguraPercentagem, backgroundColor: corPreenchimento },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  trilho: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  preenchimento: {
    height: '100%',
    borderRadius: 4,
  },
});