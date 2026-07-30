import { Search, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function DataTable({ 
  columns, 
  data, 
  searchable = false, 
  searchPlaceholder = "Rechercher...", 
  onRowClick,
  emptyMessage = "Aucune donnée disponible"
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(lowerSearch)
      )
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <div className="glass-card overflow-hidden">
      {searchable && (
        <div 
          className="p-4 flex justify-between items-center"
          style={{ borderBottom: '1px solid var(--border-secondary)', backgroundColor: 'var(--bg-hover)' }}
        >
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0284C7] transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" style={{ color: 'var(--text-secondary)' }}>
          <thead 
            className="text-xs uppercase"
            style={{ 
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-tertiary)',
              borderBottom: '1px solid var(--border-secondary)'
            }}
          >
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="px-6 py-4 font-medium whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  style={{ borderBottom: '1px solid var(--border-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="h-8 w-8 mb-2" style={{ color: 'var(--text-muted)' }} />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div 
          className="p-4 flex items-center justify-between"
          style={{ 
            borderTop: '1px solid var(--border-secondary)',
            backgroundColor: 'var(--bg-hover)'
          }}
        >
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Affichage de <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> sur <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{filteredData.length}</span> résultats
          </span>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm px-2" style={{ color: 'var(--text-secondary)' }}>
              Page {currentPage} sur {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
