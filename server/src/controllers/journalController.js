import { JournalChantier, Chantier } from '../models/index.js';

export const getJournauxByChantier = async (req, res, next) => {
  try {
    const { chantierId } = req.params;
    const journaux = await JournalChantier.findAll({
      where: { chantier_id: chantierId },
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });
    res.json(journaux);
  } catch (error) {
    next(error);
  }
};

export const createJournal = async (req, res, next) => {
  try {
    const { chantier_id, date, meteo, effectif_present, travaux_realises, incidents_retards } = req.body;
    
    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map(file => `/uploads/journal/${file.filename}`);
    } else if (req.body.photos) {
      try {
        photos = typeof req.body.photos === 'string' ? JSON.parse(req.body.photos) : req.body.photos;
      } catch (e) {
        photos = [];
      }
    }

    const journal = await JournalChantier.create({
      chantier_id,
      date: date || new Date().toISOString().split('T')[0],
      meteo: meteo || 'Soleil',
      effectif_present: effectif_present || 1,
      travaux_realises,
      incidents_retards,
      photos
    });

    res.status(201).json(journal);
  } catch (error) {
    next(error);
  }
};

export const deleteJournal = async (req, res, next) => {
  try {
    const journal = await JournalChantier.findByPk(req.params.id);
    if (!journal) {
      return res.status(404).json({ message: 'Rapport de journal introuvable.' });
    }
    await journal.destroy();
    res.json({ message: 'Rapport de journal supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
};
