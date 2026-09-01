import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Package, Building2, Truck, Calendar, DollarSign, Clock, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import api from '../api/axios';

export function CommandeDetailScreen({ route, navigation }) {
  const { id, item } = route.params || {};
  const { themeColors } = useTheme();
  const [commande, setCommande] = useState(item || null);
  const [loading, setLoading] = useState(!item);

  useEffect(() => {
    if (id && !item) {
      api.get(`/commandes/${id}`)
        .then(res => setCommande(res.data))
        .catch(err => console.error('Erreur chargement commande:', err))
        .finally(() => setLoading(false));
    }
  }, [id, item]);

  if (loading) {
    return (
      <ScreenContainer showBack={true}>
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  const data = commande || item || {};

  return (
    <ScreenContainer
      headerTitle="Détails Commande"
      showBack={true}
      scrollable={true}
      contentContainerStyle={styles.content}
    >
        {/* Main Card */}
        <Card style={{ marginBottom: 14 }}>
          <View style={styles.rowBetween}>
            <Text style={[styles.numCommande, { color: themeColors.text }]}>
              {data.num_commande || `CMD-#${data.id || '001'}`}
            </Text>
            <Badge label={data.statut || 'En cours'} type="warning" />
          </View>

          <View style={styles.infoRow}>
            <Truck size={16} color={themeColors.primary} />
            <Text style={[styles.infoText, { color: themeColors.text }]}>
              Fournisseur: {data.fournisseur?.raison_sociale || data.fournisseurNom || 'Point P Matériaux'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Building2 size={16} color={themeColors.subtext} />
            <Text style={[styles.infoText, { color: themeColors.text }]}>
              Chantier: {data.chantier?.nom || data.chantierNom || 'Résidence Palmier'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <DollarSign size={16} color={themeColors.primary} />
            <Text style={[styles.infoText, { color: themeColors.primary, fontWeight: '800' }]}>
              Montant Total: {data.montant_total ? `${data.montant_total} MAD` : '48 500 MAD'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={16} color={themeColors.subtext} />
            <Text style={[styles.infoText, { color: themeColors.subtext }]}>
              Date Commande: {data.createdAt ? new Date(data.createdAt).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}
            </Text>
          </View>
        </Card>

        {/* Timeline Livraison */}
        <Card style={{ marginBottom: 14 }}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Historique & Livraison</Text>

          <View style={styles.timelineItem}>
            <CheckCircle2 size={18} color="#16A34A" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.timelineTitle, { color: themeColors.text }]}>Commande validée par le fournisseur</Text>
              <Text style={{ fontSize: 11, color: themeColors.subtext }}>Hier à 14:30</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <Clock size={18} color="#F59E0B" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.timelineTitle, { color: themeColors.text }]}>Expédition en cours d'acheminement</Text>
              <Text style={{ fontSize: 11, color: themeColors.subtext }}>Livraison prévue demain vers 10:00</Text>
            </View>
          </View>
        </Card>

        {/* Liste des articles */}
        <Card>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Articles Commandés</Text>
          <View style={[styles.articleRow, { borderBottomColor: themeColors.border }]}>
            <Text style={[styles.articleName, { color: themeColors.text }]}>Ciment CPJ 45 (Sacs 50kg)</Text>
            <Text style={[styles.articleQty, { color: themeColors.subtext }]}>100 Sacs</Text>
          </View>

          <View style={styles.articleRow}>
            <Text style={[styles.articleName, { color: themeColors.text }]}>Fer à Béton FeE500 Ø12mm</Text>
            <Text style={[styles.articleQty, { color: themeColors.subtext }]}>2.5 Tonnes</Text>
          </View>
        </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  content: { padding: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  numCommande: { fontSize: 18, fontWeight: '800' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  infoText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  timelineItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  timelineTitle: { fontSize: 13, fontWeight: '700' },
  articleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5 },
  articleName: { fontSize: 13, fontWeight: '600' },
  articleQty: { fontSize: 12, fontWeight: '700' },
});
