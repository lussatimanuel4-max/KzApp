// src/screens/AnalyticsScreen.js
// Ecrã de Análises (Gráficos)

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-gifted-charts';

import { useTheme } from '../context/ThemeContext';
import { obterTransacoes } from '../storage/transactions';
import { CATEGORIES } from '../utils/categories';
import { formatarKz, obterEtiquetaMesCurta } from '../utils/format';
import { gerarRelatorioMensal } from '../utils/pdfGenerator';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { colors, typography } = useTheme();
  const [transacoes, setTransacoes] = useState([]);
  const [gerando, setGerando] = useState(false);

  async function carregarDados() {
    const lista = await obterTransacoes();
    setTransacoes(lista);
  }

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const agora = new Date();
  const anoAlvo = agora.getFullYear();
  const indiceMesAlvo = agora.getMonth();

  const transacoesDoMes = transacoes.filter((tx) => {
    const data = new Date(tx.date || tx.createdAt);
    return data.getFullYear() === anoAlvo && data.getMonth() === indiceMesAlvo;
  });

  // Cálculos para o Relatório
  const totalEntradas = transacoesDoMes
    .filter((tx) => tx.type === 'in')
    .reduce((soma, tx) => soma + tx.amount, 0);
  const totalSaidas = transacoesDoMes
    .filter((tx) => tx.type === 'out')
    .reduce((soma, tx) => soma + tx.amount, 0);
  const saldo = totalEntradas - totalSaidas;

  // 1. Ranking Diário (Top 5)
  const totaisDiarios = {};
  transacoesDoMes
    .filter((tx) => tx.type === 'out')
    .forEach((tx) => {
      const dia = new Date(tx.date || tx.createdAt).getDate();
      totaisDiarios[dia] = (totaisDiarios[dia] || 0) + tx.amount;
    });

  const rankingDiario = Object.keys(totaisDiarios)
    .map(dia => ({ day: Number(dia), amount: totaisDiarios[dia] }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const maiorValorDiario = rankingDiario.length > 0 ? rankingDiario[0].amount : 1;

  // 2. Gastos por Categoria
  const totaisCategoria = transacoesDoMes
    .filter((tx) => tx.type === 'out')
    .reduce((acc, tx) => {
      const cat = tx.category || 'outros';
      acc[cat] = (acc[cat] || 0) + tx.amount;
      return acc;
    }, {});

  // MAPA DE CORES
  const mapaCores = {
    lanche: '#FFB74D',
    transporte: '#64B5F6',
    material: '#d72cf5',
    fasciculos: '#c6f5f0',
    propinas: '#9575CD',
    'internet unitel': '#f77149',
    'internet africell': '#fc3a7b',
    almoco: '#E57373',
    roupa: '#4FC3F7',
    higiene: '#81C784',
    saude: '#FFD54F',
    diversao: '#A1887F',
    emprestimos: '#90A4AE',
    livros: '#7986CB',
    'acessorios electronicos': '#A1887F',
    'sinal dstv': '#0ec1f8',
    'saldo zap': '#BA68C8',
    'luz ende': '#FFB300',
  };

  const dadosTopCategorias = Object.keys(totaisCategoria).map((idCat) => {
    const dadosCat = CATEGORIES.find((c) => c.id === idCat);
    return {
      id: idCat,
      value: totaisCategoria[idCat],
      color: mapaCores[idCat] || '#A1A1A6',
      label: dadosCat ? dadosCat.label : 'Outros',
    };
  }).sort((a, b) => b.value - a.value);

  const dadosPizza = dadosTopCategorias.map((item) => ({
    value: item.value,
    color: item.color,
    text: item.label,
    fullLabel: item.label,
  }));

  const totalGasto = dadosPizza.reduce((soma, item) => soma + item.value, 0);

  async function lidarComPartilharRelatorio() {
    if (transacoesDoMes.length === 0) {
      alert('Sem dados para este mês.');
      return;
    }

    try {
      setGerando(true);
      await gerarRelatorioMensal({
        transactions: transacoes,
        year: anoAlvo,
        monthIndex: indiceMesAlvo,
        totalIn: totalEntradas,
        totalOut: totalSaidas,
        balance: saldo,
        topCategories: dadosTopCategorias,
      });
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar relatório.');
    } finally {
      setGerando(false);
    }
  }

  return (
    <SafeAreaView style={[styles.seguro, { backgroundColor: colors.fundo }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.cabecalho}>
          <View>
            <Text style={typography.h2}>Análises</Text>
            <Text style={[typography.rotulo, { color: colors.textoSecundario, marginTop: 4 }]}>
              {obterEtiquetaMesCurta(anoAlvo, indiceMesAlvo)}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.botaoPartilhar, { backgroundColor: colors.cartao }]}
            onPress={lidarComPartilharRelatorio}
            activeOpacity={0.7}
            disabled={gerando}
          >
            <Ionicons name="share-outline" size={20} color={colors.primaria} />
            <Text style={[styles.textoBotaoPartilhar, { color: colors.primaria }]}>
              {gerando ? 'A gerar...' : 'Relatório'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── CARD: RANKING DIÁRIO ─── */}
        <View style={[styles.cartaoGrafico, { backgroundColor: colors.cartao }]}>
          <Text style={[typography.subtitulo, { color: colors.textoPrimario, marginBottom: 24 }]}>
            Top 5 dias com mais gastos
          </Text>
          
          {rankingDiario.length === 0 ? (
            <Text style={[typography.corpo, { textAlign: 'center', paddingVertical: 20, color: colors.textoSecundario }]}>
              Sem gastos registados este mês.
            </Text>
          ) : (
            <View style={styles.containerRanking}>
              {rankingDiario.map((item, index) => {
                const percentagem = (item.amount / maiorValorDiario);
                return (
                  <View key={index} style={styles.linhaRanking}>
                    <Text style={[styles.diaRanking, { color: colors.textoSecundario }]}>
                      Dia {item.day}
                    </Text>
                    <View style={[styles.trilhoBarra, { backgroundColor: colors.superficie }]}>
                      <View 
                        style={[
                          styles.preenchimentoBarra, 
                          { width: `${percentagem * 100}%`, backgroundColor: colors.perigo }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.valorRanking, { color: colors.textoPrimario }]}>
                      {formatarKz(item.amount)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ─── CARD: GRÁFICO DE PIZZA ─── */}
        <View style={[styles.cartaoGrafico, { backgroundColor: colors.cartao }]}>
          <Text style={[typography.subtitulo, { color: colors.textoPrimario, marginBottom: 20 }]}>
            Gastos por Categoria
          </Text>

          {dadosPizza.length > 0 ? (
            <View style={styles.containerPizza}>
              <View style={styles.containerGraficoPizza}>
                <PieChart
                  data={dadosPizza}
                  donut
                  radius={80}
                  innerRadius={60}
                  innerCircleColor={colors.cartao}
                  centerLabelComponent={() => (
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={[typography.rotulo, {color: colors.textoSecundario}]}>Total</Text>
                      <Text style={[typography.subtitulo, {color: colors.textoPrimario}]}>
                        {formatarKz(totalGasto)}
                      </Text>
                    </View>
                  )}
                />
              </View>
              <View style={styles.legendaPizza}>
                {dadosPizza.map((item, index) => (
                  <View key={index} style={styles.itemLegendaPizza}>
                    <View style={[styles.pontoLegenda, { backgroundColor: item.color }]} />
                    <Text style={[styles.textoLegenda, { color: colors.textoSecundario, flex: 1 }]} numberOfLines={1}>
                      {item.fullLabel}
                    </Text>
                    <Text style={[styles.valorLegenda, { color: colors.textoPrimario }]}>
                      {formatarKz(item.value)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={[typography.corpo, { textAlign: 'center', paddingVertical: 40, color: colors.textoSecundario }]}>
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
  seguro: { flex: 1 },
  scroll: { paddingBottom: 32 },
  cabecalho: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botaoPartilhar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  textoBotaoPartilhar: {
    fontFamily: 'InterBold',
    fontSize: 13,
  },
  cartaoGrafico: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  containerRanking: { gap: 16 },
  linhaRanking: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  diaRanking: { fontFamily: 'InterMedium', fontSize: 13, width: 50 },
  trilhoBarra: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  preenchimentoBarra: { height: '100%', borderRadius: 4 },
  valorRanking: { fontFamily: 'InterBold', fontSize: 13, width: 80, textAlign: 'right' },
  containerPizza: { flexDirection: 'column', alignItems: 'center' },
  containerGraficoPizza: { marginBottom: 24 },
  legendaPizza: { width: '100%', gap: 12 },
  itemLegendaPizza: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pontoLegenda: { width: 8, height: 8, borderRadius: 4 },
  textoLegenda: { fontFamily: 'InterMedium', fontSize: 13 },
  valorLegenda: { fontFamily: 'InterBold', fontSize: 13 },
});