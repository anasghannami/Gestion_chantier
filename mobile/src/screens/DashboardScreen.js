import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Building2, ShoppingBag, Bell, Package,
  ShieldAlert, ChevronRight, AlertCircle, AlertTriangle, FileText
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SkeletonDashboard } from '../components/SkeletonLoader';
import { CacheService } from '../services/cacheService';
import api from '../api/axios';

export function DashboardScreen({ navigation }) {
  const { themeColors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalChantiers: 0,
    activeChantiers: 0,
    totalCommandes: 0,
    totalFactures: 0,
    chantiersRecents: [],
  });

  const fetchDashboardData = async () => {
    try {
      const [resChantiers, resCommandes, resFactures, localAlerts] = await Promise.all([
        api.get('/chantiers').catch(() => ({ data: [] })),
        api.get('/commandes').catch(() => ({ data: [] })),
        api.get('/factures').catch(() => ({ data: [] })),
        CacheService.getAlerts(),
      ]);

      const chantiers = Array.isArray(resChantiers.data) ? resChantiers.data : [];
      const commandes = Array.isArray(resCommandes.data) ? resCommandes.data : [];
      const factures = Array.isArray(resFactures.data) ? resFactures.data : [];
      const activeCount = chantiers.filter(c => c.statut === 'En cours' || c.statut === 'EN_COURS').length;

      setStats({
        totalChantiers: chantiers.length,
        activeChantiers: activeCount,
        totalCommandes: commandes.length,
        totalFactures: factures.length,
        chantiersRecents: chantiers.slice(0, 5),
      });

      setAlerts(localAlerts || []);
    } catch (e) {
      console.error('Erreur chargement dashboard:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDashboardData();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  const handleQuickAction = async (actionKey) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    const parentNav = navigation.getParent() || navigation;

    switch (actionKey) {
      case 'Chantiers':
        parentNav.navigate('Chantiers');
        break;
      case 'Commandes':
        parentNav.navigate('Commandes');
        break;
      case 'Alertes':
        navigation.navigate('Alertes');
        break;
      case 'Stocks':
        parentNav.navigate('More', { screen: 'Stocks' });
        break;
      case 'Factures':
        parentNav.navigate('More', { screen: 'Factures' });
        break;
      default:
        break;
    }
  };

  const unreadAlerts = alerts.filter(a => !a.isRead);
  const urgentAlerts = alerts.filter(a => a.priority === 'CRITIQUE');

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <SkeletonDashboard />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Header title="Tableau de Bord — BTP Manager" showLogout={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />
        }
      >
        {/* KPI Cards Grid */}
        <View style={styles.grid}>
          <TouchableOpacity
            style={[styles.kpiCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => handleQuickAction('Chantiers')}
          >
            <View style={[styles.kpiIconWrap, { backgroundColor: '#0284C720' }]}>
              <Building2 size={20} color="#0284C7" />
            </View>
            <Text style={[styles.kpiValue, { color: themeColors.text }]}>{stats.activeChantiers}</Text>
            <Text style={[styles.kpiLabel, { color: themeColors.subtext }]}>Chantiers Actifs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.kpiCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => handleQuickAction('Alertes')}
          >
            <View style={[styles.kpiIconWrap, { backgroundColor: '#EF444420' }]}>
              <ShieldAlert size={20} color="#EF4444" />
            </View>
            <Text style={[styles.kpiValue, { color: '#EF4444' }]}>{urgentAlerts.length}</Text>
            <Text style={[styles.kpiLabel, { color: themeColors.subtext }]}>Urgences & Critiques</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.kpiCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => handleQuickAction('Commandes')}
          >
            <View style={[styles.kpiIconWrap, { backgroundColor: '#F59E0B20' }]}>
              <ShoppingBag size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.kpiValue, { color: themeColors.text }]}>{stats.totalCommandes}</Text>
            <Text style={[styles.kpiLabel, { color: themeColors.subtext }]}>Commandes</Text>
          </TouchableOpacity>
        </View>

        {/* Section Dernières Alertes - Scroll Horizontal */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Dernières Alertes</Text>
          <TouchableOpacity onPress={() => handleQuickAction('Alertes')} style={styles.seeAllBtn}>
            <Text style={[styles.seeAllText, { color: themeColors.primary }]}>Voir tout</Text>
            <ChevronRight size={14} color={themeColors.primary} />
          </TouchableOpacity>
        </View>

        {alerts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={{ color: themeColors.subtext, textAlign: 'center' }}>
              Aucune alerte en cours. Tout est sous contrôle.
            </Text>
          </Card>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.alertsHorizontal}>
            {alerts.slice(0, 5).map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleQuickAction('Alertes')}
                style={[
                  styles.alertItemCard,
                  {
                    backgroundColor: themeColors.card,
                    borderColor: item.priority === 'CRITIQUE' ? '#EF4444' : themeColors.border,
                  },
                ]}
              >
                <View style={styles.alertItemHeader}>
                  {item.priority === 'CRITIQUE' ? (
                    <AlertCircle size={16} color="#EF4444" />
                  ) : (
                    <AlertTriangle size={16} color="#F59E0B" />
                  )}
                  <Text style={[styles.alertItemTag, { color: item.priority === 'CRITIQUE' ? '#EF4444' : '#F59E0B' }]}>
                    {item.priority}
                  </Text>
                </View>

                <Text style={[styles.alertItemTitle, { color: themeColors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.alertItemDesc, { color: themeColors.subtext }]} numberOfLines={2}>
                  {item.message}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Quick Actions Shortcuts */}
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 20 }]}>
          Accès Rapide
        </Text>

        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => handleQuickAction('Chantiers')}
          >
            <Building2 size={20} color="#0284C7" />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>Chantiers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => handleQuickAction('Commandes')}
          >
            <ShoppingBag size={20} color="#F59E0B" />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>Commandes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => handleQuickAction('Factures')}
          >
            <FileText size={20} color="#16A34A" />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>Factures</Text>
          </TouchableOpacity>
        </View>

        {/* Chantiers Récents */}
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 20 }]}>
          Chantiers en Cours
        </Text>

        {stats.chantiersRecents.length === 0 ? (
          <Card>
            <Text style={{ color: themeColors.subtext, textAlign: 'center' }}>
              Aucun chantier récent.
            </Text>
          </Card>
        ) : (
          stats.chantiersRecents.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleQuickAction('Chantiers')}
            >
              <Card style={{ marginBottom: 10 }}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.chantierName, { color: themeColors.text }]}>{item.nom}</Text>
                  <Badge
                    label={item.statut || 'En cours'}
                    type={item.statut === 'Terminé' ? 'success' : 'primary'}
                  />
                </View>
                <Text style={[styles.chantierClient, { color: themeColors.subtext }]}>
                  Client: {item.client || 'Client Privé'}
                </Text>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  kpiCard: {
    width: '31%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  kpiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 20,
    marginBottom: 10,
  },
  alertsHorizontal: {
    marginBottom: 10,
  },
  alertItemCard: {
    width: 220,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginRight: 10,
  },
  alertItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  alertItemTag: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  alertItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  alertItemDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  quickActionBtn: {
    width: '31%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  quickActionText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chantierName: {
    fontSize: 14,
    fontWeight: '700',
  },
  chantierClient: {
    fontSize: 12,
    marginTop: 4,
  },
});
