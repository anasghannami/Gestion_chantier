import React, { useState, useEffect } from 'react';
import { HardHat, Calendar, Clock } from 'lucide-react';
import api from '../../api/axios';

export default function OrderPrintTemplate({ commande }) {
  const [societe, setSociete] = useState(null);

  useEffect(() => {
    api.get('/societe')
      .then(res => setSociete(res.data))
      .catch(err => console.error("Erreur chargement société impression commande:", err));
  }, []);

  if (!commande) return null;

  const formatMAD = (val) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 2 }).format(val || 0);

  const tvaAmount = parseFloat(commande.montant_ttc || 0) - parseFloat(commande.montant_ht || 0);

  // Current date and exact time formatted (e.g. 30/07/2026 à 14:24)
  const now = new Date();
  const printDateStr = now.toLocaleDateString('fr-FR');
  const printTimeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const orderDateStr = commande.date_commande ? new Date(commande.date_commande).toLocaleDateString('fr-FR') : '—';
  const deliveryDateStr = commande.date_livraison_prevue ? new Date(commande.date_livraison_prevue).toLocaleDateString('fr-FR') : '—';

  return (
    <div id="print-area" className="hidden print:block p-10 bg-white text-slate-900 font-sans min-h-screen">
      {/* Top Company Header & Logo */}
      <div className="flex justify-between items-start border-b-2 border-[#0284C7] pb-6 mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            {societe?.logo ? (
              <img 
                src={societe.logo.startsWith('http') ? societe.logo : `http://localhost:5000${societe.logo}`} 
                alt="Logo Officiel" 
                className="h-14 max-w-[180px] object-contain rounded"
              />
            ) : (
              <div 
                className="p-2.5 bg-sky-100 border-2 border-[#0284C7] rounded-xl flex items-center justify-center shadow-sm"
                style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
              >
                <HardHat className="h-8 w-8 text-[#0284C7]" style={{ color: '#0284C7', stroke: '#0284C7' }} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{societe?.nom || 'BTP MANAGER SARL'}</h1>
              <p className="text-xs font-bold text-[#0284C7] tracking-wider uppercase">Gestion & Suivi de Chantiers</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {societe?.adresse || '123 Boulevard Mohammed V, Casablanca, Maroc'}<br />
            Tél: {societe?.telephone || '+212 5 22 00 00 00'} | Email: {societe?.email || 'achats@btpmanager.ma'}<br />
            <span className="font-medium text-slate-600">
              ICE: {societe?.ice || '001234567000089'} | IF: {societe?.if_fiscal || '45678901'} | RC: {societe?.rc || '234567'} {societe?.patente ? `| Patente: ${societe.patente}` : ''}
            </span>
          </p>
        </div>

        <div className="text-right">
          <div className="inline-flex items-center px-3 py-1 bg-slate-100 border border-slate-300 rounded-full text-xs font-bold text-slate-800 uppercase mb-2">
            BON DE COMMANDE
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">N° {commande.num_commande}</h2>
          <div className="text-xs text-slate-600 mt-2 space-y-1">
            <p className="flex items-center justify-end text-slate-700">
              <Calendar className="h-3.5 w-3.5 mr-1 text-[#0284C7]" style={{ color: '#0284C7' }} />
              Date Commande : <span className="font-semibold ml-1">{orderDateStr}</span>
            </p>
            {commande.date_livraison_prevue && (
              <p className="flex items-center justify-end text-slate-600">
                <Clock className="h-3.5 w-3.5 mr-1 text-amber-600" style={{ color: '#D97706' }} />
                Livraison prévue : <span className="font-semibold ml-1">{deliveryDateStr}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-400 pt-1">
              Imprimé le <span className="font-medium text-slate-600">{printDateStr}</span> à <span className="font-medium text-slate-600">{printTimeStr}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Fournisseur vs Chantier */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#0284C7] mb-2">Fournisseur / Prestataire</p>
          <p className="text-base font-bold text-slate-900">{commande.fournisseur?.raison_sociale || '—'}</p>
          <p className="text-xs text-slate-600 mt-1">Code Fournisseur : <span className="font-semibold text-slate-800">{commande.fournisseur?.code_fournisseur || '—'}</span></p>
          {commande.fournisseur?.adresse && <p className="text-xs text-slate-500 mt-1">{commande.fournisseur.adresse}</p>}
          {commande.fournisseur?.telephone && <p className="text-xs text-slate-500">Tél: {commande.fournisseur.telephone}</p>}
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#0284C7] mb-2">Lieu de Livraison / Chantier</p>
          <p className="text-base font-bold text-slate-900">{commande.chantier?.nom || '—'}</p>
          <p className="text-xs text-slate-600 mt-1">Code Chantier : <span className="font-semibold text-slate-800">{commande.chantier?.code_chantier || '—'}</span></p>
          {commande.chantier?.adresse && <p className="text-xs text-slate-500 mt-1">Adresse : {commande.chantier.adresse}</p>}
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[11px] border-b border-slate-200">
              <th className="px-4 py-3 w-12 text-center">#</th>
              <th className="px-4 py-3">Désignation des fournitures / matériaux</th>
              <th className="px-4 py-3 text-right">Montant HT</th>
              <th className="px-4 py-3 text-right">TVA (20%)</th>
              <th className="px-4 py-3 text-right">Montant TTC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-4 py-4 text-center font-bold text-slate-400">01</td>
              <td className="px-4 py-4">
                <p className="font-bold text-slate-900 text-sm">Commande de matériaux pour le chantier {commande.chantier?.nom || ''}</p>
                <p className="text-xs text-slate-500 mt-0.5">Destiné au site : {commande.chantier?.nom || '—'}</p>
              </td>
              <td className="px-4 py-4 text-right font-medium text-slate-800 text-sm">{formatMAD(commande.montant_ht)}</td>
              <td className="px-4 py-4 text-right font-medium text-slate-800 text-sm">{formatMAD(tvaAmount)}</td>
              <td className="px-4 py-4 text-right font-bold text-slate-900 text-sm">{formatMAD(commande.montant_ttc)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-72 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Total Hors Taxe (HT) :</span>
            <span className="font-semibold text-slate-900">{formatMAD(commande.montant_ht)}</span>
          </div>
          <div className="flex justify-between text-slate-600 border-b border-slate-200 pb-2">
            <span>TVA (20%) :</span>
            <span className="font-semibold text-slate-900">{formatMAD(tvaAmount)}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-900 pt-1">
            <span>TOTAL TTC :</span>
            <span className="text-base text-[#0284C7]">{formatMAD(commande.montant_ttc)}</span>
          </div>
        </div>
      </div>

      {/* Stamp & Signatures */}
      <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 mb-8">
        <div className="border border-dashed border-slate-300 p-4 rounded-xl text-center">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-6">Visa & Tampon du Fournisseur</p>
          <div className="h-10"></div>
        </div>
        <div className="border border-dashed border-slate-300 p-4 rounded-xl text-center">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-6">Signature Autorisée / Service Achats {societe?.nom || ''}</p>
          <div className="h-10"></div>
        </div>
      </div>

      {/* Footer Legal & Time Stamp */}
      <div className="text-center pt-4 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between items-center">
        <span>{societe?.nom || 'BTP Manager SARL'} • ICE: {societe?.ice || '001234567000089'} — Document Officiel</span>
        <span>Émis le {printDateStr} à {printTimeStr}</span>
      </div>
    </div>
  );
}

