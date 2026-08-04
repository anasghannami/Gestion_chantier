import 'dotenv/config';
import { Devis, Chantier } from '../models/index.js';

const testChantierConvert = async () => {
  try {
    console.log('Test de conversion d\'un devis en chantier...');
    const devis = await Devis.findOne();
    if (!devis) {
      console.log('Aucun devis trouvé');
      process.exit(0);
    }

    let countChantiers = await Chantier.count();
    let nextChantierNum = countChantiers + 1;
    let code_chantier = `CHT-DEV-${nextChantierNum.toString().padStart(3, '0')}`;

    let existsChantier = await Chantier.findOne({ where: { code_chantier } });
    while (existsChantier) {
      nextChantierNum++;
      code_chantier = `CHT-DEV-${nextChantierNum.toString().padStart(3, '0')}`;
      existsChantier = await Chantier.findOne({ where: { code_chantier } });
    }

    const chantier = await Chantier.create({
      code_chantier,
      nom: `Chantier - ${devis.client_nom}`,
      client_nom: devis.client_nom,
      adresse: devis.client_adresse || '',
      date_debut: new Date().toISOString().split('T')[0],
      statut: 'En préparation',
      budget_previsionnel: devis.montant_ht || 0,
      devis_id: devis.id
    });

    console.log('✅ Chantier créé avec succès ! Code:', chantier.code_chantier, 'ID:', chantier.id);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur conversion chantier:', err);
    process.exit(1);
  }
};

testChantierConvert();
