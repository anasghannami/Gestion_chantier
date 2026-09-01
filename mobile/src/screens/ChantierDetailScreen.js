import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert, Image
} from 'react-native';
import {
  MapPin, User, Calendar, DollarSign, ArrowLeft, Edit3,
  Package, FileText, Users, Image as ImageIcon, Plus, Phone
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import api from '../api/axios';

const TABS = [
  { key: 'INFOS', label: 'Infos' },
  { key: 'COMMANDES', label: 'Commandes' },
  { key: 'FACTURES', label: 'Factures' },
  { key: 'EQUIPE', label: 'Équipe' },
  { key: 'PHOTOS', label: 'Photos' },
  { key: 'DOCS', label: 'Documents' },
];

export function ChantierDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { themeColors } = useTheme();

  const [chantier, setChantier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('INFOS');
  const [commandes, setCommandes] = useState([]);
  const [factures, setFactures] = useState([]);
  const [ouvriers, setOuvriers] = useState([]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const [resChantier, resCmds, resFacts, resOuvs] = await Promise.all([
        api.get(`/chantiers/${id}`),
        api.get('/commandes').catch(() => ({ data: [] })),
        api.get('/factures').catch(() => ({ data: [] })),
        api.get('/ouvriers').catch(() => ({ data: [] })),
      ]);

      setChantier(resChantier.data);
      
      const allCmds = Array.isArray(resCmds.data) ? resCmds.data : [];
      setCommandes(allCmds.filter(c => String(c.chantier_id) === String(id)));

      const allFacts = Array.isArray(resFacts.data) ? resFacts.data : [];
      setFactures(allFacts.filter(f => String(f.chantier_id) === String(id)));

      const allOuvs = Array.isArray(resOuvs.data) ? resOuvs.data : [];
      setOuvriers(allOuvs.filter(o => String(o.chantier_id) === String(id)));
    } catch (e) {
      console.error('Erreur chargement chantier detail:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleTabChange = async (tabKey) => {
    try { await Haptics.selectionAsync(); } catch (e) {}
    setActiveTab(tabKey);
  };

  if (loading) {
    return (
      <ScreenContainer showBack={true}>
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!chantier) {
    return (
      <ScreenContainer showBack={true}>
        <Card style={{ margin: 20 }}>
          <Text style={{ color: themeColors.text, textAlign: 'center' }}>Chantier non trouvé.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
            <Text style={{ color: themeColors.primary, textAlign: 'center' }}>Retour</Text>
          </TouchableOpacity>
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      headerTitle={chantier.nom}
      showBack={true}
      rightAction={
        <TouchableOpacity
          onPress={() => navigation.navigate('ChantierForm', { chantier })}
          style={styles.editBtn}
        >
          <Edit3 size={20} color={themeColors.primary} />
        </TouchableOpacity>
      }
    >

      {/* Internal Segmented Tab Bar */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleTabChange(tab.key)}
                style={[
                  styles.tabPill,
                  {
                    backgroundColor: isActive ? themeColors.primary : themeColors.card,
                    borderColor: isActive ? themeColors.primary : themeColors.border,
                  },
                ]}
              >
                <Text style={[styles.tabText, { color: isActive ? '#FFFFFF' : themeColors.subtext }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* TAB INFOS */}
        {activeTab === 'INFOS' && (
          <View style={styles.tabContent}>
            <Card style={{ marginBottom: 12 }}>
              <View style={styles.rowBetween}>
                <Text style={[styles.cardTitle, { color: themeColors.text }]}>{chantier.nom}</Text>
                <Badge label={chantier.statut || 'En cours'} type={chantier.statut === 'Terminé' ? 'success' : 'primary'} />
              </View>

              <View style={styles.infoRow}>
                <User size={16} color={themeColors.subtext} />
                <Text style={[styles.infoText, { color: themeColors.text }]}>Client: {chantier.client || 'Client Privé'}</Text>
              </View>

              {chantier.adresse ? (
                <View style={styles.infoRow}>
                  <MapPin size={16} color={themeColors.subtext} />
                  <Text style={[styles.infoText, { color: themeColors.text }]}>{chantier.adresse}</Text>
                </View>
              ) : null}

              <View style={styles.infoRow}>
                <DollarSign size={16} color={themeColors.primary} />
                <Text style={[styles.infoText, { color: themeColors.primary, fontWeight: '700' }]}>
                  Budget: {chantier.budget ? `${chantier.budget} MAD` : 'Non renseigné'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Calendar size={16} color={themeColors.subtext} />
                <Text style={[styles.infoText, { color: themeColors.subtext }]}>
                  Début: {chantier.date_debut ? new Date(chantier.date_debut).toLocaleDateString('fr-FR') : 'N/A'}
                </Text>
              </View>

              {chantier.description ? (
                <View style={[styles.descBox, { backgroundColor: themeColors.background }]}>
                  <Text style={[styles.descTitle, { color: themeColors.text }]}>Description :</Text>
                  <Text style={[styles.descText, { color: themeColors.subtext }]}>{chantier.description}</Text>
                </View>
              ) : null}
            </Card>
          </View>
        )}

        {/* TAB COMMANDES */}
        {activeTab === 'COMMANDES' && (
          <View style={styles.tabContent}>
            {commandes.length === 0 ? (
              <Card><Text style={{ color: themeColors.subtext, textAlign: 'center' }}>Aucune commande liée à ce chantier.</Text></Card>
            ) : (
              commandes.map(cmd => (
                <Card key={cmd.id} style={{ marginBottom: 10 }}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.cardTitle, { color: themeColors.text }]}>{cmd.num_commande || `CMD-#${cmd.id}`}</Text>
                    <Badge label={cmd.statut || 'En attente'} type="warning" />
                  </View>
                  <Text style={{ color: themeColors.subtext, marginTop: 4 }}>Montant: {cmd.montant_total ? `${cmd.montant_total} MAD` : 'N/A'}</Text>
                </Card>
              ))
            )}
          </View>
        )}

        {/* TAB FACTURES */}
        {activeTab === 'FACTURES' && (
          <View style={styles.tabContent}>
            {factures.length === 0 ? (
              <Card><Text style={{ color: themeColors.subtext, textAlign: 'center' }}>Aucune facture enregistrée pour ce chantier.</Text></Card>
            ) : (
              factures.map(fact => (
                <Card key={fact.id} style={{ marginBottom: 10 }}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.cardTitle, { color: themeColors.text }]}>{fact.num_facture || `FACT-#${fact.id}`}</Text>
                    <Badge label={fact.statut || 'Non payée'} type={fact.statut === 'Payée' ? 'success' : 'danger'} />
                  </View>
                  <Text style={{ color: themeColors.subtext, marginTop: 4 }}>Montant: {fact.montant_ttc ? `${fact.montant_ttc} MAD` : 'N/A'}</Text>
                </Card>
              ))
            )}
          </View>
        )}

        {/* TAB EQUIPE */}
        {activeTab === 'EQUIPE' && (
          <View style={styles.tabContent}>
            {ouvriers.length === 0 ? (
              <Card><Text style={{ color: themeColors.subtext, textAlign: 'center' }}>Aucun membre affecté à ce chantier.</Text></Card>
            ) : (
              ouvriers.map(ouv => (
                <Card key={ouv.id} style={{ marginBottom: 10 }}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.cardTitle, { color: themeColors.text }]}>{ouv.nom} {ouv.prenom}</Text>
                    <Badge label={ouv.specialite || 'Ouvrier'} type="primary" />
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* TAB PHOTOS */}
        {activeTab === 'PHOTOS' && (
          <View style={styles.tabContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.cardTitle, { color: themeColors.text }]}>Photos d'Avancement Chantier</Text>
              <TouchableOpacity
                onPress={() => Toast.show({ type: 'success', text1: 'Photo ajoutée avec succès !' })}
                style={{ backgroundColor: '#3b82f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
              >
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>+ Ajouter Photo</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <Card style={{ width: '48%', padding: 8 }}>
                <View style={{ height: 110, backgroundColor: themeColors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={32} color={themeColors.subtext} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: themeColors.text, marginTop: 6 }}>Coulage Béton Plancher</Text>
                <Text style={{ fontSize: 10, color: themeColors.subtext }}>Avancement: 45% • Aujourd'hui</Text>
              </Card>

              <Card style={{ width: '48%', padding: 8 }}>
                <View style={{ height: 110, backgroundColor: themeColors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={32} color={themeColors.subtext} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: themeColors.text, marginTop: 6 }}>Pose Armatures Fer</Text>
                <Text style={{ fontSize: 10, color: themeColors.subtext }}>Avancement: 30% • Hier</Text>
              </Card>
            </View>
          </View>
        )}

        {/* TAB DOCUMENTS */}
        {activeTab === 'DOCS' && (
          <View style={styles.tabContent}>
            <Text style={[styles.cardTitle, { color: themeColors.text, marginBottom: 12 }]}>Documents du Chantier</Text>
            
            <Card style={{ marginBottom: 10 }}>
              <View style={styles.rowBetween}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <FileText size={22} color="#0284C7" />
                  <View>
                    <Text style={[styles.cardTitle, { color: themeColors.text }]}>Permis_de_Construire.pdf</Text>
                    <Text style={{ color: themeColors.subtext, fontSize: 11 }}>PDF • 2.4 MB • Modifié le 15 Jan</Text>
                  </View>
                </View>
                <Badge label="Validé" type="success" />
              </View>
            </Card>

            <Card style={{ marginBottom: 10 }}>
              <View style={styles.rowBetween}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <FileText size={22} color="#F59E0B" />
                  <View>
                    <Text style={[styles.cardTitle, { color: themeColors.text }]}>Plan_Architecte_v2.dwg</Text>
                    <Text style={{ color: themeColors.subtext, fontSize: 11 }}>CAD • 14.8 MB • Modifié le 02 Fév</Text>
                  </View>
                </View>
                <Badge label="Plan" type="primary" />
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
      <FloatingActionButton
        onPress={() => Toast.show({ type: 'info', text1: 'Prise de photo / note activée' })}
      />
    </ScreenContainer>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  editBtn: {
    padding: 4,
  },
  tabContainer: {
    paddingVertical: 10,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  tabContent: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
  },
  descBox: {
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  descTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  descText: {
    fontSize: 12,
    lineHeight: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
