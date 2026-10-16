// src/components/CategoryPicker.js
// Grelha para escolher a categoria de uma saída

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import colors from '../theme/colors';
import { CATEGORIES } from '../utils/categories';

export default function CategoryPicker({ selected, onSelect }) {
  return (
    <View style={styles.grid}>
      {CATEGORIES.map((cat) => {
        const isSelected = selected === cat.id;

        return (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.item,
              isSelected && styles.itemSelected,
            ]}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconBox,
                isSelected && styles.iconBoxSelected,
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
                isSelected && styles.labelSelected,
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
    backgroundColor: colors.surface,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemSelected: {
    backgroundColor: '#F0EDFF',
    borderColor: colors.primary,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginBottom: 8,
  },
  iconBoxSelected: {
    backgroundColor: colors.white,
  },
  image: {
    width: 48,
    height: 48,
  },
  label: {
    fontFamily: 'InterBold',
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});