import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sequelize from './config/database.js';

import authRoutes from './routes/auth.js';
import chantiersRoutes from './routes/chantiers.js';
import fournisseursRoutes from './routes/fournisseurs.js';
import commandesRoutes from './routes/commandes.js';
import dashboardRoutes from './routes/dashboard.js';
import facturesRoutes from './routes/factures.js';
import ouvriersRoutes from './routes/ouvriers.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chantiers', chantiersRoutes);
app.use('/api/fournisseurs', fournisseursRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/factures', facturesRoutes);
app.use('/api/ouvriers', ouvriersRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur.', error: err.message });
});

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}).catch(err => {
  console.error('Impossible de se connecter à la base de données:', err);
});
