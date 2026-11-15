// src/utils/format.js
// Funções para formatar valores, datas e texto

// ─────────────────────────────
// FORMATAR VALOR EM KWANZA
// Ex: 15000 → "15.000 Kz"
// ─────────────────────────────
export function formatarKz(valor) {
  const num = Number(valor) || 0;
  const formatado = num
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatado} Kz`;
}

// ─────────────────────────────
// FORMATAR VALOR COM SINAL
// Ex: 15000, 'in' → "+15.000 Kz"
// Ex: 15000, 'out' → "-15.000 Kz"
// ─────────────────────────────
export function formatarKzComSinal(valor, tipo) {
  const num = Number(valor) || 0;
  const formatado = num
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sinal = tipo === 'in' ? '+' : '-';
  return `${sinal}${formatado} Kz`;
}

// ─────────────────────────────
// FORMATAR DATA (curta)
// Ex: "14 Set 2026"
// ─────────────────────────────
const MESES_CURTOS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

const MESES_LONGOS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function formatarData(dataEntrada) {
  if (!dataEntrada) return '';
  const data = new Date(dataEntrada);
  const dia = data.getDate();
  const mes = MESES_CURTOS[data.getMonth()];
  const ano = data.getFullYear();
  return `${dia} ${mes} ${ano}`;
}

// ─────────────────────────────
// FORMATAR DATA (hora)
// Ex: "10:30"
// ─────────────────────────────
export function formatarHora(dataEntrada) {
  if (!dataEntrada) return '';
  const data = new Date(dataEntrada);
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

// ─────────────────────────────
// ETIQUETA DO DIA (Hoje / Ontem / Data)
// ─────────────────────────────
export function obterEtiquetaDia(dataEntrada) {
  if (!dataEntrada) return '';
  const data = new Date(dataEntrada);
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  const eMesmoDia = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (eMesmoDia(data, hoje)) return 'Hoje';
  if (eMesmoDia(data, ontem)) return 'Ontem';
  return formatarData(dataEntrada);
}

// ─────────────────────────────
// FORMATAR PERCENTAGEM
// Ex: 0.4567 → "46%"
// ─────────────────────────────
export function formatarPercentagem(valor) {
  const num = Number(valor) || 0;
  return `${Math.round(num * 100)}%`;
}

// ─────────────────────────────
// CALCULAR PERCENTAGEM (0 a 1)
// Ex: 5000 / 10000 → 0.5
// ─────────────────────────────
export function calcularPercentagem(atual, total) {
  const a = Number(atual) || 0;
  const t = Number(total) || 0;
  if (t === 0) return 0;
  const percentagem = a / t;
  return percentagem > 1 ? 1 : percentagem;
}

// ─────────────────────────────
// PRIMEIRA LETRA MAIÚSCULA
// Ex: "joão" → "João"
// ─────────────────────────────
export function capitalizar(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// ─────────────────────────────
// SAUDAÇÃO POR HORA
// Ex: "Bom dia", "Boa tarde", "Boa noite"
// ─────────────────────────────
export function obterSaudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

// ═══════════════════════════════════════════════════════════
// FUNÇÕES PARA O FILTRO POR MÊS
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────
// FORMATAR MÊS POR EXTENSO
// Ex: (2026, 10) → "Novembro 2026"
// ─────────────────────────────
export function formatarMesAno(ano, indiceMes) {
  return `${MESES_LONGOS[indiceMes]} ${ano}`;
}

// ─────────────────────────────
// FORMATAR MÊS CURTO (para o botão no topo)
// Ex: (2026, 10) → "Nov 2026"
// ─────────────────────────────
export function obterEtiquetaMesCurta(ano, indiceMes) {
  return `${MESES_CURTOS[indiceMes]} ${ano}`;
}

// ─────────────────────────────
// OBTER LISTA DE MESES DISPONÍVEIS
// A partir da lista de transações, devolve um array de objetos:
// [{ label, year, monthIndex }, ...] ordenado do mais recente para o mais antigo.
// ─────────────────────────────
export function obterMesesDisponiveis(transacoes) {
  if (!Array.isArray(transacoes) || transacoes.length === 0) return [];

  const mapaMeses = {};

  transacoes.forEach((tx) => {
    const data = new Date(tx.date || tx.createdAt);
    const chave = `${data.getFullYear()}-${data.getMonth()}`;
    
    if (!mapaMeses[chave]) {
      mapaMeses[chave] = {
        year: data.getFullYear(),
        monthIndex: data.getMonth(),
        label: formatarMesAno(data.getFullYear(), data.getMonth()),
      };
    }
  });

  // Converter para array e ordenar decrescente (mais recente primeiro)
  return Object.values(mapaMeses).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.monthIndex - a.monthIndex;
  });
}