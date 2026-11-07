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

const WHATSAPP_NUMBER = '244933593515';

export default function AboutScreen() {
  const { colors } = useTheme();

  async function openWhatsApp() {
    const appUrl = `whatsapp://send?phone=${WHATSAPP_NUMBER}`;
    const webUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

    try {
      const supported = await Linking.canOpenURL(appUrl);
      if (supported) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      await Linking.openURL(webUrl);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── DEV CARD (1º) ─── */}
        <View style={[styles.devCard, { backgroundColor: colors.card }]}>
          <Image
            source={require('../../assets/dev.jpg')}
            style={styles.devAvatar}
          />

          <View style={styles.devInfo}>
            <Text style={[styles.devLabel, { color: colors.textSecondary }]}>
              Desenvolvedor Do App
            </Text>
            <Text style={[styles.devName, { color: colors.textPrimary }]}>
              Manuel Lussaty
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={openWhatsApp}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-whatsapp" size={20} color={colors.white} />
          <Text style={[styles.contactButtonText, { color: colors.white }]}>
            Falar comigo
          </Text>
        </TouchableOpacity>

        {/* ─── 3 MINI-CARDS (2º) ─── */}
        <View style={styles.miniCardsRow}>
          <View style={[styles.miniCard, { backgroundColor: colors.card }]}>
            <View style={[styles.miniIconBox, { backgroundColor: colors.accentSoft }]}>
              <Ionicons
                name="cloud-offline-outline"
                size={22}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.miniLabel, { color: colors.textPrimary }]}>
              Offline
            </Text>
          </View>

          <View style={[styles.miniCard, { backgroundColor: colors.card }]}>
            <View style={[styles.miniIconBox, { backgroundColor: colors.accentSoft }]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.miniLabel, { color: colors.textPrimary }]}>
              Privado
            </Text>
          </View>

          <View style={[styles.miniCard, { backgroundColor: colors.card }]}>
            <View style={[styles.miniIconBox, { backgroundColor: colors.accentSoft }]}>
              <Text style={styles.flagEmoji}>🇦🇴</Text>
            </View>
            <Text style={[styles.miniLabel, { color: colors.textPrimary }]}>
              Angola
            </Text>
          </View>
        </View>

        {/* ─── SOBRE O KWANZA (3º) ─── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Image
              source={require('../../assets/moeda.png')}
              style={styles.cardImageIcon}
              resizeMode="contain"
            />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Sobre o Kwanza App
            </Text>
          </View>
          <Text style={[styles.cardTextDark, { color: colors.textPrimary }]}>
            O Kwanza App, é um aplicativo Android que funciona de maneira 
            Offline, O foco do App é registar e controlar os teus ganhos
            e gastos, para teres domínio de onde vão as tuas Finanças. O APP
            foi feito especialmente para ajudar os estudantes...
          </Text>
        </View>

        {/* ─── SOBRE O KZAPP (4º) ─── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: colors.accentSoft }]}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Sobre o KzApp
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.infoLabelDark, { color: colors.textPrimary }]}>
              Versão
            </Text>
            <Text style={[styles.infoValueDark, { color: colors.textPrimary }]}>
              5.1.0
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.infoLabelDark, { color: colors.textPrimary }]}>
              Plataforma
            </Text>
            <Text style={[styles.infoValueDark, { color: colors.textPrimary }]}>
              Android
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.infoLabelDark, { color: colors.textPrimary }]}>
              Preço
            </Text>
            <Text style={[styles.infoValueDark, { color: colors.textPrimary }]}>
              Grátis
            </Text>
          </View>
        </View>

        {/* ─── RODAPÉ ─── */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2026 KzApp
          </Text>
          <Text style={[styles.footerSub, { color: colors.textLight }]}>
            App De Finanças
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // ─── DEV CARD ───
  devCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  devAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  devInfo: {
    flex: 1,
  },
  devLabel: {
    fontFamily: 'InterMedium',
    fontSize: 12,
    marginBottom: 2,
  },
  devName: {
    fontFamily: 'InterExtraBold',
    fontSize: 20,
    letterSpacing: -0.3,
  },

  // ─── CONTACT BUTTON ───
  contactButton: {
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
  contactButtonText: {
    fontFamily: 'InterBold',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  // ─── MINI-CARDS ───
  miniCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  miniCard: {
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
  miniIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  flagEmoji: {
    fontSize: 22,
  },
  miniLabel: {
    fontFamily: 'InterBold',
    fontSize: 13,
    letterSpacing: -0.1,
  },

  // ─── CARDS ───
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    minHeight: 32,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageIcon: {
    width: 32,
    height: 32,
  },
  cardTitle: {
    fontFamily: 'InterBold',
    fontSize: 15,
    letterSpacing: -0.1,
  },
  cardTextDark: {
    fontFamily: 'InterRegular',
    fontSize: 14,
    lineHeight: 21,
  },

  // ─── INFO ROWS ───
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  infoLabelDark: {
    fontFamily: 'InterMedium',
    fontSize: 14,
  },
  infoValueDark: {
    fontFamily: 'InterBold',
    fontSize: 14,
  },

  // ─── RODAPÉ ───
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontFamily: 'InterBold',
    fontSize: 12,
    marginBottom: 4,
  },
  footerSub: {
    fontFamily: 'InterRegular',
    fontSize: 12,
  },
});