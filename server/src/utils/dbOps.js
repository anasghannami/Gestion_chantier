// SQLite (dialecte par défaut, base embarquée) ne connaît pas l'opérateur
// ILIKE de PostgreSQL — mais son LIKE est déjà insensible à la casse pour les
// caractères ASCII, ce qui donne un résultat équivalent pour nos recherches.
// Sur un déploiement PostgreSQL (optionnel), on garde le vrai ILIKE.
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const iLike = sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
