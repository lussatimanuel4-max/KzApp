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
  const botoesAlerta = buttons.length > 0
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
        <View style={[styles.sobreposicao, { backgroundColor: colors.sobreposicao }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.cartao, { backgroundColor: colors.cartao }]}>
              
              {/* ─── CABEÇALHO (Ícone + Título) ─── */}
              <View style={styles.cabecalho}>
                {/* Se for destrutivo, mostra a imagem de erro sem fundo */}
                {isDestructive && (
                  <Image
                    source={require('../../assets/error.png')}
                    style={styles.iconeErro}
                    resizeMode="contain"
                  />
                )}
                
                <Text style={[styles.titulo, { color: colors.textoPrimario }]}>
                  {title}
                </Text>
              </View>

              {/* ─── MENSAGEM ─── */}
              {message ? (
                <Text style={[styles.mensagem, { color: colors.textoSecundario }]}>
                  {message}
                </Text>
              ) : null}

              {/* ─── BOTÕES ─── */}
              <View style={styles.containerBotoes}>
                {botoesAlerta.map((btn, index) => {
                  const ePrimario = btn.style === 'destructive' || btn.style === 'default';
                  const eCancelar = btn.style === 'cancel';
                  
                  // Cores dos botões
                  let fundoBotao = colors.superficie;
                  let corTexto = colors.textoPrimario;

                  if (ePrimario && btn.style === 'destructive') {
                    fundoBotao = colors.perigo; // Botão vermelho para apagar
                    corTexto = colors.branco;
                  } else if (ePrimario) {
                    fundoBotao = colors.primaria; // Botão roxo para ação principal
                    corTexto = colors.branco;
                  } else if (eCancelar) {
                    fundoBotao = 'transparent'; // Botão de cancelar (texto)
                    corTexto = colors.textoSecundario;
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.botao,
                        { backgroundColor: fundoBotao },
                        eCancelar && styles.botaoCancelar,
                      ]}
                      onPress={() => {
                        if (btn.onPress) btn.onPress();
                        if (onRequestClose) onRequestClose();
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.textoBotao,
                          { color: corTexto, fontFamily: 'InterBold' },
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
  sobreposicao: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cartao: {
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
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconeErro: {
    width: 44,
    height: 44,
  },
  titulo: {
    fontFamily: 'InterExtraBold',
    fontSize: 20,
    letterSpacing: -0.3,
    flex: 1,
  },
  mensagem: {
    fontFamily: 'InterRegular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  containerBotoes: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  botao: {
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  botaoCancelar: {
    flex: 0.8,
  },
  textoBotao: {
    fontSize: 15,
    letterSpacing: 0.2,
  },
});