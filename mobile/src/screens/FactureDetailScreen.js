import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Download, Calendar, Building2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function FactureDetailScreen({ route, navigation }) {
  const { facture } = route.params || {};
  const { themeColors } = useTheme();

  const data = facture || {
    num_facture: 'FACT-2026-088',
    type: 'Fournisseur',
    montant_ht: 38000,
    tva: 7600,
    montant_ttc: 45600,
    statut: 'Payée',
    date_facture: '2026-07-28',
    date_echeance: '2026-08-28',
    chantierNom: 'Résidence Palmier'
  };

  const handleDownloadPdf = () => {
    Toast.show({ type: 'success', text1: 'Téléchargement de la facture PDF démarré...' });
  };

  return (
    <ScreenContainer
      headerTitle="Fiche Facture"
      showBack={true}
      scrollable={true}
      contentContainerStyle={styles.content}
    >
      {/* Main Card */}
      <Card style={{ marginBottom: 14 }}>
        <View style={styles.rowBetween}>
          <Text style={[styles.numFacture, { color: themeColors.text }]}>
            {data.num_facture || `FACT-#${data.id || '012'}`}
          </Text>
          <Badge label={data.statut || 'En attente'} type={data.statut === 'Payée' ? 'success' : 'danger'} />
        </View>

        <View style={styles.infoRow}>
          <Building2 size={16} color={themeColors.subtext} />
          <Text style={[styles.infoText, { color: themeColors.text }]}>
            Chantier: {data.chantier?.nom || data.chantierNom || 'Résidence Palmier'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={16} color={themeColors.subtext} />
          <Text style={[styles.infoText, { color: themeColors.subtext }]}>
            Échéance: {data.date_echeance || '28/08/2026'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={16} color={themeColors.subtext} />
          <Text style={[styles.infoText, { color: themeColors.subtext }]}>
            Émission: {data.date_facture || '2026-07-28'}
          </Text>
        </View>
      </Card>

      {/* Détails financiers */}
      <Card style={{ marginBottom: 14 }}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Décomposition Financière</Text>

        <View style={styles.financialRow}>
          <Text style={{ color: themeColors.subtext }}>Montant HT :</Text>
          <Text style={{ color: themeColors.text, fontWeight: '700' }}>
            {data.montant_ht ? `${data.montant_ht} MAD` : '38 000 MAD'}
          </Text>
        </View>

        <View style={styles.financialRow}>
          <Text style={{ color: themeColors.subtext }}>TVA (20%) :</Text>
          <Text style={{ color: themeColors.text, fontWeight: '700' }}>
            {data.tva ? `${data.tva} MAD` : '7 600 MAD'}
          </Text>
        </View>

        <View style={[styles.financialRow, { borderTopWidth: 1, borderTopColor: themeColors.border, paddingTop: 8, marginTop: 4 }]}>
          <Text style={{ color: themeColors.text, fontWeight: '800' }}>Total TTC :</Text>
          <Text style={{ color: themeColors.primary, fontWeight: '800', fontSize: 16 }}>
            {data.montant_ttc ? `${data.montant_ttc} MAD` : '45 600 MAD'}
          </Text>
        </View>

        {/* Action PDF */}
        <TouchableOpacity onPress={handleDownloadPdf} style={[styles.pdfBtn, { backgroundColor: '#0284C7' }]}>
          <Download size={18} color="#FFFFFF" />
          <Text style={styles.pdfBtnText}>Télécharger Facture PDF</Text>
        </TouchableOpacity>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  numFacture: { fontSize: 18, fontWeight: '800' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  infoText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  financialRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  breakdownBox: { padding: 12, borderRadius: 10, marginVertical: 12, gap: 6 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pdfBtn: { height: 44, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  pdfBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
