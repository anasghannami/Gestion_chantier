import { Op } from 'sequelize';
import { Ouvrier, AvanceOuvrier, PaiementSemaine, TacheIntervenant } from '../models/index.js';

// Retourne le numéro de semaine ISO d'une date
function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

const todayISO = () => new Date().toISOString().split('T')[0];

// Somme des tâches "Terminée" (non encore réglées) d'un intervenant
async function sumTachesDues(ouvrierId) {
  return parseFloat(await TacheIntervenant.sum('montant', {
    where: { ouvrier_id: ouvrierId, statut: 'Terminée' }
  }) || 0);
}

// Somme des avances pas encore déduites (reportées) d'un intervenant
async function sumAvancesNonReglees(ouvrierId) {
  return parseFloat(await AvanceOuvrier.sum('montant', {
    where: { ouvrier_id: ouvrierId, paiement_semaine_id: null }
  }) || 0);
}

// Recalcule les totaux d'une fiche de semaine selon le type de rémunération
async function recalcPaiement(paiement, ouvrier) {
  const patch = { type_remuneration: ouvrier.type_remuneration };

  if (ouvrier.type_remuneration === 'Tâche') {
    // Les avances suivent l'intervenant (pas la semaine) : une avance versée
    // avant la fin d'une tâche est reportée jusqu'à la clôture qui la règle.
    const totalAvances = await sumAvancesNonReglees(ouvrier.id);
    const brut = await sumTachesDues(ouvrier.id);
    patch.total_avances = totalAvances;
    patch.total_taches = brut;
    patch.total_brut = brut;
    patch.reste_paye = brut - totalAvances;
  } else {
    const totalAvances = parseFloat(await AvanceOuvrier.sum('montant', {
      where: { ouvrier_id: ouvrier.id, semaine: paiement.semaine, annee: paiement.annee }
    }) || 0);
    patch.total_avances = totalAvances;
    const brut = parseFloat(paiement.tarif_journalier || 0) * parseFloat(paiement.jours_travailles || 0);
    patch.total_brut = brut;
    patch.total_taches = 0;
    patch.reste_paye = brut - totalAvances;
  }

  await paiement.update(patch);
  return paiement;
}

// Récupère (ou crée) la fiche de la semaine courante et la recalcule
async function ensureCurrentWeek(ouvrier) {
  const now = new Date();
  const semaine = getISOWeek(now);
  const annee = now.getFullYear();

  let paiement = await PaiementSemaine.findOne({ where: { ouvrier_id: ouvrier.id, semaine, annee } });
  if (!paiement) {
    paiement = await PaiementSemaine.create({
      ouvrier_id: ouvrier.id,
      semaine,
      annee,
      jours_travailles: 0,
      tarif_journalier: ouvrier.tarif_journalier || 0,
      type_remuneration: ouvrier.type_remuneration,
      total_brut: 0,
      total_taches: 0,
      total_avances: 0,
      reste_paye: 0,
      statut: 'En cours'
    });
  }
  if (paiement.statut !== 'Payé') await recalcPaiement(paiement, ouvrier);
  return { paiement, semaine, annee };
}

// GET /api/paiement-ouvriers/:ouvrierId/semaine-courante
export const getSemaineCourante = async (req, res) => {
  const ouvrier = await Ouvrier.findByPk(req.params.ouvrierId);
  if (!ouvrier) return res.status(404).json({ message: 'Intervenant introuvable.' });

  const { paiement, semaine, annee } = await ensureCurrentWeek(ouvrier);

  // Journalier : avances de la semaine. Tâche : toutes les avances non encore déduites.
  const avances = await AvanceOuvrier.findAll({
    where: ouvrier.type_remuneration === 'Tâche'
      ? { ouvrier_id: ouvrier.id, paiement_semaine_id: null }
      : { ouvrier_id: ouvrier.id, semaine, annee },
    order: [['date_avance', 'ASC']]
  });

  // Tâches non réglées (En cours + Terminée) pour les intervenants à la tâche
  const taches = ouvrier.type_remuneration === 'Tâche'
    ? await TacheIntervenant.findAll({
        where: { ouvrier_id: ouvrier.id, statut: ['En cours', 'Terminée'] },
        order: [['statut', 'ASC'], ['createdAt', 'ASC']]
      })
    : [];

  res.json({ ouvrier, paiement, avances, taches, semaine, annee });
};

