import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import api from '../api/axios';
import { Boxes, AlertTriangle, ArrowUpRight, ArrowDownLeft, Plus, RefreshCw } from 'lucide-react-native';

export function StocksScreen({ navigation }) {
  const { themeColors } = useTheme();
  const [materiaux, setMateriaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStocks = async () => {
    try {
      const res = await api.get('/stocks').catch(() => ({ data: [] }));
      setMateriaux(res.data || []);
    } catch (e) {
      console.error('Erreur chargement stocks:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStocks();
  }, []);

  const alertesCount = materiaux.filter(m => m.statut_stock === 'Rupture' || m.statut_stock === 'Alerte Stock Bas').length;

  const handleMouvement = async (materiauId, typeMouvement) => {
    Alert.prompt(
      `${typeMouvement} de Stock`,
      `Entrez la quantité (${typeMouvement === 'Sortie' ? 'retirée' : 'ajoutée'}) :`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Valider',
          onPress: async (val) => {
            const qte = parseFloat(val);
            if (isNaN(qte) || qte <= 0) {
              Alert.alert('Erreur', 'Veuillez saisir une quantité valide.');
              return;
            }
            try {
              await api.post('/stocks/mouvements', {
                materiau_id: materiauId,
                type_mouvement: typeMouvement,
                quantite: qte,
                motif: `Saisie mobile terrain (${typeMouvement})`
              });
              Alert.alert('Succès', `Mouvement de stock enregistré.`);
              fetchStocks();
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors du mouvement de stock');
            }
          }
        }
      ],
      'plain-text',
      '10'
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerLoading, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header title="Stocks & Matériaux" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />
        }
      >
        {/* Banner Alert if stock low */}
        {alertesCount > 0 && (
          <Card style={[styles.alertBanner, { backgroundColor: themeColors.dangerBg, borderColor: themeColors.danger }]}>
            <View style={styles.alertRow}>
              <AlertTriangle size={24} color={themeColors.danger} />
              <View style={styles.alertTextWrap}>
                <Text style={[styles.alertTitle, { color: themeColors.danger }]}>
                  {alertesCount} Article(s) en Alerte de Stock !
                </Text>
                <Text style={[styles.alertSub, { color: themeColors.textSecondary }]}>
                  Réapprovisionnement recommandé pour éviter les arrêts de chantier.
                </Text>
              </View>
            </View>
          </Card>
        )}

        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Catalogue des Matériaux ({materiaux.length})
        </Text>

        {materiaux.map((item) => {
          const isAlerte = item.statut_stock === 'Rupture' || item.statut_stock === 'Alerte Stock Bas';
          const isRupture = item.statut_stock === 'Rupture';

          return (
            <TouchableOpacity key={item.id} onPress={() => navigation.navigate('StockDetail', { article: item })}>
              <Card style={styles.matCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.matInfo}>
                    <Text style={[styles.matCode, { color: themeColors.primary }]}>{item.code_article}</Text>
                    <Text style={[styles.matName, { color: themeColors.text }]}>{item.designation}</Text>
                    <Text style={[styles.matSub, { color: themeColors.textSecondary }]}>
                      {item.categorie} • {item.emplacement || 'Dépôt'}
                    </Text>
                  </View>
                  <Badge
                    label={item.statut_stock || 'Normal'}
                    type={isRupture ? 'danger' : isAlerte ? 'warning' : 'success'}
                  />
                </View>

                <View style={[styles.stockRow, { backgroundColor: themeColors.cardBorder }]}>
                  <View>
                    <Text style={[styles.stockLabel, { color: themeColors.textSecondary }]}>Quantité en Stock</Text>
                    <Text style={[styles.stockValue, { color: isAlerte ? themeColors.danger : themeColors.text }]}>
                      {item.quantite_stock} {item.unite}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.stockLabel, { color: themeColors.textSecondary }]}>Seuil Alerte</Text>
                    <Text style={[styles.stockLabelVal, { color: themeColors.textSecondary }]}>
                      {item.seuil_alerte} {item.unite}
                    </Text>
                  </View>
                </View>

                {/* Quick Action Buttons for Field Movement */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.btnAction, { backgroundColor: themeColors.successBg }]}
                    onPress={() => handleMouvement(item.id, 'Entrée')}
                  >
                    <ArrowDownLeft size={16} color={themeColors.success} />
                    <Text style={[styles.btnActionText, { color: themeColors.success }]}>+ Entrée</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnAction, { backgroundColor: themeColors.dangerBg }]}
                    onPress={() => handleMouvement(item.id, 'Sortie')}
                  >
                    <ArrowUpRight size={16} color={themeColors.danger} />
                    <Text style={[styles.btnActionText, { color: themeColors.danger }]}>- Sortie</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  alertBanner: {
    borderWidth: 1,
    marginBottom: 16,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTextWrap: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  alertSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  matCard: {
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  matInfo: {
    flex: 1,
    paddingRight: 8,
  },
  matCode: {
    fontSize: 12,
    fontWeight: '600',
  },
  matName: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  matSub: {
    fontSize: 12,
    marginTop: 2,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  stockLabel: {
    fontSize: 11,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  stockLabelVal: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  btnActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
