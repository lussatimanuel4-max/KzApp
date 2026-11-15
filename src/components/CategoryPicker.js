// src/components/CategoryPicker.js
// Grelha para escolher a categoria de uma saída

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES } from '../utils/categories';

export default function CategoryPicker({ selected, onSelect }) {
  const { colors } = useTheme();

  return (
    <View style={styles.grelha}>
      {CATEGORIES.map((cat) => {
        const estaSelecionada = selected === cat.id;

        return (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.item,
              { backgroundColor: colors.superficie },
              estaSelecionada && {
                backgroundColor: colors.destaqueSuave,
                borderColor: colors.primaria,
              },
            ]}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.caixaIcone,
                { backgroundColor: colors.branco },
              ]}
            >
              <Image
                source={cat.image}
                style={styles.imagem}
                resizeMode="contain"
              />
            </View>

            <Text
              style={[
                styles.rotulo,
                { color: colors.textoSecundario },
                estaSelecionada && { color: colors.primaria, fontWeight: '700' },
              ]}
              numberOfLines={2}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grelha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  caixaIcone: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  imagem: {
    width: 48,
    height: 48,
  },
  rotulo: {
    fontFamily: 'InterBold',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});