// PUT /api/paiement-ouvriers/:ouvrierId/jours
export const updateJoursTravailles = async (req, res) => {
  const { jours_travailles } = req.body;

  const ouvrier = await Ouvrier.findByPk(req.params.ouvrierId);
  if (!ouvrier) return res.status(404).json({ message: 'Intervenant introuvable.' });
  if (ouvrier.type_remuneration === 'Tâche') {
    return res.status(400).json({ message: 'Cet intervenant est payé à la tâche, pas au jour.' });
  }

  const { paiement } = await ensureCurrentWeek(ouvrier);
  if (paiement.statut === 'Payé') return res.status(400).json({ message: 'Cette semaine est déjà clôturée.' });

  await paiement.update({ jours_travailles, tarif_journalier: ouvrier.tarif_journalier || 0 });
  await recalcPaiement(paiement, ouvrier);

  res.json(paiement);
};

// POST /api/paiement-ouvriers/:ouvrierId/avances
export const createAvance = async (req, res) => {
  const { montant, date_avance, notes } = req.body;
  const now = new Date();
  const semaine = getISOWeek(now);
  const annee = now.getFullYear();

  const ouvrier = await Ouvrier.findByPk(req.params.ouvrierId);
  if (!ouvrier) return res.status(404).json({ message: 'Intervenant introuvable.' });

  const { paiement } = await ensureCurrentWeek(ouvrier);
  if (paiement.statut === 'Payé') return res.status(400).json({ message: 'Cette semaine est déjà clôturée.' });

  const avance = await AvanceOuvrier.create({
    ouvrier_id: ouvrier.id,
    montant,
    date_avance: date_avance || todayISO(),
    semaine,
    annee,
    notes
  });

  await recalcPaiement(paiement, ouvrier);

  res.status(201).json(avance);
};

// DELETE /api/paiement-ouvriers/avances/:avanceId
export const deleteAvance = async (req, res) => {
  const avance = await AvanceOuvrier.findByPk(req.params.avanceId);
  if (!avance) return res.status(404).json({ message: 'Avance introuvable.' });
  if (avance.paiement_semaine_id) {
    return res.status(400).json({ message: 'Cette avance a déjà été déduite d\'un paiement clôturé.' });
  }

  const ouvrier = await Ouvrier.findByPk(avance.ouvrier_id);

  const paiement = await PaiementSemaine.findOne({
    where: { ouvrier_id: avance.ouvrier_id, semaine: avance.semaine, annee: avance.annee }
  });
  if (paiement?.statut === 'Payé') return res.status(400).json({ message: 'Cette semaine est déjà clôturée.' });

  await avance.destroy();

  if (ouvrier) {
    if (paiement && paiement.statut !== 'Payé') await recalcPaiement(paiement, ouvrier);
    await ensureCurrentWeek(ouvrier);
  }

  res.json({ message: 'Avance supprimée.' });
};

// POST /api/paiement-ouvriers/:ouvrierId/payer
export const validerPaiement = async (req, res) => {
  const ouvrier = await Ouvrier.findByPk(req.params.ouvrierId);
  if (!ouvrier) return res.status(404).json({ message: 'Intervenant introuvable.' });

  const { paiement, semaine, annee } = await ensureCurrentWeek(ouvrier);
  if (paiement.statut === 'Payé') return res.status(400).json({ message: 'Cette semaine est déjà payée.' });

  if (ouvrier.type_remuneration === 'Tâche') {
    const tachesDues = await TacheIntervenant.findAll({ where: { ouvrier_id: ouvrier.id, statut: 'Terminée' } });
    if (tachesDues.length === 0) {
      return res.status(400).json({ message: 'Aucune tâche terminée à régler cette semaine.' });
    }
    await recalcPaiement(paiement, ouvrier);

    if (parseFloat(paiement.reste_paye) < 0) {
      return res.status(400).json({
        message: `Les avances versées (${paiement.total_avances} MAD) dépassent le total des tâches terminées (${paiement.total_taches} MAD). Terminez d'autres tâches ou ajustez les avances avant de clôturer.`
      });
    }

    await TacheIntervenant.update(
      { statut: 'Payée', paiement_semaine_id: paiement.id, semaine_paiement: semaine, annee_paiement: annee },
      { where: { ouvrier_id: ouvrier.id, statut: 'Terminée' } }
    );
    // Les avances reportées sont désormais déduites de cette clôture
    await AvanceOuvrier.update(
      { paiement_semaine_id: paiement.id },
      { where: { ouvrier_id: ouvrier.id, paiement_semaine_id: null } }
    );
  } else {
    if (parseFloat(paiement.jours_travailles || 0) === 0) {
      return res.status(400).json({ message: 'Renseignez les jours travaillés avant de payer.' });
    }
  }

  await paiement.update({ statut: 'Payé', date_paiement: todayISO() });
  res.json(paiement);
};

