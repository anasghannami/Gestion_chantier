import 'dotenv/config';
import { sequelize, Devis, DevisLigne, Chantier } from '../models/index.js';

const syncDatabase = async () => {
  try {
    console.log('Vérification et création des tables Devis dans PostgreSQL...');
    await sequelize.sync({ alter: true });
    console.log('✅ Tables PostgreSQL "devis" et "devis_lignes" créées/mises à jour avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables Devis:', error);
    process.exit(1);
  }
};

syncDatabase();
