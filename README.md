```markdown
# KzApp — Gestão de Finanças Pessoais

O KzApp é uma aplicação mobile de finanças pessoais, desenhada especialmente para estudantes angolanos. O foco é ser 100% **Offline-first**, rápido, seguro e visualmente apelativo.

Este projeto está a ser desenvolvido como parte do meu portfólio pessoal e também como projeto académico (Front-end em React Native + Back-end em Java/Spring Boot).

## 🚀 Funcionalidades

- 100% Offline: Todos os dados são guardados localmente via `AsyncStorage`.
- Dark Mode Nativo: Design System focado no modo escuro (preto puro e tons de cinza elevados).
- Registo de Transações: Entradas (Recebi) e Saídas (Gastei) com categorias visuais.
- Histórico Inteligente: Agrupamento por dia, filtros por tipo (Tudo/Recebi/Gastei) e filtro por mês.
- Metas Financeiras: Criação de objetivos de poupança e acompanhamento do progresso.
- Perfil Personalizável: Escolha de avatares, edição de nome e estatísticas gerais.
- Design System: Tipografia Inter, botões em pílula e paleta de cores "Silicon Valley".

## 🛠️ Tecnologias Utilizadas

- Framework: React Native (Expo SDK 57)
- Linguagem: JavaScript (puro)
- Navegação: React Navigation (Bottom Tabs + Native Stack)
- Armazenamento: `@react-native-async-storage/async-storage`
- Animações & Feedback: `expo-haptics`, `expo-linear-gradient`, `Animated` (React Native)
- Tipografia: Fontes Inter (Regular, Medium, Bold, ExtraBold)

## 📁 Estrutura do Projeto

```text
Front-end/
├── assets/          # Imagens, fontes, avatares e ícones
├── src/
│   ├── components/  # Componentes reutilizáveis (BalanceCard, CustomAlert, etc.)
│   ├── context/     # ThemeContext (cores fixas em Dark Mode)
│   ├── screens/     # Ecrãs (Home, Histórico, Metas, Perfil, etc.)
│   ├── storage/     # Lógica de AsyncStorage (transações, perfil, metas)
│   ├── theme/       # Paleta de cores e tipografia
│   └── utils/       # Funções de cálculo, formatação e categorias
├── App.js           # Entrada da aplicação e navegação
├── app.json         # Configuração do Expo
└── package.json     # Dependências do projeto
```

## ⚙️ Como correr o projeto localmente

### Pré-requisitos
- Node.js instalado
- Expo Go instalado no telemóvel (Android/iOS) ou um emulador

### Passos

1. Clona o repositório:
```bash
git clone https://github.com/lussatimanuel4-max/KzApp.git
```

2. Entra na pasta do Front-end:
```bash
cd KzApp
```

3. Instala as dependências:
```bash
npm install
```

4. Inicia o servidor do Expo:
```bash
npx expo start
```

5. Lê o QR Code com a app **Expo Go** no teu telemóvel.

## 👨‍💻 Autor

**Manuel Lussaty**
- GitHub: [@lussatimanuel4-max](https://github.com/lussatimanuel4-max)
- Angola 🇦🇴

---
*Este projeto está em desenvolvimento contínuo.*
```

---