import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

if (dialect === 'sqlite') {
  // Base embarquée : aucun service externe requis, l'app fonctionne 100% hors ligne.
  // DB_STORAGE est fourni par main.js (dossier userData d'Electron) en mode desktop ;
  // par défaut on écrit dans server/data/ (pratique pour `npm run dev`).
  const storage = process.env.DB_STORAGE || path.join(__dirname, '../../data/database.sqlite');
  fs.mkdirSync(path.dirname(storage), { recursive: true });

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false
  });
} else {
  // Conservé pour un déploiement serveur/web partagé sur PostgreSQL (optionnel).
  sequelize = new Sequelize(
    process.env.DB_NAME || 'gestion_chantier',
    process.env.DB_USER || 'postgres',
    String(process.env.DB_PASS || ''),
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

export default sequelize;
