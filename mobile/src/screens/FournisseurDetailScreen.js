import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Truck, Phone, Mail, MapPin, ShoppingBag } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function FournisseurDetailScreen({ route, navigation }) {
  const { fournisseur } = route.params || {};
  const { themeColors } = useTheme();

  const data = fournisseur || {
    raison_sociale: 'SOFADEX Matériaux',
    contact_referent: 'M. Alami',
    telephone: '06 61 23 45 67',
    email: 'contact@sofadex.ma',
    adresse: 'Zone Industrielle Ain Sebaâ, Casablanca',
    code_fournisseur: 'FRN-001'
  };

  const handleCall = async () => {
    try { await Haptics.selectionAsync(); } catch (e) {}
    if (data.telephone) Linking.openURL(`tel:${data.telephone}`);
  };

  const handleEmail = async () => {
    try { await Haptics.selectionAsync(); } catch (e) {}
    if (data.email) Linking.openURL(`mailto:${data.email}`);
  };

  return (
    <ScreenContainer
      headerTitle="Fiche Fournisseur"
      showBack={true}
      scrollable={true}
      contentContainerStyle={styles.content}
    >
      {/* Profile Card */}
      <Card style={{ marginBottom: 14 }}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: themeColors.primaryBackground }]}>
            <Truck size={28} color={themeColors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.name, { color: themeColors.text }]}>{data.raison_sociale || data.nom}</Text>
            <Text style={{ color: themeColors.subtext, fontSize: 12 }}>Réf: {data.code_fournisseur || 'FRN-001'}</Text>
          </View>
          <Badge label="Partenaire" type="success" />
        </View>

        {data.contact_referent || data.contact ? (
          <View style={styles.infoRow}>
            <Text style={[styles.infoText, { color: themeColors.text }]}>
              Contact: {data.contact_referent || data.contact}
            </Text>
          </View>
        ) : null}

        {data.adresse ? (
          <View style={styles.infoRow}>
            <MapPin size={16} color={themeColors.subtext} />
            <Text style={[styles.infoText, { color: themeColors.subtext, marginLeft: 6 }]}>{data.adresse}</Text>
          </View>
        ) : null}

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          {data.telephone ? (
            <TouchableOpacity onPress={handleCall} style={[styles.actionBtn, { backgroundColor: themeColors.successBg }]}>
              <Phone size={16} color={themeColors.success} />
              <Text style={[styles.actionText, { color: themeColors.success }]}>Appeler</Text>
            </TouchableOpacity>
          ) : null}

          {data.email ? (
            <TouchableOpacity onPress={handleEmail} style={[styles.actionBtn, { backgroundColor: themeColors.infoBg }]}>
              <Mail size={16} color={themeColors.info} />
              <Text style={[styles.actionText, { color: themeColors.info }]}>Email</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </Card>

      {/* Historique des Commandes */}
      <Card>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Historique des Livraisons</Text>

        <View style={[styles.orderItem, { borderBottomColor: themeColors.border }]}>
          <ShoppingBag size={18} color={themeColors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.orderTitle, { color: themeColors.text }]}>Livraison Fer à Béton (2.5T)</Text>
            <Text style={{ fontSize: 11, color: themeColors.subtext }}>CMD-#104 • 24 500 MAD • Validé</Text>
          </View>
        </View>

        <View style={styles.orderItem}>
          <ShoppingBag size={18} color={themeColors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.orderTitle, { color: themeColors.text }]}>Livraison Ciment CPJ 45 (120 sacs)</Text>
            <Text style={{ fontSize: 11, color: themeColors.subtext }}>CMD-#098 • 7 800 MAD • Livré</Text>
          </View>
        </View>
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
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  companyName: { fontSize: 17, fontWeight: '800' },
  code: { fontSize: 12, marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBtn: { flex: 1, height: 42, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  orderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5 },
  orderTitle: { fontSize: 13, fontWeight: '700' },
});
