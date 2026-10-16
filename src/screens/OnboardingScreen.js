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
import colors from '../theme/colors';

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
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  function handleScroll(event) {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  }

  function handleNext() {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      if (onComplete) onComplete();
    }
  }

  function handleSkip() {
    if (onComplete) onComplete();
  }

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safe}>
      {/* ─── PULAR ─── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      </View>

      {/* ─── SLIDES ─── */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.illustrationWrapper}>
              <Image
                source={slide.image}
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* ─── DOTS ─── */}
      <View style={styles.dotsRow}>
        {SLIDES.map((slide, index) => (
          <View
            key={slide.id}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* ─── BOTÃO ─── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {isLast ? 'Começar' : 'Próximo'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  skipText: {
    fontFamily: 'InterBold',
    fontSize: 13,
    color: colors.textPrimary,
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
  illustrationWrapper: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: 'InterExtraBold',
    fontSize: 26,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'InterRegular',
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.divider,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 28,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    fontFamily: 'InterBold',
    fontSize: 16,
    color: colors.white,
    letterSpacing: 0.2,
  },
});