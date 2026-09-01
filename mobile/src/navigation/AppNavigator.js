import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ChantiersScreen } from '../screens/ChantiersScreen';
import { ChantierDetailScreen } from '../screens/ChantierDetailScreen';
import { ChantierFormScreen } from '../screens/ChantierFormScreen';
import { CommandesScreen } from '../screens/CommandesScreen';
import { CommandeDetailScreen } from '../screens/CommandeDetailScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { FacturesScreen } from '../screens/FacturesScreen';
import { FactureDetailScreen } from '../screens/FactureDetailScreen';
import { FournisseursScreen } from '../screens/FournisseursScreen';
import { FournisseurDetailScreen } from '../screens/FournisseurDetailScreen';
import { OuvriersScreen } from '../screens/OuvriersScreen';
import { OuvrierDetailScreen } from '../screens/OuvrierDetailScreen';
import { PlanningScreen } from '../screens/PlanningScreen';
import { StocksScreen } from '../screens/StocksScreen';
import { StockDetailScreen } from '../screens/StockDetailScreen';
import { MoreMenuScreen } from '../screens/MoreMenuScreen';

// Custom Components
import { CustomAddButton } from '../components/CustomAddButton';
import { QuickAddModal } from '../components/QuickAddModal';
import { CacheService } from '../services/cacheService';

import {
  LayoutDashboard, Building2, Package, Menu, Bell
} from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const DashboardStackNav = createNativeStackNavigator();
const ChantiersStackNav = createNativeStackNavigator();
const CommandesStackNav = createNativeStackNavigator();
const MoreStackNav = createNativeStackNavigator();

// Stack Accueil
function DashboardStack() {
  return (
    <DashboardStackNav.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStackNav.Screen name="DashboardHome" component={DashboardScreen} />
      <DashboardStackNav.Screen name="Alertes" component={AlertsScreen} />
    </DashboardStackNav.Navigator>
  );
}

// Stack Chantiers
function ChantiersStack() {
  return (
    <ChantiersStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ChantiersStackNav.Screen name="ChantiersList" component={ChantiersScreen} />
      <ChantiersStackNav.Screen name="ChantierDetail" component={ChantierDetailScreen} />
      <ChantiersStackNav.Screen name="ChantierForm" component={ChantierFormScreen} />
    </ChantiersStackNav.Navigator>
  );
}

// Stack Commandes
function CommandesStack() {
  return (
    <CommandesStackNav.Navigator screenOptions={{ headerShown: false }}>
      <CommandesStackNav.Screen name="CommandesList" component={CommandesScreen} />
      <CommandesStackNav.Screen name="CommandeDetail" component={CommandeDetailScreen} />
    </CommandesStackNav.Navigator>
  );
}

// Stack Menu
function MoreStack() {
  return (
    <MoreStackNav.Navigator screenOptions={{ headerShown: false }}>
      <MoreStackNav.Screen name="MoreMenu" component={MoreMenuScreen} />
      <MoreStackNav.Screen name="Ouvriers" component={OuvriersScreen} />
      <MoreStackNav.Screen name="OuvrierDetail" component={OuvrierDetailScreen} />
      <MoreStackNav.Screen name="Fournisseurs" component={FournisseursScreen} />
      <MoreStackNav.Screen name="FournisseurDetail" component={FournisseurDetailScreen} />
      <MoreStackNav.Screen name="Planning" component={PlanningScreen} />
      <MoreStackNav.Screen name="Stocks" component={StocksScreen} />
      <MoreStackNav.Screen name="StockDetail" component={StockDetailScreen} />
      <MoreStackNav.Screen name="Factures" component={FacturesScreen} />
      <MoreStackNav.Screen name="FactureDetail" component={FactureDetailScreen} />
    </MoreStackNav.Navigator>
  );
}

// Composant Dummy pour l'onglet central Ajouter
function DummyComponent() {
  return null;
}

function MainTabNavigator({ navigation }) {
  const { themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [unreadCount, setUnreadCount] = useState(0);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const tabBarHeight = Platform.OS === 'ios' ? 54 + insets.bottom : 62 + insets.bottom;

  useEffect(() => {
    const checkBadge = async () => {
      const alerts = await CacheService.getAlerts();
      const count = alerts.filter(a => !a.isRead).length;
      setUnreadCount(count);
    };
    checkBadge();
    const interval = setInterval(checkBadge, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectQuickAdd = (choiceKey) => {
    if (choiceKey === 'Chantier') {
      navigation.navigate('Chantiers', { screen: 'ChantierForm' });
    } else if (choiceKey === 'Commande') {
      navigation.navigate('Commandes');
    } else if (choiceKey === 'Facture') {
      navigation.navigate('More', { screen: 'Factures' });
    }
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: themeColors.tabBar,
            borderTopColor: themeColors.tabBarBorder,
            height: tabBarHeight,
            paddingBottom: Math.max(insets.bottom, 6),
            paddingTop: 6,
          },
          tabBarActiveTintColor: themeColors.activeTab,
          tabBarInactiveTintColor: themeColors.inactiveTab,
        }}
      >
        {/* Onglet 1: Accueil */}
        <Tab.Screen
          name="Dashboard"
          component={DashboardStack}
          options={{
            tabBarLabel: 'Accueil',
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
            tabBarBadgeStyle: { backgroundColor: '#EF4444', fontSize: 10, fontWeight: '700' },
            tabBarIcon: ({ color, size }) => <LayoutDashboard size={size || 22} color={color} />,
          }}
        />

        {/* Onglet 2: Chantiers */}
        <Tab.Screen
          name="Chantiers"
          component={ChantiersStack}
          options={{
            tabBarLabel: 'Chantiers',
            tabBarIcon: ({ color, size }) => <Building2 size={size || 22} color={color} />,
          }}
        />

        {/* Onglet 3: Bouton Central Surélevé "Ajouter" */}
        <Tab.Screen
          name="Ajouter"
          component={DummyComponent}
          options={{
            tabBarLabel: '',
            tabBarButton: () => (
              <CustomAddButton onPress={() => setAddModalVisible(true)} />
            ),
          }}
        />

        {/* Onglet 4: Commandes */}
        <Tab.Screen
          name="Commandes"
          component={CommandesStack}
          options={{
            tabBarLabel: 'Commandes',
            tabBarIcon: ({ color, size }) => <Package size={size || 22} color={color} />,
          }}
        />

        {/* Onglet 5: Menu */}
        <Tab.Screen
          name="More"
          component={MoreStack}
          options={{
            tabBarLabel: 'Menu',
            tabBarIcon: ({ color, size }) => <Menu size={size || 22} color={color} />,
          }}
        />
      </Tab.Navigator>

      {/* Modal d'ajout rapide */}
      <QuickAddModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSelect={handleSelectQuickAdd}
      />
    </>
  );
}

export function AppNavigator() {
  const { user, loading } = useAuth();
  const { themeColors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
