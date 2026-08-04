// ============================================================
// GanttView.jsx — Diagramme de Gantt avec Grille Temporelle 3 Niveaux
// Ligne 1: MOIS (JUILLET 2026, AOÛT 2026...)
// Ligne 2: NUMÉROS DES JOURS (1, 2, 3, 4, 5... 31)
// Ligne 3: INITIALES DES JOURS (L, M, M, J, V, S, D)
// + WBS hiérarchique (└─ Sous-tâches), Week-ends grises,
// Ligne rouge pointillée "Aujourd'hui", Jalons ◆, Dépendances SVG,
// Chemin critique en rouge vif #ef4444.
// ============================================================

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  ChevronDown, ChevronRight, Link as LinkIcon, Diamond,
  GripVertical, Clock, User, AlertTriangle, ZoomIn
} from 'lucide-react';
import Badge from '../ui/Badge';

// ─── Constantes visuelles ────────────────────────────────────
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 64; // 3 rangées : 24px + 20px + 20px
const LEFT_COL_WIDTH = 480;
const BAR_HEIGHT = 22;
const BAR_Y_OFFSET = (ROW_HEIGHT - BAR_HEIGHT) / 2;

// Couleurs des barres selon le statut
const STATUS_COLORS = {
  'En cours': { bg: '#0ea5e9', border: '#0284c7', text: '#fff' },
  'En retard': { bg: '#ef4444', border: '#dc2626', text: '#fff' },
  'Terminé': { bg: '#22c55e', border: '#16a34a', text: '#fff' },
  'Terminée': { bg: '#22c55e', border: '#16a34a', text: '#fff' },
  'À faire': { bg: '#94a3b8', border: '#64748b', text: '#fff' },
};

