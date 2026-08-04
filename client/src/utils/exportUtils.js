/**
  * Utility module for 1-Click Excel and PDF Exports in corresponding page zones.
  */

/**
 * Export data array to Excel (.csv format with UTF-8 BOM, fully compatible with Excel)
 * @param {Array} columns Array of { header: string, accessor: string|function }
 * @param {Array} data Array of objects to export
 * @param {string} filename Name of the file (without extension)
 */
export const exportToExcel = (columns, data, filename = 'export') => {
  if (!data || data.length === 0) {
    alert("Aucune donnée disponible pour l'exportation.");
    return;
  }

  // Header row
  const headers = columns.map(col => `"${(col.header || '').replace(/"/g, '""')}"`);
  const csvRows = [headers.join(';')];

  // Data rows
  data.forEach(row => {
    const rowValues = columns.map(col => {
      let val = '';
      if (typeof col.accessor === 'function') {
        val = col.accessor(row);
      } else if (col.renderText) {
        val = col.renderText(row);
      } else {
        val = row[col.accessor] !== undefined && row[col.accessor] !== null ? row[col.accessor] : '';
      }
      
      // Clean value string
      const strVal = String(val).replace(/<[^>]*>?/gm, '').trim();
      return `"${strVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(rowValues.join(';'));
  });

  const csvString = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data array to a styled, printable PDF report (1-Click PDF Report)
 * @param {Object} options { title, subtitle, columns, data, filename }
 */
export const exportToPDF = ({ title = 'Rapport BTP', subtitle = '', columns = [], data = [], filename = 'rapport' }) => {
  if (!data || data.length === 0) {
    alert("Aucune donnée disponible pour le rapport PDF.");
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Veuillez autoriser les fenêtres surgissantes (pop-ups) pour exporter le rapport PDF.");
    return;
  }

  const todayStr = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const headersHtml = columns.map(col => `<th style="padding: 10px 12px; background-color: #0284C7; color: white; text-align: left; font-size: 11px; font-weight: 700; border-bottom: 2px solid #0369A1; text-transform: uppercase;">${col.header}</th>`).join('');

  const rowsHtml = data.map((row, idx) => {
    const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    const cellsHtml = columns.map(col => {
      let val = '';
      if (typeof col.accessor === 'function') {
        val = col.accessor(row);
      } else if (col.renderText) {
        val = col.renderText(row);
      } else {
        val = row[col.accessor] !== undefined && row[col.accessor] !== null ? row[col.accessor] : '';
      }
      const strVal = String(val).replace(/<[^>]*>?/gm, '').trim();
      return `<td style="padding: 9px 12px; font-size: 11px; color: #1E293B; border-bottom: 1px solid #E2E8F0;">${strVal}</td>`;
    }).join('');

    return `<tr style="background-color: ${bg};">${cellsHtml}</tr>`;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${title} - BTP Manager</title>
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0F172A; margin: 0; padding: 20px; background-color: white; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0284C7; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 22px; font-weight: 800; color: #0284C7; letter-spacing: -0.5px; }
        .subtitle { font-size: 11px; color: #64748B; margin-top: 4px; }
        .meta { text-align: right; font-size: 11px; color: #64748B; }
        .report-title { font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; border-radius: 8px; overflow: hidden; }
        .footer { margin-top: 25px; padding-top: 15px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 10px; color: #94A3B8; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">🏗️ BTP MANAGER</div>
          <div class="subtitle">Gestion & Suivi d'Entreprise BTP</div>
        </div>
        <div class="meta">
          <div><strong>Généré le :</strong> ${todayStr}</div>
          <div><strong>Nombre d'éléments :</strong> ${data.length}</div>
        </div>
      </div>

      <div class="report-title">${title}</div>
      ${subtitle ? `<div style="font-size: 12px; color: #475569; margin-bottom: 15px;">${subtitle}</div>` : ''}

      <table>
        <thead>
          <tr>${headersHtml}</tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        Document officiel généré par BTP Manager • Confidence & Intégrité des données
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
