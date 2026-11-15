// App.js
// Entrada do KzApp — navegação completa com vibração (Dark Mode Fixo)

import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as Haptics from 'expo-haptics';

// ─── Tema & Contexto ───
import { ThemeProvider } from './src/context/ThemeContext';
import { colors } from './src/theme/colors';

// ─── Ecrãs ───
import OnboardingScreen from './src/screens/OnboardingScreen';
import CreateProfileScreen from './src/screens/CreateProfileScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AboutScreen from './src/screens/AboutScreen';

// ─── Componentes ───
import AddActionSheet from './src/components/AddActionSheet';

// ─── Storage ───
import {
  perfilFoiCriado,
  onboardingFoiVisto,
  marcarOnboardingVisto,
} from './src/storage/appState';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─────────────────────────────
// FUNÇÕES DE VIBRAÇÃO
// ─────────────────────────────
function vibrarLeve() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function vibrarMedio() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

// ─────────────────────────────
// TABS PRINCIPAIS (FLUTUANTE)
// ─────────────────────────────
function MainTabs({ onLogout, navigation }) {
  const insets = useSafeAreaInsets();
  const posicaoInferior = 0 + insets.bottom;
  const [folhaVisivel, setFolhaVisivel] = useState(false);

  function lidarComSelecaoFolha(tipo) {
    navigation.navigate('AddTransaction', { type: tipo });
  }

  function lidarComPressaoAdicionar() {
    vibrarMedio();
    setFolhaVisivel(true);
  }

  const estiloTabBar = {
    position: 'absolute',
    bottom: posicaoInferior,
    left: 16,
    right: 16,
    height: 76,
    borderRadius: 28,
    backgroundColor: colors.fundoModal,
    borderTopWidth: 0,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.fundo }}>
      <Tab.Navigator
        screenListeners={{
          tabPress: () => {
            vibrarLeve();
          },
        }}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primaria,
          tabBarInactiveTintColor: colors.textoPrimario,
          tabBarStyle: estiloTabBar,
          tabBarItemStyle: {
            paddingVertical: 6,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'InterBold',
            marginTop: 2,
          },
          tabBarIcon: ({ focused, color }) => {
            let nomeIcone;

            if (route.name === 'Home') {
              nomeIcone = 'home';
            } else if (route.name === 'Histórico') {
              nomeIcone = 'clock';
            } else if (route.name === 'Análises') {
              nomeIcone = 'pie-chart';
            } else if (route.name === 'Perfil') {
              nomeIcone = 'user';
            }

            if (route.name === '_Adicionar') {
              return <View style={styles.iconeFantasma} />;
            }

            if (focused) {
              return (
                <View
                  style={[
                    styles.caixaIconeAtivo,
                    { backgroundColor: colors.destaqueSuave },
                  ]}
                >
                  <Feather name={nomeIcone} size={18} color={colors.primaria} />
                </View>
              );
            }

            return <Feather name={nomeIcone} size={20} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Histórico" component={HistoryScreen} />

        <Tab.Screen
          name="_Adicionar"
          component={View}
          options={{
            tabBarButton: () => <View style={styles.tabFantasma} />,
            tabBarLabel: () => null,
          }}
        />

        <Tab.Screen name="Análises" component={AnalyticsScreen} />
        <Tab.Screen
          name="Perfil"
          children={(props) => (
            <ProfileScreen {...props} onLogout={onLogout} />
          )}
        />
      </Tab.Navigator>

      <TouchableOpacity
        style={[
          styles.botaoAdicionar,
          {
            bottom: posicaoInferior + 12,
            backgroundColor: colors.primaria,
            shadowColor: colors.primaria,
          },
        ]}
        onPress={lidarComPressaoAdicionar}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color={colors.branco} />
      </TouchableOpacity>

      <AddActionSheet
        visible={folhaVisivel}
        onClose={() => setFolhaVisivel(false)}
        onSelect={lidarComSelecaoFolha}
      />
    </View>
  );
}

// ─────────────────────────────
// STACK PRINCIPAL
// ─────────────────────────────
function MainStack({ onLogout }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.fundo },
        headerTintColor: colors.textoPrimario,
        headerTitleStyle: { fontFamily: 'InterBold', fontWeight: 'normal' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.fundo },
      }}
    >
      <Stack.Screen name="Tabs" options={{ headerShown: false }}>
        {(props) => <MainTabs {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ title: 'Nova Transação', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Metas"
        component={GoalsScreen}
        options={{ title: 'Minhas Metas' }}
      />
      <Stack.Screen
        name="Sobre"
        component={AboutScreen}
        options={{ title: 'Sobre o KzApp' }}
      />
    </Stack.Navigator>
  );
}

// ─────────────────────────────
// CONTEÚDO INTERNO
// ─────────────────────────────
function AppContent() {
  const [carregando, setCarregando] = useState(true);
  const [fontesCarregadas, setFontesCarregadas] = useState(false);
  const [onboardingVisto, setOnboardingVisto] = useState(false);
  const [perfilCriado, setPerfilCriado] = useState(false);

  useEffect(() => {
    carregarApp();
  }, []);

  async function carregarApp() {
    try {
      await Font.loadAsync({
        InterRegular: require('./assets/fonts/Inter_18pt-Regular.ttf'),
        InterMedium: require('./assets/fonts/Inter_18pt-Medium.ttf'),
        InterBold: require('./assets/fonts/Inter_18pt-Bold.ttf'),
        InterExtraBold: require('./assets/fonts/Inter_18pt-ExtraBold.ttf'),
      });
      setFontesCarregadas(true);
    } catch (error) {
      console.log('Erro ao carregar fontes:', error);
      setFontesCarregadas(true);
    }

    const visto = await onboardingFoiVisto();
    const criado = await perfilFoiCriado();
    setOnboardingVisto(visto);
    setPerfilCriado(criado);
    setCarregando(false);
  }

  async function lidarComOnboardingConcluido() {
    await marcarOnboardingVisto();
    setOnboardingVisto(true);
  }

  function lidarComPerfilConcluido() {
    setPerfilCriado(true);
  }

  function lidarComLogout() {
    setPerfilCriado(false);
  }

  if (carregando || !fontesCarregadas) {
    return (
      <View style={[styles.carregando, { backgroundColor: colors.fundo }]}>
        <ActivityIndicator size="large" color={colors.primaria} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.fundo }}>
      <StatusBar style="light" />
      <NavigationContainer>
        {!onboardingVisto ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Onboarding">
              {(props) => (
                <OnboardingScreen
                  {...props}
                  onComplete={lidarComOnboardingConcluido}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        ) : !perfilCriado ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CreateProfile">
              {(props) => (
                <CreateProfileScreen
                  {...props}
                  onComplete={lidarComPerfilConcluido}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        ) : (
          <MainStack onLogout={lidarComLogout} />
        )}
      </NavigationContainer>
    </View>
  );
}

// ─────────────────────────────
// APP ROOT
// ─────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caixaIconeAtivo: {
    width: 54,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabFantasma: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  iconeFantasma: {
    width: 20,
    height: 20,
    backgroundColor: 'transparent',
  },
  botaoAdicionar: {
    position: 'absolute',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
  },
});