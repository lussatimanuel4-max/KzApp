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
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '../theme/colors';
import { saveProfile } from '../storage/profile';
import { markProfileCreated } from '../storage/appState';
import { PROVINCES, SCHOOL_LEVELS, GENDERS } from '../storage/constants';

const TOTAL_STEPS = 4;

// ─── AVATARES DISPONÍVEIS ───
const AVATARS = [
  { id: 'avatar-1', image: require('../../assets/avatars/avatar-1.jpg') },
  { id: 'avatar-2', image: require('../../assets/avatars/avatar-2.jpg') },
  { id: 'avatar-3', image: require('../../assets/avatars/avatar-3.jpg') },
  { id: 'avatar-4', image: require('../../assets/avatars/avatar-4.jpg') },
  { id: 'avatar-5', image: require('../../assets/avatars/avatar-5.jpg') },
  { id: 'avatar-6', image: require('../../assets/avatars/avatar-6.jpg') },
];

export default function CreateProfileScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // ─── DADOS DO PERFIL ───
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [school, setSchool] = useState('');
  const [schoolLevel, setSchoolLevel] = useState('');
  const [province, setProvince] = useState('');
  const [gender, setGender] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  // ─── MODAIS ───
  const [showSchoolLevels, setShowSchoolLevels] = useState(false);
  const [showProvinces, setShowProvinces] = useState(false);

  function vibrate() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function goNext() {
    vibrate();

    if (step === 1) {
      if (name.trim().length < 2) {
        Alert.alert('Nome inválido', 'Escreve o teu nome.');
        return;
      }
      if (!age || Number(age) < 10 || Number(age) > 80) {
        Alert.alert('Idade inválida', 'Escreve uma idade entre 10 e 80.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (school.trim().length < 2) {
        Alert.alert('Escola inválida', 'Escreve o nome da tua escola.');
        return;
      }
      if (!schoolLevel) {
        Alert.alert('Classe em falta', 'Escolhe a tua classe ou ano.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!province) {
        Alert.alert('Província em falta', 'Escolhe a tua província.');
        return;
      }
      if (!gender) {
        Alert.alert('Género em falta', 'Escolhe uma opção.');
        return;
      }
      setStep(4);
    }
  }

  function goBack() {
    if (step > 1) {
      vibrate();
      setStep(step - 1);
    }
  }

  async function handleFinish() {
    if (!selectedAvatar) {
      Alert.alert('Avatar em falta', 'Escolhe um avatar para continuar.');
      return;
    }

    vibrate();
    setLoading(true);

    const saved = await saveProfile({
      name: name.trim(),
      age: age.trim(),
      school: school.trim(),
      schoolLevel,
      province,
      gender,
      avatar: selectedAvatar,
    });

    if (!saved) {
      setLoading(false);
      Alert.alert('Erro', 'Não foi possível guardar. Tenta novamente.');
      return;
    }

    await markProfileCreated();
    setLoading(false);

    if (onComplete) onComplete();
  }

  // ─── TELA 1 ───
  function renderStep1() {
    return (
      <>
        <Image
          source={require('../../assets/signup/signup-1.png')}
          style={styles.illustration}
          resizeMode="contain"
        />

        <Text style={styles.title}>Quem és?</Text>
        <Text style={styles.subtitle}>
          Diz-nos quem és para personalizar a tua experiência.
        </Text>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={20}
            color={colors.textLight}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Escreve o teu nome"
            placeholderTextColor={colors.textLight}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={30}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={colors.textLight}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Quantos anos tens?"
            placeholderTextColor={colors.textLight}
            keyboardType="number-pad"
            value={age}
            onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
            maxLength={2}
          />
        </View>
      </>
    );
  }

  // ─── TELA 2 ───
  function renderStep2() {
    return (
      <>
        <Image
          source={require('../../assets/signup/signup-2.png')}
          style={styles.illustration}
          resizeMode="contain"
        />

        <Text style={styles.title}>Onde estudas?</Text>
        <Text style={styles.subtitle}>
          Isto ajuda-nos a adaptar o app para ti.
        </Text>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="school-outline"
            size={20}
            color={colors.textLight}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Escola ou universidade"
            placeholderTextColor={colors.textLight}
            value={school}
            onChangeText={setSchool}
            maxLength={50}
          />
        </View>

        <TouchableOpacity
          style={styles.inputWrapper}
          onPress={() => {
            vibrate();
            setShowSchoolLevels(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="book-outline"
            size={20}
            color={colors.textLight}
            style={styles.inputIcon}
          />
          <Text
            style={[
              styles.input,
              !schoolLevel && { color: colors.textLight },
            ]}
          >
            {schoolLevel || 'Classe / Ano'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={colors.textLight}
          />
        </TouchableOpacity>
      </>
    );
  }

  // ─── TELA 3 ───
  function renderStep3() {
    return (
      <>
        <Image
          source={require('../../assets/signup/signup-3.png')}
          style={styles.illustration}
          resizeMode="contain"
        />

        <Text style={styles.title}>Onde vives?</Text>
        <Text style={styles.subtitle}>
          Estamos em Angola, mas queremos saber a tua província.
        </Text>

        <TouchableOpacity
          style={styles.inputWrapper}
          onPress={() => {
            vibrate();
            setShowProvinces(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={colors.textLight}
            style={styles.inputIcon}
          />
          <Text
            style={[
              styles.input,
              !province && { color: colors.textLight },
            ]}
          >
            {province || 'Província'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={colors.textLight}
          />
        </TouchableOpacity>

        <View style={styles.genderRow}>
          {GENDERS.map((g) => {
            const active = gender === g.id;
            return (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.genderButton,
                  active && styles.genderButtonActive,
                ]}
                onPress={() => {
                  vibrate();
                  setGender(g.id);
                }}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.genderText,
                    active && styles.genderTextActive,
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
  function renderStep4() {
    return (
      <>
        <Text style={styles.title}>Escolhe o teu avatar</Text>
        <Text style={styles.subtitle}>
          Este avatar vai aparecer no teu perfil.
        </Text>

        <View style={styles.avatarsGrid}>
          {AVATARS.map((avatar) => {
            const active = selectedAvatar === avatar.id;
            return (
              <TouchableOpacity
                key={avatar.id}
                style={[
                  styles.avatarWrapper,
                  active && styles.avatarWrapperActive,
                ]}
                onPress={() => {
                  vibrate();
                  setSelectedAvatar(avatar.id);
                }}
                activeOpacity={0.85}
              >
                <Image
                  source={avatar.image}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />

                {active && (
                  <View style={styles.avatarCheck}>
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={colors.white}
                    />
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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ─── HEADER ─── */}
        <View style={styles.header}>
          {step > 1 ? (
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Ionicons
                name="arrow-back"
                size={22}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}

          <Text style={styles.stepText}>
            {step} / {TOTAL_STEPS}
          </Text>
        </View>

        {/* ─── BARRA DE PROGRESSO ─── */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${(step / TOTAL_STEPS) * 100}%` },
            ]}
          />
        </View>

        {/* ─── CONTEÚDO ─── */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </ScrollView>

        {/* ─── BOTÃO ─── */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={step === 4 ? handleFinish : goNext}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? 'A guardar...'
                : step === 4
                ? 'Começar'
                : 'Próximo'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* ─── MODAL: CLASSES ─── */}
        {showSchoolLevels && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setShowSchoolLevels(false)}
              activeOpacity={1}
            />
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Classe / Ano</Text>

              <ScrollView style={{ maxHeight: 320 }}>
                {SCHOOL_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={styles.modalOption}
                    onPress={() => {
                      vibrate();
                      setSchoolLevel(level);
                      setShowSchoolLevels(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{level}</Text>
                    {schoolLevel === level && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* ─── MODAL: PROVÍNCIAS ─── */}
        {showProvinces && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setShowProvinces(false)}
              activeOpacity={1}
            />
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Província</Text>

              <ScrollView style={{ maxHeight: 320 }}>
                {PROVINCES.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={styles.modalOption}
                    onPress={() => {
                      vibrate();
                      setProvince(p);
                      setShowProvinces(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{p}</Text>
                    {province === p && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.divider,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  illustration: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'InterExtraBold',
    fontSize: 26,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'InterRegular',
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 26,
    paddingHorizontal: 20,
    height: 52,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'InterRegular',
    fontSize: 16,
    color: colors.textPrimary,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  genderButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
  },
  genderText: {
    fontFamily: 'InterBold',
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  genderTextActive: {
    color: colors.white,
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  avatarWrapper: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 100,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarWrapperActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0EDFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  avatarCheck: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 24,
    paddingTop: 12,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: 'InterBold',
    fontSize: 16,
    color: colors.white,
    letterSpacing: 0.2,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'InterExtraBold',
    fontSize: 20,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  modalOptionText: {
    fontFamily: 'InterMedium',
    fontSize: 15,
    color: colors.textPrimary,
  },
});