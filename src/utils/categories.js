// src/utils/categories.js
// Lista oficial das categorias do KzApp

export const CATEGORIES = [
  // ─── ACADÉMICO ───
  {
    id: 'lanche',
    label: 'Lanche',
    image: require('../../assets/categories/lanche.png'),
  },
  {
    id: 'transporte',
    label: 'Transporte',
    image: require('../../assets/categories/transporte.png'),
  },
  {
    id: 'material',
    label: 'Material escolar',
    image: require('../../assets/categories/material.png'),
  },
  {
    id: 'fasciculos',
    label: 'Fascículos',
    image: require('../../assets/categories/fasciculos.png'),
  },
  {
    id: 'livros',
    label: 'Livros',
    image: require('../../assets/categories/livros.png'),
  },
  {
    id: 'propinas',
    label: 'Propinas',
    image: require('../../assets/categories/propinas.png'),
  },

  // ─── NOVAS ───
  {
    id: 'almoco',
    label: 'Almoço',
    image: require('../../assets/categories/almoco.png'),
  },
  {
    id: 'roupa',
    label: 'Roupa',
    image: require('../../assets/categories/roupa.png'),
  },
  {
    id: 'higiene',
    label: 'Higiene',
    image: require('../../assets/categories/higiene.png'),
  },
  {
    id: 'saude',
    label: 'Saúde',
    image: require('../../assets/categories/saude.png'),
  },
  {
    id: 'diversao',
    label: 'Diversão',
    image: require('../../assets/categories/diversao.png'),
  },
  {
    id: 'emprestimos',
    label: 'Empréstimos',
    image: require('../../assets/categories/emprestimos.jpg'),
  },
  {
    id: 'acessorios electronicos',
    label: 'Acessórios Electrónicos',
    image: require('../../assets/categories/acessorios.png'),
  },
  {
    id: 'internet unitel',
    label: 'Internet Unitel',
    image: require('../../assets/categories/internet.png'),
  },
  {
    id: 'internet africell',
    label: 'Internet Africell',
    image: require('../../assets/categories/africell.png'),
  },
  {
    id: 'sinal dstv',
    label: 'Sinal DSTV',
    image: require('../../assets/categories/dstv.png'),
  },
  {
    id: 'saldo zap',
    label: 'Saldo Zap',
    image: require('../../assets/categories/zap.jpg'),
  },
  {
    id: 'luz ende',
    label: 'Luz ENDE',
    image: require('../../assets/categories/ende.png'),
  },
];

// ─────────────────────────────
// OBTER CATEGORIA PELO ID
// ─────────────────────────────
export function obterCategoriaPorId(idCategoria) {
  return CATEGORIES.find((cat) => cat.id === idCategoria) || null;
}