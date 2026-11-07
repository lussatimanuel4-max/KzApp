// src/context/ThemeContext.js
// Contexto simplificado: fornece as cores e tipografia fixas (Dark Mode)

import React, { createContext, useContext } from 'react';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  // O tema agora é fixo (Dark). Não há estado, nem loading, nem toggle.
  return (
    <ThemeContext.Provider value={{ colors, typography }}>
      {children}
    </ThemeContext.Provider>
  );
}