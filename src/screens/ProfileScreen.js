// src/screens/ProfileScreen.js
// Ecrã de perfil — estilo Silicon Valley

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { obterPerfil, atualizarNomePerfil, apagarPerfil } from '../storage/profile';
import { obterTransacoes, limparTransacoes } from '../storage/transactions';
import { limparMetas } from '../storage/goals';
import { limparOrcamentos } from '../storage/budgets';
import { redefinirEstadoApp } from '../storage/appState';
import { calcularSaldo } from '../utils/calc';
import { formatarKz } from '../utils/format';
import CustomAlert from '../components/CustomAlert';

const MAPA_AVATARES = {
  'avatar-1': require('../../assets/avatars/avatar-1.jpg'),
  'avatar-2': require('../../assets/avatars/avatar-2.jpg'),
  'avatar-3': require('../../assets/avatars/avatar-3.jpg'),
  'avatar-4': require('../../assets/avatars/avatar-4.jpg'),
  'avatar-5': require('../../assets/avatars/avatar-5.jpg'),
  'avatar-6': require('../../assets/avatars/avatar-6.jpg'),
};

const URL_ATUALIZACOES = 'https://lussatimanuel4-max.github.io/KzApp/';
const URL_WHATSAPP = 'https://wa.me/244933593515';

