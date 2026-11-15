// src/context/ThemeContext.js
// Contexto simplificado: fornece as cores e tipografia fixas (Dark Mode)

import React, { createContext, useContext } from 'react';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const ContextoTema = createContext();

export function useTheme() {
  const contexto = useContext(ContextoTema);
  if (!contexto) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return contexto;
}

export function ThemeProvider({ children }) {
  // O tema agora é fixo (Dark). Não há estado, nem loading, nem toggle.
  return (
    <ContextoTema.Provider value={{ colors, typography }}>
      {children}
    </ContextoTema.Provider>
  );
}