// ─── Helpers ─────────────────────────────────────────────────
function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / (86400000));
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDateFr(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

// Lettres initiales des jours en français
const DAY_LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

// ─── Composant principal ─────────────────────────────────────
export default function GanttView({
  taches = [],
  chantiers = [],
  ouvriers = [],
  onTaskClick,
  todayStr = '2026-02-15',
}) {
  // ── State Zoom ──
  const [zoomLevel, setZoomLevel] = useState('Jours'); // 'Jours' | 'Semaines'
  const [collapsedPhases, setCollapsedPhases] = useState({});
  const [hoveredTaskId, setHoveredTaskId] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const timelineRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Largeur d'une journée en pixels selon le zoom
  const DAY_WIDTH = useMemo(() => {
    if (zoomLevel === 'Jours') return 44;
    if (zoomLevel === 'Semaines') return 36;
    return 14; // 'Mois'
  }, [zoomLevel]);

  // ── Calculer la plage de dates globale ──
  const { timelineStart, totalDays, months, weeks, years } = useMemo(() => {
    if (taches.length === 0) {
      return { timelineStart: todayStr, totalDays: 30, months: [], weeks: [], years: [] };
    }

    let minDate = taches[0].date_debut || todayStr;
    let maxDate = taches[0].date_fin || todayStr;
    taches.forEach(t => {
      if (t.date_debut && t.date_debut < minDate) minDate = t.date_debut;
      if (t.date_fin && t.date_fin > maxDate) maxDate = t.date_fin;
    });

    const marginBefore = zoomLevel === 'Mois' ? -30 : -7;
    const marginAfter = zoomLevel === 'Mois' ? 60 : 21;

    const start = addDays(minDate, marginBefore);
    const end = addDays(maxDate, marginAfter);
    const total = Math.max(30, daysBetween(start, end) + 1);

    const monthsList = [];
    const weeksList = [];
    const yearsList = [];
    let cursor = new Date(start);
    let currentMonth = null;
    let currentYear = null;

    for (let i = 0; i < total; i++) {
      const d = new Date(cursor);
      d.setDate(d.getDate() + i);

      const yearKey = d.getFullYear();
      const monthKey = `${yearKey}-${d.getMonth()}`;

      // Années
      if (yearKey !== currentYear) {
        currentYear = yearKey;
        yearsList.push({
          label: `${yearKey}`,
          startDay: i,
          days: 0,
        });
      }
      yearsList[yearsList.length - 1].days++;

      // Mois
      if (monthKey !== currentMonth) {
        currentMonth = monthKey;
        monthsList.push({
          label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase(),
          shortLabel: d.toLocaleDateString('fr-FR', { month: 'short' }),
          startDay: i,
          days: 0,
        });
      }
      monthsList[monthsList.length - 1].days++;

      // Semaines
      if (d.getDay() === 1 || i === 0) {
        const weekNum = getWeekNumber(d);
        weeksList.push({
          label: `S${weekNum}`,
          startDay: i,
          days: 0,
        });
      }
      if (weeksList.length > 0) {
        weeksList[weeksList.length - 1].days++;
      }
    }

    return {
      timelineStart: start,
      totalDays: total,
      months: monthsList,
      weeks: weeksList,
      years: yearsList,
    };
  }, [taches, todayStr, zoomLevel]);

  // ── Grouper les tâches par chantier et sous-tâches WBS ──
  const groupedTasks = useMemo(() => {
    const groups = [];

    chantiers.forEach(chantier => {
      const chantierTasks = taches.filter(t => String(t.chantier_id) === String(chantier.id));
      if (chantierTasks.length === 0) return;

      const parentTasks = chantierTasks.filter(t => !t.parent_id);
      const visibleTasks = [];

      parentTasks.forEach(parent => {
        visibleTasks.push(parent);
        if (!collapsedPhases[parent.id]) {
          const children = chantierTasks.filter(t => t.parent_id === parent.id);
          children.sort((a, b) => (a.date_debut || '').localeCompare(b.date_debut || ''));
          visibleTasks.push(...children);
        }
      });

      groups.push({ chantier, tasks: visibleTasks });
    });

    const orphanTasks = taches.filter(t => !chantiers.some(c => String(c.id) === String(t.chantier_id)));
    if (orphanTasks.length > 0) {
      groups.push({ chantier: { id: 'orphan', nom: 'Autres Tâches' }, tasks: orphanTasks });
    }

    return groups;
  }, [taches, chantiers, collapsedPhases]);

  const flatTasks = useMemo(() => {
    const list = [];
    groupedTasks.forEach(group => {
      list.push({ type: 'chantier-header', chantier: group.chantier });
      group.tasks.forEach(t => list.push({ type: 'task', task: t }));
    });
    return list;
  }, [groupedTasks]);

  const getBarPosition = useCallback((task) => {
    if (!task.date_debut) return { x: 0, width: DAY_WIDTH };
    const startOffset = daysBetween(timelineStart, task.date_debut);
    const dureeJours = task.duree || (task.date_fin ? daysBetween(task.date_debut, task.date_fin) + 1 : 1);
    return {
      x: startOffset * DAY_WIDTH,
      width: Math.max(dureeJours * DAY_WIDTH - 3, 10),
    };
  }, [timelineStart, DAY_WIDTH]);

  const todayOffset = useMemo(() => {
    return daysBetween(timelineStart, todayStr) * DAY_WIDTH + DAY_WIDTH / 2;
  }, [timelineStart, todayStr, DAY_WIDTH]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollTo = todayOffset - 250;
      scrollContainerRef.current.scrollLeft = Math.max(0, scrollTo);
    }
  }, [todayOffset, zoomLevel]);

  const timelineWidth = totalDays * DAY_WIDTH;

  let totalHeight = 0;
  flatTasks.forEach(item => {
    totalHeight += item.type === 'chantier-header' ? 36 : ROW_HEIGHT;
  });

  const rowPositions = useMemo(() => {
    const positions = [];
    let y = 0;
    flatTasks.forEach((item, idx) => {
      const h = item.type === 'chantier-header' ? 36 : ROW_HEIGHT;
      positions.push({ y, height: h, index: idx });
      y += h;
    });
    return positions;
  }, [flatTasks]);

  // Flèches de dépendance SVG
  const dependencyArrows = useMemo(() => {
    const arrows = [];
    const taskIndexMap = {};
    flatTasks.forEach((item, idx) => {
      if (item.type === 'task') {
        taskIndexMap[item.task.id] = idx;
      }
    });

    flatTasks.forEach((item, idx) => {
      if (item.type !== 'task') return;
      const task = item.task;
      if (!task.dependances_ids || task.dependances_ids.length === 0) return;

      task.dependances_ids.forEach(dep => {
        let fromIdx;
        if (typeof dep === 'number') {
          fromIdx = taskIndexMap[dep];
        } else {
          const foundItem = flatTasks.find(it => it.type === 'task' && it.task.nom === dep);
          if (foundItem) fromIdx = taskIndexMap[foundItem.task.id];
        }

        if (fromIdx === undefined) return;

        const fromTask = flatTasks[fromIdx].task;
        const fromPos = getBarPosition(fromTask);
        const toPos = getBarPosition(task);

        const fromY = rowPositions[fromIdx]?.y || 0;
        const toY = rowPositions[idx]?.y || 0;

        arrows.push({
          id: `${dep}->${task.id}`,
          x1: fromPos.x + fromPos.width + 2,
          y1: fromY + ROW_HEIGHT / 2,
          x2: toPos.x - 2,
          y2: toY + ROW_HEIGHT / 2,
          isCritical: task.is_critical && fromTask.is_critical,
        });
      });
    });
    return arrows;
  }, [flatTasks, rowPositions, getBarPosition]);

  return (
    <div className="glass-card overflow-hidden flex flex-col">

      {/* ═══════════════════════════════════════════
          BARRE DE ZOOM (Liste | Gantt | Calendrier & Zoom)
          ═══════════════════════════════════════════ */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{
          borderColor: 'var(--border-secondary)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
          <ZoomIn className="h-4 w-4 text-[#0284C7]" />
          <span>Échelle Gantt :</span>
        </div>

        {/* Toggle Zoom pill buttons */}
        <div className="flex bg-[#0284C7]/10 p-1 rounded-xl border border-[#0284C7]/20">
          {['Jours', 'Semaines'].map((level) => {
            const isActive = zoomLevel === level;
            return (
              <button
                key={level}
                onClick={() => setZoomLevel(level)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${isActive
                    ? 'bg-[#0284C7] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#0284C7]'
                  }`}
              >
                {level}
                {level === 'Jours' && <span className="text-[10px] ml-1 opacity-75"></span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex overflow-hidden">
        {/* ═══════════════════════════════════════════
            COLONNE GAUCHE : Tableau WBS
            ═══════════════════════════════════════════ */}
        <div
          className="flex-shrink-0 border-r"
          style={{
            width: LEFT_COL_WIDTH,
            borderColor: 'var(--border-primary)',
          }}
        >
          {/* En-tête colonnes gauche */}
          <div
            className="flex items-center text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10"
            style={{
              height: HEADER_HEIGHT,
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-primary)',
              color: 'var(--text-tertiary)',
            }}
          >
            <div className="flex-1 px-3">Tâche (WBS)</div>
            <div className="w-14 text-center">Durée</div>
            <div className="w-20 text-center">Début</div>
            <div className="w-20 text-center">Fin</div>
            <div className="w-20 text-center">Avancement</div>
          </div>

          {/* Lignes des tâches WBS */}
          <div>
            {flatTasks.map((item, idx) => {
              if (item.type === 'chantier-header') {
                return (
                  <div
                    key={`ch-${item.chantier.id}`}
                    className="flex items-center px-3 font-bold text-[11px]"
                    style={{
                      height: 36,
                      backgroundColor: 'var(--bg-hover)',
                      color: '#0284C7',
                      borderBottom: '1px solid var(--border-secondary)',
                    }}
                  >
                    <span className="truncate">{item.chantier.nom}</span>
                    <span className="ml-auto text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>
                      {taches.filter(t => String(t.chantier_id) === String(item.chantier.id)).length} tâche(s)
                    </span>
                  </div>
                );
              }

              const task = item.task;
              const isParent = !task.parent_id && taches.some(t => t.parent_id === task.id);
              const isChild = !!task.parent_id;
              const isCollapsed = collapsedPhases[task.id];

              return (
                <div
                  key={`row-${task.id}`}
                  className="flex items-center text-[11px] transition-colors cursor-pointer group"
                  style={{
                    height: ROW_HEIGHT,
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-hover)',
                    borderBottom: '1px solid var(--border-secondary)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    setHoveredTaskId(task.id);
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => {
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => setHoveredTaskId(null)}
                >
                  {/* Nom de la tâche hiérarchique WBS */}
                  <div className="flex-1 flex items-center px-2 min-w-0">
                    {isParent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCollapsedPhases(prev => ({ ...prev, [task.id]: !prev[task.id] }));
                        }}
                        className="mr-1 p-0.5 rounded hover:bg-[#0284C7]/10 transition-colors flex-shrink-0"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {isCollapsed
                          ? <ChevronRight className="h-3.5 w-3.5" />
                          : <ChevronDown className="h-3.5 w-3.5" />
                        }
                      </button>
                    )}
                    {isChild && (
                      <span className="text-[11px] mr-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
                        └─
                      </span>
                    )}
                    {task.is_milestone && (
                      <Diamond className="h-3 w-3 mr-1 flex-shrink-0 text-red-500" />
                    )}

                    <span
                      className={`truncate ${isParent ? 'font-bold' : 'font-medium'} ${task.is_critical && task.statut !== 'Terminé' && task.statut !== 'Terminée' ? 'text-red-500' : ''
                        }`}
                      title={task.nom}
                    >
                      {task.nom}
                    </span>
                  </div>

                  {/* Durée */}
                  <div className="w-14 text-center font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    {task.duree || 1}j
                  </div>

                  {/* Début */}
                  <div className="w-20 text-center text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    {formatDateFr(task.date_debut)}
                  </div>

                  {/* Fin */}
                  <div className="w-20 text-center text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    {formatDateFr(task.date_fin)}
                  </div>

                  {/* Avancement */}
                  <div className="w-20 flex items-center justify-center gap-1">
                    <div className="w-10 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${task.avancement || task.pourcentage_avancement || 0}%`,
                          backgroundColor: (task.avancement || task.pourcentage_avancement) === 100 ? '#22c55e' : '#0284C7',
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                      {task.avancement || task.pourcentage_avancement || 0}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            ZONE DROITE : Timeline SVG
            ═══════════════════════════════════════════ */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <div style={{ width: timelineWidth, minWidth: '100%' }}>

            {/* EN-TÊTE TIMELINE (3 NIVEAUX : MOIS / NUMÉROS / LETTRES JOURS) */}
            <div
              className="sticky top-0 z-10 flex flex-col"
              style={{
                height: HEADER_HEIGHT,
                backgroundColor: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-primary)',
              }}
            >
              {/* Ligne 1 : MOIS (ex: JUILLET 2026, AOÛT 2026) */}
              <div className="flex border-b" style={{ height: 24, borderColor: 'var(--border-secondary)' }}>
                {zoomLevel === 'Mois'
                  ? years.map((y, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-[10px] font-bold uppercase tracking-wide border-r"
                      style={{
                        width: y.days * DAY_WIDTH,
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {y.label}
                    </div>
                  ))
                  : months.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-[10px] font-bold uppercase tracking-wide border-r truncate px-1"
                      style={{
                        width: m.days * DAY_WIDTH,
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {m.label}
                    </div>
                  ))
                }
              </div>

              {/* Ligne 2 : NUMÉRO DES JOURS (1, 2, 3... 31) ou Mois/Semaines */}
              <div className="flex border-b" style={{ height: 20, borderColor: 'var(--border-secondary)' }}>
                {zoomLevel === 'Mois' &&
                  months.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-[9px] font-semibold border-r capitalize"
                      style={{
                        width: m.days * DAY_WIDTH,
                        borderColor: 'var(--border-secondary)',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      {m.shortLabel}
                    </div>
                  ))
                }

                {zoomLevel === 'Semaines' &&
                  weeks.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-[9px] font-bold border-r"
                      style={{
                        width: w.days * DAY_WIDTH,
                        borderColor: 'var(--border-secondary)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {w.label}
                    </div>
                  ))
                }

                {zoomLevel === 'Jours' &&
                  Array.from({ length: totalDays }, (_, i) => {
                    const dateCheck = addDays(timelineStart, i);
                    const d = new Date(dateCheck);
                    const isToday = dateCheck === todayStr;

                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-center text-[9px] font-bold border-r ${isToday ? 'bg-[#0284C7] text-white' : ''
                          }`}
                        style={{
                          width: DAY_WIDTH,
                          borderColor: 'var(--border-secondary)',
                          color: isToday ? '#ffffff' : 'var(--text-primary)',
                        }}
                      >
                        {d.getDate()}
                      </div>
                    );
                  })
                }
              </div>

              {/* Ligne 3 : INITIALE DU JOUR (L, M, M, J, V, S, D) */}
              <div className="flex" style={{ height: 20 }}>
                {zoomLevel === 'Mois' &&
                  months.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-[8px] font-medium border-r uppercase"
                      style={{
                        width: m.days * DAY_WIDTH,
                        borderColor: 'var(--border-secondary)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Mois
                    </div>
                  ))
                }

                {zoomLevel === 'Semaines' &&
                  Array.from({ length: totalDays }, (_, i) => {
                    const dateCheck = addDays(timelineStart, i);
                    const d = new Date(dateCheck);
                    const isWeekend = [0, 6].includes(d.getDay());
                    const letter = DAY_LETTERS[d.getDay()];

                    return (
                      <div
                        key={i}
                        className="flex items-center justify-center text-[8px] font-semibold border-r"
                        style={{
                          width: DAY_WIDTH,
                          borderColor: 'var(--border-secondary)',
                          color: isWeekend ? '#ef4444' : 'var(--text-muted)',
                        }}
                      >
                        {letter}
                      </div>
                    );
                  })
                }

                {zoomLevel === 'Jours' &&
                  Array.from({ length: totalDays }, (_, i) => {
                    const dateCheck = addDays(timelineStart, i);
                    const d = new Date(dateCheck);
                    const isWeekend = [0, 6].includes(d.getDay());
                    const letter = DAY_LETTERS[d.getDay()];

                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-center text-[8px] font-semibold border-r ${isWeekend ? 'text-red-500 font-bold' : ''
                          }`}
                        style={{
                          width: DAY_WIDTH,
                          borderColor: 'var(--border-secondary)',
                          color: isWeekend ? '#ef4444' : 'var(--text-muted)',
                        }}
                      >
                        {letter}
                      </div>
                    );
                  })
                }
              </div>

            </div>

            {/* Zone SVG des barres */}
            <svg
              ref={timelineRef}
              width={timelineWidth}
              height={totalHeight}
              className="block"
            >
              {/* Grille verticale jours & Week-ends grises */}
              {Array.from({ length: totalDays }, (_, i) => {
                const x = i * DAY_WIDTH;
                const dateCheck = addDays(timelineStart, i);
                const isWeekend = [0, 6].includes(new Date(dateCheck).getDay());

                return (
                  <g key={`grid-${i}`}>
                    {/* Week-ends (Samedi / Dimanche) grises */}
                    {isWeekend && (
                      <rect
                        x={x}
                        y={0}
                        width={DAY_WIDTH}
                        height={totalHeight}
                        fill="var(--bg-tertiary)"
                        opacity={0.4}
                      />
                    )}
                    <line
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={totalHeight}
                      stroke="var(--border-secondary)"
                      strokeWidth={0.5}
                    />
                  </g>
                );
              })}

              {/* Lignes horizontales */}
              {rowPositions.map((pos, i) => (
                <line
                  key={`hline-${i}`}
                  x1={0}
                  y1={pos.y + pos.height}
                  x2={timelineWidth}
                  y2={pos.y + pos.height}
                  stroke="var(--border-secondary)"
                  strokeWidth={0.5}
                />
              ))}

              {/* Barres des tâches */}
              {flatTasks.map((item, idx) => {
                if (item.type !== 'task') return null;
                const task = item.task;
                const { x, width } = getBarPosition(task);
                const rowY = rowPositions[idx]?.y || 0;
                const barY = rowY + BAR_Y_OFFSET;
                const isCritical = task.is_critical || task.statut === 'En retard';
                const colors = isCritical
                  ? { bg: '#ef4444', border: '#b91c1c', text: '#fff' } // Rouge vif #ef4444 pour chemin critique
                  : STATUS_COLORS[task.statut] || STATUS_COLORS['À faire'];

                const isParent = !task.parent_id && taches.some(t => t.parent_id === task.id);
                const isHovered = hoveredTaskId === task.id;
                const progress = task.avancement !== undefined ? task.avancement : task.pourcentage_avancement || 0;

                // ── Jalon (losange rouge ◆) ──
                if (task.is_milestone) {
                  const cx = x + DAY_WIDTH / 2;
                  const cy = rowY + ROW_HEIGHT / 2;
                  const size = 8;
                  return (
                    <g
                      key={`bar-${task.id}`}
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        setHoveredTaskId(task.id);
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredTaskId(null)}
                    >
                      <polygon
                        points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
                        fill="#ef4444"
                        stroke="#dc2626"
                        strokeWidth={2}
                      />
                    </g>
                  );
                }

                // ── Barre parent (phase) ──
                if (isParent) {
                  return (
                    <g
                      key={`bar-${task.id}`}
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        setHoveredTaskId(task.id);
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredTaskId(null)}
                    >
                      <rect
                        x={x}
                        y={rowY + ROW_HEIGHT / 2 - 3}
                        width={width}
                        height={6}
                        rx={2}
                        fill={colors.bg}
                        opacity={0.7}
                      />
                      <polygon
                        points={`${x},${rowY + ROW_HEIGHT / 2 - 6} ${x + 6},${rowY + ROW_HEIGHT / 2} ${x},${rowY + ROW_HEIGHT / 2 + 6}`}
                        fill={colors.bg}
                      />
                      <polygon
                        points={`${x + width},${rowY + ROW_HEIGHT / 2 - 6} ${x + width - 6},${rowY + ROW_HEIGHT / 2} ${x + width},${rowY + ROW_HEIGHT / 2 + 6}`}
                        fill={colors.bg}
                      />
                    </g>
                  );
                }

                // ── Barre enfant standard ──
                return (
                  <g
                    key={`bar-${task.id}`}
                    className="cursor-pointer"
                    onMouseEnter={(e) => {
                      setHoveredTaskId(task.id);
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setHoveredTaskId(null)}
                    onMouseMove={(e) => {
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }}
                  >
                    {/* Fond de barre */}
                    <rect
                      x={x}
                      y={barY}
                      width={width}
                      height={BAR_HEIGHT}
                      rx={5}
                      fill={colors.bg}
                      stroke={isCritical ? '#b91c1c' : colors.border}
                      strokeWidth={isCritical ? 2.5 : 1}
                      opacity={isHovered ? 1 : 0.9}
                    />

                    {/* Barre de progression */}
                    {progress > 0 && progress < 100 && (
                      <rect
                        x={x + 1}
                        y={barY + BAR_HEIGHT - 4}
                        width={Math.max(0, (width - 2) * (progress / 100))}
                        height={3}
                        rx={1.5}
                        fill="rgba(255,255,255,0.6)"
                      />
                    )}

                    {/* Texte du nom de la tâche si la place le permet */}
                    {width > 30 && (
                      <text
                        x={x + 6}
                        y={barY + BAR_HEIGHT / 2 + 1}
                        fill={colors.text}
                        fontSize={10}
                        fontWeight={600}
                        fontFamily="Inter, system-ui, sans-serif"
                        dominantBaseline="middle"
                      >
                        <tspan>
                          {task.nom.length > Math.floor(width / 6.5)
                            ? task.nom.substring(0, Math.max(3, Math.floor(width / 6.5))) + '…'
                            : task.nom}
                        </tspan>
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Flèches de dépendance courbes SVG */}
              {dependencyArrows.map(arrow => {
                const midX = (arrow.x1 + arrow.x2) / 2;
                const path = `M ${arrow.x1} ${arrow.y1} C ${midX} ${arrow.y1}, ${midX} ${arrow.y2}, ${arrow.x2} ${arrow.y2}`;
                return (
                  <g key={arrow.id}>
                    <path
                      d={path}
                      fill="none"
                      stroke={arrow.isCritical ? '#ef4444' : 'var(--text-muted)'}
                      strokeWidth={arrow.isCritical ? 2 : 1.2}
                      strokeDasharray={arrow.isCritical ? '' : '4 3'}
                      opacity={0.7}
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })}

              {/* Ligne verticale rouge pointillée de la date du jour (AUJOURD'HUI) */}
              <line
                x1={todayOffset}
                y1={0}
                x2={todayOffset}
                y2={totalHeight}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="6 4"
                opacity={0.95}
              />
              <text
                x={todayOffset + 4}
                y={14}
                fill="#ef4444"
                fontSize={9}
                fontWeight={700}
                fontFamily="Inter, system-ui, sans-serif"
              >
                Aujourd'hui
              </text>

              {/* Arrow marker definition */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="var(--text-muted)" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          TOOLTIP flottant au survol
          ═══════════════════════════════════════════ */}
      {hoveredTaskId && (() => {
        const task = taches.find(t => t.id === hoveredTaskId);
        if (!task) return null;
        const assignedWorkers = ouvriers.filter(o => task.ouvriers_ids?.includes(o.id));
        const chantier = chantiers.find(c => String(c.id) === String(task.chantier_id));
        const progress = task.avancement !== undefined ? task.avancement : task.pourcentage_avancement || 0;

        const tooltipX = Math.max(10, Math.min(tooltipPos.x + 16, window.innerWidth - 300));
        const tooltipY = Math.max(10, Math.min(tooltipPos.y + 16, window.innerHeight - 220));

        return (
          <div
            className="fixed z-[9999] pointer-events-none transition-all duration-75 ease-out"
            style={{
              left: tooltipX,
              top: tooltipY,
            }}
          >
            <div
              className="rounded-xl p-3 shadow-2xl border max-w-[280px]"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <h5 className="font-bold text-xs truncate mr-2" style={{ color: 'var(--text-primary)' }}>
                  {task.nom}
                </h5>
                <Badge status={task.statut} />
              </div>

              {chantier && (
                <p className="text-[10px] mb-1.5 font-semibold" style={{ color: '#0284C7' }}>
                  {chantier.nom}
                </p>
              )}

              <div className="grid grid-cols-2 gap-1 text-[10px] mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                <span>Début : <strong style={{ color: 'var(--text-primary)' }}>{formatDateFr(task.date_debut)}</strong></span>
                <span>Fin : <strong style={{ color: 'var(--text-primary)' }}>{formatDateFr(task.date_fin)}</strong></span>
                <span>Durée : <strong style={{ color: 'var(--text-primary)' }}>{task.duree || 1}j</strong></span>
                <span>Avancement : <strong style={{ color: 'var(--text-primary)' }}>{progress}%</strong></span>
              </div>

              {assignedWorkers.length > 0 && (
                <div className="flex items-center gap-1 text-[10px] pt-1.5" style={{ borderTop: '1px solid var(--border-secondary)', color: 'var(--text-tertiary)' }}>
                  <User className="h-3 w-3" />
                  <span>{assignedWorkers.map(w => `${w.prenom} ${w.nom.charAt(0)}.`).join(', ')}</span>
                </div>
              )}

              {(task.is_critical || task.statut === 'En retard') && (
                <div className="flex items-center gap-1 text-[10px] text-red-500 mt-1.5 font-semibold">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Chemin critique</span>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
