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
import { saveProfile } from '../storage/profile';
import { markProfileCreated } from '../storage/appState';
import { PROVINCES, SCHOOL_LEVELS, GENDERS } from '../storage/constants';
import CustomAlert from '../components/CustomAlert';

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
  const { colors } = useTheme();
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

  // ─── ESTADO DO CUSTOM ALERT ───
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    isDestructive: false,
    buttons: [],
  });

  // Função auxiliar para mostrar alertas de validação
  function showAlert(title, message, isDestructive = false) {
    setAlertConfig({
      visible: true,
      title,
      message,
      isDestructive,
      buttons: [{ text: 'Entendido', style: 'default' }],
    });
  }

  function closeAlert() {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }

  function vibrate() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function goNext() {
    vibrate();

    if (step === 1) {
      if (name.trim().length < 2) {
        showAlert('Nome inválido', 'Escreve o teu nome.');
        return;
      }
      if (!age || Number(age) < 10 || Number(age) > 80) {
        showAlert('Idade inválida', 'Escreve uma idade entre 10 e 80.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (school.trim().length < 2) {
        showAlert('Escola inválida', 'Escreve o nome da tua escola.');
        return;
      }
      if (!schoolLevel) {
        showAlert('Classe em falta', 'Escolhe a tua classe ou ano.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!province) {
        showAlert('Província em falta', 'Escolhe a tua província.');
        return;
      }
      if (!gender) {
        showAlert('Género em falta', 'Escolhe uma opção.');
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
      showAlert('Avatar em falta', 'Escolhe um avatar para continuar.');
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
      showAlert('Erro', 'Não foi possível guardar. Tenta novamente.', true);
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

        <Text style={[styles.title, { color: colors.textPrimary }]}>Quem és?</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Diz-nos quem és para personalizar a tua experiência.
        </Text>

        <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
          <Ionicons
            name="person-outline"
            size={20}
            color={colors.textLight}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="Escreve o teu nome"
            placeholderTextColor={colors.textLight}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={30}
          />
        </View>

        <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={colors.textLight}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
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

        <Text style={[styles.title, { color: colors.textPrimary }]}>Onde estudas?</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Isto ajuda-nos a adaptar o app para ti.
        </Text>

        <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
          <Ionicons
            name="school-outline"
            size={20}
            color={colors.textLight}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="Escola ou universidade"
            placeholderTextColor={colors.textLight}
            value={school}
            onChangeText={setSchool}
            maxLength={50}
          />
        </View>

        <TouchableOpacity
          style={[styles.inputWrapper, { backgroundColor: colors.surface }]}
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
              { color: schoolLevel ? colors.textPrimary : colors.textLight },
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

        <Text style={[styles.title, { color: colors.textPrimary }]}>Onde vives?</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Estamos em Angola, mas queremos saber a tua província.
        </Text>

        <TouchableOpacity
          style={[styles.inputWrapper, { backgroundColor: colors.surface }]}
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
              { color: province ? colors.textPrimary : colors.textLight },
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
                  { backgroundColor: colors.surface },
                  active && { backgroundColor: colors.primary },
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
                    { color: active ? colors.white : colors.textSecondary },
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
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Escolhe o teu avatar
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
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
                  active && {
                    borderColor: colors.primary,
                    backgroundColor: colors.accentSoft,
                  },
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
                  <View
                    style={[
                      styles.avatarCheck,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.white,
                      },
                    ]}
                  >
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
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

          <Text style={[styles.stepText, { color: colors.textSecondary }]}>
            {step} / {TOTAL_STEPS}
          </Text>
        </View>

        {/* ─── BARRA DE PROGRESSO ─── */}
        <View style={[styles.progressTrack, { backgroundColor: colors.divider }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${(step / TOTAL_STEPS) * 100}%`, backgroundColor: colors.primary },
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
            style={[
              styles.button,
              loading && styles.buttonDisabled,
              { backgroundColor: colors.primary, shadowColor: colors.primary },
            ]}
            onPress={step === 4 ? handleFinish : goNext}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>
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
          <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setShowSchoolLevels(false)}
              activeOpacity={1}
            />
            <View style={[styles.modalSheet, { backgroundColor: colors.sheetBg }]}>
              <View style={[styles.modalHandle, { backgroundColor: colors.divider }]} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Classe / Ano
              </Text>

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
                    <Text style={[styles.modalOptionText, { color: colors.textPrimary }]}>
                      {level}
                    </Text>
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
          <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setShowProvinces(false)}
              activeOpacity={1}
            />
            <View style={[styles.modalSheet, { backgroundColor: colors.sheetBg }]}>
              <View style={[styles.modalHandle, { backgroundColor: colors.divider }]} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Província
              </Text>

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
                    <Text style={[styles.modalOptionText, { color: colors.textPrimary }]}>
                      {p}
                    </Text>
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

        {/* ─── CUSTOM ALERT ─── */}
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          isDestructive={alertConfig.isDestructive}
          buttons={alertConfig.buttons.map((btn) => ({
            ...btn,
            onPress: () => {
              closeAlert();
              if (btn.onPress) btn.onPress();
            },
          }))}
          onRequestClose={closeAlert}
        />

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
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
  },
  progressTrack: {
    height: 4,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
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
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'InterRegular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  genderText: {
    fontFamily: 'InterBold',
    fontSize: 13,
    textAlign: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
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
    height: 56,
    borderRadius: 28,
    gap: 8,
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
    letterSpacing: 0.2,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
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
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'InterExtraBold',
    fontSize: 20,
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
  },
});