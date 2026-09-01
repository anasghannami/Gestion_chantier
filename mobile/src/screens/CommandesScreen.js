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
import { Plus, ShoppingBag, Truck, Calendar, DollarSign, X } from 'lucide-react-native';

export function CommandesScreen({ navigation }) {
  const { themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [commandes, setCommandes] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal création
  const [modalVisible, setModalVisible] = useState(false);
  const [article, setArticle] = useState('');
  const [quantite, setQuantite] = useState('1');
  const [montant, setMontant] = useState('');
  const [selectedFournisseur, setSelectedFournisseur] = useState('');
  const [selectedChantier, setSelectedChantier] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [resCmd, resFourn, resChant] = await Promise.all([
        api.get('/commandes').catch(() => ({ data: [] })),
        api.get('/fournisseurs').catch(() => ({ data: [] })),
        api.get('/chantiers').catch(() => ({ data: [] })),
      ]);
      setCommandes(resCmd.data || []);
      setFournisseurs(resFourn.data || []);
      setChantiers(resChant.data || []);
    } catch (e) {
      console.error('Erreur chargement commandes:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!article || !montant) {
      Alert.alert('Champs requis', 'Veuillez renseigner l\'article et le montant.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/commandes', {
        article,
        quantite: parseInt(quantite) || 1,
        montant: parseFloat(montant) || 0,
        fournisseur_id: selectedFournisseur || null,
        chantier_id: selectedChantier || null,
        statut: 'En attente'
      });

      setModalVisible(false);
      setArticle('');
      setQuantite('1');
      setMontant('');
      fetchData();
    } catch (e) {
      console.error('Erreur création commande:', e);
      Alert.alert('Erreur', 'Échec lors de la création de la commande.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (cmdId, newStatut) => {
    try {
      await api.put(`/commandes/${cmdId}`, { statut: newStatut });
      setCommandes(prev => prev.map(c => c.id === cmdId ? { ...c, statut: newStatut } : c));
    } catch (e) {
      console.error('Erreur MAJ statut commande:', e);
    }
  };

  const getBadgeType = (statut) => {
    switch (statut) {
      case 'Livrée':
      case 'LIVREE':
        return 'success';
      case 'En attente':
      case 'EN_ATTENTE':
        return 'warning';
      case 'Annulée':
      case 'ANNULEE':
        return 'danger';
      default:
        return 'info';
    }
  };

  return (
    <ScreenContainer headerTitle="Commandes Matériaux" hasTabBar={true}>
      <View style={styles.topBar}>
        <Text style={[styles.subTitle, { color: themeColors.textSecondary }]}>
          Suivi des approvisionnements
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
        data={commandes}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: 80 + insets.bottom }]}
        ListEmptyComponent={
          !loading && (
            <Card style={styles.emptyCard}>
              <Text style={{ color: themeColors.textSecondary, textAlign: 'center' }}>
                Aucune commande enregistrée.
              </Text>
            </Card>
          )
        }
        renderItem={({ item }) => {
          const fournisseurNom =
            typeof item.fournisseur === 'object' && item.fournisseur !== null
              ? (item.fournisseur.raison_sociale || item.fournisseur.nom || item.fournisseur.code_fournisseur)
              : typeof item.fournisseur === 'string'
              ? item.fournisseur
              : item.Fournisseur?.nom || item.Fournisseur?.raison_sociale;

          return (
            <TouchableOpacity onPress={() => navigation.navigate('CommandeDetail', { commande: item })}>
              <Card>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: themeColors.text }]}>{item.article}</Text>
                  <Text style={[styles.details, { color: themeColors.textSecondary }]}>
                    Qté: {item.quantite || 1} • {fournisseurNom || 'Fournisseur direct'}
                  </Text>
                </View>
                <Badge label={item.statut || 'En attente'} type={getBadgeType(item.statut)} />
              </View>

            <View style={styles.cardFooter}>
              <Text style={[styles.amount, { color: themeColors.primary }]}>
                {item.montant ? `${item.montant} €` : '0 €'}
              </Text>
              
              {item.statut !== 'Livrée' && (
                <TouchableOpacity
                  onPress={() => handleStatusChange(item.id, 'Livrée')}
                  style={[styles.smallBtn, { backgroundColor: themeColors.successBg }]}
                >
                  <Text style={{ color: themeColors.success, fontSize: 12, fontWeight: '700' }}>
                    Marquer Livrée
                  </Text>
                </TouchableOpacity>
              )}
            </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />

      {/* Modal Créer Commande */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Nouvelle Commande</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Input label="Article / Matériau *" value={article} onChangeText={setArticle} placeholder="Ex: Ciment 32.5 R (50 sacs)" />
              <Input label="Quantité *" value={quantite} onChangeText={setQuantite} keyboardType="numeric" />
              <Input label="Montant (€) *" value={montant} onChangeText={setMontant} keyboardType="numeric" placeholder="Ex: 450" />
            </ScrollView>

            <Button
              title="Valider la Commande"
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
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  details: {
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
    fontSize: 17,
    fontWeight: '800',
  },
  smallBtn: {
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
