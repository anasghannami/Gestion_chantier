import { Materiau, MouvementStock, Chantier, Commande } from '../models/index.js';
import { Op } from 'sequelize';

// Seed default materials if table is empty
const seedDefaultMateriaux = async () => {
  const count = await Materiau.count();
  if (count === 0) {
    await Materiau.bulkCreate([
      { code_article: 'MAT-001', designation: 'Sac de Ciment CPJ 45', categorie: 'Liants & Ciment', unite: 'Sac', quantite_stock: 120, seuil_alerte: 30, prix_unitaire_moyen: 65.00, emplacement: 'Dépôt principal' },
      { code_article: 'MAT-002', designation: 'Fer à Béton FeE500 Ø12mm', categorie: 'Acier & Fer', unite: 'Tonne', quantite_stock: 4.5, seuil_alerte: 2.0, prix_unitaire_moyen: 9200.00, emplacement: 'Zone Acier' },
      { code_article: 'MAT-003', designation: 'Sable de Concassage 0/4', categorie: 'Matériaux', unite: 'm³', quantite_stock: 45, seuil_alerte: 15, prix_unitaire_moyen: 180.00, emplacement: 'Dépôt vrac' },
      { code_article: 'MAT-004', designation: 'Gasoil / Carburant engins', categorie: 'Carburant', unite: 'Litre', quantite_stock: 250, seuil_alerte: 100, prix_unitaire_moyen: 13.50, emplacement: 'Citerne 1' },
      { code_article: 'MAT-005', designation: 'Brique Creuse 8 trous', categorie: 'Matériaux', unite: 'Unité', quantite_stock: 1500, seuil_alerte: 500, prix_unitaire_moyen: 4.20, emplacement: 'Zone Maçonnerie' },
      { code_article: 'MAT-006', designation: 'Casque de Sécurité BTP (Gris/Jaune)', categorie: 'Sécurité', unite: 'Unité', quantite_stock: 8, seuil_alerte: 10, prix_unitaire_moyen: 45.00, emplacement: 'Magasin EPI' }
    ]);
  }
};

export const getMateriaux = async (req, res, next) => {
  try {
    await seedDefaultMateriaux();
    const materiaux = await Materiau.findAll({
      order: [['designation', 'ASC']]
    });

    const formatted = materiaux.map(m => {
      const qte = parseFloat(m.quantite_stock || 0);
      const seuil = parseFloat(m.seuil_alerte || 0);
      let statutStock = 'Stock Normal';
      if (qte <= 0) {
        statutStock = 'Rupture';
      } else if (qte <= seuil) {
        statutStock = 'Alerte Stock Bas';
      }

      return {
        ...m.toJSON(),
        quantite_stock: qte,
        seuil_alerte: seuil,
        prix_unitaire_moyen: parseFloat(m.prix_unitaire_moyen || 0),
        statut_stock: statutStock
      };
    });

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const createMateriau = async (req, res, next) => {
  try {
    const { code_article, designation, categorie, unite, quantite_stock, seuil_alerte, prix_unitaire_moyen, emplacement, notes } = req.body;

    if (!designation) {
      return res.status(400).json({ message: 'La désignation de l\'article est obligatoire.' });
    }

    // Génération/Vérification du code article unique
    let generatedCode = code_article;
    if (!generatedCode) {
      let seq = (await Materiau.count()) + 1;
      while (await Materiau.findOne({ where: { code_article: `MAT-${String(seq).padStart(3, '0')}` } })) {
        seq++;
      }
      generatedCode = `MAT-${String(seq).padStart(3, '0')}`;
    } else {
      // Si le code saisi existe déjà, générer un code unique dérivé
      const existing = await Materiau.findOne({ where: { code_article: generatedCode } });
      if (existing) {
        let seq = (await Materiau.count()) + 1;
        while (await Materiau.findOne({ where: { code_article: `MAT-${String(seq).padStart(3, '0')}` } })) {
          seq++;
        }
        generatedCode = `MAT-${String(seq).padStart(3, '0')}`;
      }
    }

    const qteStockNum = quantite_stock ? parseFloat(quantite_stock) : 0;

    const materiau = await Materiau.create({
      code_article: generatedCode,
      designation,
      categorie: categorie || 'Matériaux',
      unite: unite || 'Unité',
      quantite_stock: qteStockNum,
      seuil_alerte: seuil_alerte ? parseFloat(seuil_alerte) : 10,
      prix_unitaire_moyen: prix_unitaire_moyen ? parseFloat(prix_unitaire_moyen) : 0,
      emplacement: emplacement || 'Dépôt principal',
      notes
    });

    // Enregistrer le mouvement d'entrée du stock initial si renseigné
    if (qteStockNum > 0) {
      try {
        await MouvementStock.create({
          materiau_id: materiau.id,
          type_mouvement: 'Entrée',
          quantite: qteStockNum,
          date_mouvement: new Date().toISOString().split('T')[0],
          motif: 'Stock initial à la création'
        });
      } catch (mouvementErr) {
        console.warn('Création du matériau réussie, mais échec de création du mouvement initial:', mouvementErr.message);
      }
    }

    res.status(201).json(materiau);
  } catch (error) {
    console.error('Erreur createMateriau:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Le code article existe déjà. Veuillez utiliser un autre code.' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors?.map(e => e.message).join(', ') || 'Données invalides.' });
    }
    res.status(500).json({ message: error.message || 'Erreur lors de l\'enregistrement de l\'article.' });
  }
};

