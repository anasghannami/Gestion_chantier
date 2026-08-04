import { useState } from 'react';
import { Clock, User, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

const STATUS_PILL_STYLES = {
  'À faire': 'bg-sky-500 text-white border-sky-600 hover:bg-sky-600 dark:bg-sky-600/90 dark:text-white dark:border-sky-500',
  'En cours': 'bg-amber-500 text-slate-950 font-bold border-amber-600 hover:bg-amber-600 dark:bg-amber-500/90 dark:text-slate-950 dark:border-amber-400',
  'Terminé': 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 dark:bg-emerald-600/90 dark:text-white dark:border-emerald-500',
  'En retard': 'bg-red-600 text-white border-red-700 hover:bg-red-700 dark:bg-red-600/90 dark:text-white dark:border-red-500'
};

const STATUS_ICONS = {
  'À faire': Clock,
  'En cours': Clock,
  'Terminé': CheckCircle2,
  'En retard': AlertCircle
};

export default function TaskPill({ task, chantier, ouvriers = [], onClick }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const styleClass = STATUS_PILL_STYLES[task.statut] || STATUS_PILL_STYLES['À faire'];
  const IconComp = STATUS_ICONS[task.statut] || Clock;

  const assignedWorkers = ouvriers.filter(o => task.ouvriers_ids?.includes(o.id));

  return (
    <div className="relative group">
      <button
        onClick={() => onClick(task)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`w-full text-left px-2 py-1 rounded-md text-[11px] font-semibold border flex items-center justify-between transition-all duration-200 cursor-pointer shadow-sm ${styleClass}`}
      >
        <span className="truncate mr-1">{task.nom}</span>
        <IconComp className="h-3 w-3 flex-shrink-0 opacity-90" />
      </button>

      {/* Hover Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-xl pointer-events-none transition-all">
          <div className="space-y-1.5">
            <h5 className="font-bold text-xs text-white leading-snug">{task.nom}</h5>
            
            <div className="flex items-center text-[11px] text-sky-400 font-medium">
              <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{chantier?.nom || 'Chantier non spécifié'}</span>
            </div>

            <div className="flex items-center text-[11px] text-slate-300">
              <User className="h-3 w-3 mr-1 flex-shrink-0 text-slate-400" />
              <span>
                {assignedWorkers.length > 0
                  ? assignedWorkers.map(w => `${w.prenom} ${w.nom}`).join(', ')
                  : 'Aucun ouvrier assigné'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Heures : <strong className="text-slate-200">{task.heures_estimees}h est.</strong></span>
              <span className="px-1.5 py-0.5 rounded font-bold bg-slate-800 text-slate-200">{task.statut}</span>
            </div>
          </div>

          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
}
