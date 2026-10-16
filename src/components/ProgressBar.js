// src/components/ProgressBar.js
// Barra de progresso (usada em orçamento e metas)

import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function ProgressBar({ percent = 0, color = colors.primary }) {
  // Garantir que percent está entre 0 e 1
  const safePercent = Math.max(0, Math.min(Number(percent) || 0, 1));
  const widthPercent = `${safePercent * 100}%`;
  
  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          { width: widthPercent, backgroundColor: color },
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
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});