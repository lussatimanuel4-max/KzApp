// src/screens/AddTransactionScreen.js
// Ecrã para adicionar ou editar um movimento

import React, { useState, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import CategoryPicker from '../components/CategoryPicker';
import CustomAlert from '../components/CustomAlert';
import {
  adicionarTransacao,
  atualizarTransacao,
  apagarTransacao,
  obterTransacoes,
} from '../storage/transactions';
import { calcularSaldo } from '../utils/calc';
import { formatarKz } from '../utils/format';

export default function AddTransactionScreen({ navigation, route }) {
  const { colors, typography } = useTheme();
  const transacaoEdicao = route?.params?.edit || null;
  const tipoInicial = transacaoEdicao?.type || route?.params?.type || 'out';
  const eEdicao = !!transacaoEdicao;

  const [tipo, setTipo] = useState(tipoInicial);
  const [valor, setValor] = useState(
    transacaoEdicao?.amount ? String(transacaoEdicao.amount) : ''
  );
  const [categoria, setCategoria] = useState(transacaoEdicao?.category || null);
  const [nota, setNota] = useState(transacaoEdicao?.note || '');
  const [carregando, setCarregando] = useState(false);

  // Ref para bloquear gravação dupla
  const salvandoRef = useRef(false);

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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: eEdicao ? 'Editar' : tipo === 'in' ? 'Recebi' : 'Gastei',
      headerStyle: { backgroundColor: colors.fundo },
      headerTintColor: colors.textoPrimario,
      headerTitleStyle: { fontFamily: 'InterBold', fontWeight: 'normal' },
    });
  }, [navigation, tipo, eEdicao, colors]);

  function lidarComMudancaTipo(novoTipo) {
    setTipo(novoTipo);
    if (novoTipo === 'in') {
      setCategoria(null);
    }
  }

  function formatarEntradaValor(texto) {
    const limpo = texto.replace(/[^0-9]/g, '');
    setValor(limpo);
  }

  function exibirValor() {
    if (!valor) return '';
    return Number(valor)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  async function lidarComGuardar() {
    if (salvandoRef.current) return;

    const numerico = Number(valor);

    if (!numerico || numerico <= 0) {
      mostrarAlerta('Valor inválido', 'Escreve um valor maior que zero.');
      return;
    }

    if (tipo === 'out' && !categoria) {
      mostrarAlerta('Categoria obrigatória', 'Escolhe uma categoria.');
      return;
    }

    // ─── VALIDAÇÃO DE SALDO INSUFICIENTE ───
    if (tipo === 'out' && !eEdicao) {
      const todasTransacoes = await obterTransacoes();
      const saldoAtual = calcularSaldo(todasTransacoes);

      if (numerico > saldoAtual) {
        mostrarAlerta(
          'Saldo insuficiente',
          `Não podes gastar mais do que tens. O teu saldo atual é de ${formatarKz(saldoAtual)}.`,
          true
        );
        return;
      }
    }

    salvandoRef.current = true;
    setCarregando(true);

    if (eEdicao) {
      const resultado = await atualizarTransacao(transacaoEdicao.id, {
        type: tipo,
        amount: numerico,
        category: tipo === 'out' ? categoria : null,
        note: nota.trim(),
      });

      if (!resultado) {
        setCarregando(false);
        salvandoRef.current = false;
        mostrarAlerta('Erro', 'Não foi possível atualizar. Tenta novamente.', true);
        return;
      }
    } else {
      const resultado = await adicionarTransacao({
        type: tipo,
        amount: numerico,
        category: tipo === 'out' ? categoria : null,
        note: nota.trim(),
        date: new Date().toISOString(),
      });

      if (!resultado) {
        setCarregando(false);
        salvandoRef.current = false;
        mostrarAlerta('Erro', 'Não foi possível guardar. Tenta novamente.', true);
        return;
      }
    }

    navigation.goBack();
  }

  function confirmarApagar() {
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
            await apagarTransacao(transacaoEdicao.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={[styles.seguro, { backgroundColor: colors.fundo }]} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── TIPO ─── */}
          <View style={styles.linhaTipo}>
            <TouchableOpacity
              style={[
                styles.botaoTipo,
                { backgroundColor: colors.superficie },
                tipo === 'in' && { backgroundColor: colors.sucesso },
              ]}
              onPress={() => lidarComMudancaTipo('in')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="arrow-down"
                size={18}
                color={tipo === 'in' ? colors.branco : colors.sucesso}
              />
              <Text
                style={[
                  styles.textoTipo,
                  { color: tipo === 'in' ? colors.branco : colors.sucesso },
                ]}
              >
                Recebi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.botaoTipo,
                { backgroundColor: colors.superficie },
                tipo === 'out' && { backgroundColor: colors.perigo },
              ]}
              onPress={() => lidarComMudancaTipo('out')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={tipo === 'out' ? colors.branco : colors.perigo}
              />
              <Text
                style={[
                  styles.textoTipo,
                  { color: tipo === 'out' ? colors.branco : colors.perigo },
                ]}
              >
                Gastei
              </Text>
            </TouchableOpacity>
          </View>

          {/* ─── VALOR ─── */}
          <View style={styles.containerValor}>
            <Text style={typography.rotulo}>Quanto?</Text>
            <View style={styles.linhaValor}>
              <Text style={[styles.moedaValor, { color: colors.textoClaro }]}>
                Kz
              </Text>
              <TextInput
                style={[styles.inputValor, { color: colors.textoPrimario }]}
                placeholder="0"
                placeholderTextColor={colors.textoClaro}
                keyboardType="number-pad"
                value={exibirValor()}
                onChangeText={formatarEntradaValor}
                maxLength={12}
              />
            </View>
          </View>

          {/* ─── CATEGORIA (só saída) ─── */}
          {tipo === 'out' && (
            <View style={styles.bloco}>
              <Text style={[typography.subtitulo, { marginBottom: 12, color: colors.textoPrimario }]}>
                Em quê?
              </Text>
              <CategoryPicker selected={categoria} onSelect={setCategoria} />
            </View>
          )}

          {/* ─── NOTA ─── */}
          <View style={styles.bloco}>
            <Text style={[typography.subtitulo, { marginBottom: 12, color: colors.textoPrimario }]}>
              Nota (se quiseres)
            </Text>
            <View style={[styles.containerInput, { backgroundColor: colors.superficie }]}>
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.textoClaro}
                style={styles.iconeInput}
              />
              <TextInput
                style={[styles.input, { color: colors.textoPrimario }]}
                placeholder="Ex: Lanche na escola"
                placeholderTextColor={colors.textoClaro}
                value={nota}
                onChangeText={setNota}
                maxLength={60}
              />
            </View>
          </View>

          {/* ─── BOTÃO APAGAR (só em edição) ─── */}
          {eEdicao && (
            <TouchableOpacity
              style={[styles.botaoApagar, { backgroundColor: colors.perigoSuave }]}
              onPress={confirmarApagar}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color={colors.perigo} />
              <Text style={[styles.textoApagar, { color: colors.perigo }]}>
                Apagar
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* ─── BOTÃO GUARDAR ─── */}
        <View style={[styles.rodape, { borderTopColor: colors.divisoria }]}>
          <TouchableOpacity
            style={[
              styles.botaoGuardar,
              carregando && styles.botaoDesativado,
              { backgroundColor: colors.primaria, shadowColor: colors.primaria }
            ]}
            onPress={lidarComGuardar}
            activeOpacity={0.85}
            disabled={carregando}
          >
            <Text style={[styles.textoGuardar, { color: colors.branco }]}>
              {carregando
                ? 'A guardar...'
                : eEdicao
                ? 'Atualizar'
                : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>

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

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 32 },
  linhaTipo: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  botaoTipo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
  },
  textoTipo: {
    fontFamily: 'InterBold',
    fontSize: 15,
    letterSpacing: 0.1,
  },
  containerValor: { alignItems: 'center', marginBottom: 28 },
  linhaValor: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  moedaValor: {
    fontFamily: 'InterBold',
    fontSize: 28,
    marginRight: 8,
  },
  inputValor: {
    fontFamily: 'InterExtraBold',
    fontSize: 40,
    minWidth: 100,
    textAlign: 'center',
    letterSpacing: -1,
  },
  bloco: { marginBottom: 24 },
  containerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 26,
    paddingHorizontal: 20,
    height: 52,
  },
  iconeInput: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: 'InterRegular',
    fontSize: 15,
  },
  botaoApagar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
    marginTop: 8,
  },
  textoApagar: {
    fontFamily: 'InterBold',
    fontSize: 15,
  },
  rodape: {
    padding: 20,
    borderTopWidth: 1,
  },
  botaoGuardar: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  botaoDesativado: { opacity: 0.6 },
  textoGuardar: {
    fontFamily: 'InterBold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});