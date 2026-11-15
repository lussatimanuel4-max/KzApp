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
import { formatarKzComSinal, formatarHora, obterEtiquetaDia } from '../utils/format';
import { CATEGORIES } from '../utils/categories';

export default function TransactionItem({
  transaction,
  onPress,
  onLongPress,
}) {
  const { colors } = useTheme();
  const eEntrada = transaction.type === 'in';

  const categoria = !eEntrada
    ? CATEGORIES.find((c) => c.id === transaction.category)
    : null;

  const obterRotulo = () => {
    if (eEntrada) return transaction.note || 'Recebi';
    if (transaction.note) return transaction.note;
    return categoria?.label || 'Gastei';
  };

  // ─── ANIMAÇÃO ───
  const animacaoFade = useRef(new Animated.Value(0)).current;
  const animacaoSlide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animacaoFade, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(animacaoSlide, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: animacaoFade,
        transform: [{ translateY: animacaoSlide }],
      }}
    >
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.cartao }]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
        delayLongPress={400}
      >
        {/* ─── CÍRCULO COM IMAGEM DA CATEGORIA ─── */}
        <View
          style={[
            styles.circuloIcone,
            {
              backgroundColor: categoria ? colors.branco : colors.superficie,
              borderColor: colors.divisoria,
            },
          ]}
        >
          {eEntrada ? (
            <Ionicons name="arrow-down" size={22} color={colors.sucesso} />
          ) : categoria ? (
            <Image
              source={categoria.image}
              style={styles.imagemCategoria}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="arrow-up" size={22} color={colors.perigo} />
          )}
        </View>

        {/* ─── TÍTULO + SUBTÍTULO ─── */}
        <View style={styles.meio}>
          <Text style={[styles.titulo, { color: colors.textoPrimario }]} numberOfLines={1}>
            {obterRotulo()}
          </Text>
          <Text style={[styles.subtitulo, { color: colors.textoSecundario }]}>
            {formatarHora(transaction.date)}
          </Text>
        </View>

        {/* ─── VALOR + DATA ─── */}
        <View style={styles.direita}>
          <Text
            style={[
              styles.valor,
              { color: eEntrada ? colors.sucesso : colors.perigo },
            ]}
          >
            {formatarKzComSinal(transaction.amount, transaction.type)}
          </Text>
          <Text style={[styles.data, { color: colors.textoSecundario }]}>
            {obterEtiquetaDia(transaction.date)}
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
  circuloIcone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
  },
  imagemCategoria: {
    width: 28,
    height: 28,
  },
  meio: {
    flex: 1,
    justifyContent: 'center',
  },
  titulo: {
    fontFamily: 'InterBold',
    fontSize: 15,
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  subtitulo: {
    fontFamily: 'InterRegular',
    fontSize: 13,
  },
  direita: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  valor: {
    fontFamily: 'InterBold',
    fontSize: 15,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  data: {
    fontFamily: 'InterRegular',
    fontSize: 12,
  },
});