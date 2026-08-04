import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import api from '../api/axios';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Building2 } from 'lucide-react-native';

export function PlanningScreen() {
  const { themeColors, isDarkMode } = useTheme();
  const [taches, setTaches] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlanning = async () => {
    try {
      setLoading(true);
      const [tachesRes, chantiersRes] = await Promise.all([
        api.get('/taches').catch(() => ({ data: [] })),
        api.get('/chantiers').catch(() => ({ data: [] })),
      ]);

      setTaches(Array.isArray(tachesRes.data) ? tachesRes.data : []);
      setChantiers(Array.isArray(chantiersRes.data) ? chantiersRes.data : []);
    } catch (e) {
      console.error('Erreur chargement planning backend:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlanning();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPlanning();
  }, []);

  const getChantierNom = (chantierId) => {
    const c = chantiers.find(item => String(item.id) === String(chantierId));
    return c ? c.nom : 'Chantier Général';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Header title="Planning & Tâches (Base de Données)" />

      <View style={styles.subHeader}>
        <Text style={[styles.subTitle, { color: themeColors.textSecondary }]}>
          Suivi des tâches synchronisées en temps réel avec le Web
        </Text>
      </View>

      <FlatList
        data={taches}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && (
            <Card style={styles.emptyCard}>
              <Text style={{ color: themeColors.textSecondary, textAlign: 'center' }}>
                Aucune tâche enregistrée dans la base de données.
              </Text>
            </Card>
          )
        }
        renderItem={({ item }) => {
          const chantierNom = getChantierNom(item.chantier_id);
          const avancement = item.avancement !== undefined ? item.avancement : item.pourcentage_avancement || 0;

          return (
            <Card style={{ marginBottom: 12 }}>
              <View style={styles.cardHeader}>
                <View style={[styles.dateBadge, { backgroundColor: themeColors.primaryBackground }]}>
                  <Calendar size={15} color={themeColors.primary} />
                  <Text style={[styles.dateText, { color: themeColors.primary }]}>
                    {item.date_debut ? new Date(item.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : 'Planifié'}
                    {item.date_fin ? ` ➔ ${new Date(item.date_fin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}` : ''}
                  </Text>
                </View>
                <Badge
                  label={item.statut || 'En cours'}
                  type={item.statut === 'Terminé' || item.statut === 'Terminée' ? 'success' : item.statut === 'En retard' ? 'danger' : 'primary'}
                />
              </View>

              <Text style={[styles.title, { color: themeColors.text }]}>{item.nom}</Text>
              
              <View style={styles.iconRow}>
                <Building2 size={13} color={themeColors.primary} />
                <Text style={[styles.chantierText, { color: themeColors.primary }]}>
                  {chantierNom}
                </Text>
              </View>

              <View style={styles.progressRow}>
                <View style={[styles.progressBarBg, { backgroundColor: themeColors.border }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(100, Math.max(0, avancement))}%`, backgroundColor: avancement === 100 ? '#16A34A' : themeColors.primary }
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
                  {avancement}%
                </Text>
              </View>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  chantierText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    width: 35,
    textAlign: 'right',
  },
});
