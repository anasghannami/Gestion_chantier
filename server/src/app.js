import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/database.js';
import './models/index.js';

import authRoutes from './routes/auth.js';
import chantiersRoutes from './routes/chantiers.js';
import fournisseursRoutes from './routes/fournisseurs.js';
import commandesRoutes from './routes/commandes.js';
import dashboardRoutes from './routes/dashboard.js';
import facturesRoutes from './routes/factures.js';
import ouvriersRoutes from './routes/ouvriers.js';
import devisRoutes from './routes/devis.js';
import stocksRoutes from './routes/stocks.js';
import documentsRoutes from './routes/documents.js';
import societeRoutes from './routes/societe.js';
import journalRoutes from './routes/journal.js';
import sousTraitantsRoutes from './routes/sousTraitants.js';
import tachesRoutes from './routes/taches.js';
import phasesRoutes from './routes/phases.js';
import evenementsRoutes from './routes/evenements.js';
import enginsRoutes from './routes/engins.js';
import jalonsRoutes from './routes/jalons.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Servir les fichiers téléversés (Photos, PDF, BL, etc.)
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/chantiers', chantiersRoutes);
app.use('/api/fournisseurs', fournisseursRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/factures', facturesRoutes);
app.use('/api/ouvriers', ouvriersRoutes);
app.use('/api/devis', devisRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/societe', societeRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/sous-traitants', sousTraitantsRoutes);
app.use('/api/taches', tachesRoutes);
app.use('/api/phases', phasesRoutes);
app.use('/api/evenements', evenementsRoutes);
app.use('/api/engins', enginsRoutes);
app.use('/api/jalons', jalonsRoutes);



// Servir les fichiers construits du client React (Production / Desktop)
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err && !res.headersSent) {
      next();
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur.', error: err.message });
});

import { Utilisateur } from './models/index.js';

const PORT = process.env.PORT || 5000;

sequelize.sync({ constraints: false }).then(async () => {
  try {
    const userCount = await Utilisateur.count();
    if (userCount === 0) {
      const bcrypt = (await import('bcryptjs')).default;
      const hash = await bcrypt.hash('othmane12345', 10);
      await Utilisateur.create({
        nom: 'Znidi',
        prenom: 'Othmane',
        email: 'othmaneznidi@gmail.com',
        mot_de_passe_hash: hash,
        role: 'Admin'
      });
      console.log('Compte Administrateur par défaut initialisé (othmaneznidi@gmail.com / othmane12345).');
    }
  } catch (e) {
    console.error('Erreur vérification utilisateur initial:', e.message);
  }

  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}).catch(err => {
  console.error('Impossible de se connecter à la base de données:', err);
});

