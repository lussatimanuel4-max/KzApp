// src/screens/OnboardingScreen.js
// Ecrã de onboarding com 3 slides (aparece só a primeira vez)

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    image: require('../../assets/onboarding/onboarding-1.png'),
    title: 'Controla o teu Kumbu',
    subtitle:
      'Regista o que recebes e o que gastas. Vê para onde vai o teu dinheiro.',
  },
  {
    id: 2,
    image: require('../../assets/onboarding/onboarding-2.png'),
    title: 'Define orçamentos',
    subtitle:
      'Cria limites por categoria e nunca mais fiques sem nada.',
  },
  {
    id: 3,
    image: require('../../assets/onboarding/onboarding-3.png'),
    title: 'Alcança as tuas metas',
    subtitle:
      'Junta para o que queres. Passo a passo, dia após dia.',
  },
];

export default function OnboardingScreen({ onComplete }) {
  const { colors } = useTheme();
  const refScroll = useRef(null);
  const [indiceAtual, setIndiceAtual] = useState(0);

  function lidarComScroll(evento) {
    const deslocamentoX = evento.nativeEvent.contentOffset.x;
    const indice = Math.round(deslocamentoX / width);
    setIndiceAtual(indice);
  }

  function lidarComProximo() {
    if (indiceAtual < SLIDES.length - 1) {
      const proximoIndice = indiceAtual + 1;
      refScroll.current?.scrollTo({
        x: proximoIndice * width,
        animated: true,
      });
      setIndiceAtual(proximoIndice);
    } else {
      if (onComplete) onComplete();
    }
  }

  function lidarComPular() {
    if (onComplete) onComplete();
  }

  const eUltimo = indiceAtual === SLIDES.length - 1;

  return (
    <SafeAreaView style={[styles.seguro, { backgroundColor: colors.fundo }]}>
      {/* ─── PULAR ─── */}
      <View style={styles.barraSuperior}>
        <TouchableOpacity
          style={[styles.botaoPular, { backgroundColor: colors.superficie }]}
          onPress={lidarComPular}
          activeOpacity={0.7}
        >
          <Text style={[styles.textoPular, { color: colors.textoPrimario }]}>
            Pular
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── SLIDES ─── */}
      <ScrollView
        ref={refScroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={lidarComScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.containerIlustracao}>
              <Image
                source={slide.image}
                style={styles.ilustracao}
                resizeMode="contain"
              />
            </View>

            <Text style={[styles.titulo, { color: colors.textoPrimario }]}>
              {slide.title}
            </Text>
            <Text style={[styles.subtitulo, { color: colors.textoSecundario }]}>
              {slide.subtitle}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* ─── DOTS ─── */}
      <View style={styles.linhaPontos}>
        {SLIDES.map((slide, indice) => (
          <View
            key={slide.id}
            style={[
              styles.ponto,
              { backgroundColor: colors.divisoria },
              indice === indiceAtual && {
                width: 24,
                backgroundColor: colors.primaria,
              },
            ]}
          />
        ))}
      </View>

      {/* ─── BOTÃO ─── */}
      <View style={styles.rodape}>
        <TouchableOpacity
          style={[
            styles.botao,
            {
              backgroundColor: colors.primaria,
              shadowColor: colors.primaria,
            },
          ]}
          onPress={lidarComProximo}
          activeOpacity={0.85}
        >
          <Text style={[styles.textoBotao, { color: colors.branco }]}>
            {eUltimo ? 'Começar' : 'Próximo'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.branco} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    flex: 1,
  },
  barraSuperior: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  botaoPular: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  textoPular: {
    fontFamily: 'InterBold',
    fontSize: 13,
  },
  scroll: {
    flex: 1,
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  containerIlustracao: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  ilustracao: {
    width: '100%',
    height: '100%',
  },
  titulo: {
    fontFamily: 'InterExtraBold',
    fontSize: 26,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitulo: {
    fontFamily: 'InterRegular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  linhaPontos: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rodape: {
    paddingHorizontal: 32,
    paddingBottom: 32,
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
  textoBotao: {
    fontFamily: 'InterBold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});