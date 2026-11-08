// src/screens/AnalyticsScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-gifted-charts';

import { useTheme } from '../context/ThemeContext';
import { getTransactions } from '../storage/transactions';
import { CATEGORIES } from '../utils/categories';
import { formatKz, getMonthLabelShort } from '../utils/format';
import { generateMonthlyReport } from '../utils/pdfGenerator';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { colors, typography } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [generating, setGenerating] = useState(false);

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

  const monthTransactions = transactions.filter((tx) => {
    const date = new Date(tx.date || tx.createdAt);
    return date.getFullYear() === targetYear && date.getMonth() === targetMonthIndex;
  });

  // Cálculos para o Relatório
  const totalIn = monthTransactions
    .filter((tx) => tx.type === 'in')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalOut = monthTransactions
    .filter((tx) => tx.type === 'out')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const balance = totalIn - totalOut;

  // Ranking diário (para o gráfico de cima)
  const dailyTotals = {};
  monthTransactions
    .filter((tx) => tx.type === 'out')
    .forEach((tx) => {
      const day = new Date(tx.date || tx.createdAt).getDate();
      dailyTotals[day] = (dailyTotals[day] || 0) + tx.amount;
    });

  const dailyRanking = Object.keys(dailyTotals)
    .map(day => ({ day: Number(day), amount: dailyTotals[day] }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const maxDailyAmount = dailyRanking.length > 0 ? dailyRanking[0].amount : 1;

  // Pizza (Top Categorias)
  const categoryTotals = monthTransactions
    .filter((tx) => tx.type === 'out')
    .reduce((acc, tx) => {
      const cat = tx.category || 'outros';
      acc[cat] = (acc[cat] || 0) + tx.amount;
      return acc;
    }, {});

  const colorMap = {
    lanche: '#FFB74D', transporte: '#64B5F6', material: '#BA68C8',
    fasciculos: '#4DB6AC', propinas: '#9575CD', 'internet unitel': '#FF8A65',
    almoco: '#E57373', roupa: '#4FC3F7', higiene: '#81C784',
    saude: '#FFD54F', diversao: '#F06292', emprestimos: '#A1887F',
  };

  const topCategoriesData = Object.keys(categoryTotals).map((catId) => {
    const catData = CATEGORIES.find((c) => c.id === catId);
    return {
      id: catId,
      value: categoryTotals[catId],
      color: colorMap[catId] || '#A1A1A6',
      label: catData ? catData.label : 'Outros',
    };
  }).sort((a, b) => b.value - a.value);

  const pieData = topCategoriesData.map((item) => ({
    value: item.value,
    color: item.color,
    text: item.label,
    fullLabel: item.label,
  }));

  const totalGasto = pieData.reduce((sum, item) => sum + item.value, 0);

  // ─── GERAR PDF ───
  async function handleShareReport() {
    if (monthTransactions.length === 0) {
      Alert.alert('Sem dados', 'Ainda não tens transações este mês.');
      return;
    }

    try {
      setGenerating(true);
      await generateMonthlyReport({
        transactions,
        year: targetYear,
        monthIndex: targetMonthIndex,
        totalIn,
        totalOut,
        balance,
        topCategories: topCategoriesData,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível gerar o relatório.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* ─── CABEÇALHO ─── */}
        <View style={styles.header}>
          <View>
            <Text style={typography.h2}>Análises</Text>
            <Text style={[typography.label, { color: colors.textSecondary, marginTop: 4 }]}>
              {getMonthLabelShort(targetYear, targetMonthIndex)}
            </Text>
          </View>

          {/* Botão de Partilhar */}
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: colors.card }]}
            onPress={handleShareReport}
            activeOpacity={0.7}
            disabled={generating}
          >
            <Ionicons name="share-outline" size={20} color={colors.primary} />
            <Text style={[styles.shareBtnText, { color: colors.primary }]}>
              {generating ? 'A gerar...' : 'Relatório'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── CARD: RANKING DIÁRIO ─── */}
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
                    <Text style={[styles.rankingDay, { color: colors.textSecondary }]}>
                      Dia {item.day}
                    </Text>
                    <View style={[styles.rankingBarTrack, { backgroundColor: colors.surface }]}>
                      <View 
                        style={[
                          styles.rankingBarFill, 
                          { width: `${percent * 100}%`, backgroundColor: colors.danger }
                        ]} 
                      />
                    </View>
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
                  centerLabelComponent={() => (
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={[typography.label, {color: colors.textSecondary}]}>Total</Text>
                      <Text style={[typography.subtitle, {color: colors.textPrimary}]}>
                        {formatKz(totalGasto)}
                      </Text>
                    </View>
                  )}
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
  safe: { flex: 1 },
  scroll: { paddingBottom: 32 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shareBtnText: {
    fontFamily: 'InterBold',
    fontSize: 13,
  },
  chartCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  rankingContainer: { gap: 16 },
  rankingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankingDay: { fontFamily: 'InterMedium', fontSize: 13, width: 50 },
  rankingBarTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  rankingBarFill: { height: '100%', borderRadius: 4 },
  rankingAmount: { fontFamily: 'InterBold', fontSize: 13, width: 80, textAlign: 'right' },
  pieContainer: { flexDirection: 'column', alignItems: 'center' },
  pieChartWrapper: { marginBottom: 24 },
  pieLegend: { width: '100%', gap: 12 },
  pieLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: 'InterMedium', fontSize: 13 },
  legendValue: { fontFamily: 'InterBold', fontSize: 13 },
});