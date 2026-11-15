// src/theme/typography.js
// Estilos de tipografia centralizados do KzApp
// Fonte: Inter (carregada no App.js)

import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  // ─────────────────────────────
  // TÍTULOS PRINCIPAIS (Inter ExtraBold)
  // ─────────────────────────────
  h1: {
    fontFamily: 'InterExtraBold',
    fontSize: 32,
    color: colors.textoPrimario,
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  h2: {
    fontFamily: 'InterExtraBold',
    fontSize: 26,
    color: colors.textoPrimario,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  h3: {
    fontFamily: 'InterExtraBold',
    fontSize: 22,
    color: colors.textoPrimario,
    letterSpacing: -0.3,
    lineHeight: 28,
  },

  // ─────────────────────────────
  // TÍTULOS SECUNDÁRIOS (Inter Bold)
  // ─────────────────────────────
  titulo: {
    fontFamily: 'InterBold',
    fontSize: 17,
    color: colors.textoPrimario,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  subtitulo: {
    fontFamily: 'InterBold',
    fontSize: 15,
    color: colors.textoPrimario,
    letterSpacing: -0.1,
    lineHeight: 20,
  },

  // ─────────────────────────────
  // CORPO DE TEXTO (Inter Regular)
  // ─────────────────────────────
  corpo: {
    fontFamily: 'InterRegular',
    fontSize: 15,
    color: colors.textoSecundario,
    lineHeight: 22,
  },
  corpoPequeno: {
    fontFamily: 'InterRegular',
    fontSize: 13,
    color: colors.textoSecundario,
    lineHeight: 18,
  },
  legenda: {
    fontFamily: 'InterRegular',
    fontSize: 12,
    color: colors.textoClaro,
    lineHeight: 16,
  },

  // ─────────────────────────────
  // RÓTULOS (Inter Medium)
  // ─────────────────────────────
  rotulo: {
    fontFamily: 'InterMedium',
    fontSize: 13,
    color: colors.textoSecundario,
    letterSpacing: 0.1,
  },
  rotuloPequeno: {
    fontFamily: 'InterMedium',
    fontSize: 11,
    color: colors.textoClaro,
    letterSpacing: 0.2,
  },

  // ─────────────────────────────
  // BOTÕES (Inter Bold)
  // ─────────────────────────────
  botao: {
    fontFamily: 'InterBold',
    fontSize: 16,
    color: colors.branco,
    letterSpacing: 0.2,
  },
  botaoPequeno: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: colors.branco,
    letterSpacing: 0.2,
  },

  // ─────────────────────────────
  // VALORES MONETÁRIOS (Inter ExtraBold)
  // ─────────────────────────────
  saldo: {
    fontFamily: 'InterExtraBold',
    fontSize: 32,
    color: colors.branco,
    letterSpacing: -0.8,
  },
  valor: {
    fontFamily: 'InterBold',
    fontSize: 16,
    letterSpacing: -0.2,
  },
});

export default typography;