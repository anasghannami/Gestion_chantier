import { Chantier, Commande, Facture } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

export const getKpis = async (req, res, next) => {
  const chantiersActifs = await Chantier.count({ where: { statut: 'En cours' } });
  const chantiersEnRetard = await Chantier.count({ where: { statut: 'En retard' } });
  const totalChantiers = await Chantier.count();

  const budgetPrevisionnelSum = await Chantier.sum('budget_previsionnel');
  const budgetConsommeSum = await Commande.sum('montant_ttc', { where: { statut: { [Op.ne]: 'Annulée' } } });

  const commandesEnCours = await Commande.count({ where: { statut: { [Op.in]: ['Brouillon', 'Validée'] } } });
  
  const facturesEnAttente = await Facture.count({ where: { statut_paiement: 'En attente' } });
  const facturesEchues = await Facture.count({ where: { statut_paiement: 'Échue' } });
  
  const montantFacturesEchues = await Facture.sum('montant_ttc', { where: { statut_paiement: 'Échue' } }) || 0;

  const chantiers = await Chantier.findAll({
    where: { statut: 'En cours' },
    attributes: [
      'id', 'nom', 'budget_previsionnel',
      [
        sequelize.literal(`(
          SELECT COALESCE(SUM(montant_ttc), 0)
          FROM commandes
          WHERE commandes.chantier_id = "Chantier"."id" AND commandes.statut != 'Annulée'
        )`),
        'budget_consomme'
      ]
    ]
  });

  const avancementParChantier = chantiers.map(c => ({
    nom: c.nom,
    budget_previsionnel: c.budget_previsionnel,
    budget_consomme: c.getDataValue('budget_consomme')
  }));

  const depensesParChantier = avancementParChantier
    .map(c => ({ nom: c.nom, total_depenses: c.budget_consomme }))
    .sort((a, b) => b.total_depenses - a.total_depenses)
    .slice(0, 5);

  const alertes = [];
  
  const commandesEnRetard = await Commande.findAll({
    where: {
      statut: 'Validée',
      date_livraison_prevue: { [Op.lt]: new Date() }
    },
    include: [{ model: Chantier, as: 'chantier', attributes: ['nom'] }]
  });

  commandesEnRetard.forEach(c => {
    alertes.push({
      type: 'Retard de livraison',
      message: `La commande ${c.num_commande} pour le chantier ${c.chantier?.nom || 'Inconnu'} est en retard.`,
      severity: 'high'
    });
  });

  avancementParChantier.forEach(c => {
    if (c.budget_previsionnel > 0 && c.budget_consomme > c.budget_previsionnel) {
      alertes.push({
        type: 'Dépassement de budget',
        message: `Le chantier ${c.nom} a dépassé son budget de ${c.budget_consomme - c.budget_previsionnel} MAD.`,
        severity: 'critical'
      });
    }
  });

  res.json({
    chantiersActifs,
    chantiersEnRetard,
    totalChantiers,
    budgetPrevisionnel: budgetPrevisionnelSum || 0,
    budgetConsomme: budgetConsommeSum || 0,
    commandesEnCours,
    facturesEnAttente,
    facturesEchues,
    montantFacturesEchues,
    avancementParChantier,
    depensesParChantier,
    alertes
  });
};
