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
import AnalyticsScreen from './src/screens/AnalyticsScreen'; // NOVO
import GoalsScreen from './src/screens/GoalsScreen'; // Movido para o Stack
import ProfileScreen from './src/screens/ProfileScreen';
import AboutScreen from './src/screens/AboutScreen';

// ─── Componentes ───
import AddActionSheet from './src/components/AddActionSheet';

// ─── Storage ───
import {
  isProfileCreated,
  hasSeenOnboarding,
  markOnboardingSeen,
} from './src/storage/appState';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─────────────────────────────
// FUNÇÕES DE VIBRAÇÃO
// ─────────────────────────────
function vibrateLight() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function vibrateMedium() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

// ─────────────────────────────
// TABS PRINCIPAIS (FLUTUANTE)
// ─────────────────────────────
function MainTabs({ onLogout, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomPosition = 0 + insets.bottom;
  const [sheetVisible, setSheetVisible] = useState(false);

  function handleSheetSelect(type) {
    navigation.navigate('AddTransaction', { type });
  }

  function handleAddPress() {
    vibrateMedium();
    setSheetVisible(true);
  }

  const tabBarStyle = {
    position: 'absolute',
    bottom: bottomPosition,
    left: 16,
    right: 16,
    height: 76,
    borderRadius: 28,
    backgroundColor: colors.sheetBg,
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tab.Navigator
        screenListeners={{
          tabPress: () => {
            vibrateLight();
          },
        }}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textPrimary,
          tabBarStyle: tabBarStyle,
          tabBarItemStyle: {
            paddingVertical: 6,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'InterBold',
            marginTop: 2,
          },
          tabBarIcon: ({ focused, color }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Histórico') {
              iconName = 'clock';
            } else if (route.name === 'Análises') {
              iconName = 'pie-chart'; // Ícone de gráfico
            } else if (route.name === 'Perfil') {
              iconName = 'user';
            }

            if (route.name === '_Add') {
              return <View style={styles.ghostIcon} />;
            }

            if (focused) {
              return (
                <View
                  style={[
                    styles.activeIconBox,
                    { backgroundColor: colors.accentSoft },
                  ]}
                >
                  <Feather name={iconName} size={18} color={colors.primary} />
                </View>
              );
            }

            return <Feather name={iconName} size={20} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Histórico" component={HistoryScreen} />

        <Tab.Screen
          name="_Add"
          component={View}
          options={{
            tabBarButton: () => <View style={styles.ghostTab} />,
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
          styles.addButton,
          {
            bottom: bottomPosition + 12,
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
        ]}
        onPress={handleAddPress}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color={colors.white} />
      </TouchableOpacity>

      <AddActionSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSelect={handleSheetSelect}
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
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: 'InterBold', fontWeight: 'normal' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
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
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);

  useEffect(() => {
    loadApp();
  }, []);

  async function loadApp() {
    try {
      await Font.loadAsync({
        InterRegular: require('./assets/fonts/Inter_18pt-Regular.ttf'),
        InterMedium: require('./assets/fonts/Inter_18pt-Medium.ttf'),
        InterBold: require('./assets/fonts/Inter_18pt-Bold.ttf'),
        InterExtraBold: require('./assets/fonts/Inter_18pt-ExtraBold.ttf'),
      });
      setFontsLoaded(true);
    } catch (error) {
      console.log('Erro ao carregar fontes:', error);
      setFontsLoaded(true);
    }

    const seen = await hasSeenOnboarding();
    const created = await isProfileCreated();
    setOnboardingSeen(seen);
    setProfileCreated(created);
    setLoading(false);
  }

  async function handleOnboardingComplete() {
    await markOnboardingSeen();
    setOnboardingSeen(true);
  }

  function handleProfileComplete() {
    setProfileCreated(true);
  }

  function handleLogout() {
    setProfileCreated(false);
  }

  if (loading || !fontsLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <NavigationContainer>
        {!onboardingSeen ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Onboarding">
              {(props) => (
                <OnboardingScreen
                  {...props}
                  onComplete={handleOnboardingComplete}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        ) : !profileCreated ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CreateProfile">
              {(props) => (
                <CreateProfileScreen
                  {...props}
                  onComplete={handleProfileComplete}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        ) : (
          <MainStack onLogout={handleLogout} />
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
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconBox: {
    width: 54,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  ghostTab: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  ghostIcon: {
    width: 20,
    height: 20,
    backgroundColor: 'transparent',
  },
  addButton: {
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