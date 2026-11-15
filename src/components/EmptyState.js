// src/components/EmptyState.js
// Ecrã vazio quando não há dados (transações, metas, etc.)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function EmptyState({
  icon = 'folder-open-outline',
  image = null,
  imageSize = 200,
  title = 'Nada por aqui',
  message = '',
  actionLabel = null,
  onAction = null,
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {image ? (
        <Image
          source={image}
          style={[styles.ilustracao, { width: imageSize, height: imageSize }]}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.caixaIcone, { backgroundColor: colors.destaqueSuave }]}>
          <Ionicons name={icon} size={40} color={colors.primaria} />
        </View>
      )}

      <Text style={[styles.titulo, { color: colors.textoPrimario }]}>
        {title}
      </Text>

      {message ? (
        <Text style={[styles.mensagem, { color: colors.textoSecundario }]}>
          {message}
        </Text>
      ) : null}

      {actionLabel && onAction ? (
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: colors.primaria }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={colors.branco} />
          <Text style={[styles.textoBotao, { color: colors.branco }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  ilustracao: {
    marginBottom: 16,
  },
  caixaIcone: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontFamily: 'InterExtraBold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  mensagem: {
    fontFamily: 'InterRegular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 28,
    gap: 6,
  },
  textoBotao: {
    fontFamily: 'InterBold',
    fontSize: 14,
    letterSpacing: 0.2,
  },
});