export default function ProfileScreen({ navigation, onLogout }) {
  const { colors, typography } = useTheme();
  const [perfil, setPerfil] = useState(null);
  const [saldo, setSaldo] = useState(0);
  const [totalTransacoes, setTotalTransacoes] = useState(0);
  const [editando, setEditando] = useState(false);
  const [entradaNome, setEntradaNome] = useState('');
  const [atualizando, setAtualizando] = useState(false);

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
    const p = await obterPerfil();
    const t = await obterTransacoes();
    setPerfil(p);
    setSaldo(calcularSaldo(t));
    setTotalTransacoes(t.length);
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

  function comecarEdicao() {
    setEntradaNome(perfil?.name || '');
    setEditando(true);
  }

  async function guardarNome() {
    const nomeLimpo = entradaNome.trim();

    if (nomeLimpo.length < 2) {
      mostrarAlerta('Nome inválido', 'Escreve pelo menos 2 letras.');
      return;
    }

    await atualizarNomePerfil(nomeLimpo);
    setEditando(false);
    await carregarDados();
  }

  function confirmarReset() {
    mostrarAlerta(
      'Apagar tudo',
      'Isto vai apagar o teu perfil, movimentos, metas e orçamentos. Não há como recuperar.',
      true,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar tudo',
          style: 'destructive',
          onPress: async () => {
            await limparTransacoes();
            await limparMetas();
            await limparOrcamentos();
            await apagarPerfil();
            await redefinirEstadoApp();
            if (onLogout) onLogout();
          },
        },
      ]
    );
  }

  async function lidarComVerificarAtualizacoes() {
    try {
      const suportado = await Linking.canOpenURL(URL_ATUALIZACOES);
      if (suportado) {
        await Linking.openURL(URL_ATUALIZACOES);
      } else {
        mostrarAlerta('Erro', 'Não foi possível abrir o link de atualizações.', true);
      }
    } catch (error) {
      mostrarAlerta('Erro', 'Ocorreu um erro ao tentar abrir o site.', true);
    }
  }

  function lidarComDoacao() {
    mostrarAlerta(
      'Apoiar o KzApp 💜',
      'O KzApp é 100% gratuito e offline. Se ele tem ajudado a controlar o teu kumbu, podes apoiar o desenvolvimento do projeto. Qualquer valor é um incentivo enorme!\n\n' +
      'Unitel Money / Multicaixa Express\n' +
      'Entidade: 930\n' +
      'Referência: 940 609 347\n\n' +
      'Depois de enviares, tira um print do comprovativo e envia-me por WhatsApp para eu te agradecer pessoalmente.\n\n' +
      'Obrigado por fazeres parte desta jornada!',
      false,
      [
        { text: 'Fechar', style: 'cancel' },
        {
          text: 'Abrir WhatsApp',
          style: 'default',
          onPress: () => {
            Linking.openURL(URL_WHATSAPP).catch(() => {
              mostrarAlerta('Erro', 'Não foi possível abrir o WhatsApp.', true);
            });
          },
        },
      ]
    );
  }

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
        <View style={styles.cabecalho}>
          <Text style={typography.h2}>Perfil</Text>
        </View>

        <View style={[styles.cartaoUtilizador, { backgroundColor: colors.superficie }]}>
          <Image
            source={fonteAvatar}
            style={[styles.avatar, { borderColor: colors.cartao }]}
          />

          {editando ? (
            <View style={styles.linhaEdicao}>
              <TextInput
                style={[styles.inputNome, { backgroundColor: colors.cartao, color: colors.textoPrimario }]}
                value={entradaNome}
                onChangeText={setEntradaNome}
                autoFocus
                maxLength={30}
              />
              <TouchableOpacity
                style={[styles.botaoIconePrimario, { backgroundColor: colors.primaria }]}
                onPress={guardarNome}
              >
                <Ionicons name="checkmark" size={20} color={colors.branco} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botaoIconeFantasma, { backgroundColor: colors.cartao }]}
                onPress={() => setEditando(false)}
              >
                <Ionicons name="close" size={20} color={colors.textoSecundario} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[styles.nomeUtilizador, { color: colors.textoPrimario }]}>
              {perfil?.name || 'Estudante'}
            </Text>
          )}

          <Text style={[styles.papelUtilizador, { color: colors.textoSecundario }]}>
            Estudante
          </Text>

          {!editando && (
            <TouchableOpacity
              style={[styles.botaoEditar, { backgroundColor: colors.cartao }]}
              onPress={comecarEdicao}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil-outline" size={14} color={colors.primaria} />
              <Text style={[styles.textoBotaoEditar, { color: colors.primaria }]}>
                Editar perfil
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.linhaEstatisticas}>
          <View style={[styles.cartaoEstatistica, { backgroundColor: colors.cartao }]}>
            <View style={[styles.containerIconeEstatistica, { backgroundColor: colors.destaqueSuave }]}>
              <Ionicons name="wallet-outline" size={18} color={colors.primaria} />
            </View>
            <Text style={[styles.rotuloEstatistica, { color: colors.textoSecundario }]}>
              Tenho agora
            </Text>
            <Text style={[styles.valorEstatistica, { color: colors.textoPrimario }]}>
              {formatarKz(saldo)}
            </Text>
          </View>

          <View style={[styles.cartaoEstatistica, { backgroundColor: colors.cartao }]}>
            <View style={[styles.containerIconeEstatistica, { backgroundColor: colors.destaqueSuave }]}>
              <Ionicons name="stats-chart-outline" size={18} color={colors.primaria} />
            </View>
            <Text style={[styles.rotuloEstatistica, { color: colors.textoSecundario }]}>
              Movimentos
            </Text>
            <Text style={[styles.valorEstatistica, { color: colors.textoPrimario }]}>
              {totalTransacoes}
            </Text>
          </View>
        </View>

        {/* ─── MENU: METAS ─── */}
        <View style={styles.secaoMenu}>
          <TouchableOpacity
            style={[styles.itemMenu, { backgroundColor: colors.cartao }]}
            onPress={() => navigation.navigate('Metas')}
            activeOpacity={0.7}
          >
            <View style={styles.esquerdaMenu}>
              <View style={[styles.caixaIconeMenu, { backgroundColor: colors.destaqueSuave }]}>
                <Ionicons name="flag-outline" size={20} color={colors.primaria} />
              </View>
              <Text style={[styles.rotuloMenu, { color: colors.textoPrimario }]}>
                As Minhas Metas
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textoClaro} />
          </TouchableOpacity>
        </View>

        {/* ─── MENU: PROCURAR ATUALIZAÇÕES ─── */}
        <View style={styles.secaoMenu}>
          <TouchableOpacity
            style={[styles.itemMenu, { backgroundColor: colors.cartao }]}
            onPress={lidarComVerificarAtualizacoes}
            activeOpacity={0.7}
          >
            <View style={styles.esquerdaMenu}>
              <View style={[styles.caixaIconeMenu, { backgroundColor: colors.informacao + '20' }]}>
                <Ionicons name="cloud-download-outline" size={20} color={colors.informacao} />
              </View>
              <Text style={[styles.rotuloMenu, { color: colors.textoPrimario }]}>
                Procurar Atualizações
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textoClaro} />
          </TouchableOpacity>
        </View>

        {/* ─── MENU: APOIAR O KZAPP ─── */}
        <View style={styles.secaoMenu}>
          <TouchableOpacity
            style={[styles.itemMenu, { backgroundColor: colors.cartao }]}
            onPress={lidarComDoacao}
            activeOpacity={0.7}
          >
            <View style={styles.esquerdaMenu}>
              <View style={[styles.caixaIconeMenu, { backgroundColor: colors.destaqueSuave }]}>
                <Ionicons name="heart" size={20} color={colors.primaria} />
              </View>
              <Text style={[styles.rotuloMenu, { color: colors.textoPrimario }]}>
                Apoiar o KzApp
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textoClaro} />
          </TouchableOpacity>
        </View>

        {/* ─── MENU: SOBRE ─── */}
        <View style={styles.secaoMenu}>
          <TouchableOpacity
            style={[styles.itemMenu, { backgroundColor: colors.cartao }]}
            onPress={() => navigation.navigate('Sobre')}
            activeOpacity={0.7}
          >
            <View style={styles.esquerdaMenu}>
              <View style={[styles.caixaIconeMenu, { backgroundColor: colors.destaqueSuave }]}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primaria} />
              </View>
              <Text style={[styles.rotuloMenu, { color: colors.textoPrimario }]}>
                Sobre o KzApp
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textoClaro} />
          </TouchableOpacity>
        </View>

        {/* ─── MENU: APAGAR ─── */}
        <View style={styles.secaoMenu}>
          <TouchableOpacity
            style={[styles.itemMenu, { backgroundColor: colors.cartao }]}
            onPress={confirmarReset}
            activeOpacity={0.7}
          >
            <View style={styles.esquerdaMenu}>
              <View style={[styles.caixaIconeMenu, { backgroundColor: colors.perigoSuave }]}>
                <Ionicons name="trash-outline" size={20} color={colors.perigo} />
              </View>
              <Text style={[styles.rotuloMenu, { color: colors.perigo }]}>
                Apagar tudo
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textoClaro} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.rodape, { color: colors.textoClaro }]}>
          Versão Beta
        </Text>
        <View style={{ height: 120 }} />
      </ScrollView>

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
  seguro: { flex: 1 },
  scroll: { paddingBottom: 24 },
  cabecalho: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  cartaoUtilizador: { alignItems: 'center', paddingVertical: 28, marginHorizontal: 20, borderRadius: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, marginBottom: 16 },
  nomeUtilizador: { fontFamily: 'InterExtraBold', fontSize: 24, letterSpacing: -0.4, marginBottom: 4 },
  papelUtilizador: { fontFamily: 'InterMedium', fontSize: 13, marginBottom: 16 },
  botaoEditar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  textoBotaoEditar: { fontFamily: 'InterBold', fontSize: 13 },
  linhaEdicao: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputNome: { borderRadius: 26, paddingHorizontal: 18, paddingVertical: 10, height: 52, fontFamily: 'InterBold', fontSize: 15, minWidth: 160 },
  botaoIconePrimario: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  botaoIconeFantasma: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  linhaEstatisticas: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 20 },
  cartaoEstatistica: { flex: 1, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  containerIconeEstatistica: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  rotuloEstatistica: { fontFamily: 'InterMedium', fontSize: 12, marginBottom: 4 },
  valorEstatistica: { fontFamily: 'InterExtraBold', fontSize: 16, letterSpacing: -0.2 },
  secaoMenu: { paddingHorizontal: 20, marginTop: 20 },
  itemMenu: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  esquerdaMenu: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  caixaIconeMenu: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rotuloMenu: { fontFamily: 'InterBold', fontSize: 15 },
  rodape: { fontFamily: 'InterRegular', fontSize: 12, textAlign: 'center', marginTop: 24 },
});