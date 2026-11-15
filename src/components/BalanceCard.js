// src/components/BalanceCard.js
// Card do saldo com gradiente

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { formatarKz } from '../utils/format';

export default function BalanceCard({ balance, userName = 'Estudante' }) {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={[colors.primaria, colors.primariaEscura]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cartao}
    >
      {/* ─── NOME DO USER ─── */}
      <Text style={styles.nomeUtilizador}>{userName}</Text>

      {/* ─── CHIP + WIFI ─── */}
      <View style={styles.linhaChip}>
        <View style={styles.chip}>
          <View style={styles.linhaChipInterna} />
          <View style={[styles.linhaChipInterna, { marginTop: 3 }]} />
          <View style={[styles.linhaChipInterna, { marginTop: 3 }]} />
        </View>

        <View style={styles.iconeWifi}>
          <View style={[styles.arcoWifi, styles.arcoWifi1]} />
          <View style={[styles.arcoWifi, styles.arcoWifi2]} />
          <View style={[styles.arcoWifi, styles.arcoWifi3]} />
        </View>
      </View>

      {/* ─── LABEL + VALOR ─── */}
      <Text style={styles.rotulo}>O QUE TENHO</Text>
      <Text style={styles.saldo}>{formatarKz(balance)}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  cartao: {
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    marginHorizontal: 20,
    marginTop: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 7,
  },
  nomeUtilizador: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  linhaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chip: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#D9D9D9',
    paddingHorizontal: 7,
    paddingVertical: 5,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  linhaChipInterna: {
    height: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 1,
    marginHorizontal: 3,
  },
  iconeWifi: {
    marginLeft: 10,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],
  },
  arcoWifi: {
    position: 'absolute',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRadius: 100,
  },
  arcoWifi1: {
    width: 22,
    height: 22,
    borderWidth: 2,
    top: 0,
  },
  arcoWifi2: {
    width: 14,
    height: 14,
    borderWidth: 2,
    top: 4,
  },
  arcoWifi3: {
    width: 6,
    height: 6,
    borderWidth: 2,
    top: 8,
  },
  rotulo: {
    fontFamily: 'InterBold',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  saldo: {
    fontFamily: 'InterExtraBold',
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: -1,
  },
});