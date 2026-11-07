// src/components/TransactionItem.js
// Item individual de uma transação — estrutura da referência Silicon Valley

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatKzSigned, formatTime, getDayLabel } from '../utils/format';
import { CATEGORIES } from '../utils/categories';

export default function TransactionItem({
  transaction,
  onPress,
  onLongPress,
}) {
  const { colors } = useTheme();
  const isIn = transaction.type === 'in';

  const category = !isIn
    ? CATEGORIES.find((c) => c.id === transaction.category)
    : null;

  const getLabel = () => {
    if (isIn) return transaction.note || 'Recebi';
    if (transaction.note) return transaction.note;
    return category?.label || 'Gastei';
  };

  // ─── ANIMAÇÃO ───
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.card }]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
        delayLongPress={400}
      >
        {/* ─── CÍRCULO COM IMAGEM DA CATEGORIA ─── */}
        <View
          style={[
            styles.iconCircle,
            {
              // O fundo é sempre branco para os ícones das categorias (igual à referência)
              backgroundColor: category ? colors.white : colors.surface,
              // A borda cinza que envolve o círculo
              borderColor: colors.divider,
            },
          ]}
        >
          {isIn ? (
            <Ionicons name="arrow-down" size={22} color={colors.success} />
          ) : category ? (
            <Image
              source={category.image}
              style={styles.categoryImage}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="arrow-up" size={22} color={colors.danger} />
          )}
        </View>

        {/* ─── TÍTULO + SUBTÍTULO ─── */}
        <View style={styles.middle}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {getLabel()}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {formatTime(transaction.date)}
          </Text>
        </View>

        {/* ─── VALOR + DATA ─── */}
        <View style={styles.right}>
          <Text
            style={[
              styles.amount,
              { color: isIn ? colors.success : colors.danger },
            ]}
          >
            {formatKzSigned(transaction.amount, transaction.type)}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {getDayLabel(transaction.date)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  iconCircle: {
    width: 48, // Tamanho exato do círculo exterior (incluindo a borda)
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2, // A linha circular cinza que tu pediste
  },
  categoryImage: {
    width: 28, // Aumentei de 24 para 28, para preencher melhor o círculo branco
    height: 28,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'InterBold',
    fontSize: 15,
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  subtitle: {
    fontFamily: 'InterRegular',
    fontSize: 13,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontFamily: 'InterBold',
    fontSize: 15,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  date: {
    fontFamily: 'InterRegular',
    fontSize: 12,
  },
});