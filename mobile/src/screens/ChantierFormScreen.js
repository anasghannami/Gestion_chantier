import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Building2, User, MapPin, Calendar, DollarSign, AlignLeft, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';

export function ChantierFormScreen({ navigation, route }) {
  const { themeColors, isDarkMode } = useTheme();
  const initialData = route.params?.chantier || null;

  const [form, setForm] = useState({
    nom: initialData?.nom || '',
    client: initialData?.client || '',
    adresse: initialData?.adresse || '',
    date_debut: initialData?.date_debut ? initialData.date_debut.split('T')[0] : new Date().toISOString().split('T')[0],
    date_fin_prevue: initialData?.date_fin_prevue ? initialData.date_fin_prevue.split('T')[0] : '',
    budget: initialData?.budget ? String(initialData.budget) : '',
    statut: initialData?.statut || 'En cours',
    description: initialData?.description || '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    let errs = {};
    if (!form.nom.trim()) errs.nom = 'Le nom du chantier est obligatoire';
    if (!form.client.trim()) errs.client = 'Le nom du client est obligatoire';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch (e) {}
      return;
    }

    try {
      setSubmitting(true);
      if (initialData?.id) {
        await api.put(`/chantiers/${initialData.id}`, form);
        Toast.show({ type: 'success', text1: 'Chantier mis à jour avec succès !' });
      } else {
        await api.post('/chantiers', form);
        Toast.show({ type: 'success', text1: 'Nouveau chantier créé avec succès !' });
      }
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
      navigation.goBack();
    } catch (err) {
      console.error('Erreur enregistrement chantier:', err);
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Erreur lors de l\'enregistrement.' });
    } finally {
      setSubmitting(false);
    }
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
          {initialData ? 'Éditer le Chantier' : 'Nouveau Chantier'}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.formContent}>
          {/* Nom du chantier */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: themeColors.text }]}>Nom du Chantier *</Text>
            <View style={[styles.inputRow, { backgroundColor: themeColors.card, borderColor: errors.nom ? '#EF4444' : themeColors.border }]}>
              <Building2 size={18} color={themeColors.subtext} style={styles.icon} />
              <TextInput
                value={form.nom}
                onChangeText={(v) => { setForm({ ...form, nom: v }); setErrors({ ...errors, nom: null }); }}
                placeholder="Ex: Résidence Palmier - Bloc A"
                placeholderTextColor={themeColors.subtext}
                style={[styles.input, { color: themeColors.text }]}
              />
            </View>
            {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}
          </View>

          {/* Client */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: themeColors.text }]}>Client / Maître d'Ouvrage *</Text>
            <View style={[styles.inputRow, { backgroundColor: themeColors.card, borderColor: errors.client ? '#EF4444' : themeColors.border }]}>
              <User size={18} color={themeColors.subtext} style={styles.icon} />
              <TextInput
                value={form.client}
                onChangeText={(v) => { setForm({ ...form, client: v }); setErrors({ ...errors, client: null }); }}
                placeholder="Ex: Société Immobilière Anfa"
                placeholderTextColor={themeColors.subtext}
                style={[styles.input, { color: themeColors.text }]}
              />
            </View>
            {errors.client && <Text style={styles.errorText}>{errors.client}</Text>}
          </View>

          {/* Adresse */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: themeColors.text }]}>Adresse / Localisation</Text>
            <View style={[styles.inputRow, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <MapPin size={18} color={themeColors.subtext} style={styles.icon} />
              <TextInput
                value={form.adresse}
                onChangeText={(v) => setForm({ ...form, adresse: v })}
                placeholder="Ex: Bd Zerktouni, Casablanca"
                placeholderTextColor={themeColors.subtext}
                style={[styles.input, { color: themeColors.text }]}
              />
            </View>
          </View>

          {/* Dates */}
          <View style={styles.rowTwo}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: themeColors.text }]}>Date Début</Text>
              <View style={[styles.inputRow, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <Calendar size={16} color={themeColors.subtext} style={styles.icon} />
                <TextInput
                  value={form.date_debut}
                  onChangeText={(v) => setForm({ ...form, date_debut: v })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={themeColors.subtext}
                  style={[styles.input, { color: themeColors.text }]}
                />
              </View>
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: themeColors.text }]}>Date Fin Prévue</Text>
              <View style={[styles.inputRow, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <Calendar size={16} color={themeColors.subtext} style={styles.icon} />
                <TextInput
                  value={form.date_fin_prevue}
                  onChangeText={(v) => setForm({ ...form, date_fin_prevue: v })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={themeColors.subtext}
                  style={[styles.input, { color: themeColors.text }]}
                />
              </View>
            </View>
          </View>

          {/* Budget */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: themeColors.text }]}>Budget (MAD)</Text>
            <View style={[styles.inputRow, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <DollarSign size={18} color={themeColors.subtext} style={styles.icon} />
              <TextInput
                value={form.budget}
                onChangeText={(v) => setForm({ ...form, budget: v })}
                keyboardType="numeric"
                placeholder="Ex: 500000"
                placeholderTextColor={themeColors.subtext}
                style={[styles.input, { color: themeColors.text }]}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: themeColors.text }]}>Description / Notes</Text>
            <View style={[styles.inputRow, { backgroundColor: themeColors.card, borderColor: themeColors.border, height: 90, alignItems: 'flex-start', paddingTop: 10 }]}>
              <AlignLeft size={18} color={themeColors.subtext} style={styles.icon} />
              <TextInput
                value={form.description}
                onChangeText={(v) => setForm({ ...form, description: v })}
                multiline
                numberOfLines={4}
                placeholder="Spécificités techniques du chantier..."
                placeholderTextColor={themeColors.subtext}
                style={[styles.input, { color: themeColors.text, textAlignVertical: 'top' }]}
              />
            </View>
          </View>
        </ScrollView>

        {/* Sticky Footer */}
        <View style={[styles.footer, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
          <TouchableOpacity
            disabled={submitting}
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: '#3b82f6', opacity: submitting ? 0.7 : 1 }]}
          >
            <Check size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.saveBtnText}>
              {submitting ? 'Enregistrement...' : 'Enregistrer le Chantier'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  formContent: {
    padding: 16,
    paddingBottom: 40,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
