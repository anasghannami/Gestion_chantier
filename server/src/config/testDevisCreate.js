import 'dotenv/config';
import { Devis, DevisLigne } from '../models/index.js';

const testCreate = async () => {
  try {
    console.log('Test de création d\'un devis...');
    const d = await Devis.create({
      num_devis: `TEST-${Date.now()}`,
      client_nom: 'Client Test Laghdira',
      client_adresse: 'laghdira',
      statut: 'Envoyé',
      date_creation: '2026-07-31',
      date_validite: '2026-08-30',
      montant_ht: 1000,
      montant_ttc: 1000
    });
    console.log('✅ Devis créé avec succès en BDD ID:', d.id);
    await DevisLigne.create({
      devis_id: d.id,
      designation: 'aggagggaaaaa',
      quantite: 10,
      unite: 'u',
      prix_unitaire: 100,
      total_ligne: 1000
    });
    console.log('✅ Ligne de devis créée avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors du test:', err);
    process.exit(1);
  }
};

testCreate();
