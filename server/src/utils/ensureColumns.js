// ============================================================
// ensureColumns — micro-migration additive
// sequelize.sync({ constraints:false }) crée les tables manquantes
// mais n'ajoute PAS les nouvelles colonnes aux tables existantes.
// Ce helper compare le modèle à la table réelle et ajoute les
// colonnes absentes (idempotent, sans toucher aux données).
// ============================================================
import sequelize from '../config/database.js';

/**
 * @param {import('sequelize').ModelStatic<any>} model
 * @param {string[]} attributeNames  noms des attributs du modèle à garantir en base
 */
export async function ensureColumns(model, attributeNames) {
  const qi = sequelize.getQueryInterface();
  const tableName = model.getTableName();

  let existing;
  try {
    existing = await qi.describeTable(tableName);
  } catch {
    // table pas encore créée -> sync s'en chargera
    return;
  }

  for (const name of attributeNames) {
    const attr = model.rawAttributes[name];
    if (!attr) continue;
    const columnName = attr.field || name;
    if (existing[columnName]) continue;

    await qi.addColumn(tableName, columnName, {
      type: attr.type,
      allowNull: attr.allowNull !== false,
      defaultValue: attr.defaultValue
    });
    console.log(`[ensureColumns] Colonne ajoutée : ${tableName}.${columnName}`);
  }
}

/**
 * Applique toutes les micro-migrations additives connues.
 */
export async function runAdditiveMigrations(models) {
  const { Ouvrier, PaiementSemaine, AvanceOuvrier } = models;
  await ensureColumns(Ouvrier, ['type_remuneration']);
  await ensureColumns(PaiementSemaine, ['type_remuneration', 'total_taches']);
  await ensureColumns(AvanceOuvrier, ['paiement_semaine_id']);
}
