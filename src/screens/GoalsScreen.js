// src/screens/GoalsScreen.js
// Ecrã de metas (aba 3) — o que quero juntar

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import CustomAlert from '../components/CustomAlert';

import {
  obterMetas,
  adicionarMeta,
  adicionarValorMeta,
  apagarMeta,
} from '../storage/goals';
import {
  calcularTotalGuardado,
  calcularProgressoMeta,
} from '../utils/calc';
import { formatarKz } from '../utils/format';

export default function GoalsScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [metas, setMetas] = useState([]);
  const [atualizando, setAtualizando] = useState(false);

  const [modalAdicionar, setModalAdicionar] = useState(false);
  const [modalDinheiro, setModalDinheiro] = useState(false);
  const [metaAtiva, setMetaAtiva] = useState(null);

  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoAlvo, setNovoAlvo] = useState('');
  const [entradaDinheiro, setEntradaDinheiro] = useState('');

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
    const lista = await obterMetas();
    setMetas(lista);
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

  async function lidarComAdicionarMeta() {
    const alvo = Number(novoAlvo);

    if (novoTitulo.trim().length < 2) {
      mostrarAlerta('Nome inválido', 'Escreve um nome para o objetivo.');
      return;
    }

    if (!alvo || alvo <= 0) {
      mostrarAlerta('Valor inválido', 'Define um valor maior que zero.');
      return;
    }

    await adicionarMeta({
      title: novoTitulo.trim(),
      target: alvo,
      saved: 0,
      deadline: null,
    });

    setNovoTitulo('');
    setNovoAlvo('');
    setModalAdicionar(false);
    await carregarDados();
  }

  async function lidarComAdicionarDinheiro() {
    const valor = Number(entradaDinheiro);

    if (!valor || valor <= 0) {
      mostrarAlerta('Valor inválido', 'Escreve um valor maior que zero.');
      return;
    }

    await adicionarValorMeta(metaAtiva.id, valor);
    setEntradaDinheiro('');
    setModalDinheiro(false);
    setMetaAtiva(null);
    await carregarDados();
  }

  function confirmarApagar(meta) {
    mostrarAlerta(
      'Apagar objetivo',
      `Queres apagar "${meta.title}"?`,
      true,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            await apagarMeta(meta.id);
            await carregarDados();
          },
        },
      ]
    );
  }

  function exibirDinheiro() {
    if (!entradaDinheiro) return '';
    return Number(entradaDinheiro)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function exibirAlvo() {
    if (!novoAlvo) return '';
    return Number(novoAlvo)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  const totalGuardado = calcularTotalGuardado(metas);

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
          <Text style={typography.h2}>O que quero</Text>
          <TouchableOpacity
            style={[styles.botaoAdicionar, { backgroundColor: colors.primaria }]}
            onPress={() => setModalAdicionar(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={24} color={colors.branco} />
          </TouchableOpacity>
        </View>

        {/* ─── CARD TOTAL ─── */}
        <View style={[styles.cartaoTotal, { backgroundColor: colors.superficie }]}>
          <Text style={typography.rotulo}>Já juntei</Text>
          <Text
            style={[
              typography.h2,
              { color: colors.primaria, marginTop: 6 },
            ]}
          >
            {formatarKz(totalGuardado)}
          </Text>
        </View>

        {/* ─── LISTA ─── */}
        {metas.length === 0 ? (
          <EmptyState
            image={require('../../assets/illustrations/empty-goals.png')}
            title="Ainda não tens objetivos"
            message="Cria o teu primeiro objetivo e começa a juntar."
            actionLabel="Novo objetivo"
            onAction={() => setModalAdicionar(true)}
          />
        ) : (
          <View style={styles.lista}>
            {metas.map((meta) => {
              const percentagem = calcularProgressoMeta(meta);
              const concluida = percentagem >= 1;

              return (
                <TouchableOpacity
                  key={meta.id}
                  style={[styles.cartaoMeta, { backgroundColor: colors.cartao }]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setMetaAtiva(meta);
                    setEntradaDinheiro('');
                    setModalDinheiro(true);
                  }}
                  onLongPress={() => confirmarApagar(meta)}
                >
                  <View style={styles.topoMeta}>
                    <View style={styles.esquerdaMeta}>
                      <View
                        style={[
                          styles.iconeMeta,
                          {
                            backgroundColor: concluida
                              ? colors.sucessoSuave
                              : colors.destaqueSuave,
                          },
                        ]}
                      >
                        <Ionicons
                          name={concluida ? 'checkmark' : 'flag-outline'}
                          size={20}
                          color={concluida ? colors.sucesso : colors.primaria}
                        />
                      </View>
                      <Text
                        style={[typography.subtitulo, { flex: 1, color: colors.textoPrimario }]}
                        numberOfLines={1}
                      >
                        {meta.title}
                      </Text>
                    </View>

                    {concluida && (
                      <View style={[styles.seloConcluido, { backgroundColor: colors.sucessoSuave }]}>
                        <Text style={[styles.textoSelo, { color: colors.sucesso }]}>
                          Consegui!
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.valoresMeta}>
                    <Text style={[typography.subtitulo, { fontSize: 16, color: colors.textoPrimario }]}>
                      {formatarKz(meta.saved)}
                    </Text>
                    <Text style={[typography.rotulo, { marginLeft: 6 }]}>
                      / {formatarKz(meta.target)}
                    </Text>
                  </View>

                  <ProgressBar
                    percent={percentagem}
                    color={concluida ? colors.sucesso : colors.primaria}
                  />

                  <Text
                    style={[
                      typography.legenda,
                      { marginTop: 8, color: colors.textoClaro },
                    ]}
                  >
                    {Math.round(percentagem * 100)}% • toca para juntar
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── MODAL: NOVO OBJETIVO ─── */}
      <Modal
        visible={modalAdicionar}
        transparent
        animationType="slide"
        onRequestClose={() => setModalAdicionar(false)}
      >
        <KeyboardAvoidingView
          style={[styles.sobreposicaoModal, { backgroundColor: colors.sobreposicao }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.conteudoModal, { backgroundColor: colors.fundoModal }]}>
            <View style={[styles.pegaModal, { backgroundColor: colors.divisoria }]} />

            <Text style={[typography.h3, { marginBottom: 4, color: colors.textoPrimario }]}>
              Novo objetivo
            </Text>
            <Text style={[typography.corpo, { marginBottom: 20, color: colors.textoSecundario }]}>
              O que queres conquistar?
            </Text>

            <View style={[styles.containerInput, { backgroundColor: colors.superficie }]}>
              <Ionicons
                name="flag-outline"
                size={20}
                color={colors.textoClaro}
                style={styles.iconeInput}
              />
              <TextInput
                style={[styles.input, { color: colors.textoPrimario }]}
                placeholder="Ex: Comprar PC"
                placeholderTextColor={colors.textoClaro}
                value={novoTitulo}
                onChangeText={setNovoTitulo}
                maxLength={40}
              />
            </View>

            <View style={[styles.containerInput, { backgroundColor: colors.superficie }]}>
              <Text style={[styles.moeda, { color: colors.textoClaro }]}>Kz</Text>
              <TextInput
                style={[styles.input, { color: colors.textoPrimario }]}
                placeholder="Quanto precisas?"
                placeholderTextColor={colors.textoClaro}
                keyboardType="number-pad"
                value={exibirAlvo()}
                onChangeText={(t) =>
                  setNovoAlvo(t.replace(/[^0-9]/g, ''))
                }
                maxLength={12}
              />
            </View>

            <View style={styles.botoesModal}>
              <TouchableOpacity
                style={[styles.botaoCancelar, { backgroundColor: colors.superficie }]}
                onPress={() => setModalAdicionar(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.textoCancelar, { color: colors.textoSecundario }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoSalvar, { backgroundColor: colors.primaria }]}
                onPress={lidarComAdicionarMeta}
                activeOpacity={0.85}
              >
                <Text style={[styles.textoSalvar, { color: colors.branco }]}>
                  Criar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── MODAL: JUNTAR DINHEIRO ─── */}
      <Modal
        visible={modalDinheiro}
        transparent
        animationType="slide"
        onRequestClose={() => setModalDinheiro(false)}
      >
        <KeyboardAvoidingView
          style={[styles.sobreposicaoModal, { backgroundColor: colors.sobreposicao }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.conteudoModal, { backgroundColor: colors.fundoModal }]}>
            <View style={[styles.pegaModal, { backgroundColor: colors.divisoria }]} />

            <Text style={[typography.h3, { marginBottom: 4, color: colors.textoPrimario }]}>
              {metaAtiva?.title || 'Objetivo'}
            </Text>
            <Text style={[typography.corpo, { marginBottom: 20, color: colors.textoSecundario }]}>
              Quanto queres juntar agora?
            </Text>

            <View style={[styles.containerInput, { backgroundColor: colors.superficie }]}>
              <Text style={[styles.moeda, { color: colors.textoClaro }]}>Kz</Text>
              <TextInput
                style={[styles.input, { color: colors.textoPrimario }]}
                placeholder="0"
                placeholderTextColor={colors.textoClaro}
                keyboardType="number-pad"
                value={exibirDinheiro()}
                onChangeText={(t) =>
                  setEntradaDinheiro(t.replace(/[^0-9]/g, ''))
                }
                maxLength={12}
                autoFocus
              />
            </View>

            <View style={styles.botoesModal}>
              <TouchableOpacity
                style={[styles.botaoCancelar, { backgroundColor: colors.superficie }]}
                onPress={() => {
                  setModalDinheiro(false);
                  setMetaAtiva(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.textoCancelar, { color: colors.textoSecundario }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoSalvar, { backgroundColor: colors.primaria }]}
                onPress={lidarComAdicionarDinheiro}
                activeOpacity={0.85}
              >
                <Text style={[styles.textoSalvar, { color: colors.branco }]}>
                  Juntar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  scroll: {
    paddingBottom: 32,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  botaoAdicionar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartaoTotal: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
  },
  lista: {
    paddingHorizontal: 20,
  },
  cartaoMeta: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  topoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  esquerdaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconeMeta: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seloConcluido: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textoSelo: {
    fontFamily: 'InterBold',
    fontSize: 11,
  },
  valoresMeta: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  sobreposicaoModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  conteudoModal: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  pegaModal: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  containerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 26,
    paddingHorizontal: 20,
    height: 52,
    marginBottom: 14,
  },
  iconeInput: {
    marginRight: 10,
  },
  moeda: {
    fontFamily: 'InterBold',
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'InterRegular',
    fontSize: 16,
  },
  botoesModal: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  botaoCancelar: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCancelar: {
    fontFamily: 'InterBold',
    fontSize: 15,
  },
  botaoSalvar: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoSalvar: {
    fontFamily: 'InterBold',
    fontSize: 15,
  },
});