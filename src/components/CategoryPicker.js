// src/components/CategoryPicker.js
// Grelha para escolher a categoria de uma saída

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES } from '../utils/categories';

export default function CategoryPicker({ selected, onSelect }) {
  const { colors } = useTheme();

  return (
    <View style={styles.grid}>
      {CATEGORIES.map((cat) => {
        const isSelected = selected === cat.id;

        return (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.item,
              { backgroundColor: colors.surface },
              isSelected && {
                backgroundColor: colors.accentSoft,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: colors.white }, // As imagens têm fundo branco, mantemos para contraste
              ]}
            >
              <Image
                source={cat.image}
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            <Text
              style={[
                styles.label,
                { color: colors.textSecondary },
                isSelected && { color: colors.primary, fontWeight: '700' },
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
  grid: {
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
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  image: {
    width: 48,
    height: 48,
  },
  label: {
    fontFamily: 'InterBold',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});