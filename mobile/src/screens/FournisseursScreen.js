import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, ScrollView, Alert, Linking } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import api from '../api/axios';
import { Plus, Phone, Mail, MapPin, Truck, X } from 'lucide-react-native';

export function FournisseursScreen({ navigation }) {
  const { themeColors } = useTheme();
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal creation
  const [modalVisible, setModalVisible] = useState(false);
  const [nom, setNom] = useState('');
  const [contact, setContact] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFournisseurs = async () => {
    try {
      const response = await api.get('/fournisseurs');
      setFournisseurs(response.data || []);
    } catch (e) {
      console.error('Erreur chargement fournisseurs:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFournisseurs();
  }, []);

  const handleCreate = async () => {
    if (!nom) {
      Alert.alert('Champs requis', 'Veuillez saisir le nom du fournisseur.');
      return;
    }

    setSubmitting(true);
    try {
      const code_fournisseur = `FRN-${Math.floor(100 + Math.random() * 900)}`;
      await api.post('/fournisseurs', {
        code_fournisseur,
        raison_sociale: nom,
        nom,
        contact_referent: contact,
        contact,
        telephone,
        email,
      });
      setModalVisible(false);
      setNom('');
      setContact('');
      setTelephone('');
      setEmail('');
      fetchFournisseurs();
    } catch (e) {
      console.error('Erreur création fournisseur:', e);
      Alert.alert('Erreur', 'Échec lors de la création du fournisseur.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCall = (tel) => {
    if (tel) Linking.openURL(`tel:${tel}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header title="Fournisseurs" />

      <View style={styles.topBar}>
        <Text style={[styles.subTitle, { color: themeColors.textSecondary }]}>
          Annuaire des prestataires & matériaux
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: themeColors.primary }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={fournisseurs}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && (
            <Card style={styles.emptyCard}>
              <Text style={{ color: themeColors.textSecondary, textAlign: 'center' }}>
                Aucun fournisseur répertorié.
              </Text>
            </Card>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('FournisseurDetail', { fournisseur: item })}>
            <Card>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: themeColors.primaryBackground }]}>
                  <Truck size={22} color={themeColors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.title, { color: themeColors.text }]}>
                    {item.raison_sociale || item.nom || 'Fournisseur'}
                  </Text>
                  <Text style={[styles.contact, { color: themeColors.textSecondary }]}>
                    Contact: {item.contact_referent || item.contact || 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                {item.telephone ? (
                  <TouchableOpacity
                    onPress={() => handleCall(item.telephone)}
                    style={[styles.callBtn, { backgroundColor: themeColors.successBg }]}
                  >
                    <Phone size={14} color={themeColors.success} style={{ marginRight: 4 }} />
                    <Text style={{ color: themeColors.success, fontSize: 13, fontWeight: '600' }}>
                      {item.telephone}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {item.email ? (
                  <Text style={[styles.emailText, { color: themeColors.textMuted }]}>
                    {item.email}
                  </Text>
                ) : null}
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* Modal Nouveau Fournisseur */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Nouveau Fournisseur</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Input label="Nom de la société *" value={nom} onChangeText={setNom} placeholder="Ex: Point P Matériaux" />
              <Input label="Nom du contact" value={contact} onChangeText={setContact} placeholder="Ex: M. Bernard" />
              <Input label="Téléphone" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" placeholder="Ex: 06 12 34 56 78" />
              <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="Ex: contact@pointp.fr" />
            </ScrollView>

            <Button
              title="Ajouter Fournisseur"
              onPress={handleCreate}
              loading={submitting}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  contact: {
    fontSize: 13,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  emailText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});
