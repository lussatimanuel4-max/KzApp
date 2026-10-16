// src/components/EmptyState.js
// Ecrã vazio quando não há dados (transações, metas, etc.)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

export default function EmptyState({
  icon = 'folder-open-outline',
  image = null,
  imageSize = 200,
  title = 'Nada por aqui',
  message = '',
  actionLabel = null,
  onAction = null,
}) {
  return (
    <View style={styles.container}>
      {image ? (
        <Image
          source={image}
          style={[styles.illustration, { width: imageSize, height: imageSize }]}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={40} color={colors.primary} />
        </View>
      )}

      <Text style={styles.title}>{title}</Text>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {actionLabel && onAction ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={colors.white} />
          <Text style={styles.buttonText}>{actionLabel}</Text>
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
  illustration: {
    marginBottom: 16,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'InterExtraBold',
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontFamily: 'InterRegular',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 28,
    gap: 6,
  },
  buttonText: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: colors.white,
    letterSpacing: 0.2,
  },
});