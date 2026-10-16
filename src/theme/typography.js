// src/theme/typography.js
// Estilos de tipografia centralizados do KzApp
// Fonte: Inter (carregada no App.js)

import { StyleSheet } from 'react-native';
import colors from './colors';

export const typography = StyleSheet.create({
  // ─────────────────────────────
  // TÍTULOS PRINCIPAIS (Inter ExtraBold)
  // ─────────────────────────────
  h1: {
    fontFamily: 'InterExtraBold',
    fontSize: 32,
    color: colors.textPrimary,
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  h2: {
    fontFamily: 'InterExtraBold',
    fontSize: 26,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  h3: {
    fontFamily: 'InterExtraBold',
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 28,
  },

  // ─────────────────────────────
  // TÍTULOS SECUNDÁRIOS (Inter Bold)
  // ─────────────────────────────
  title: {
    fontFamily: 'InterBold',
    fontSize: 17,
    color: colors.textPrimary,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: 'InterBold',
    fontSize: 15,
    color: colors.textPrimary,
    letterSpacing: -0.1,
    lineHeight: 20,
  },

  // ─────────────────────────────
  // CORPO DE TEXTO (Inter Regular)
  // ─────────────────────────────
  body: {
    fontFamily: 'InterRegular',
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: 'InterRegular',
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  caption: {
    fontFamily: 'InterRegular',
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 16,
  },

  // ─────────────────────────────
  // LABELS (Inter Medium)
  // ─────────────────────────────
  label: {
    fontFamily: 'InterMedium',
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  labelSmall: {
    fontFamily: 'InterMedium',
    fontSize: 11,
    color: colors.textLight,
    letterSpacing: 0.2,
  },

  // ─────────────────────────────
  // BOTÕES (Inter Bold)
  // ─────────────────────────────
  button: {
    fontFamily: 'InterBold',
    fontSize: 16,
    color: colors.white,
    letterSpacing: 0.2,
  },
  buttonSmall: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: colors.white,
    letterSpacing: 0.2,
  },

  // ─────────────────────────────
  // VALORES MONETÁRIOS (Inter ExtraBold)
  // ─────────────────────────────
  balance: {
    fontFamily: 'InterExtraBold',
    fontSize: 32,
    color: colors.white,
    letterSpacing: -0.8,
  },
  amount: {
    fontFamily: 'InterBold',
    fontSize: 16,
    letterSpacing: -0.2,
  },
});

export default typography;