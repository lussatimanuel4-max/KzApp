// src/components/BalanceCard.js
// Card do saldo com gradiente

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import { formatKz } from '../utils/format';

export default function BalanceCard({ balance, userName = 'Estudante' }) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* ─── NOME DO USER ─── */}
      <Text style={styles.userName}>{userName}</Text>

      {/* ─── CHIP + WIFI ─── */}
      <View style={styles.chipRow}>
        <View style={styles.chip}>
          <View style={styles.chipLine} />
          <View style={[styles.chipLine, { marginTop: 3 }]} />
          <View style={[styles.chipLine, { marginTop: 3 }]} />
        </View>

        <View style={styles.wifiIcon}>
          <View style={[styles.wifiArc, styles.wifiArc1]} />
          <View style={[styles.wifiArc, styles.wifiArc2]} />
          <View style={[styles.wifiArc, styles.wifiArc3]} />
        </View>
      </View>

      {/* ─── LABEL + VALOR ─── */}
      <Text style={styles.label}>O QUE TENHO</Text>
      <Text style={styles.balance}>{formatKz(balance)}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    marginHorizontal: 20,
    marginTop: 12,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 7,
  },
  userName: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: colors.white,
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  chipRow: {
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
  chipLine: {
    height: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 1,
    marginHorizontal: 3,
  },
  wifiIcon: {
    marginLeft: 10,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],
  },
  wifiArc: {
    position: 'absolute',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRadius: 100,
  },
  wifiArc1: {
    width: 22,
    height: 22,
    borderWidth: 2,
    top: 0,
  },
  wifiArc2: {
    width: 14,
    height: 14,
    borderWidth: 2,
    top: 4,
  },
  wifiArc3: {
    width: 6,
    height: 6,
    borderWidth: 2,
    top: 8,
  },
  label: {
    fontFamily: 'InterBold',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  balance: {
    fontFamily: 'InterExtraBold',
    fontSize: 32,
    color: colors.white,
    letterSpacing: -1,
  },
});