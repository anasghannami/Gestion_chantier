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
import { Plus, Search, MapPin, Calendar, DollarSign, X } from 'lucide-react-native';

export function ChantiersScreen({ navigation }) {
  const { themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal création
  const [modalVisible, setModalVisible] = useState(false);
  const [nom, setNom] = useState('');
  const [client, setClient] = useState('');
  const [adresse, setAdresse] = useState('');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchChantiers = async () => {
    try {
      const response = await api.get('/chantiers');
      setChantiers(response.data || []);
    } catch (e) {
      console.error('Erreur chargement chantiers:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChantiers();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChantiers();
  }, []);

  const handleCreate = async () => {
    if (!nom || !client) {
      Alert.alert('Champs requis', 'Veuillez renseigner le nom du chantier et le nom du client.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/chantiers', {
        nom,
        client,
        adresse,
        budget: budget ? parseFloat(budget) : 0,
        statut: 'En cours'
      });

      setModalVisible(false);
      setNom('');
      setClient('');
      setAdresse('');
      setBudget('');
      fetchChantiers();
    } catch (e) {
      console.error('Erreur création chantier:', e);
      Alert.alert('Erreur', 'Impossible de créer le chantier.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredChantiers = chantiers.filter(c =>
    (c.nom && c.nom.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.client && c.client.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ScreenContainer headerTitle="Chantiers" hasTabBar={true}>
      {/* Top Search and Add Action */}
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Input
            placeholder="Rechercher un chantier..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: themeColors.primary }]}
          onPress={() => navigation.navigate('ChantierForm')}
          activeOpacity={0.8}
        >
          <Plus size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredChantiers}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: 80 + insets.bottom }]}
        ListEmptyComponent={
          !loading && (
            <Card style={styles.emptyCard}>
              <Text style={{ color: themeColors.textSecondary, textAlign: 'center' }}>
                Aucun chantier trouvé.
              </Text>
            </Card>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ChantierDetail', { id: item.id })}
          >
            <Card>
              <View style={styles.cardHeader}>
                <Text style={[styles.title, { color: themeColors.text }]}>{item.nom}</Text>
                <Badge
                  label={item.statut || 'En cours'}
                  type={item.statut === 'Terminé' ? 'success' : 'primary'}
                />
              </View>

              <Text style={[styles.client, { color: themeColors.textSecondary }]}>
                Client: {item.client || 'N/A'}
              </Text>

              {item.adresse ? (
                <View style={styles.iconRow}>
                  <MapPin size={16} color={themeColors.textMuted} />
                  <Text style={[styles.iconText, { color: themeColors.textSecondary }]}>
                    {item.adresse}
                  </Text>
                </View>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={[styles.budgetText, { color: themeColors.primary }]}>
                  {item.budget ? `${item.budget} €` : 'Budget N/A'}
                </Text>
                <Text style={[styles.dateText, { color: themeColors.textMuted }]}>
                  {item.date_debut ? new Date(item.date_debut).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* Modal Nouveau Chantier */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Nouveau Chantier</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Input label="Nom du chantier *" value={nom} onChangeText={setNom} placeholder="Ex: Résidence Les Pins" />
              <Input label="Client *" value={client} onChangeText={setClient} placeholder="Ex: M. Dupont" />
              <Input label="Adresse" value={adresse} onChangeText={setAdresse} placeholder="Ex: 12 Rue de la Paix" />
              <Input label="Budget (€)" value={budget} onChangeText={setBudget} keyboardType="numeric" placeholder="Ex: 45000" />
            </ScrollView>

            <Button
              title="Créer le Chantier"
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchWrap: {
    flex: 1,
    marginRight: 10,
  },
  searchInput: {
    marginVertical: 0,
  },
  addBtn: {
    width: 48,
    height: 48,
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
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  client: {
    fontSize: 14,
    marginBottom: 8,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 13,
    marginLeft: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  budgetText: {
    fontSize: 15,
    fontWeight: '700',
  },
  dateText: {
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
