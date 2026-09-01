import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Card } from '../components/ui/Card';
import { Truck, Users, Calendar, Sun, Moon, LogOut, ChevronRight, HardHat, ShieldCheck, Boxes } from 'lucide-react-native';

export function MoreMenuScreen({ navigation }) {
  const { themeColors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: 'Stocks & Matériaux',
      subtitle: 'Alertes stock bas & mouvements terrain',
      icon: Boxes,
      screen: 'Stocks',
      color: themeColors.primary,
      bg: themeColors.primaryBackground,
    },
    {
      title: 'Fournisseurs',
      subtitle: 'Annuaire des partenaires & matériaux',
      icon: Truck,
      screen: 'Fournisseurs',
      color: themeColors.info,
      bg: themeColors.infoBg,
    },
    {
      title: 'Équipe & Ouvriers',
      subtitle: 'Gestion du personnel et spécialités',
      icon: Users,
      screen: 'Ouvriers',
      color: themeColors.success,
      bg: themeColors.successBg,
    },
    {
      title: 'Planning',
      subtitle: 'Calendrier des interventions',
      icon: Calendar,
      screen: 'Planning',
      color: themeColors.warning,
      bg: themeColors.warningBg,
    },
    {
      title: 'Factures & Règlements',
      subtitle: 'Suivi des paiements et pièces PDF',
      icon: Boxes,
      screen: 'Factures',
      color: themeColors.primary,
      bg: themeColors.primaryBackground,
    },
  ];

  return (
    <ScreenContainer
      headerTitle="Menu & Options"
      scrollable={true}
      hasTabBar={true}
    >
        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={[styles.avatarCircle, { backgroundColor: themeColors.primaryBackground }]}>
            <HardHat size={28} color={themeColors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: themeColors.text }]}>
              {user?.nom || user?.email || 'Administrateur'}
            </Text>
            <Text style={[styles.userRole, { color: themeColors.textSecondary }]}>
              {user?.email || 'Session Active'}
            </Text>
          </View>
        </Card>

        {/* Modules Grid / List */}
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>GESTION MODULES</Text>

        {menuItems.map((item, index) => {
          const IconComp = item.icon;
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Card style={styles.menuCard}>
                <View style={styles.row}>
                  <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                    <IconComp size={22} color={item.color} />
                  </View>
                  <View style={styles.menuTextWrap}>
                    <Text style={[styles.menuTitle, { color: themeColors.text }]}>{item.title}</Text>
                    <Text style={[styles.menuSub, { color: themeColors.textSecondary }]}>{item.subtitle}</Text>
                  </View>
                  <ChevronRight size={20} color={themeColors.textMuted} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}

        {/* Theme & Settings Section */}
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary, marginTop: 20 }]}>APPARENCE & SESSIONS</Text>

        <TouchableOpacity activeOpacity={0.8} onPress={toggleTheme}>
          <Card style={styles.menuCard}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: themeColors.primaryBackground }]}>
                {isDark ? <Sun size={22} color={themeColors.primary} /> : <Moon size={22} color={themeColors.primary} />}
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={[styles.menuTitle, { color: themeColors.text }]}>
                  Thème d'affichage
                </Text>
                <Text style={[styles.menuSub, { color: themeColors.textSecondary }]}>
                  Actuellement : {isDark ? 'Mode Nuit (Sombre)' : 'Mode Jour (Clair)'}
                </Text>
              </View>
              <ChevronRight size={20} color={themeColors.textMuted} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={logout}>
          <Card style={styles.menuCard}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: themeColors.dangerBg }]}>
                <LogOut size={22} color={themeColors.danger} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={[styles.menuTitle, { color: themeColors.danger }]}>Se Déconnecter</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userRole: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSub: {
    fontSize: 12,
    marginTop: 2,
  },
});
