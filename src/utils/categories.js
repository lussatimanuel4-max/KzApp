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
    id: 'propinas',
    label: 'Propinas',
    image: require('../../assets/categories/propinas.png'),
  },
  {
    id: 'internet unitel',
    label: 'Internet Unitel',
    image: require('../../assets/categories/internet.png'),
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
    image: require('../../assets/categories/emprestimos.png'),
  },

{
    id: 'internet africell',
    label: 'Internet Africell',
    image: require('../../assets/categories/africell.png'),
  },

];

// ─────────────────────────────
// OBTER CATEGORIA PELO ID
// ─────────────────────────────
export function getCategoryById(categoryId) {
  return CATEGORIES.find((cat) => cat.id === categoryId) || null;
}