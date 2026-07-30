import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Utilisateur } from '../models/index.js';

const updateAdmin = async () => {
  try {
    const mot_de_passe_hash = await bcrypt.hash('othmane12345', 10);

    // Find existing admin or user by email or role
    let admin = await Utilisateur.findOne({ where: { email: 'othmaneznidi@gmail.com' } });
    if (!admin) {
      admin = await Utilisateur.findOne({ where: { role: 'Admin' } });
    }

    if (admin) {
      admin.nom = 'Znidi';
      admin.prenom = 'Othmane';
      admin.email = 'othmaneznidi@gmail.com';
      admin.mot_de_passe_hash = mot_de_passe_hash;
      admin.statut = 'Actif';
      await admin.save();
      console.log('SUCCESS: Administrateur mis à jour : Othmane Znidi (othmaneznidi@gmail.com)');
    } else {
      await Utilisateur.create({
        nom: 'Znidi',
        prenom: 'Othmane',
        email: 'othmaneznidi@gmail.com',
        mot_de_passe_hash,
        role: 'Admin',
        statut: 'Actif'
      });
      console.log('SUCCESS: Administrateur créé : Othmane Znidi (othmaneznidi@gmail.com)');
    }
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'admin:', err);
    process.exit(1);
  }
};

updateAdmin();