export const updateMateriau = async (req, res, next) => {
  try {
    const { id } = req.params;
    const materiau = await Materiau.findByPk(id);

    if (!materiau) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    await materiau.update(req.body);
    res.json(materiau);
  } catch (error) {
    console.error('Erreur updateMateriau:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la mise à jour de l\'article.' });
  }
};

export const deleteMateriau = async (req, res, next) => {
  try {
    const { id } = req.params;
    const materiau = await Materiau.findByPk(id);

    if (!materiau) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    await materiau.destroy();
    res.json({ message: 'Article supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deleteMateriau:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la suppression de l\'article.' });
  }
};

export const getMouvements = async (req, res, next) => {
  try {
    const mouvements = await MouvementStock.findAll({
      include: [
        { model: Materiau, as: 'materiau', attributes: ['designation', 'code_article', 'unite'] },
        { model: Chantier, as: 'chantier', attributes: ['nom', 'code_chantier'] },
        { model: Commande, as: 'commande', attributes: ['num_commande'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.json(mouvements);
  } catch (error) {
    next(error);
  }
};

export const createMouvement = async (req, res, next) => {
  try {
    const { materiau_id, chantier_id, type_mouvement, quantite, date_mouvement, motif, notes } = req.body;

    const materiau = await Materiau.findByPk(materiau_id);
    if (!materiau) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    const qteNum = parseFloat(quantite);
    if (isNaN(qteNum) || qteNum <= 0) {
      return res.status(400).json({ message: 'La quantité doit être supérieure à 0.' });
    }

    let currentStock = parseFloat(materiau.quantite_stock || 0);

    if (type_mouvement === 'Sortie') {
      if (currentStock < qteNum) {
        return res.status(400).json({ 
          message: `Stock insuffisant pour ${materiau.designation}. Stock actuel: ${currentStock} ${materiau.unite}.` 
        });
      }
      currentStock -= qteNum;
    } else if (type_mouvement === 'Entrée') {
      currentStock += qteNum;
    } else if (type_mouvement === 'Ajustement') {
      currentStock = qteNum;
    }

    await materiau.update({ quantite_stock: currentStock });

    const mouvement = await MouvementStock.create({
      materiau_id,
      chantier_id: chantier_id ? parseInt(chantier_id) : null,
      type_mouvement,
      quantite: qteNum,
      date_mouvement: date_mouvement || new Date().toISOString().split('T')[0],
      motif: motif || `${type_mouvement} de stock`,
      notes
    });

    res.status(201).json(mouvement);
  } catch (error) {
    console.error('Erreur createMouvement:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la création du mouvement.' });
  }
};
