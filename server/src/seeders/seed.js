import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { 
  sequelize, Utilisateur, Chantier, Fournisseur, Commande, Facture, Devis, DevisLigne,
  Ouvrier, EnginEquipement, PhaseChantier, JalonPermis, AffectationRessource
} from '../models/index.js';

const seed = async () => {
  try {
    if (process.env.DB_DIALECT === 'postgres') {
      console.log('Connexion au serveur PostgreSQL pour vérifier la base de données...');
      const { Client } = pg;
      const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
        port: process.env.DB_PORT || 5432,
        database: 'postgres'
      });

      await client.connect();
      const dbName = process.env.DB_NAME || 'gestion_chantier';
      const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
      if (res.rowCount === 0) {
        console.log(`Création de la base de données PostgreSQL "${dbName}"...`);
        await client.query(`CREATE DATABASE "${dbName}"`);
      }
      await client.end();
      console.log('Base de données prête.');
    }


    console.log('Synchronisation des modèles avec la base de données...');
    await sequelize.sync({ force: true });
    
    console.log('Création des utilisateurs...');
    const mot_de_passe_hash = await bcrypt.hash('othmane12345', 10);
    await Utilisateur.bulkCreate([
      { nom: 'Znidi', prenom: 'Othmane', email: 'othmaneznidi@gmail.com', mot_de_passe_hash, role: 'Admin' },
      { nom: 'Tazi', prenom: 'Karim', email: 'conducteur@chantier.ma', mot_de_passe_hash, role: 'Conducteur' },
      { nom: 'Alaoui', prenom: 'Fatima Zahra', email: 'achats@chantier.ma', mot_de_passe_hash, role: 'Achats' },
      { nom: 'Idrissi', prenom: 'Youssef', email: 'compta@chantier.ma', mot_de_passe_hash, role: 'Comptabilite' }
    ]);

    console.log('Création des chantiers...');
    await Chantier.bulkCreate([
      { code_chantier: 'CH-2024-001', nom: "Résidence Les Jardins de l'Atlas", client_nom: 'Groupe Addoha', adresse: 'Marrakech', date_debut: '2024-02-01', statut: 'En cours', budget_previsionnel: 12500000, chef_chantier_id: 2 },
      { code_chantier: 'CH-2024-002', nom: 'Centre Commercial Marina Bay', client_nom: 'Marjane Holding', adresse: 'Tanger', date_debut: '2024-03-15', statut: 'En cours', budget_previsionnel: 28000000, chef_chantier_id: 2 },
      { code_chantier: 'CH-2024-003', nom: 'Complexe Sportif Hassan II', client_nom: 'Ministère Jeunesse et Sports', adresse: 'Casablanca', date_debut: '2024-01-10', statut: 'En retard', budget_previsionnel: 8500000, chef_chantier_id: 2 },
      { code_chantier: 'CH-2024-004', nom: 'Tour de bureaux Casablanca Finance City', client_nom: 'CFC Authority', adresse: 'Casablanca', statut: 'En préparation', budget_previsionnel: 45000000, chef_chantier_id: 2 },
      { code_chantier: 'CH-2024-005', nom: 'Rénovation Hôtel Mamounia', client_nom: 'Société Mamounia SA', adresse: 'Marrakech', date_debut: '2024-01-05', date_fin_reelle: '2024-06-30', statut: 'Terminé', budget_previsionnel: 6000000, chef_chantier_id: 2 }
    ]);

    console.log('Création des fournisseurs...');
    await Fournisseur.bulkCreate([
      { code_fournisseur: 'FRN-001', raison_sociale: 'Ciments du Maroc SA', categorie: 'Matériaux', conditions_paiement: '30 jours' },
      { code_fournisseur: 'FRN-002', raison_sociale: 'SONASID Acier', categorie: 'Matériaux', conditions_paiement: '45 jours' },
      { code_fournisseur: 'FRN-003', raison_sociale: 'Schneider Electric Maroc', categorie: 'Électricité', conditions_paiement: '30 jours' },
      { code_fournisseur: 'FRN-004', raison_sociale: 'Groupe Platinum Plomberie', categorie: 'Plomberie', conditions_paiement: '30 jours' },
      { code_fournisseur: 'FRN-005', raison_sociale: 'Locamat Engins', categorie: 'Location engins', conditions_paiement: 'Fin de mois' },
      { code_fournisseur: 'FRN-006', raison_sociale: 'Peintures Colorado', categorie: 'Peinture', conditions_paiement: '30 jours' },
      { code_fournisseur: 'FRN-007', raison_sociale: 'Atlas Menuiserie Alu', categorie: 'Menuiserie', conditions_paiement: '60 jours' },
      { code_fournisseur: 'FRN-008', raison_sociale: 'Holcim Béton Maroc', categorie: 'Matériaux', conditions_paiement: '30 jours' }
    ]);

    console.log('Création des commandes...');
    await Commande.bulkCreate([
      { num_commande: 'CMD-001', fournisseur_id: 1, chantier_id: 1, date_commande: '2024-02-15', date_livraison_prevue: '2024-02-28', montant_ht: 50000, montant_ttc: 60000, statut: 'Livrée' },
      { num_commande: 'CMD-002', fournisseur_id: 2, chantier_id: 1, date_commande: '2024-03-10', date_livraison_prevue: '2024-03-20', montant_ht: 120000, montant_ttc: 144000, statut: 'Validée' },
      { num_commande: 'CMD-003', fournisseur_id: 3, chantier_id: 2, date_commande: '2024-04-05', date_livraison_prevue: '2024-04-15', montant_ht: 80000, montant_ttc: 96000, statut: 'Livrée' },
      { num_commande: 'CMD-004', fournisseur_id: 5, chantier_id: 2, date_commande: '2024-05-12', date_livraison_prevue: '2024-05-14', montant_ht: 25000, montant_ttc: 30000, statut: 'Validée' },
      { num_commande: 'CMD-005', fournisseur_id: 1, chantier_id: 3, date_commande: '2024-01-20', date_livraison_prevue: '2024-01-30', montant_ht: 40000, montant_ttc: 48000, statut: 'Livrée' },
      { num_commande: 'CMD-006', fournisseur_id: 4, chantier_id: 3, date_commande: '2024-02-10', date_livraison_prevue: '2024-02-15', montant_ht: 35000, montant_ttc: 42000, statut: 'Validée' },
      { num_commande: 'CMD-007', fournisseur_id: 6, chantier_id: 5, date_commande: '2024-05-01', date_livraison_prevue: '2024-05-10', montant_ht: 60000, montant_ttc: 72000, statut: 'Livrée' },
      { num_commande: 'CMD-008', fournisseur_id: 7, chantier_id: 5, date_commande: '2024-05-15', date_livraison_prevue: '2024-06-01', montant_ht: 90000, montant_ttc: 108000, statut: 'Livrée' },
      { num_commande: 'CMD-009', fournisseur_id: 8, chantier_id: 1, date_commande: '2024-06-10', date_livraison_prevue: '2024-06-25', montant_ht: 55000, montant_ttc: 66000, statut: 'Livrée' },
      { num_commande: 'CMD-010', fournisseur_id: 2, chantier_id: 2, date_commande: '2024-07-05', date_livraison_prevue: '2024-07-20', montant_ht: 150000, montant_ttc: 180000, statut: 'Brouillon' },
      { num_commande: 'CMD-011', fournisseur_id: 3, chantier_id: 4, date_commande: '2024-08-01', date_livraison_prevue: '2024-08-15', montant_ht: 75000, montant_ttc: 90000, statut: 'Annulée' },
      { num_commande: 'CMD-012', fournisseur_id: 5, chantier_id: 3, date_commande: '2024-08-10', date_livraison_prevue: '2024-08-12', montant_ht: 20000, montant_ttc: 24000, statut: 'Validée' },
      { num_commande: 'CMD-013', fournisseur_id: 6, chantier_id: 1, date_commande: '2024-09-01', date_livraison_prevue: '2024-09-15', montant_ht: 45000, montant_ttc: 54000, statut: 'Livrée' },
      { num_commande: 'CMD-014', fournisseur_id: 1, chantier_id: 2, date_commande: '2024-09-10', date_livraison_prevue: '2024-09-25', montant_ht: 65000, montant_ttc: 78000, statut: 'Livrée' },
      { num_commande: 'CMD-015', fournisseur_id: 4, chantier_id: 4, date_commande: '2024-09-20', date_livraison_prevue: '2024-10-05', montant_ht: 85000, montant_ttc: 102000, statut: 'Brouillon' }
    ]);

    console.log('Création des factures...');
    await Facture.bulkCreate([
      { num_facture: 'FAC-001', fournisseur_id: 1, chantier_id: 1, date_emission: '2024-03-01', date_echeance: '2024-03-31', montant_ht: 50000, montant_tva: 10000, montant_ttc: 60000, statut_paiement: 'Payée' },
      { num_facture: 'FAC-002', fournisseur_id: 3, chantier_id: 2, date_emission: '2024-04-20', date_echeance: '2024-05-20', montant_ht: 80000, montant_tva: 16000, montant_ttc: 96000, statut_paiement: 'Payée' },
      { num_facture: 'FAC-003', fournisseur_id: 1, chantier_id: 3, date_emission: '2024-02-05', date_echeance: '2024-03-05', montant_ht: 40000, montant_tva: 8000, montant_ttc: 48000, statut_paiement: 'Échue' },
      { num_facture: 'FAC-004', fournisseur_id: 6, chantier_id: 5, date_emission: '2024-05-15', date_echeance: '2024-06-15', montant_ht: 60000, montant_tva: 12000, montant_ttc: 72000, statut_paiement: 'Payée' },
      { num_facture: 'FAC-005', fournisseur_id: 7, chantier_id: 5, date_emission: '2024-06-05', date_echeance: '2024-08-05', montant_ht: 90000, montant_tva: 18000, montant_ttc: 108000, statut_paiement: 'Payée' },
      { num_facture: 'FAC-006', fournisseur_id: 8, chantier_id: 1, date_emission: '2024-06-30', date_echeance: '2024-07-30', montant_ht: 55000, montant_tva: 11000, montant_ttc: 66000, statut_paiement: 'Échue' },
      { num_facture: 'FAC-007', fournisseur_id: 6, chantier_id: 1, date_emission: '2024-09-20', date_echeance: '2024-10-20', montant_ht: 45000, montant_tva: 9000, montant_ttc: 54000, statut_paiement: 'En attente' },
      { num_facture: 'FAC-008', fournisseur_id: 1, chantier_id: 2, date_emission: '2024-09-28', date_echeance: '2024-10-28', montant_ht: 65000, montant_tva: 13000, montant_ttc: 78000, statut_paiement: 'En attente' },
      { num_facture: 'FAC-009', fournisseur_id: 2, chantier_id: 1, date_emission: '2024-03-25', date_echeance: '2024-05-09', montant_ht: 120000, montant_tva: 24000, montant_ttc: 144000, statut_paiement: 'Échue' },
      { num_facture: 'FAC-010', fournisseur_id: 5, chantier_id: 2, date_emission: '2024-05-15', date_echeance: '2024-06-15', montant_ht: 25000, montant_tva: 5000, montant_ttc: 30000, statut_paiement: 'Partiellement payée' }
    ]);

    console.log('Création des devis...');
    const d1 = await Devis.create({
      num_devis: 'DEV-2026-001',
      client_nom: 'Société Immobilière Rabat',
      client_email: 'contact@immorabat.ma',
      client_telephone: '0537001122',
      client_adresse: 'Avenue de France, Rabat',
      chantier_id: 1,
      statut: 'Accepté',
      date_creation: '2026-01-15',
      date_validite: '2026-03-15',
      montant_ht: 450000,
      tva: 20,
      montant_ttc: 540000,
      notes: 'Devis pour travaux de terrassement et fondations.'
    });
    await DevisLigne.bulkCreate([
      { devis_id: d1.id, designation: 'Terrassement et décapage du sol', quantite: 1500, unite: 'm³', prix_unitaire: 180, total_ligne: 270000 },
      { devis_id: d1.id, designation: 'Béton de propreté dosé à 250 kg/m³', quantite: 300, unite: 'm³', prix_unitaire: 600, total_ligne: 180000 }
    ]);

    const d2 = await Devis.create({
      num_devis: 'DEV-2026-002',
      client_nom: 'Residences Tanger SARL',
      client_email: 'info@tanger-residences.com',
      client_telephone: '0539887766',
      client_adresse: 'Boulevard Mohamed V, Tanger',
      statut: 'Envoyé',
      date_creation: '2026-02-01',
      date_validite: '2026-04-01',
      montant_ht: 180000,
      tva: 20,
      montant_ttc: 216000,
      notes: 'Fourniture et pose menuiserie aluminium haut de gamme.'
    });
    await DevisLigne.bulkCreate([
      { devis_id: d2.id, designation: 'Fenêtres coulissantes Alu double vitrage', quantite: 40, unite: 'u', prix_unitaire: 3500, total_ligne: 140000 },
      { devis_id: d2.id, designation: 'Portes fenêtres coulissantes Alu', quantite: 8, unite: 'u', prix_unitaire: 5000, total_ligne: 40000 }
    ]);

    const d3 = await Devis.create({
      num_devis: 'DEV-2026-003',
      client_nom: 'Ministère de l\'Éducation',
      client_email: 'marches@education.gov.ma',
      statut: 'Brouillon',
      date_creation: '2026-02-10',
      date_validite: '2026-05-10',
      montant_ht: 320000,
      tva: 20,
      montant_ttc: 384000
    });
    await DevisLigne.bulkCreate([
      { devis_id: d3.id, designation: 'Rénovation peinture bâtiment A', quantite: 2500, unite: 'm²', prix_unitaire: 80, total_ligne: 200000 },
      { devis_id: d3.id, designation: 'Réfection étanchéité toiture terrasse', quantite: 800, unite: 'm²', prix_unitaire: 150, total_ligne: 120000 }
    ]);

    console.log('Création des ouvriers...');
    await Ouvrier.bulkCreate([
      { nom: 'El Amrani', prenom: 'Hassan', specialite: 'Chef d\'équipe Maçonnerie', telephone: '0661122334', statut: 'Actif', tarif_journalier: 350, chantier_id: 1 },
      { nom: 'Bennani', prenom: 'Rachid', specialite: 'Électricien BTP', telephone: '0662233445', statut: 'Actif', tarif_journalier: 300, chantier_id: 1 },
      { nom: 'Kabbaj', prenom: 'Mustapha', specialite: 'Plombier Sanitaire', telephone: '0663344556', statut: 'Actif', tarif_journalier: 280, chantier_id: 2 },
      { nom: 'Chraibi', prenom: 'Omar', specialite: 'Conducteur d\'Engins', telephone: '0664455667', statut: 'Actif', tarif_journalier: 400, chantier_id: 2 }
    ]);

    console.log('Création des engins et équipements...');
    await EnginEquipement.bulkCreate([
      { code: 'ENG-101', nom: 'Grue à Tour Potain 50T', type: 'Grue', cout_journalier: 2500, statut: 'En service' },
      { code: 'ENG-102', nom: 'Bétonnière Autochargeuse 3.5m³', type: 'Bétonnière', cout_journalier: 1200, statut: 'En service' },
      { code: 'ENG-103', nom: 'Pelle Hydraulique CAT 320', type: 'Pelleteuse', cout_journalier: 1800, statut: 'Disponible' },
      { code: 'ENG-104', nom: 'Système Coffrage Métallique Doka', type: 'Coffrage', cout_journalier: 800, statut: 'En service' }
    ]);

    console.log('Création des phases de chantier...');
    const p1 = await PhaseChantier.create({
      nom: 'Préparation du Terrain & Installation',
      ordre: 1,
      date_debut: '2026-08-01',
      date_fin: '2026-08-10',
      duree_jours: 10,
      pourcentage_avancement: 100,
      statut: 'Terminée',
      est_critique: true,
      chantier_id: 1,
      cout_prevu: 45000
    });

    const p2 = await PhaseChantier.create({
      nom: 'Terrassement & Fouilles',
      ordre: 2,
      date_debut: '2026-08-11',
      date_fin: '2026-08-25',
      duree_jours: 15,
      pourcentage_avancement: 60,
      statut: 'En cours',
      est_critique: true,
      predecesseur_id: p1.id,
      chantier_id: 1,
      cout_prevu: 120000
    });

    const p3 = await PhaseChantier.create({
      nom: 'Fondations & Longrines',
      ordre: 3,
      date_debut: '2026-08-26',
      date_fin: '2026-09-15',
      duree_jours: 20,
      pourcentage_avancement: 0,
      statut: 'À faire',
      est_critique: true,
      predecesseur_id: p2.id,
      chantier_id: 1,
      cout_prevu: 280000
    });

    const p4 = await PhaseChantier.create({
      nom: 'Gros Œuvre & Structure Béton Armé',
      ordre: 4,
      date_debut: '2026-09-16',
      date_fin: '2026-11-30',
      duree_jours: 75,
      pourcentage_avancement: 0,
      statut: 'À faire',
      est_critique: true,
      predecesseur_id: p3.id,
      chantier_id: 1,
      cout_prevu: 1500000
    });

    console.log('Création des jalons et permis...');
    await JalonPermis.bulkCreate([
      { chantier_id: 1, titre: 'Obtention Autorisation de Construire', type_jalon: 'Autorisation de construire', date_prevue: '2026-07-15', date_obtention: '2026-07-20', statut: 'Validé' },
      { chantier_id: 1, titre: 'Réception Provisoire des Fondations', type_jalon: 'Réception provisoire', date_prevue: '2026-09-16', statut: 'En attente' },
      { chantier_id: 2, titre: 'Permis d\'Habiter & Conformité', type_jalon: 'Permis d\'habiter', date_prevue: '2026-12-01', statut: 'En attente' }
    ]);

    console.log('Création des affectations de ressources...');
    await AffectationRessource.bulkCreate([
      { phase_id: p2.id, ouvrier_id: 1, engin_id: 3, date_debut: '2026-08-11', date_fin: '2026-08-25', heures_prevues: 8, taux_charge: 100 },
      { phase_id: p3.id, ouvrier_id: 2, engin_id: 2, date_debut: '2026-08-26', date_fin: '2026-09-15', heures_prevues: 8, taux_charge: 100 }
    ]);

    console.log('Données injectées avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du seed:', error);
    process.exit(1);
  }
};

seed();
