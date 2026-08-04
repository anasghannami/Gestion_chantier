import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Building2, Package, FileText, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

export function QuickAddModal({ visible, onClose, onSelect }) {
  const { themeColors } = useTheme();

  const handleSelect = async (key) => {
    try {
      await Haptics.selectionAsync();
    } catch (e) {}
    onClose();
    onSelect(key);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: themeColors.card }]}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: themeColors.text }]}>Création Rapide</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={themeColors.subtext} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.subtitle, { color: themeColors.subtext }]}>
                Choisissez le type d'élément que vous souhaitez ajouter :
              </Text>

              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[styles.optionCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}
                  onPress={() => handleSelect('Chantier')}
                >
                  <View style={[styles.iconWrap, { backgroundColor: '#0284C720' }]}>
                    <Building2 size={22} color="#0284C7" />
                  </View>
                  <View style={styles.optionTextWrap}>
                    <Text style={[styles.optionTitle, { color: themeColors.text }]}>Nouveau Chantier</Text>
                    <Text style={[styles.optionDesc, { color: themeColors.subtext }]}>Créer une fiche projet avec dates, budget et client</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}
                  onPress={() => handleSelect('Commande')}
                >
                  <View style={[styles.iconWrap, { backgroundColor: '#F59E0B20' }]}>
                    <Package size={22} color="#F59E0B" />
                  </View>
                  <View style={styles.optionTextWrap}>
                    <Text style={[styles.optionTitle, { color: themeColors.text }]}>Nouvelle Commande</Text>
                    <Text style={[styles.optionDesc, { color: themeColors.subtext }]}>Passer une commande de matériaux ou carburant</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}
                  onPress={() => handleSelect('Facture')}
                >
                  <View style={[styles.iconWrap, { backgroundColor: '#16A34A20' }]}>
                    <FileText size={22} color="#16A34A" />
                  </View>
                  <View style={styles.optionTextWrap}>
                    <Text style={[styles.optionTitle, { color: themeColors.text }]}>Enregistrer Facture</Text>
                    <Text style={[styles.optionDesc, { color: themeColors.subtext }]}>Saisir une facture fournisseur ou client</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  closeBtn: {
    padding: 4,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
