import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { ArrowLeft, Package, AlertTriangle, ArrowUpRight, ArrowDownLeft, MapPin, DollarSign } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function StockDetailScreen({ route, navigation }) {
  const { article } = route.params || {};
  const { themeColors, isDarkMode } = useTheme();

  const data = article || {
    code_article: 'MAT-001',
    designation: 'Sac de Ciment CPJ 45',
    categorie: 'Liants & Ciment',
    unite: 'Sac',
    quantite_stock: 120,
    seuil_alerte: 30,
    prix_unitaire_moyen: 65,
    emplacement: 'Dépôt principal'
  };

  const isAlerte = data.quantite_stock <= data.seuil_alerte;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          Fiche Article Stock
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Card */}
        <Card style={{ marginBottom: 14 }}>
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.avatar, { backgroundColor: '#0284C720' }]}>
                <Package size={24} color="#0284C7" />
              </View>
              <View>
                <Text style={[styles.code, { color: themeColors.primary }]}>{data.code_article}</Text>
                <Text style={[styles.title, { color: themeColors.text }]}>{data.designation}</Text>
              </View>
            </View>
            <Badge label={isAlerte ? 'Alerte Stock Bas' : 'Stock Normal'} type={isAlerte ? 'danger' : 'success'} />
          </View>

          {/* Quantités Grid */}
          <View style={styles.qtyGrid}>
            <View style={[styles.qtyBox, { backgroundColor: themeColors.background }]}>
              <Text style={[styles.qtyVal, { color: themeColors.text }]}>{data.quantite_stock}</Text>
              <Text style={{ fontSize: 11, color: themeColors.subtext }}>Stock Actuel ({data.unite})</Text>
            </View>

            <View style={[styles.qtyBox, { backgroundColor: themeColors.background }]}>
              <Text style={[styles.qtyVal, { color: '#F59E0B' }]}>{data.seuil_alerte}</Text>
              <Text style={{ fontSize: 11, color: themeColors.subtext }}>Seuil d'Alerte</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={16} color={themeColors.subtext} />
            <Text style={[styles.infoText, { color: themeColors.text }]}>Emplacement: {data.emplacement || 'Dépôt principal'}</Text>
          </View>

          <View style={styles.infoRow}>
            <DollarSign size={16} color={themeColors.primary} />
            <Text style={[styles.infoText, { color: themeColors.primary, fontWeight: '700' }]}>
              Prix Unitaire Moyen: {data.prix_unitaire_moyen ? `${data.prix_unitaire_moyen} MAD` : '65 MAD'}
            </Text>
          </View>
        </Card>

        {/* Historique des Mouvements */}
        <Card>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Derniers Mouvements de Stock</Text>

          <View style={[styles.mouvItem, { borderBottomColor: themeColors.border }]}>
            <ArrowUpRight size={18} color="#16A34A" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.mouvTitle, { color: themeColors.text }]}>Entrée Stock Initial (+50 sacs)</Text>
              <Text style={{ fontSize: 11, color: themeColors.subtext }}>Réapprovisionnement • 26 Juillet</Text>
            </View>
          </View>

          <View style={styles.mouvItem}>
            <ArrowDownLeft size={18} color="#EF4444" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.mouvTitle, { color: themeColors.text }]}>Sortie Chantier Résidence Palmier (-20 sacs)</Text>
              <Text style={{ fontSize: 11, color: themeColors.subtext }}>Consommation • 28 Juillet</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  avatar: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  code: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '800' },
  qtyGrid: { flexDirection: 'row', gap: 10, marginVertical: 12 },
  qtyBox: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  qtyVal: { fontSize: 22, fontWeight: '800' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  infoText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  mouvItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5 },
  mouvTitle: { fontSize: 13, fontWeight: '700' },
});
