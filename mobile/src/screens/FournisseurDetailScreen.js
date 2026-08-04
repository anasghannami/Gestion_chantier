import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, SafeAreaView, StatusBar } from 'react-native';
import { ArrowLeft, Truck, Phone, Mail, MapPin, Package, ShoppingBag } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function FournisseurDetailScreen({ route, navigation }) {
  const { fournisseur } = route.params || {};
  const { themeColors, isDarkMode } = useTheme();

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
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          Fiche Fournisseur
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <Card style={{ marginBottom: 14 }}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: '#0284C720' }]}>
              <Truck size={28} color="#0284C7" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.companyName, { color: themeColors.text }]}>
                {data.raison_sociale || data.nom}
              </Text>
              <Text style={[styles.code, { color: themeColors.subtext }]}>
                {data.code_fournisseur || 'Fournisseur Agréé'}
              </Text>
            </View>
            <Badge label="Partenaire" type="success" />
          </View>

          {data.contact_referent || data.contact ? (
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: themeColors.subtext }}>Contact Référent :</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: themeColors.text, marginLeft: 6 }}>
                {data.contact_referent || data.contact}
              </Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            {data.telephone ? (
              <TouchableOpacity onPress={handleCall} style={[styles.actionBtn, { backgroundColor: '#16A34A' }]}>
                <Phone size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Appeler</Text>
              </TouchableOpacity>
            ) : null}

            {data.email ? (
              <TouchableOpacity onPress={handleEmail} style={[styles.actionBtn, { backgroundColor: '#0284C7' }]}>
                <Mail size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Email</Text>
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
