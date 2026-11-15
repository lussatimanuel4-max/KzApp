// src/screens/CreateProfileScreen.js
// Ecrã de criação de perfil em 4 passos

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { guardarPerfil } from '../storage/profile';
import { marcarPerfilCriado } from '../storage/appState';
import { PROVINCES, SCHOOL_LEVELS, GENDERS } from '../storage/constants';
import CustomAlert from '../components/CustomAlert';

const TOTAL_PASSOS = 4;

// ─── AVATARES DISPONÍVEIS ───
const AVATARES = [
  { id: 'avatar-1', image: require('../../assets/avatars/avatar-1.jpg') },
  { id: 'avatar-2', image: require('../../assets/avatars/avatar-2.jpg') },
  { id: 'avatar-3', image: require('../../assets/avatars/avatar-3.jpg') },
  { id: 'avatar-4', image: require('../../assets/avatars/avatar-4.jpg') },
  { id: 'avatar-5', image: require('../../assets/avatars/avatar-5.jpg') },
  { id: 'avatar-6', image: require('../../assets/avatars/avatar-6.jpg') },
];

export default function CreateProfileScreen({ onComplete }) {
  const { colors } = useTheme();
  const [passo, setPasso] = useState(1);
  const [carregando, setCarregando] = useState(false);

  // ─── DADOS DO PERFIL ───
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [escola, setEscola] = useState('');
  const [nivelEscolar, setNivelEscolar] = useState('');
  const [provincia, setProvincia] = useState('');
  const [genero, setGenero] = useState('');
  const [avatarSelecionado, setAvatarSelecionado] = useState('');

  // ─── MODAIS ───
  const [mostrarNiveis, setMostrarNiveis] = useState(false);
  const [mostrarProvincias, setMostrarProvincias] = useState(false);

  // ─── ESTADO DO CUSTOM ALERT ───
  const [configAlerta, setConfigAlerta] = useState({
    visible: false,
    title: '',
    message: '',
    isDestructive: false,
    buttons: [],
  });

  function mostrarAlerta(title, message, isDestructive = false) {
    setConfigAlerta({
      visible: true,
      title,
      message,
      isDestructive,
      buttons: [{ text: 'Entendido', style: 'default' }],
    });
  }

  function fecharAlerta() {
    setConfigAlerta((prev) => ({ ...prev, visible: false }));
  }

  function vibrar() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function avancar() {
    vibrar();

    if (passo === 1) {
      if (nome.trim().length < 2) {
        mostrarAlerta('Nome inválido', 'Escreve o teu nome.');
        return;
      }
      if (!idade || Number(idade) < 10 || Number(idade) > 80) {
        mostrarAlerta('Idade inválida', 'Escreve uma idade entre 10 e 80.');
        return;
      }
      setPasso(2);
    } else if (passo === 2) {
      if (escola.trim().length < 2) {
        mostrarAlerta('Escola inválida', 'Escreve o nome da tua escola.');
        return;
      }
      if (!nivelEscolar) {
        mostrarAlerta('Classe em falta', 'Escolhe a tua classe ou ano.');
        return;
      }
      setPasso(3);
    } else if (passo === 3) {
      if (!provincia) {
        mostrarAlerta('Província em falta', 'Escolhe a tua província.');
        return;
      }
      if (!genero) {
        mostrarAlerta('Género em falta', 'Escolhe uma opção.');
        return;
      }
      setPasso(4);
    }
  }

  function retroceder() {
    if (passo > 1) {
      vibrar();
      setPasso(passo - 1);
    }
  }

  async function finalizar() {
    if (!avatarSelecionado) {
      mostrarAlerta('Avatar em falta', 'Escolhe um avatar para continuar.');
      return;
    }

    vibrar();
    setCarregando(true);

    const guardado = await guardarPerfil({
      name: nome.trim(),
      age: idade.trim(),
      school: escola.trim(),
      schoolLevel: nivelEscolar,
      province: provincia,
      gender: genero,
      avatar: avatarSelecionado,
    });

    if (!guardado) {
      setCarregando(false);
      mostrarAlerta('Erro', 'Não foi possível guardar. Tenta novamente.', true);
      return;
    }

    await marcarPerfilCriado();
    setCarregando(false);

    if (onComplete) onComplete();
  }

  // ─── TELA 1 ───
  function renderizarPasso1() {
    return (
      <>
        <Image
          source={require('../../assets/signup/signup-1.png')}
          style={styles.ilustracao}
          resizeMode="contain"
        />

        <Text style={[styles.titulo, { color: colors.textoPrimario }]}>Quem és?</Text>
        <Text style={[styles.subtitulo, { color: colors.textoSecundario }]}>
          Diz-nos quem és para personalizar a tua experiência.
        </Text>

        <View style={[styles.containerInput, { backgroundColor: colors.superficie }]}>
          <Ionicons
            name="person-outline"
            size={20}
            color={colors.textoClaro}
            style={styles.iconeInput}
          />
          <TextInput
            style={[styles.input, { color: colors.textoPrimario }]}
            placeholder="Escreve o teu nome"
            placeholderTextColor={colors.textoClaro}
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            maxLength={30}
          />
        </View>

        <View style={[styles.containerInput, { backgroundColor: colors.superficie }]}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={colors.textoClaro}
            style={styles.iconeInput}
          />
          <TextInput
            style={[styles.input, { color: colors.textoPrimario }]}
            placeholder="Quantos anos tens?"
            placeholderTextColor={colors.textoClaro}
            keyboardType="number-pad"
            value={idade}
            onChangeText={(t) => setIdade(t.replace(/[^0-9]/g, ''))}
            maxLength={2}
          />
        </View>
      </>
    );
  }

  // ─── TELA 2 ───
  function renderizarPasso2() {
    return (
      <>
        <Image
          source={require('../../assets/signup/signup-2.png')}
          style={styles.ilustracao}
          resizeMode="contain"
        />

        <Text style={[styles.titulo, { color: colors.textoPrimario }]}>Onde estudas?</Text>
        <Text style={[styles.subtitulo, { color: colors.textoSecundario }]}>
          Isto ajuda-nos a adaptar o app para ti.
        </Text>

        <View style={[styles.containerInput, { backgroundColor: colors.superficie }]}>
          <Ionicons
            name="school-outline"
            size={20}
            color={colors.textoClaro}
            style={styles.iconeInput}
          />
          <TextInput
            style={[styles.input, { color: colors.textoPrimario }]}
            placeholder="Escola ou universidade"
            placeholderTextColor={colors.textoClaro}
            value={escola}
            onChangeText={setEscola}
            maxLength={50}
          />
        </View>

        <TouchableOpacity
          style={[styles.containerInput, { backgroundColor: colors.superficie }]}
          onPress={() => {
            vibrar();
            setMostrarNiveis(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="book-outline"
            size={20}
            color={colors.textoClaro}
            style={styles.iconeInput}
          />
          <Text
            style={[
              styles.input,
              { color: nivelEscolar ? colors.textoPrimario : colors.textoClaro },
            ]}
          >
            {nivelEscolar || 'Classe / Ano'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.textoClaro} />
        </TouchableOpacity>
      </>
    );
  }

  // ─── TELA 3 ───
  function renderizarPasso3() {
    return (
      <>
        <Image
          source={require('../../assets/signup/signup-3.png')}
          style={styles.ilustracao}
          resizeMode="contain"
        />

        <Text style={[styles.titulo, { color: colors.textoPrimario }]}>Onde vives?</Text>
        <Text style={[styles.subtitulo, { color: colors.textoSecundario }]}>
          Estamos em Angola, mas queremos saber a tua província.
        </Text>

        <TouchableOpacity
          style={[styles.containerInput, { backgroundColor: colors.superficie }]}
          onPress={() => {
            vibrar();
            setMostrarProvincias(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={colors.textoClaro}
            style={styles.iconeInput}
          />
          <Text
            style={[
              styles.input,
              { color: provincia ? colors.textoPrimario : colors.textoClaro },
            ]}
          >
            {provincia || 'Província'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.textoClaro} />
        </TouchableOpacity>

        <View style={styles.linhaGenero}>
          {GENDERS.map((g) => {
            const ativo = genero === g.id;
            return (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.botaoGenero,
                  { backgroundColor: colors.superficie },
                  ativo && { backgroundColor: colors.primaria },
                ]}
                onPress={() => {
                  vibrar();
                  setGenero(g.id);
                }}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.textoGenero,
                    { color: ativo ? colors.branco : colors.textoSecundario },
                  ]}
                  numberOfLines={1}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </>
    );
  }

  // ─── TELA 4 ───
  function renderizarPasso4() {
    return (
      <>
        <Text style={[styles.titulo, { color: colors.textoPrimario }]}>
          Escolhe o teu avatar
        </Text>
        <Text style={[styles.subtitulo, { color: colors.textoSecundario }]}>
          Este avatar vai aparecer no teu perfil.
        </Text>

        <View style={styles.grelhaAvatares}>
          {AVATARES.map((avatar) => {
            const ativo = avatarSelecionado === avatar.id;
            return (
              <TouchableOpacity
                key={avatar.id}
                style={[
                  styles.containerAvatar,
                  ativo && {
                    borderColor: colors.primaria,
                    backgroundColor: colors.destaqueSuave,
                  },
                ]}
                onPress={() => {
                  vibrar();
                  setAvatarSelecionado(avatar.id);
                }}
                activeOpacity={0.85}
              >
                <Image
                  source={avatar.image}
                  style={styles.imagemAvatar}
                  resizeMode="cover"
                />

                {ativo && (
                  <View
                    style={[
                      styles.checkAvatar,
                      {
                        backgroundColor: colors.primaria,
                        borderColor: colors.branco,
                      },
                    ]}
                  >
                    <Ionicons name="checkmark" size={16} color={colors.branco} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </>
    );
  }

  return (
    <SafeAreaView style={[styles.seguro, { backgroundColor: colors.fundo }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ─── HEADER ─── */}
        <View style={styles.cabecalho}>
          {passo > 1 ? (
            <TouchableOpacity onPress={retroceder} style={styles.botaoVoltar}>
              <Ionicons name="arrow-back" size={22} color={colors.textoPrimario} />
            </TouchableOpacity>
          ) : (
            <View style={styles.botaoVoltar} />
          )}

          <Text style={[styles.textoPasso, { color: colors.textoSecundario }]}>
            {passo} / {TOTAL_PASSOS}
          </Text>
        </View>

        {/* ─── BARRA DE PROGRESSO ─── */}
        <View style={[styles.trilhoProgresso, { backgroundColor: colors.divisoria }]}>
          <View
            style={[
              styles.preenchimentoProgresso,
              { width: `${(passo / TOTAL_PASSOS) * 100}%`, backgroundColor: colors.primaria },
            ]}
          />
        </View>

        {/* ─── CONTEÚDO ─── */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {passo === 1 && renderizarPasso1()}
          {passo === 2 && renderizarPasso2()}
          {passo === 3 && renderizarPasso3()}
          {passo === 4 && renderizarPasso4()}
        </ScrollView>

        {/* ─── BOTÃO ─── */}
        <View style={styles.rodape}>
          <TouchableOpacity
            style={[
              styles.botao,
              carregando && styles.botaoDesativado,
              { backgroundColor: colors.primaria, shadowColor: colors.primaria },
            ]}
            onPress={passo === 4 ? finalizar : avancar}
            activeOpacity={0.85}
            disabled={carregando}
          >
            <Text style={[styles.textoBotao, { color: colors.branco }]}>
              {carregando ? 'A guardar...' : passo === 4 ? 'Começar' : 'Próximo'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.branco} />
          </TouchableOpacity>
        </View>

        {/* ─── MODAL: CLASSES ─── */}
        {mostrarNiveis && (
          <View style={[styles.sobreposicaoModal, { backgroundColor: colors.sobreposicao }]}>
            <TouchableOpacity
              style={styles.fundoModal}
              onPress={() => setMostrarNiveis(false)}
              activeOpacity={1}
            />
            <View style={[styles.folhaModal, { backgroundColor: colors.fundoModal }]}>
              <View style={[styles.pegaModal, { backgroundColor: colors.divisoria }]} />
              <Text style={[styles.tituloModal, { color: colors.textoPrimario }]}>
                Classe / Ano
              </Text>

              <ScrollView style={{ maxHeight: 320 }}>
                {SCHOOL_LEVELS.map((nivel) => (
                  <TouchableOpacity
                    key={nivel}
                    style={styles.opcaoModal}
                    onPress={() => {
                      vibrar();
                      setNivelEscolar(nivel);
                      setMostrarNiveis(false);
                    }}
                  >
                    <Text style={[styles.textoOpcaoModal, { color: colors.textoPrimario }]}>
                      {nivel}
                    </Text>
                    {nivelEscolar === nivel && (
                      <Ionicons name="checkmark" size={20} color={colors.primaria} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* ─── MODAL: PROVÍNCIAS ─── */}
        {mostrarProvincias && (
          <View style={[styles.sobreposicaoModal, { backgroundColor: colors.sobreposicao }]}>
            <TouchableOpacity
              style={styles.fundoModal}
              onPress={() => setMostrarProvincias(false)}
              activeOpacity={1}
            />
            <View style={[styles.folhaModal, { backgroundColor: colors.fundoModal }]}>
              <View style={[styles.pegaModal, { backgroundColor: colors.divisoria }]} />
              <Text style={[styles.tituloModal, { color: colors.textoPrimario }]}>
                Província
              </Text>

              <ScrollView style={{ maxHeight: 320 }}>
                {PROVINCES.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={styles.opcaoModal}
                    onPress={() => {
                      vibrar();
                      setProvincia(p);
                      setMostrarProvincias(false);
                    }}
                  >
                    <Text style={[styles.textoOpcaoModal, { color: colors.textoPrimario }]}>
                      {p}
                    </Text>
                    {provincia === p && (
                      <Ionicons name="checkmark" size={20} color={colors.primaria} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

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

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  botaoVoltar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoPasso: {
    fontFamily: 'InterBold',
    fontSize: 14,
  },
  trilhoProgresso: {
    height: 4,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  preenchimentoProgresso: {
    height: '100%',
    borderRadius: 2,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  ilustracao: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontFamily: 'InterExtraBold',
    fontSize: 26,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitulo: {
    fontFamily: 'InterRegular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
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
  input: {
    flex: 1,
    fontFamily: 'InterRegular',
    fontSize: 16,
  },
  linhaGenero: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  botaoGenero: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  textoGenero: {
    fontFamily: 'InterBold',
    fontSize: 13,
    textAlign: 'center',
  },
  grelhaAvatares: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  containerAvatar: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 100,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  imagemAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  checkAvatar: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  rodape: {
    paddingHorizontal: 28,
    paddingBottom: 24,
    paddingTop: 12,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    gap: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  botaoDesativado: {
    opacity: 0.6,
  },
  textoBotao: {
    fontFamily: 'InterBold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  sobreposicaoModal: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  fundoModal: {
    ...StyleSheet.absoluteFillObject,
  },
  folhaModal: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
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
    marginBottom: 12,
  },
  opcaoModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  textoOpcaoModal: {
    fontFamily: 'InterMedium',
    fontSize: 15,
  },
});