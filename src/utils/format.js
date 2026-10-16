// src/utils/format.js
// Funções para formatar valores, datas e texto

// ─────────────────────────────
// FORMATAR VALOR EM KWANZA
// Ex: 15000 → "15.000 Kz"
// ─────────────────────────────
export function formatKz(value) {
  const num = Number(value) || 0;
  const formatted = num
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted} Kz`;
}

// ─────────────────────────────
// FORMATAR VALOR COM SINAL
// Ex: 15000, 'in' → "+15.000 Kz"
// Ex: 15000, 'out' → "-15.000 Kz"
// ─────────────────────────────
export function formatKzSigned(value, type) {
  const num = Number(value) || 0;
  const formatted = num
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = type === 'in' ? '+' : '-';
  return `${sign}${formatted} Kz`;
}

// ─────────────────────────────
// FORMATAR DATA (curta)
// Ex: "14 Set 2026"
// ─────────────────────────────
const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export function formatDate(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const day = date.getDate();
  const month = MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// ─────────────────────────────
// FORMATAR DATA (hora)
// Ex: "10:30"
// ─────────────────────────────
export function formatTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// ─────────────────────────────
// ETIQUETA DO DIA (Hoje / Ontem / Data)
// ─────────────────────────────
export function getDayLabel(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDay(date, today)) return 'Hoje';
  if (sameDay(date, yesterday)) return 'Ontem';
  return formatDate(dateInput);
}

// ─────────────────────────────
// FORMATAR PERCENTAGEM
// Ex: 0.4567 → "46%"
// ─────────────────────────────
export function formatPercent(value) {
  const num = Number(value) || 0;
  return `${Math.round(num * 100)}%`;
}

// ─────────────────────────────
// CALCULAR PERCENTAGEM (0 a 1)
// Ex: 5000 / 10000 → 0.5
// ─────────────────────────────
export function calculatePercent(current, total) {
  const c = Number(current) || 0;
  const t = Number(total) || 0;
  if (t === 0) return 0;
  const percent = c / t;
  return percent > 1 ? 1 : percent;
}

// ─────────────────────────────
// PRIMEIRA LETRA MAIÚSCULA
// Ex: "joão" → "João"
// ─────────────────────────────
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ─────────────────────────────
// SAUDAÇÃO POR HORA
// Ex: "Bom dia", "Boa tarde", "Boa noite"
// ─────────────────────────────
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}