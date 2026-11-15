// src/screens/AboutScreen.js
// Ecrã "Sobre o KzApp" — estilo Silicon Valley

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';

const NUMERO_WHATSAPP = '244933593515';

export default function AboutScreen() {
  const { colors } = useTheme();

  async function abrirWhatsApp() {
    const urlApp = `whatsapp://send?phone=${NUMERO_WHATSAPP}`;
    const urlWeb = `https://wa.me/${NUMERO_WHATSAPP}`;

    try {
      const suportado = await Linking.canOpenURL(urlApp);
      if (suportado) {
        await Linking.openURL(urlApp);
      } else {
        await Linking.openURL(urlWeb);
      }
    } catch (error) {
      await Linking.openURL(urlWeb);
    }
  }

  return (
    <SafeAreaView style={[styles.seguro, { backgroundColor: colors.fundo }]} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── DEV CARD (1º) ─── */}
        <View style={[styles.cartaoDev, { backgroundColor: colors.cartao }]}>
          <Image
            source={require('../../assets/dev.jpg')}
            style={styles.avatarDev}
          />

          <View style={styles.infoDev}>
            <Text style={[styles.rotuloDev, { color: colors.textoSecundario }]}>
              Desenvolvedor Do App
            </Text>
            <Text style={[styles.nomeDev, { color: colors.textoPrimario }]}>
              Manuel Lussaty
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.botaoContacto}
          onPress={abrirWhatsApp}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-whatsapp" size={20} color={colors.branco} />
          <Text style={[styles.textoBotaoContacto, { color: colors.branco }]}>
            Falar comigo
          </Text>
        </TouchableOpacity>

        {/* ─── 3 MINI-CARDS (2º) ─── */}
        <View style={styles.linhaMiniCartoes}>
          <View style={[styles.miniCartao, { backgroundColor: colors.cartao }]}>
            <View style={[styles.caixaIconeMini, { backgroundColor: colors.destaqueSuave }]}>
              <Ionicons
                name="cloud-offline-outline"
                size={22}
                color={colors.primaria}
              />
            </View>
            <Text style={[styles.rotuloMini, { color: colors.textoPrimario }]}>
              Offline
            </Text>
          </View>

          <View style={[styles.miniCartao, { backgroundColor: colors.cartao }]}>
            <View style={[styles.caixaIconeMini, { backgroundColor: colors.destaqueSuave }]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={colors.primaria}
              />
            </View>
            <Text style={[styles.rotuloMini, { color: colors.textoPrimario }]}>
              Privado
            </Text>
          </View>

          <View style={[styles.miniCartao, { backgroundColor: colors.cartao }]}>
            <View style={[styles.caixaIconeMini, { backgroundColor: colors.destaqueSuave }]}>
              <Text style={styles.emojiBandeira}>🇦🇴</Text>
            </View>
            <Text style={[styles.rotuloMini, { color: colors.textoPrimario }]}>
              Angola
            </Text>
          </View>
        </View>

        {/* ─── SOBRE O KWANZA (3º) ─── */}
        <View style={[styles.cartao, { backgroundColor: colors.cartao }]}>
          <View style={styles.cabecalhoCartao}>
            <Image
              source={require('../../assets/moeda.png')}
              style={styles.iconeImagemCartao}
              resizeMode="contain"
            />
            <Text style={[styles.tituloCartao, { color: colors.textoPrimario }]}>
              Sobre o Kwanza App
            </Text>
          </View>
          <Text style={[styles.textoCartao, { color: colors.textoPrimario }]}>
            O Kwanza App, é um aplicativo Android que funciona de maneira 
            Offline, O foco do App é registar e controlar os teus ganhos
            e gastos, para teres domínio de onde vão as tuas Finanças. O APP
            foi feito especialmente para ajudar os estudantes...
          </Text>
        </View>

        {/* ─── SOBRE O KZAPP (4º) ─── */}
        <View style={[styles.cartao, { backgroundColor: colors.cartao }]}>
          <View style={styles.cabecalhoCartao}>
            <View style={[styles.iconeCartao, { backgroundColor: colors.destaqueSuave }]}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.primaria}
              />
            </View>
            <Text style={[styles.tituloCartao, { color: colors.textoPrimario }]}>
              Sobre o KzApp
            </Text>
          </View>

          <View style={[styles.linhaInfo, { borderBottomColor: colors.divisoria }]}>
            <Text style={[styles.rotuloInfo, { color: colors.textoPrimario }]}>
              Versão
            </Text>
            <Text style={[styles.valorInfo, { color: colors.textoPrimario }]}>
              5.1.3
            </Text>
          </View>

          <View style={[styles.linhaInfo, { borderBottomColor: colors.divisoria }]}>
            <Text style={[styles.rotuloInfo, { color: colors.textoPrimario }]}>
              Plataforma
            </Text>
            <Text style={[styles.valorInfo, { color: colors.textoPrimario }]}>
              Android
            </Text>
          </View>

          <View style={[styles.linhaInfo, { borderBottomWidth: 0 }]}>
            <Text style={[styles.rotuloInfo, { color: colors.textoPrimario }]}>
              Preço
            </Text>
            <Text style={[styles.valorInfo, { color: colors.textoPrimario }]}>
              Grátis
            </Text>
          </View>
        </View>

        {/* ─── RODAPÉ ─── */}
        <View style={styles.rodape}>
          <Text style={[styles.textoRodape, { color: colors.textoSecundario }]}>
            © 2026 KzApp
          </Text>
          <Text style={[styles.subRodape, { color: colors.textoClaro }]}>
            App De Finanças
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // ─── DEV CARD ───
  cartaoDev: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  avatarDev: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  infoDev: {
    flex: 1,
  },
  rotuloDev: {
    fontFamily: 'InterMedium',
    fontSize: 12,
    marginBottom: 2,
  },
  nomeDev: {
    fontFamily: 'InterExtraBold',
    fontSize: 20,
    letterSpacing: -0.3,
  },

  // ─── CONTACT BUTTON ───
  botaoContacto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#25D366', // Cor fixa do WhatsApp
    marginBottom: 24,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  textoBotaoContacto: {
    fontFamily: 'InterBold',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  // ─── MINI-CARDS ───
  linhaMiniCartoes: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  miniCartao: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  caixaIconeMini: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emojiBandeira: {
    fontSize: 22,
  },
  rotuloMini: {
    fontFamily: 'InterBold',
    fontSize: 13,
    letterSpacing: -0.1,
  },

  // ─── CARDS ───
  cartao: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cabecalhoCartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    minHeight: 32,
  },
  iconeCartao: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeImagemCartao: {
    width: 32,
    height: 32,
  },
  tituloCartao: {
    fontFamily: 'InterBold',
    fontSize: 15,
    letterSpacing: -0.1,
  },
  textoCartao: {
    fontFamily: 'InterRegular',
    fontSize: 14,
    lineHeight: 21,
  },

  // ─── INFO ROWS ───
  linhaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  rotuloInfo: {
    fontFamily: 'InterMedium',
    fontSize: 14,
  },
  valorInfo: {
    fontFamily: 'InterBold',
    fontSize: 14,
  },

  // ─── RODAPÉ ───
  rodape: {
    alignItems: 'center',
    marginTop: 16,
  },
  textoRodape: {
    fontFamily: 'InterBold',
    fontSize: 12,
    marginBottom: 4,
  },
  subRodape: {
    fontFamily: 'InterRegular',
    fontSize: 12,
  },
});