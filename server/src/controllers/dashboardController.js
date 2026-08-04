import { Chantier, Commande, Facture, Devis, Materiau, Ouvrier } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

export const getKpis = async (req, res, next) => {
  try {
    const chantiersActifs = await Chantier.count({ where: { statut: 'En cours' } });
    const chantiersEnRetard = await Chantier.count({ where: { statut: 'En retard' } });
    const totalChantiers = await Chantier.count();

    const budgetPrevisionnelSum = await Chantier.sum('budget_previsionnel');
    const budgetConsommeSum = await Commande.sum('montant_ttc', { where: { statut: { [Op.ne]: 'Annulée' } } });

    const commandesEnCours = await Commande.count({ where: { statut: { [Op.in]: ['Brouillon', 'Validée'] } } });
    
    const facturesEnAttente = await Facture.count({ where: { statut_paiement: 'En attente' } });
    const facturesEchues = await Facture.count({ where: { statut_paiement: 'Échue' } });
    
    const montantFacturesEchues = await Facture.sum('montant_ttc', { where: { statut_paiement: 'Échue' } }) || 0;

    // --- KPI Devis ---
    const totalDevis = await Devis.count();
    const devisAcceptes = await Devis.count({ where: { statut: 'Accepté' } });
    const devisRefuses = await Devis.count({ where: { statut: 'Refusé' } });
    const devisTraites = devisAcceptes + devisRefuses;
    const tauxAcceptationDevis = devisTraites > 0 ? Math.round((devisAcceptes / devisTraites) * 100) : (devisAcceptes > 0 ? 100 : 0);

    // --- KPI Stocks & Matériaux ---
    const materiaux = await Materiau.findAll();
    const articlesEnAlerte = materiaux.filter(m => m.quantite_stock <= m.seuil_alerte).length;
    const articlesEnRupture = materiaux.filter(m => m.quantite_stock <= 0).length;

    // --- KPI Ouvriers ---
    const ouvriersActifs = await Ouvrier.count({ where: { statut: 'Actif' } });
    const masseSalarialeJour = await Ouvrier.sum('tarif_journalier', { where: { statut: 'Actif' } }) || 0;

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

    if (articlesEnRupture > 0) {
      alertes.push({
        type: 'Rupture de stock',
        message: `${articlesEnRupture} article(s) de matériel sont en rupture de stock !`,
        severity: 'critical'
      });
    } else if (articlesEnAlerte > 0) {
      alertes.push({
        type: 'Alerte stock bas',
        message: `${articlesEnAlerte} article(s) de matériel ont atteint le seuil d'alerte.`,
        severity: 'warning'
      });
    }

    // --- Bilan Financier Mensuel (CA vs Dépenses & Bénéfice Net) ---
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const currentDate = new Date();
    const bilanMensuel = [];

    // Obtenir les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthLabel = `${monthNames[month]} ${year}`;

      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

      // Chiffre d'Affaires (Somme des Factures du mois)
      const caFactures = await Facture.sum('montant_ttc', {
        where: {
          date_emission: { [Op.between]: [startOfMonth, endOfMonth] }
        }
      }) || 0;

      // Achats & Matériaux (Somme des Commandes du mois)
      const depensesAchats = await Commande.sum('montant_ttc', {
        where: {
          statut: { [Op.ne]: 'Annulée' },
          date_commande: { [Op.between]: [startOfMonth, endOfMonth] }
        }
      }) || 0;

      // Masse salariale mensuelle estimée (~20 jours ouvrés)
      const depensesOuvriers = masseSalarialeJour * 20;
      const depensesTotales = depensesAchats + depensesOuvriers;
      const beneficeNet = caFactures - depensesTotales;

      bilanMensuel.push({
        mois: monthLabel,
        chiffre_affaires: parseFloat(caFactures.toFixed(2)),
        depenses_totales: parseFloat(depensesTotales.toFixed(2)),
        benefice_net: parseFloat(beneficeNet.toFixed(2))
      });
    }

    const currentMonthBilan = bilanMensuel[bilanMensuel.length - 1] || {
      chiffre_affaires: 0,
      depenses_totales: 0,
      benefice_net: 0
    };

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
      // Nouveaux KPI
      totalDevis,
      devisAcceptes,
      tauxAcceptationDevis,
      articlesEnAlerte,
      articlesEnRupture,
      ouvriersActifs,
      masseSalarialeJour,
      // Bilan Mensuel
      bilanMensuel,
      currentMonthBilan,
      // Graphiques et alertes
      avancementParChantier,
      depensesParChantier,
      alertes
    });
  } catch (error) {
    next(error);
  }
};


