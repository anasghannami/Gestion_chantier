import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import api from '../api/axios';
import { Plus, X } from 'lucide-react-native';

export function FacturesScreen({ navigation }) {
  const { themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal creation
  const [modalVisible, setModalVisible] = useState(false);
  const [numero, setNumero] = useState('');
  const [montant, setMontant] = useState('');
  const [type, setType] = useState('Client'); // Client ou Fournisseur
  const [submitting, setSubmitting] = useState(false);

  const fetchFactures = async () => {
    try {
      const response = await api.get('/factures');
      setFactures(response.data || []);
    } catch (e) {
      console.error('Erreur chargement factures:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFactures();
  }, []);

  const handleCreate = async () => {
    if (!numero || !montant) {
      Alert.alert('Champs requis', 'Veuillez renseigner le numéro et le montant.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/factures', {
        numero,
        montant: parseFloat(montant) || 0,
        type,
        statut: 'En attente'
      });

      setModalVisible(false);
      setNumero('');
      setMontant('');
      fetchFactures();
    } catch (e) {
      console.error('Erreur création facture:', e);
      Alert.alert('Erreur', 'Échec lors de la création de la facture.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (factId, newStatut) => {
    try {
      await api.put(`/factures/${factId}`, { statut: newStatut });
      setFactures(prev => prev.map(f => f.id === factId ? { ...f, statut: newStatut } : f));
    } catch (e) {
      console.error('Erreur MAJ statut facture:', e);
    }
  };

  return (
    <ScreenContainer headerTitle="Factures & Règlement" showBack={true}>
      <View style={styles.topBar}>
        <Text style={[styles.subTitle, { color: themeColors.textSecondary }]}>
          Facturation clients & fournisseurs
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
        data={factures}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: 30 + insets.bottom }]}
        ListEmptyComponent={
          !loading && (
            <Card style={styles.emptyCard}>
              <Text style={{ color: themeColors.textSecondary, textAlign: 'center' }}>
                Aucune facture répertoriée.
              </Text>
            </Card>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('FactureDetail', { facture: item })}>
            <Card>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.numero, { color: themeColors.text }]}>
                    Facture #{item.numero || item.num_facture || item.id}
                  </Text>
                  <Text style={[styles.typeText, { color: themeColors.textSecondary }]}>
                    Type: {item.type || 'Fournisseur'}
                  </Text>
                </View>
                <Badge
                  label={item.statut || 'En attente'}
                  type={item.statut === 'Payée' || item.statut === 'PAYEE' ? 'success' : 'warning'}
                />
              </View>

              <View style={styles.cardFooter}>
                <Text style={[styles.amount, { color: themeColors.primary }]}>
                  {item.montant || item.montant_ttc ? `${item.montant || item.montant_ttc} MAD` : '0 MAD'}
                </Text>

                <TouchableOpacity
                  onPress={() => handleToggleStatut(item.id, item.statut)}
                  style={[
                    styles.statusToggleBtn,
                    {
                      backgroundColor: item.statut === 'Payée' ? themeColors.warningBg : themeColors.successBg,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: item.statut === 'Payée' ? themeColors.warning : themeColors.success,
                      fontSize: 12,
                      fontWeight: '700',
                    }}
                  >
                    {item.statut === 'Payée' ? 'Marquer En attente' : 'Marquer Payée'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* Modal Créer Facture */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Nouvelle Facture</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Input label="Numéro de Facture *" value={numero} onChangeText={setNumero} placeholder="Ex: FAC-2024-001" />
              <Input label="Montant Total (€) *" value={montant} onChangeText={setMontant} keyboardType="numeric" placeholder="Ex: 12500" />
            </ScrollView>

            <Button
              title="Enregistrer Facture"
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  numero: {
    fontSize: 16,
    fontWeight: '700',
  },
  typeText: {
    fontSize: 13,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
  },
  statusToggleBtn: {
    paddingHorizontal: 12,
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
