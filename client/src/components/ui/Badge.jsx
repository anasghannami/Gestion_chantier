import React from 'react';

const statusConfig = {
  'En cours': { bg: 'bg-[#16A34A]/10', text: 'text-[#16A34A]', border: 'border-[#16A34A]/20' },
  'En retard': { bg: 'bg-[#DC2626]/10', text: 'text-[#DC2626]', border: 'border-[#DC2626]/20' },
  'En préparation': { bg: 'bg-[#EA580C]/10', text: 'text-[#EA580C]', border: 'border-[#EA580C]/20' },
  'Terminé': { bg: 'bg-[#0284C7]/10', text: 'text-[#0284C7]', border: 'border-[#0284C7]/20' },
  'Suspendu': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  'Brouillon': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  'Validée': { bg: 'bg-[#0284C7]/10', text: 'text-[#0284C7]', border: 'border-[#0284C7]/20' },
  'Livrée': { bg: 'bg-[#16A34A]/10', text: 'text-[#16A34A]', border: 'border-[#16A34A]/20' },
  'Annulée': { bg: 'bg-[#DC2626]/10', text: 'text-[#DC2626]', border: 'border-[#DC2626]/20' },
  'Payée': { bg: 'bg-[#16A34A]/10', text: 'text-[#16A34A]', border: 'border-[#16A34A]/20' },
  'En attente': { bg: 'bg-[#D97706]/10', text: 'text-[#D97706]', border: 'border-[#D97706]/20' },
  'Échue': { bg: 'bg-[#DC2626]/10', text: 'text-[#DC2626]', border: 'border-[#DC2626]/20' },
  'Actif': { bg: 'bg-[#16A34A]/10', text: 'text-[#16A34A]', border: 'border-[#16A34A]/20' },
  'Inactif': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  'Bloqué': { bg: 'bg-[#DC2626]/10', text: 'text-[#DC2626]', border: 'border-[#DC2626]/20' },
  'Envoyé': { bg: 'bg-[#D97706]/10', text: 'text-[#D97706]', border: 'border-[#D97706]/20' },
  'Accepté': { bg: 'bg-[#16A34A]/10', text: 'text-[#16A34A]', border: 'border-[#16A34A]/20' },
  'Refusé': { bg: 'bg-[#DC2626]/10', text: 'text-[#DC2626]', border: 'border-[#DC2626]/20' },
  'Expiré': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

const defaultStyle = { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };

export default function Badge({ status, type }) {
  const style = statusConfig[status] || defaultStyle;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {status}
    </span>
  );
}
