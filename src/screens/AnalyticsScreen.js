// src/screens/AnalyticsScreen.js
// Ecrã de Análises (Gráficos)

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-gifted-charts'; // Mantemos apenas o PieChart

import { useTheme } from '../context/ThemeContext';
import { getTransactions } from '../storage/transactions';
import { CATEGORIES } from '../utils/categories';
import { formatKz, getMonthLabelShort } from '../utils/format';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { colors, typography } = useTheme();
  const [transactions, setTransactions] = useState([]);

  async function loadData() {
    const list = await getTransactions();
    setTransactions(list);
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const now = new Date();
  const targetYear = now.getFullYear();
  const targetMonthIndex = now.getMonth();

  // Filtrar transações do mês atual
  const monthTransactions = transactions.filter((tx) => {
    const date = new Date(tx.date || tx.createdAt);
    return date.getFullYear() === targetYear && date.getMonth() === targetMonthIndex;
  });

  // ─── 1. RANKING DE GASTOS POR DIA ───
  // Agrupar por dia
  const dailyTotals = {};
  monthTransactions
    .filter((tx) => tx.type === 'out')
    .forEach((tx) => {
      const day = new Date(tx.date || tx.createdAt).getDate();
      dailyTotals[day] = (dailyTotals[day] || 0) + tx.amount;
    });

  // Transformar num array, ordenar do maior para o menor e pegar nos top 5
  const dailyRanking = Object.keys(dailyTotals)
    .map(day => ({ day: Number(day), amount: dailyTotals[day] }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5); // Mostra apenas os 5 dias com mais gastos

  const maxDailyAmount = dailyRanking.length > 0 ? dailyRanking[0].amount : 1;

  // ─── 2. GASTOS POR CATEGORIA ───
  const categoryTotals = monthTransactions
    .filter((tx) => tx.type === 'out')
    .reduce((acc, tx) => {
      const cat = tx.category || 'outros';
      acc[cat] = (acc[cat] || 0) + tx.amount;
      return acc;
    }, {});

  const pieData = Object.keys(categoryTotals).map((catId) => {
    const catData = CATEGORIES.find((c) => c.id === catId);
    return {
      value: categoryTotals[catId],
      color: catId === 'lanche' ? '#FFB74D' : 
             catId === 'transporte' ? '#64B5F6' : 
             catId === 'material' ? '#BA68C8' : 
             catId === 'fasciculos' ? '#4DB6AC' :
             catId === 'propinas' ? '#9575CD' :
             catId === 'internet unitel' ? '#FF8A65' : 
             catId === 'almoco' ? '#E57373' : 
             catId === 'roupa' ? '#4FC3F7' : 
             catId === 'higiene' ? '#81C784' : 
             catId === 'saude' ? '#FFD54F' : 
             catId === 'diversao' ? '#F06292' : 
             catId === 'emprestimos' ? '#A1887F' : 
             '#A1A1A6',
      text: catData ? catData.label : 'Outros',
      fullLabel: catData ? catData.label : 'Outros',
    };
  }).sort((a, b) => b.value - a.value);

  const totalGasto = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* ─── CABEÇALHO ─── */}
        <View style={styles.header}>
          <Text style={typography.h2}>Análises</Text>
          <Text style={[typography.label, { color: colors.textSecondary }]}>
            {getMonthLabelShort(targetYear, targetMonthIndex)}
          </Text>
        </View>

        {/* ─── CARD: RANKING DIÁRIO (NOVO FORMATO) ─── */}
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[typography.subtitle, { color: colors.textPrimary, marginBottom: 24 }]}>
            Dias com mais gastos
          </Text>
          
          {dailyRanking.length === 0 ? (
            <Text style={[typography.body, { textAlign: 'center', paddingVertical: 20, color: colors.textSecondary }]}>
              Sem gastos registados este mês.
            </Text>
          ) : (
            <View style={styles.rankingContainer}>
              {dailyRanking.map((item, index) => {
                const percent = (item.amount / maxDailyAmount);
                return (
                  <View key={index} style={styles.rankingRow}>
                    {/* Dia */}
                    <Text style={[styles.rankingDay, { color: colors.textSecondary }]}>
                      Dia {item.day}
                    </Text>
                    
                    {/* Barra de Progresso */}
                    <View style={[styles.rankingBarTrack, { backgroundColor: colors.surface }]}>
                      <View 
                        style={[
                          styles.rankingBarFill, 
                          { 
                            width: `${percent * 100}%`,
                            backgroundColor: colors.danger 
                          }
                        ]} 
                      />
                    </View>

                    {/* Valor */}
                    <Text style={[styles.rankingAmount, { color: colors.textPrimary }]}>
                      {formatKz(item.amount)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ─── CARD: GRÁFICO DE PIZZA ─── */}
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[typography.subtitle, { color: colors.textPrimary, marginBottom: 20 }]}>
            Gastos por Categoria
          </Text>

          {pieData.length > 0 ? (
            <View style={styles.pieContainer}>
              <View style={styles.pieChartWrapper}>
                <PieChart
                  data={pieData}
                  donut
                  radius={80}
                  innerRadius={60}
                  innerCircleColor={colors.card}
                  centerLabelComponent={() => {
                    return (
                      <View style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={[typography.label, {color: colors.textSecondary}]}>Total</Text>
                        <Text style={[typography.subtitle, {color: colors.textPrimary}]}>
                          {formatKz(totalGasto)}
                        </Text>
                      </View>
                    );
                  }}
                />
              </View>

              <View style={styles.pieLegend}>
                {pieData.map((item, index) => (
                  <View key={index} style={styles.pieLegendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
                      {item.fullLabel}
                    </Text>
                    <Text style={[styles.legendValue, { color: colors.textPrimary }]}>
                      {formatKz(item.value)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={[typography.body, { textAlign: 'center', paddingVertical: 40, color: colors.textSecondary }]}>
              Sem gastos registados este mês.
            </Text>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  
  // ─── ESTILOS DO RANKING ───
  rankingContainer: {
    gap: 16,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankingDay: {
    fontFamily: 'InterMedium',
    fontSize: 13,
    width: 50, // Largura fixa para alinhar todas as barras
  },
  rankingBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  rankingBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  rankingAmount: {
    fontFamily: 'InterBold',
    fontSize: 13,
    width: 80, // Largura fixa para alinhar os valores
    textAlign: 'right',
  },

  // ─── ESTILOS DO PIE CHART ───
  pieContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  pieChartWrapper: {
    marginBottom: 24,
  },
  pieLegend: {
    width: '100%',
    gap: 12,
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: 'InterMedium',
    fontSize: 13,
  },
  legendValue: {
    fontFamily: 'InterBold',
    fontSize: 13,
  }
});