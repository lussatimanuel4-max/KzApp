// src/screens/HomeScreen.js
// Ecrã principal (aba 1) — saldo + ações + transações recentes

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import BalanceCard from '../components/BalanceCard';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';

import { obterPerfil } from '../storage/profile';
import { obterTransacoes } from '../storage/transactions';
import {
  calcularSaldo,
  calcularTotalEntradas,
  calcularTotalSaidas,
} from '../utils/calc';
import { formatarKz, obterSaudacao } from '../utils/format';

// ─── AVATARES ───
const MAPA_AVATARES = {
  'avatar-1': require('../../assets/avatars/avatar-1.jpg'),
  'avatar-2': require('../../assets/avatars/avatar-2.jpg'),
  'avatar-3': require('../../assets/avatars/avatar-3.jpg'),
  'avatar-4': require('../../assets/avatars/avatar-4.jpg'),
  'avatar-5': require('../../assets/avatars/avatar-5.jpg'),
  'avatar-6': require('../../assets/avatars/avatar-6.jpg'),
};

// ─── DIAS DA SEMANA ───
const DIAS_SEMANA = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

// ─── MESES ───
const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

function obterEtiquetaHoje() {
  const agora = new Date();
  const diaSemana = DIAS_SEMANA[agora.getDay()];
  const dia = agora.getDate();
  const mes = MESES[agora.getMonth()];
  return `${diaSemana}, ${dia} ${mes}`;
}

export default function HomeScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [perfil, setPerfil] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [atualizando, setAtualizando] = useState(false);

  async function carregarDados() {
    const p = await obterPerfil();
    const t = await obterTransacoes();
    setPerfil(p);
    setTransacoes(t);
  }

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  async function aoAtualizar() {
    setAtualizando(true);
    await carregarDados();
    setAtualizando(false);
  }

  const saldo = calcularSaldo(transacoes);
  const totalEntradas = calcularTotalEntradas(transacoes);
  const totalSaidas = calcularTotalSaidas(transacoes);
  const recentes = transacoes.slice(0, 5);
  const saudacao = obterSaudacao();
  const primeiroNome = perfil?.name ? perfil.name.split(' ')[0] : '';
  const fonteAvatar = MAPA_AVATARES[perfil?.avatar] || MAPA_AVATARES['avatar-1'];

  return (
    <SafeAreaView style={[styles.seguro, { backgroundColor: colors.fundo }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={aoAtualizar}
            tintColor={colors.primaria}
          />
        }
      >
        {/* ─── CABEÇALHO ─── */}
        <View style={styles.cabecalho}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Perfil')}
            activeOpacity={0.85}
          >
            <Image
              source={fonteAvatar}
              style={[styles.avatarCabecalho, { borderColor: colors.cartao }]}
            />
          </TouchableOpacity>

          <View style={styles.textoCabecalho}>
            <Text style={[styles.saudacao, { color: colors.textoPrimario }]}>
              {saudacao}, {primeiroNome || 'Estudante'}
            </Text>
            <Text style={[styles.data, { color: colors.textoSecundario }]}>
              {obterEtiquetaHoje()}
            </Text>
          </View>
        </View>

        {/* ─── CARD DO SALDO ─── */}
        <BalanceCard
          balance={saldo}
          userName={primeiroNome || 'Estudante'}
        />

        {/* ─── AÇÕES RÁPIDAS ─── */}
        <View style={styles.acoes}>
          <TouchableOpacity
            style={[styles.botaoAcao, { backgroundColor: colors.sucesso }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AddTransaction', { type: 'in' })}
          >
            <Ionicons name="arrow-down" size={20} color={colors.branco} />
            <Text style={typography.botao}>Recebi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoAcao, { backgroundColor: colors.perigo }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AddTransaction', { type: 'out' })}
          >
            <Ionicons name="arrow-up" size={20} color={colors.branco} />
            <Text style={typography.botao}>Gastei</Text>
          </TouchableOpacity>
        </View>

        {/* ─── RESUMO ─── */}
        <View style={styles.linhaResumo}>
          <View style={[styles.cartaoResumo, { backgroundColor: colors.cartao }]}>
            <View style={[styles.iconeResumo, { backgroundColor: colors.sucessoSuave }]}>
              <Ionicons name="trending-up" size={18} color={colors.sucesso} />
            </View>
            <Text style={typography.rotulo}>Recebi</Text>
            <Text
              style={[
                typography.subtitulo,
                { color: colors.sucesso, marginTop: 4 },
              ]}
            >
              {formatarKz(totalEntradas)}
            </Text>
          </View>

          <View style={[styles.cartaoResumo, { backgroundColor: colors.cartao }]}>
            <View style={[styles.iconeResumo, { backgroundColor: colors.perigoSuave }]}>
              <Ionicons name="trending-down" size={18} color={colors.perigo} />
            </View>
            <Text style={typography.rotulo}>Gastei</Text>
            <Text
              style={[
                typography.subtitulo,
                { color: colors.perigo, marginTop: 4 },
              ]}
            >
              {formatarKz(totalSaidas)}
            </Text>
          </View>
        </View>

        {/* ─── TRANSAÇÕES RECENTES ─── */}
        <View style={styles.cabecalhoSecao}>
          <Text style={typography.titulo}>O que fiz</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Histórico')}>
            <Text
              style={[
                typography.rotulo,
                { color: colors.primaria, fontFamily: 'InterBold' },
              ]}
            >
              Ver mais
            </Text>
          </TouchableOpacity>
        </View>

        {recentes.length === 0 ? (
          <EmptyState
            image={require('../../assets/illustrations/empty-home.png')}
            title="Ainda não fizeste nada"
            message="Regista a primeira coisa que recebeste ou gastaste."
            actionLabel="Adicionar"
            onAction={() =>
              navigation.navigate('AddTransaction', { type: 'out' })
            }
          />
        ) : (
          <View style={styles.lista}>
            {recentes.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onPress={() =>
                  navigation.navigate('AddTransaction', { edit: tx })
                }
              />
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  avatarCabecalho: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  textoCabecalho: {
    flex: 1,
  },
  saudacao: {
    fontFamily: 'InterExtraBold',
    fontSize: 17,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  data: {
    fontFamily: 'InterMedium',
    fontSize: 12,
    letterSpacing: 0.1,
  },
  acoes: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  botaoAcao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
  },
  linhaResumo: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  cartaoResumo: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  iconeResumo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cabecalhoSecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },
  lista: {
    paddingHorizontal: 20,
  },
});