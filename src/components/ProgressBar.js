// src/components/ProgressBar.js
// Barra de progresso (usada em orçamento e metas)

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ProgressBar({ percent = 0, color }) {
  const { colors } = useTheme();
  
  // Garantir que percent está entre 0 e 1
  const safePercent = Math.max(0, Math.min(Number(percent) || 0, 1));
  const widthPercent = `${safePercent * 100}%`;
  
  // Fallback para o primário se não for passada cor
  const fillColor = color || colors.primary;

  return (
    <View style={[styles.track, { backgroundColor: colors.surface }]}>
      <View
        style={[
          styles.fill,
          { width: widthPercent, backgroundColor: fillColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});