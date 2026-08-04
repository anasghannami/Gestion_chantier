import { Document } from '../models/index.js';
import fs from 'fs';
import path from 'path';

export const getDocumentsByEntity = async (req, res, next) => {
  try {
    const { entity_type, entity_id } = req.query;
    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'entity_type et entity_id sont requis.' });
    }

    const documents = await Document.findAll({
      where: {
        entity_type,
        entity_id: parseInt(entity_id)
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(documents);
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier transmis.' });
    }

    const { entity_type, entity_id, categorie, description } = req.body;
    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'entity_type et entity_id sont requis.' });
    }

    const relativePath = `/uploads/documents/${req.file.filename}`;

    const doc = await Document.create({
      nom_fichier: req.file.originalname,
      chemin_fichier: relativePath,
      type_mime: req.file.mimetype,
      taille: req.file.size,
      entity_type,
      entity_id: parseInt(entity_id),
      categorie: categorie || 'Autre',
      description: description || ''
    });

    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Document.findByPk(id);

    if (!doc) {
      return res.status(404).json({ message: 'Document non trouvé.' });
    }

    // Supprimer le fichier physique du disque
    const absolutePath = path.join(process.cwd(), doc.chemin_fichier);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error("Erreur suppression fichier physique:", err);
      }
    }

    await doc.destroy();
    res.json({ message: 'Document supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
};