// GET /api/paiement-ouvriers/:ouvrierId/historique
export const getHistorique = async (req, res) => {
  const paiements = await PaiementSemaine.findAll({
    where: { ouvrier_id: req.params.ouvrierId },
    order: [['annee', 'DESC'], ['semaine', 'DESC']],
    limit: 20
  });

  const result = await Promise.all(paiements.map(async (p) => {
    const avances = await AvanceOuvrier.findAll({
      where: {
        ouvrier_id: req.params.ouvrierId,
        [Op.or]: [
          { paiement_semaine_id: p.id },
          { paiement_semaine_id: null, semaine: p.semaine, annee: p.annee }
        ]
      },
      order: [['date_avance', 'ASC']]
    });
    const taches_reglees = await TacheIntervenant.findAll({
      where: { paiement_semaine_id: p.id },
      order: [['date_fin', 'ASC']]
    });
    return { ...p.toJSON(), avances, taches_reglees };
  }));

  res.json(result);
};

// ============================================================
// Tâches des intervenants payés "à la tâche"
// ============================================================

// GET /api/paiement-ouvriers/:ouvrierId/taches
export const listTaches = async (req, res) => {
  const taches = await TacheIntervenant.findAll({
    where: { ouvrier_id: req.params.ouvrierId },
    order: [['createdAt', 'DESC']]
  });
  res.json(taches);
};

// POST /api/paiement-ouvriers/:ouvrierId/taches
export const createTache = async (req, res) => {
  const ouvrier = await Ouvrier.findByPk(req.params.ouvrierId);
  if (!ouvrier) return res.status(404).json({ message: 'Intervenant introuvable.' });

  const { nom, description, montant, date_debut, date_fin, statut } = req.body;
  if (!nom || !String(nom).trim()) return res.status(400).json({ message: 'Le nom de la tâche est obligatoire.' });

  const finalStatut = ['En cours', 'Terminée', 'Payée'].includes(statut) ? statut : 'En cours';

  const tache = await TacheIntervenant.create({
    ouvrier_id: ouvrier.id,
    nom: String(nom).trim(),
    description: description || null,
    montant: montant || 0,
    date_debut: date_debut || null,
    date_fin: date_fin || (finalStatut === 'Terminée' ? todayISO() : null),
    statut: finalStatut === 'Payée' ? 'Terminée' : finalStatut // on ne crée jamais directement en "Payée"
  });

  await ensureCurrentWeek(ouvrier);
  res.status(201).json(tache);
};

// PUT /api/paiement-ouvriers/taches/:tacheId
export const updateTache = async (req, res) => {
  const tache = await TacheIntervenant.findByPk(req.params.tacheId);
  if (!tache) return res.status(404).json({ message: 'Tâche introuvable.' });
  if (tache.statut === 'Payée') return res.status(400).json({ message: 'Cette tâche est déjà réglée, elle n\'est plus modifiable.' });

  const patch = {};
  for (const f of ['nom', 'description', 'montant', 'date_debut', 'date_fin', 'statut']) {
    if (f in req.body) patch[f] = req.body[f] === '' ? null : req.body[f];
  }
  if (patch.statut === 'Payée') delete patch.statut; // le passage en "Payée" se fait via la clôture de semaine
  if (patch.statut === 'Terminée' && !patch.date_fin && !tache.date_fin) patch.date_fin = todayISO();

  await tache.update(patch);

  const ouvrier = await Ouvrier.findByPk(tache.ouvrier_id);
  if (ouvrier) await ensureCurrentWeek(ouvrier);

  res.json(tache);
};

// DELETE /api/paiement-ouvriers/taches/:tacheId
export const deleteTache = async (req, res) => {
  const tache = await TacheIntervenant.findByPk(req.params.tacheId);
  if (!tache) return res.status(404).json({ message: 'Tâche introuvable.' });
  if (tache.statut === 'Payée') return res.status(400).json({ message: 'Une tâche déjà réglée ne peut pas être supprimée.' });

  const ouvrierId = tache.ouvrier_id;
  await tache.destroy();

  const ouvrier = await Ouvrier.findByPk(ouvrierId);
  if (ouvrier) await ensureCurrentWeek(ouvrier);

  res.json({ message: 'Tâche supprimée.' });
};
