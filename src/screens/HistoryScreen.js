// src/screens/HistoryScreen.js
// Ecrã de histórico (aba 2) — lista completa agrupada por dia, com filtro por mês

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../context/ThemeContext';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';
import CustomAlert from '../components/CustomAlert';

import {
  obterTransacoes,
  apagarTransacao,
} from '../storage/transactions';
import { agruparTransacoesPorDia } from '../utils/calc';
import { 
  obterEtiquetaDia, 
  formatarKz, 
  obterMesesDisponiveis, 
  obterEtiquetaMesCurta,
  formatarMesAno,
} from '../utils/format';

const FILTROS = [
  { id: 'all', label: 'Tudo' },
  { id: 'in', label: 'Recebi' },
  { id: 'out', label: 'Gastei' },
];

export default function HistoryScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [transacoes, setTransacoes] = useState([]);
  const [filtro, setFiltro] = useState('all');
  const [atualizando, setAtualizando] = useState(false);

  // Estado do filtro por mês
  const [mesSelecionado, setMesSelecionado] = useState(null); // null = Todos
  const [modalMesVisivel, setModalMesVisivel] = useState(false);

  // ─── ESTADO DO CUSTOM ALERT ───
  const [configAlerta, setConfigAlerta] = useState({
    visible: false,
    title: '',
    message: '',
    isDestructive: false,
    buttons: [],
  });

  function mostrarAlerta(title, message, isDestructive = false, buttons = null) {
    setConfigAlerta({
      visible: true,
      title,
      message,
      isDestructive,
      buttons: buttons || [{ text: 'Entendido', style: 'default' }],
    });
  }

  function fecharAlerta() {
    setConfigAlerta((prev) => ({ ...prev, visible: false }));
  }

  async function carregarDados() {
    const lista = await obterTransacoes();
    setTransacoes(lista);
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

  function lidarComMudancaFiltro(novoFiltro) {
    if (novoFiltro !== filtro) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFiltro(novoFiltro);
    }
  }

  function lidarComPressao(transacao) {
    navigation.navigate('AddTransaction', { edit: transacao });
  }

  function confirmarApagar(id) {
    mostrarAlerta(
      'Apagar',
      'Tens a certeza que queres apagar?',
      true,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            await apagarTransacao(id);
            await carregarDados();
          },
        },
      ]
    );
  }

  // 1. Filtrar por tipo (Tudo / Recebi / Gastei)
  const filtradasPorTipo =
    filtro === 'all'
      ? transacoes
      : transacoes.filter((tx) => tx.type === filtro);

  // 2. Filtrar por mês (se estiver selecionado)
  const filtradas = mesSelecionado
    ? filtradasPorTipo.filter((tx) => {
        const data = new Date(tx.date || tx.createdAt);
        return (
          data.getFullYear() === mesSelecionado.year &&
          data.getMonth() === mesSelecionado.monthIndex
        );
      })
    : filtradasPorTipo;

  // 3. Agrupar por dia
  const agrupadas = agruparTransacoesPorDia(filtradas);

  const secoes = agrupadas.map((grupo) => {
    const total = grupo.items.reduce((soma, tx) => {
      const valor = Number(tx.amount) || 0;
      return tx.type === 'in' ? soma + valor : soma - valor;
    }, 0);

    return {
      title: obterEtiquetaDia(grupo.date),
      total,
      data: grupo.items,
    };
  });

  // 4. Calcular meses disponíveis
  const mesesDisponiveis = useMemo(() => obterMesesDisponiveis(transacoes), [transacoes]);

  function abrirModalMes() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalMesVisivel(true);
  }

  function selecionarMes(mes) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMesSelecionado(mes);
    setModalMesVisivel(false);
  }

  const rotuloMes = mesSelecionado
    ? obterEtiquetaMesCurta(mesSelecionado.year, mesSelecionado.monthIndex)
    : 'Este mês';

  return (
    <SafeAreaView style={[styles.seguro, { backgroundColor: colors.fundo }]} edges={['top']}>
      {/* ─── CABEÇALHO ─── */}
      <View style={styles.cabecalho}>
        <View style={styles.cabecalhoEsquerda}>
          <Text style={typography.h2}>O que fiz</Text>
          
          {/* Botão do filtro de mês */}
          <TouchableOpacity
            style={[styles.botaoMes, { backgroundColor: colors.superficie }]}
            onPress={abrirModalMes}
            activeOpacity={0.7}
          >
            <Text style={[styles.textoBotaoMes, { color: colors.textoPrimario }]}>
              {rotuloMes}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.textoSecundario} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.botaoAdicionar, { backgroundColor: colors.primaria }]}
          onPress={() => navigation.navigate('AddTransaction', { type: 'out' })}
        >
          <Ionicons name="add" size={24} color={colors.branco} />
        </TouchableOpacity>
      </View>

      {/* ─── FILTROS (Tipo) ─── */}
      <View style={styles.filtros}>
        {FILTROS.map((f) => {
          const ativo = filtro === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filtro,
                { backgroundColor: colors.superficie },
                ativo && { backgroundColor: colors.primaria },
              ]}
              onPress={() => lidarComMudancaFiltro(f.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.textoFiltro,
                  { color: ativo ? colors.branco : colors.textoSecundario },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── LISTA ─── */}
      {secoes.length === 0 ? (
        <EmptyState
          image={require('../../assets/illustrations/empty-history.png')}
          title="Ainda não fizeste nada"
          message={
            filtro === 'all'
              ? 'Ainda não registaste nada. Bora começar.'
              : 'Não há nada deste tipo.'
          }
          actionLabel={filtro === 'all' ? 'Adicionar' : null}
          onAction={
            filtro === 'all'
              ? () => navigation.navigate('AddTransaction', { type: 'out' })
              : null
          }
        />
      ) : (
        <SectionList
          sections={secoes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.conteudoLista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={aoAtualizar}
              tintColor={colors.primaria}
            />
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.cabecalhoSecao}>
              <Text style={[styles.tituloSecao, { color: colors.textoSecundario }]}>
                {section.title}
              </Text>
              <Text
                style={[
                  styles.totalSecao,
                  {
                    color: section.total >= 0 ? colors.sucesso : colors.perigo,
                  },
                ]}
              >
                {section.total >= 0 ? '+' : '-'}
                {formatarKz(Math.abs(section.total))}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              onPress={() => lidarComPressao(item)}
              onLongPress={() => confirmarApagar(item.id)}
            />
          )}
        />
      )}

      {/* ─── MODAL: FILTRO POR MÊS ─── */}
      <Modal
        visible={modalMesVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalMesVisivel(false)}
      >
        <TouchableOpacity
          style={[styles.sobreposicaoModal, { backgroundColor: colors.sobreposicao }]}
          onPress={() => setModalMesVisivel(false)}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={[styles.folhaModal, { backgroundColor: colors.fundoModal }]}
            activeOpacity={1}
          >
            <View style={[styles.pegaModal, { backgroundColor: colors.divisoria }]} />

            <Text style={[styles.tituloModal, { color: colors.textoPrimario }]}>
              Filtrar por mês
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {/* Opção "Ver Todos" */}
              <TouchableOpacity
                style={[
                  styles.opcaoModal,
                  !mesSelecionado && { backgroundColor: colors.destaqueSuave },
                ]}
                onPress={() => selecionarMes(null)}
              >
                <View style={styles.opcaoModalEsquerda}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={!mesSelecionado ? colors.primaria : colors.textoSecundario}
                  />
                  <Text
                    style={[
                      styles.textoOpcaoModal,
                      {
                        color: !mesSelecionado ? colors.primaria : colors.textoPrimario,
                        fontFamily: !mesSelecionado ? 'InterBold' : 'InterMedium',
                      },
                    ]}
                  >
                    Ver Todos
                  </Text>
                </View>
                {!mesSelecionado && (
                  <Ionicons name="checkmark" size={20} color={colors.primaria} />
                )}
              </TouchableOpacity>

              {/* Meses Disponíveis */}
              {mesesDisponiveis.map((mes) => {
                const ativo =
                  mesSelecionado &&
                  mesSelecionado.year === mes.year &&
                  mesSelecionado.monthIndex === mes.monthIndex;

                return (
                  <TouchableOpacity
                    key={`${mes.year}-${mes.monthIndex}`}
                    style={[
                      styles.opcaoModal,
                      ativo && { backgroundColor: colors.destaqueSuave },
                    ]}
                    onPress={() => selecionarMes(mes)}
                  >
                    <View style={styles.opcaoModalEsquerda}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={ativo ? colors.primaria : colors.textoSecundario}
                      />
                      <Text
                        style={[
                          styles.textoOpcaoModal,
                          {
                            color: ativo ? colors.primaria : colors.textoPrimario,
                            fontFamily: ativo ? 'InterBold' : 'InterMedium',
                          },
                        ]}
                      >
                        {formatarMesAno(mes.year, mes.monthIndex)}
                      </Text>
                    </View>
                    {ativo && (
                      <Ionicons name="checkmark" size={20} color={colors.primaria} />
                    )}
                  </TouchableOpacity>
                );
              })}

              {mesesDisponiveis.length === 0 && (
                <Text style={[styles.textoMesesVazios, { color: colors.textoSecundario }]}>
                  Ainda não tens movimentos registados.
                </Text>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ─── CUSTOM ALERT ─── */}
      <CustomAlert
        visible={configAlerta.visible}
        title={configAlerta.title}
        message={configAlerta.message}
        isDestructive={configAlerta.isDestructive}
        buttons={configAlerta.buttons.map((btn) => ({
          ...btn,
          onPress: () => {
            fecharAlerta();
            if (btn.onPress) btn.onPress();
          },
        }))}
        onRequestClose={fecharAlerta}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    flex: 1,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  cabecalhoEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botaoMes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  textoBotaoMes: {
    fontFamily: 'InterBold',
    fontSize: 12,
  },
  botaoAdicionar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtros: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filtro: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
  },
  textoFiltro: {
    fontFamily: 'InterBold',
    fontSize: 14,
  },
  conteudoLista: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  cabecalhoSecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  tituloSecao: {
    fontFamily: 'InterBold',
    fontSize: 14,
  },
  totalSecao: {
    fontFamily: 'InterBold',
    fontSize: 13,
  },
  sobreposicaoModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  folhaModal: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  pegaModal: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  tituloModal: {
    fontFamily: 'InterExtraBold',
    fontSize: 20,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  opcaoModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
  },
  opcaoModalEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textoOpcaoModal: {
    fontSize: 15,
  },
  textoMesesVazios: {
    fontFamily: 'InterRegular',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});