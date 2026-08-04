import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell, CheckCheck, Filter, ShieldAlert,
  AlertCircle, Info, RefreshCw
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { AlertCard } from '../components/AlertCard';
import { CacheService } from '../services/cacheService';
import { updateAppBadgeCount, scheduleLocalNotification } from '../services/notificationService';

const FILTER_OPTIONS = [
  { key: 'ALL', label: 'Tout' },
  { key: 'UNREAD', label: 'Non lues' },
  { key: 'CRITIQUE', label: 'Urgent' },
  { key: 'ALERTE', label: 'Alerte' },
  { key: 'INFO', label: 'Info' },
];

export function AlertsScreen({ navigation }) {
  const { themeColors, isDarkMode } = useTheme();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const loadAlerts = useCallback(async () => {
    try {
      const data = await CacheService.getAlerts();
      setAlerts(data);

      const unreadCount = data.filter(a => !a.isRead).length;
      updateAppBadgeCount(unreadCount);

      // Déclenchement automatique de la notification push native pour l'alerte la plus récente non lue
      const urgentUnread = data.find(a => !a.isRead && a.priority === 'CRITIQUE');
      if (urgentUnread) {
        scheduleLocalNotification({
          title: `⚠️ Urgence: ${urgentUnread.title}`,
          body: urgentUnread.message,
          priority: 'CRITIQUE',
          seconds: 1,
        });
      }
    } catch (e) {
      console.error('Erreur chargement alertes:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    const unsubscribe = navigation.addListener('focus', () => {
      loadAlerts();
    });
    return unsubscribe;
  }, [navigation, loadAlerts]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  const handleMarkRead = async (alertId) => {
    const updated = await CacheService.markAlertAsRead(alertId);
    setAlerts(updated);
    const unreadCount = updated.filter(a => !a.isRead).length;
    updateAppBadgeCount(unreadCount);
    Toast.show({
      type: 'success',
      text1: 'Alerte marquée comme lue',
      position: 'bottom',
    });
  };

  const handleMarkAllRead = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}
    const updated = await CacheService.markAllAlertsAsRead();
    setAlerts(updated);
    updateAppBadgeCount(0);
    Toast.show({
      type: 'success',
      text1: 'Toutes les alertes sont marquées comme lues',
      position: 'bottom',
    });
  };

  const handlePressDetail = (alert) => {
    const parentNav = navigation.getParent() || navigation;

    if (alert.type === 'Stock') {
      parentNav.navigate('More', { screen: 'Stocks' });
    } else if (alert.type === 'Commande') {
      parentNav.navigate('Commandes');
    } else if (alert.chantierId) {
      parentNav.navigate('Chantiers', {
        screen: 'ChantierDetail',
        params: { id: alert.chantierId, nom: alert.chantierNom }
      });
    } else {
      parentNav.navigate('Dashboard');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'UNREAD') return !alert.isRead;
    if (activeFilter === 'CRITIQUE') return alert.priority === 'CRITIQUE';
    if (activeFilter === 'ALERTE') return alert.priority === 'ALERTE';
    if (activeFilter === 'INFO') return alert.priority === 'INFO';
    return true;
  });

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            Alertes & Urgences
          </Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.subtext }]}>
            {unreadCount > 0 ? `${unreadCount} alerte(s) non lue(s)` : 'Toutes les alertes sont traitées'}
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            style={[styles.markAllBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          >
            <CheckCheck size={16} color={themeColors.primary} />
            <Text style={[styles.markAllText, { color: themeColors.primary }]}>Tout lire</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTIONS}
          keyExtractor={item => item.key}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => {
            const isActive = activeFilter === item.key;
            return (
              <TouchableOpacity
                onPress={async () => {
                  try { await Haptics.selectionAsync(); } catch (e) {}
                  setActiveFilter(item.key);
                }}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive ? themeColors.primary : themeColors.card,
                    borderColor: isActive ? themeColors.primary : themeColors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? '#FFFFFF' : themeColors.subtext },
                  ]}
                >
                  {item.label}
                  {item.key === 'UNREAD' && unreadCount > 0 ? ` (${unreadCount})` : ''}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Alert List */}
      <FlatList
        data={filteredAlerts}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={themeColors.primary}
          />
        }
        renderItem={({ item }) => (
          <AlertCard
            alert={item}
            onMarkRead={handleMarkRead}
            onPressDetail={handlePressDetail}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ShieldAlert size={48} color={themeColors.subtext} opacity={0.3} />
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
              Aucune alerte trouvée
            </Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.subtext }]}>
              Tous vos chantiers et stocks sont sous contrôle.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterBar: {
    paddingVertical: 10,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});
