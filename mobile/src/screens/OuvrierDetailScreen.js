import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, SafeAreaView, StatusBar } from 'react-native';
import { ArrowLeft, HardHat, Phone, Building2, Calendar, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function OuvrierDetailScreen({ route, navigation }) {
  const { ouvrier } = route.params || {};
  const { themeColors, isDarkMode } = useTheme();

  const data = ouvrier || {
    nom: 'Chakir',
    prenom: 'Hassan',
    role: 'Chef Maçon',
    specialite: 'Gros Œuvre & Béton Armé',
    telephone: '06 98 76 54 32',
    statut: 'Actif',
    chantierNom: 'Résidence Palmier'
  };

  const handleCall = async () => {
    try { await Haptics.selectionAsync(); } catch (e) {}
    if (data.telephone) Linking.openURL(`tel:${data.telephone}`);
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
          Fiche Ouvrier
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <Card style={{ marginBottom: 14 }}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: '#F59E0B20' }]}>
              <HardHat size={28} color="#F59E0B" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.name, { color: themeColors.text }]}>
                {data.prenom} {data.nom}
              </Text>
              <Text style={[styles.role, { color: themeColors.subtext }]}>
                {data.role || data.specialite || 'Polyvalent'}
              </Text>
            </View>
            <Badge label={data.statut || 'Actif'} type="success" />
          </View>

          <View style={styles.infoRow}>
            <Building2 size={16} color={themeColors.primary} />
            <Text style={[styles.infoText, { color: themeColors.text }]}>
              Chantier Actuel: {data.chantier?.nom || data.chantierNom || 'Résidence Palmier'}
            </Text>
          </View>

          {data.telephone ? (
            <TouchableOpacity onPress={handleCall} style={[styles.callBtn, { backgroundColor: '#16A34A', marginTop: 12 }]}>
              <Phone size={16} color="#FFFFFF" />
              <Text style={styles.callBtnText}>Appeler {data.telephone}</Text>
            </TouchableOpacity>
          ) : null}
        </Card>

        {/* Tâches attribuées */}
        <Card>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Tâches & Pointage</Text>

          <View style={[styles.taskRow, { borderBottomColor: themeColors.border }]}>
            <CheckCircle2 size={18} color="#16A34A" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.taskTitle, { color: themeColors.text }]}>Coffrage & Ferraillage voile B1</Text>
              <Text style={{ fontSize: 11, color: themeColors.subtext }}>Pointage effectué aujourd'hui à 08:00</Text>
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
  name: { fontSize: 18, fontWeight: '800' },
  role: { fontSize: 13, marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  infoText: { fontSize: 13, fontWeight: '600' },
  callBtn: { height: 42, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  callBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5 },
  taskTitle: { fontSize: 13, fontWeight: '700' },
});
