// ============================================================
// CalendarView.jsx — Vue calendrier mensuel type Google Calendar
// Affiche les tâches comme blocs colorés, navigation mois,
// click sur un jour pour ajouter, click sur tâche pour détails.
// ============================================================

import { useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Building2 } from 'lucide-react';
import Badge from '../ui/Badge';

const WEEKDAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const STATUS_DOT_COLORS = {
  'En cours':  'bg-sky-500',
  'En retard': 'bg-red-500',
  'Terminé':   'bg-emerald-500',
  'À faire':   'bg-slate-400',
};

const STATUS_BAR_COLORS = {
  'En cours':  'bg-sky-500/90 text-white border-sky-600',
  'En retard': 'bg-red-500/90 text-white border-red-600',
  'Terminé':   'bg-emerald-500/90 text-white border-emerald-600',
  'À faire':   'bg-slate-400/90 text-white border-slate-500',
};

export default function CalendarView({
  taches = [],
  chantiers = [],
  ouvriers = [],
  onTaskClick,
  onDayClick,
  todayStr = '2026-02-15',
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(todayStr);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const [selectedDay, setSelectedDay] = useState(null);

  // ── Navigation mois ──
  const goToPrevMonth = () => {
    setCurrentMonth(prev => {
      const d = new Date(prev.year, prev.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };
  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const d = new Date(prev.year, prev.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  // ── Générer la grille du calendrier ──
  const calendarDays = useMemo(() => {
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDow = firstDay.getDay() - 1;
    if (startDow === -1) startDow = 6;

    const days = [];

    // Jours du mois précédent
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevLastDay - i);
      days.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isCurrentMonth: false,
        dayNum: d.getDate(),
      });
    }

    // Jours du mois courant
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isCurrentMonth: true,
        dayNum: i,
      });
    }

    // Compléter à 42 (6 semaines)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isCurrentMonth: false,
        dayNum: i,
      });
    }

    return days;
  }, [currentMonth]);

  // ── Mapper tâches aux dates ──
  const tasksByDate = useMemo(() => {
    const map = {};
    taches.forEach(t => {
      if (!t.date_debut) return;
      const start = new Date(t.date_debut);
      const end = t.date_fin ? new Date(t.date_fin) : start;
      const cur = new Date(start);

      while (cur <= end) {
        const key = cur.toISOString().split('T')[0];
        if (!map[key]) map[key] = [];
        if (!map[key].some(x => x.id === t.id)) {
          map[key].push(t);
        }
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [taches]);

  const monthLabel = new Date(currentMonth.year, currentMonth.month, 1)
    .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="glass-card overflow-hidden">
      {/* ── En-tête navigation mois ── */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid var(--border-secondary)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-lg transition-colors hover:bg-[#0ea5e9]/10"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <h3 className="text-sm font-bold capitalize min-w-[160px] text-center" style={{ color: 'var(--text-primary)' }}>
            {monthLabel}
          </h3>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg transition-colors hover:bg-[#0ea5e9]/10"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => {
            const d = new Date(todayStr);
            setCurrentMonth({ year: d.getFullYear(), month: d.getMonth() });
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border"
          style={{
            borderColor: 'var(--border-primary)',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-hover)',
          }}
        >
          Aujourd'hui
        </button>
      </div>

      {/* ── En-tête jours de la semaine ── */}
      <div
        className="grid grid-cols-7 text-[10px] font-bold uppercase tracking-wider"
        style={{
          backgroundColor: 'var(--bg-hover)',
          color: 'var(--text-muted)',
          borderBottom: '1px solid var(--border-secondary)',
        }}
      >
        {WEEKDAYS.map((day, idx) => (
          <div key={idx} className="py-2.5 text-center">
            {day.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* ── Grille des jours ── */}
      <div className="grid grid-cols-7" style={{ borderTop: '1px solid var(--border-secondary)' }}>
        {calendarDays.map((day, idx) => {
          const dayTasks = tasksByDate[day.dateStr] || [];
          const isToday = day.dateStr === todayStr;
          const isSelected = selectedDay === day.dateStr;

          return (
            <div
              key={idx}
              onClick={() => {
                setSelectedDay(day.dateStr);
                onDayClick?.(day.dateStr);
              }}
              className={`min-h-[110px] p-1.5 flex flex-col group cursor-pointer transition-colors relative ${
                !day.isCurrentMonth ? 'opacity-40' : ''
              }`}
              style={{
                backgroundColor: isToday
                  ? 'rgba(14, 165, 233, 0.06)'
                  : isSelected
                    ? 'var(--bg-hover)'
                    : 'transparent',
                borderBottom: '1px solid var(--border-secondary)',
                borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-secondary)' : 'none',
              }}
            >
              {/* Numéro du jour */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center ${
                    isToday ? 'bg-[#0ea5e9] text-white shadow-md' : ''
                  }`}
                  style={!isToday ? { color: 'var(--text-secondary)' } : {}}
                >
                  {day.dayNum}
                </span>

                {/* Bouton + visible au hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDayClick?.(day.dateStr);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all hover:bg-[#0ea5e9]/10"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Liste des tâches du jour */}
              <div className="flex-1 space-y-0.5 overflow-y-auto max-h-[80px]">
                {dayTasks.slice(0, 3).map(task => {
                  const barClass = STATUS_BAR_COLORS[task.statut] || STATUS_BAR_COLORS['À faire'];
                  return (
                    <button
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick?.(task);
                      }}
                      className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-semibold border truncate transition-all hover:brightness-110 ${barClass}`}
                    >
                      {task.nom}
                    </button>
                  );
                })}
                {dayTasks.length > 3 && (
                  <span className="text-[9px] font-medium px-1" style={{ color: 'var(--text-muted)' }}>
                    +{dayTasks.length - 3} autre(s)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
