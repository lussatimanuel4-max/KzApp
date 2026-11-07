// src/components/CustomAlert.js
// Substituto do Alert.alert nativo, com o Design System do KzApp

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CustomAlert({
  visible,
  title,
  message,
  buttons = [],
  onRequestClose,
  isDestructive = false,
}) {
  const { colors } = useTheme();

  // Se não houver botões, cria um botão "OK" por defeito
  const alertButtons = buttons.length > 0
    ? buttons
    : [{ text: 'OK', style: 'default' }];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <TouchableWithoutFeedback onPress={onRequestClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              
              {/* ─── CABEÇALHO (Ícone + Título) ─── */}
              <View style={styles.header}>
                {/* Se for destrutivo, mostra a imagem de erro sem fundo */}
                {isDestructive && (
                  <Image
                    source={require('../../assets/error.png')}
                    style={styles.errorIcon}
                    resizeMode="contain"
                  />
                )}
                
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  {title}
                </Text>
              </View>

              {/* ─── MENSAGEM ─── */}
              {message ? (
                <Text style={[styles.message, { color: colors.textSecondary }]}>
                  {message}
                </Text>
              ) : null}

              {/* ─── BOTÕES ─── */}
              <View style={styles.buttonsContainer}>
                {alertButtons.map((btn, index) => {
                  const isPrimary = btn.style === 'destructive' || btn.style === 'default';
                  const isCancel = btn.style === 'cancel';
                  
                  // Cores dos botões
                  let buttonBg = colors.surface;
                  let textColor = colors.textPrimary;

                  if (isPrimary && btn.style === 'destructive') {
                    buttonBg = colors.danger; // Botão vermelho para apagar
                    textColor = colors.white;
                  } else if (isPrimary) {
                    buttonBg = colors.primary; // Botão roxo para ação principal
                    textColor = colors.white;
                  } else if (isCancel) {
                    buttonBg = 'transparent'; // Botão de cancelar (texto)
                    textColor = colors.textSecondary;
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        { backgroundColor: buttonBg },
                        isCancel && styles.cancelButton,
                      ]}
                      onPress={() => {
                        if (btn.onPress) btn.onPress();
                        if (onRequestClose) onRequestClose();
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          { color: textColor, fontFamily: 'InterBold' },
                        ]}
                      >
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Aumentei um pouco o espaço para respirar
    gap: 12,
  },
  errorIcon: {
    width: 44, // Aumentei o tamanho do ícone
    height: 44,
  },
  title: {
    fontFamily: 'InterExtraBold',
    fontSize: 20,
    letterSpacing: -0.3,
    flex: 1,
  },
  message: {
    fontFamily: 'InterRegular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  button: {
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  cancelButton: {
    flex: 0.8,
  },
  buttonText: {
    fontSize: 15,
    letterSpacing: 0.2,
  },
});