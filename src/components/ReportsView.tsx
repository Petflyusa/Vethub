/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Reports and Financial Accounting Ledger View.
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, DollarSign, AlertTriangle, FileText, CheckCircle, 
  Users, TrendingUp, Filter, ArrowUpRight, Award, PlusCircle, CreditCard, PieChart as PieIcon, Layers
} from 'lucide-react';
import { Invoice, RevenueSplit, Staff, Client, Pet, Role } from '../types';

interface ReportsViewProps {
  invoices: Invoice[];
  splits: RevenueSplit[];
  allStaff: Staff[];
  pets: Pet[];
  clients: Client[];
  onMarkInvoicePaid: (invoiceId: string) => void;
  onApproveSplit: (splitId: string) => void;
  onPaySplit: (splitId: string) => void;
}

export default function ReportsView({
  invoices,
  splits,
  allStaff,
  pets,
  clients,
  onMarkInvoicePaid,
  onApproveSplit,
  onPaySplit
}: ReportsViewProps) {
  const [activeReportTab, setActiveReportTab] = useState<'OVERVIEW' | 'BILLING_FOLDERS' | 'REVENUE_SPLITS'>('OVERVIEW');
  const [invoiceFilter, setInvoiceFilter] = useState<'ALL' | 'PAID' | 'DRAFT' | 'SENT'>('ALL');
  const [splitFilter, setSplitFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'PAID'>('ALL');

  // Core accounting metrics calculated from clinical state
  const settledRevenue = useMemo(() => {
    return invoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + inv.total, 0);
  }, [invoices]);

  const outstandingRevenue = useMemo(() => {
    return invoices.filter(i => i.status !== 'PAID').reduce((sum, inv) => sum + inv.total, 0);
  }, [invoices]);

  const totalInvoiced = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.total, 0);
  }, [invoices]);

  // Aggregate stats by transaction category
  const categoryStats = useMemo(() => {
    const categories = {
      Consultation: 0,
      Surgery: 0,
      Medication: 0,
      Lab: 0,
      General: 0
    };

    invoices.forEach(inv => {
      inv.items.forEach(item => {
        const cat = item.category || 'General';
        const amt = item.amount * (item.quantity || 1);
        if (cat in categories) {
          categories[cat as keyof typeof categories] += amt;
        } else {
          categories.General += amt;
        }
      });
    });

    return categories;
  }, [invoices]);

  // Sum commissions splits by clinician
  const payoutByStaff = useMemo(() => {
    return allStaff.reduce((acc, st) => {
      const staffSplits = splits.filter(s => s.staffId === st.id);
      const totalAmount = staffSplits.reduce((sum, item) => sum + item.splitAmount, 0);
      const approvedAmount = staffSplits.filter(s => s.status !== 'PENDING').reduce((sum, item) => sum + item.splitAmount, 0);
      const paidAmount = staffSplits.filter(s => s.status === 'PAID').reduce((sum, item) => sum + item.splitAmount, 0);
      
      acc[st.id] = {
        total: totalAmount,
        approved: approvedAmount,
        paid: paidAmount,
        count: staffSplits.length
      };
      return acc;
    }, {} as Record<string, { total: number; approved: number; paid: number; count: number }>);
  }, [splits, allStaff]);

  // Filters for tables
  const filteredInvoices = useMemo(() => {
    if (invoiceFilter === 'ALL') return invoices;
    return invoices.filter(inv => inv.status === invoiceFilter);
  }, [invoices, invoiceFilter]);

  const filteredSplits = useMemo(() => {
    if (splitFilter === 'ALL') return splits;
    return splits.filter(s => s.status === splitFilter);
  }, [splits, splitFilter]);

  // Custom high precision visualizer calculations - max values for scaling SVG bars
  const maxCategoryVal = Math.max(...(Object.values(categoryStats) as number[]), 1);
  const maxStaffPayoutVal = Math.max(...(Object.values(payoutByStaff) as { total: number }[]).map(x => x.total), 1);

  return (
    <div className="space-y-6" id="reports-accounting-view">
      
      {/* Page Header */}
      <div className="border-b border-[#eff4ff] pb-3 flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#0d1c2e] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00647c]" /> Veterinary Financial &amp; Revenue Reports
          </h1>
          <p className="text-xs text-[#545d62] font-semibold mt-0.5">
            Audit clinic statements, patient invoices, multi-clinician split margins, and payout divisions.
          </p>
        </div>
        
        {/* Quick accounting tab switches */}
        <div className="flex bg-[#eff4ff] p-1 rounded-xl border border-slate-200 self-start md:self-auto shadow-2xs">
          <button
            onClick={() => setActiveReportTab('OVERVIEW')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wide transition-all ${
              activeReportTab === 'OVERVIEW'
                ? 'bg-white text-[#00647c] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📊 Analytics Summary
          </button>
          <button
            onClick={() => setActiveReportTab('BILLING_FOLDERS')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wide transition-all ${
              activeReportTab === 'BILLING_FOLDERS'
                ? 'bg-white text-[#00647c] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🧾 Billing &amp; Invoices
          </button>
          <button
            onClick={() => setActiveReportTab('REVENUE_SPLITS')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wide transition-all ${
              activeReportTab === 'REVENUE_SPLITS'
                ? 'bg-white text-[#00647c] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚖️ Surgeon Splits Ledger
          </button>
        </div>
      </div>

      {/* CORE FINANCIAL INDICATOR TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border rounded-2xl p-4 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-6 -mt-6" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Paid Settled Revenue</span>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-5 h-5 text-emerald-600 shrink-0" />
            <h4 className="text-xl font-bold font-mono text-slate-850">${settledRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{invoices.filter(i => i.status === 'PAID').length} invoices settled</span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-6 -mt-6" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Outstanding Receivable</span>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <h4 className="text-xl font-bold font-mono text-slate-850">${outstandingRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Due at Patient check-out discharge</p>
        </div>

        <div className="bg-white border rounded-2xl p-4 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00647c]/5 rounded-full -mr-6 -mt-6" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Total Cumulative Billed</span>
          <div className="flex items-center gap-1.5">
            <FileText className="w-5 h-5 text-[#00647c] shrink-0" />
            <h4 className="text-xl font-bold font-mono text-slate-850">${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Sum value of all diagnostic sessions</p>
        </div>

        <div className="bg-white border rounded-2xl p-4 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#3f51b5]/5 rounded-full -mr-6 -mt-6" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Split Stipends Reserved</span>
          <div className="flex items-center gap-1.5">
            <Award className="w-5 h-5 text-[#3f51b5] shrink-0" />
            <h4 className="text-xl font-bold font-mono text-slate-850">
              ${splits.reduce((s, x) => s + x.splitAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Co-doctor &amp; nurse commissions splits</p>
        </div>

      </div>

      {/* RENDER TAB 1: GRAPHICAL ANALYTICS BREAKDOWNS */}
      {activeReportTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="overview-analytics-grid">
          
          {/* Revenue distribution by category */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#00647c]" /> Revenue Allocations by Care Category
                </h3>
                <p className="text-[10px] text-slate-400">Analysis of clinic direct clinical income channels</p>
              </div>
            </div>

            {/* Custom High Fidelity SVG Bar Distribution Visualizer */}
            <div className="space-y-3.5 pt-2">
              {(Object.entries(categoryStats) as [string, number][]).map(([category, amount]) => {
                const percentageOfMax = (amount / maxCategoryVal) * 100;
                const percentageOfTotal = totalInvoiced > 0 ? (amount / totalInvoiced) * 100 : 0;
                
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-755">{category}</span>
                      <div className="space-x-1.5 font-mono font-bold">
                        <span className="text-slate-800">${amount.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({percentageOfTotal.toFixed(1)}%)</span>
                      </div>
                    </div>
                    {/* SVG Progress bar */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${percentageOfMax || 1}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          category === 'Consultation' ? 'bg-[#00647c]' :
                          category === 'Surgery' ? 'bg-indigo-500' :
                          category === 'Medication' ? 'bg-emerald-500' :
                          category === 'Lab' ? 'bg-sky-500' : 'bg-slate-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ledger Footnote */}
            <div className="bg-[#eff4ff] p-3 rounded-xl border border-blue-150/40 text-[11px] leading-relaxed text-slate-600 font-semibold">
              <strong>💡 Trend Insight:</strong> Procedures and surgical splits compose the majority of the current operational ledger. Check-in drug dispensing boosts the pharmacy sector on active days.
            </div>
          </div>

          {/* Clinician payouts list & graphical chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" /> Surgeon Split Bonus Distribution
              </h3>
              <p className="text-[10px] text-slate-400">Total split stipends allocated based on surgical charting</p>
            </div>

            <div className="space-y-3 pt-2">
              {allStaff.map(st => {
                const data = payoutByStaff[st.id] || { total: 0, approved: 0, paid: 0, count: 0 };
                const pctOfMax = (data.total / maxStaffPayoutVal) * 100;
                
                return (
                  <div key={st.id} className="flex items-center justify-between gap-4 py-1">
                    <div className="flex items-center gap-2.5 w-1/3">
                      <img 
                        src={st.avatar} 
                        alt={st.name} 
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border" 
                      />
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-800 block truncate">{st.name.replace('Dr. ', '')}</span>
                        <span className="text-[8px] tracking-wider uppercase font-mono font-bold text-slate-400">{st.role}</span>
                      </div>
                    </div>

                    {/* SVG representation split */}
                    <div className="flex-1">
                      <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                        <span>{data.count} cases</span>
                        <span className="font-mono">${data.total.toFixed(2)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${pctOfMax || 1}%` }}
                          className="h-full bg-indigo-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-400 leading-normal border-t pt-3 text-center">
              All split stipends are computed dynamically when medical charts are locked in. Manager authorization triggers payout release tags.
            </p>
          </div>

        </div>
      )}

      {/* RENDER TAB 2: DETAILED BILLING & INVOICING DIRECTORY */}
      {activeReportTab === 'BILLING_FOLDERS' && (
        <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-4" id="billing-ledger-tab">
          
          {/* Filtering Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wide">
                🧾 Patient Billing Folders &amp; Transaction Ledger
              </h3>
              <p className="text-[10px] text-slate-400">Review status, amounts, and execute checkout direct settlements.</p>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1.5">
              {(['ALL', 'PAID', 'DRAFT', 'SENT'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setInvoiceFilter(f)}
                  className={`text-[9.5px] font-bold py-1 px-2.5 rounded border transition-all ${
                    invoiceFilter === f
                      ? 'bg-[#00647c] text-white border-[#00647c]'
                      : 'bg-white hover:bg-slate-50 text-slate-655 border-slate-200'
                  }`}
                >
                  {f === 'ALL' ? 'Show All' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b font-bold text-slate-500 uppercase text-[9px]">
                  <th className="p-3">Invoice / Folder ID</th>
                  <th className="p-3">Created Date</th>
                  <th className="p-3">Client details</th>
                  <th className="p-3">Treatment / Materials Summary</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3 text-right">Settlement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-slate-500">
                      No invoices found matching the "{invoiceFilter}" category filter.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const client = clients.find(c => c.id === inv.clientId);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-800">
                          {inv.id.toUpperCase()}
                        </td>
                        <td className="p-3 text-slate-500">{inv.date}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-800">{client?.name || 'Unknown Client'}</span>
                          <span className="block text-[10px] text-slate-400">{client?.phone}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {inv.items.map((it) => (
                              <span key={it.id} className="text-[9px] bg-slate-100 px-1.5 py-0.5 text-[#545d62] font-semibold rounded">
                                {it.description}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-[#00647c]">
                          ${inv.total.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                              : inv.status === 'SENT'
                              ? 'bg-amber-50 text-amber-800 border-amber-100 animate-pulse'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {inv.status !== 'PAID' ? (
                            <button
                              type="button"
                              onClick={() => {
                                onMarkInvoicePaid(inv.id);
                                alert(`Payment of $${inv.total.toFixed(2)} received successfully for Invoice ${inv.id.toUpperCase()}! Transaction recorded in ledger.`);
                              }}
                              className="px-2.5 py-1 bg-[#00647c] hover:bg-cyan-700 text-white font-bold rounded text-[10px] shadow-xs cursor-pointer"
                            >
                              Settle Payment
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                              ✓ Locked Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER TAB 3: SPLIT COMMISSIONS AND REVENUE DIVISION TABLE */}
      {activeReportTab === 'REVENUE_SPLITS' && (
        <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-4" id="payout-splits-tab">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wide">
                ⚖️ Shared Revenue Divisions &amp; Surgical Split Commissions
              </h3>
              <p className="text-[10px] text-slate-400">
                Audit individual team commissions generated upon charting procedures.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1.5">
              {(['ALL', 'PENDING', 'APPROVED', 'PAID'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSplitFilter(f)}
                  className={`text-[9.5px] font-bold py-1 px-2.5 rounded border transition-all ${
                    splitFilter === f
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white hover:bg-slate-50 text-slate-655 border-slate-200'
                  }`}
                >
                  {f === 'ALL' ? 'Show All' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b font-bold text-slate-500 uppercase text-[9px]">
                  <th className="p-3">Split Ref ID</th>
                  <th className="p-3">Linked Invoice</th>
                  <th className="p-3">Covering Practitioner</th>
                  <th className="p-3">Earned split %</th>
                  <th className="p-3">Payout Value</th>
                  <th className="p-3">Commissions status</th>
                  <th className="p-3 text-right">Operational Releases</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSplits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-slate-500">
                      No clinician revenue splits found in category "{splitFilter}".
                    </td>
                  </tr>
                ) : (
                  filteredSplits.map((split) => {
                    const doc = allStaff.find(s => s.id === split.staffId);
                    return (
                      <tr key={split.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono text-[10px] text-slate-500 font-bold">
                          {split.id.toUpperCase()}
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800">
                          {split.invoiceId.toUpperCase()}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img src={doc?.avatar} alt={doc?.name} className="w-7 h-7 rounded-full object-cover" />
                            <div>
                              <span className="font-bold text-slate-800 block">{doc?.name.replace('Dr. ', '')}</span>
                              <span className="text-[9px] text-slate-400 capitalize">{doc?.role}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-500">
                          {split.percentage}%
                        </td>
                        <td className="p-3 font-mono font-extrabold text-emerald-800">
                          ${split.splitAmount.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded border ${
                            split.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                              : split.status === 'APPROVED'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                              : 'bg-amber-50 text-amber-800 border-amber-140'
                          }`}>
                            {split.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {split.status === 'PENDING' && (
                              <button
                                onClick={() => {
                                  onApproveSplit(split.id);
                                  alert(`Split commission approved on record!`);
                                }}
                                className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200 cursor-pointer"
                              >
                                Approve Split
                              </button>
                            )}
                            {(split.status === 'PENDING' || split.status === 'APPROVED') && (
                              <button
                                onClick={() => {
                                  if (split.status === 'PENDING') {
                                    onApproveSplit(split.id);
                                  }
                                  onPaySplit(split.id);
                                  alert(`Released and processed fund split. Surgeon stipend paid successfully!`);
                                }}
                                className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer"
                              >
                                Release Fund
                              </button>
                            )}
                            {split.status === 'PAID' && (
                              <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                                ✓ Fully Released
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
