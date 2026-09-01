import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, ScrollView, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import api from '../api/axios';
import { Plus, Users, Phone, HardHat, X } from 'lucide-react-native';

export function OuvriersScreen({ navigation }) {
  const { themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [ouvriers, setOuvriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal creation
  const [modalVisible, setModalVisible] = useState(false);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [role, setRole] = useState('Ouvrier'); // Maçon, Électricien, Chef de chantier...
  const [telephone, setTelephone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOuvriers = async () => {
    try {
      const response = await api.get('/ouvriers');
      setOuvriers(response.data || []);
    } catch (e) {
      console.error('Erreur chargement ouvriers:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOuvriers();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOuvriers();
  }, []);

  const handleCreate = async () => {
    if (!nom || !prenom) {
      Alert.alert('Champs requis', 'Veuillez renseigner le nom et le prénom de l\'ouvrier.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/ouvriers', { nom, prenom, role, telephone, statut: 'Actif' });
      setModalVisible(false);
      setNom('');
      setPrenom('');
      setRole('Ouvrier');
      setTelephone('');
      fetchOuvriers();
    } catch (e) {
      console.error('Erreur création ouvrier:', e);
      Alert.alert('Erreur', 'Échec lors de l\'ajout de l\'ouvrier.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCall = (tel) => {
    if (tel) Linking.openURL(`tel:${tel}`);
  };

  return (
    <ScreenContainer headerTitle="Équipe & Ouvriers" showBack={true}>
      <View style={styles.topBar}>
        <Text style={[styles.subTitle, { color: themeColors.textSecondary }]}>
          Gestion du personnel du chantier
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: themeColors.primary }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={ouvriers}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: 30 + insets.bottom }]}
        ListEmptyComponent={
          !loading && (
            <Card style={styles.emptyCard}>
              <Text style={{ color: themeColors.textSecondary, textAlign: 'center' }}>
                Aucun ouvrier enregistré.
              </Text>
            </Card>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('OuvrierDetail', { ouvrier: item })}>
            <Card>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: themeColors.primaryBackground }]}>
                  <HardHat size={22} color={themeColors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.name, { color: themeColors.text }]}>
                    {item.prenom} {item.nom}
                  </Text>
                  <Text style={[styles.role, { color: themeColors.textSecondary }]}>
                    Spécialité: {item.role || item.specialite || 'Polyvalent'}
                  </Text>
                </View>
                <Badge label={item.statut || 'Actif'} type="success" />
              </View>

              <View style={styles.cardFooter}>
                {item.telephone ? (
                  <TouchableOpacity
                    onPress={() => handleCall(item.telephone)}
                    style={[styles.callBtn, { backgroundColor: themeColors.successBg }]}
                  >
                    <Phone size={14} color={themeColors.success} style={{ marginRight: 6 }} />
                    <Text style={{ color: themeColors.success, fontSize: 13, fontWeight: '600' }}>
                      Appeler {item.telephone}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: themeColors.textMuted, fontSize: 12 }}>Sans téléphone</Text>
                )}
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* Modal Nouvel Ouvrier */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Nouvel Ouvrier</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Input label="Prénom *" value={prenom} onChangeText={setPrenom} placeholder="Ex: Jean" />
              <Input label="Nom *" value={nom} onChangeText={setNom} placeholder="Ex: Martin" />
              <Input label="Spécialité / Rôle" value={role} onChangeText={setRole} placeholder="Ex: Chef de chantier, Maçon..." />
              <Input label="Téléphone" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" placeholder="Ex: 06 98 76 54 32" />
            </ScrollView>

            <Button
              title="Ajouter à l'Équipe"
              onPress={handleCreate}
              loading={submitting}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
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
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  role: {
    fontSize: 13,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
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
