/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  CreditCard, Printer, Send, User, ChevronRight, HelpCircle, 
  Plus, CheckCircle, PlusCircle, Trash2, Wallet,
  Phone, Globe, FileText, Sparkles, Receipt, Percent
} from 'lucide-react';
import { Pet, Client } from '../types';

interface BillingViewProps {
  onAddInvoice?: (invoice: any) => void;
  addToast?: (msg: string, type: 'success' | 'info' | 'warning') => void;
}

interface BillingItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function BillingView({ onAddInvoice, addToast }: BillingViewProps) {
  // Inline fallback toast notifications in case parent toast handler is absent
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'warning' }[]>([]);
  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    if (addToast) {
      addToast(message, type);
    } else {
      const id = Math.random().toString();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    }
  };

  // State definitions aligned with provided HTML model template
  const [invoiceId, setInvoiceId] = useState('INV-2026-0342');
  const [invoiceStatus, setInvoiceStatus] = useState<'DUE' | 'PAID' | 'SENT'>('DUE');
  const [clientName, setClientName] = useState('Sarah Johnson');
  const [clientEmail, setClientEmail] = useState('sarah.j@example.com');
  const [petName, setPetName] = useState('Max');
  const [petDetails, setPetDetails] = useState('Golden Retriever, 4y');
  const [serviceDate, setServiceDate] = useState('Feb 15, 2026');
  const [followUpDate, setFollowUpDate] = useState('Mar 01, 2026');

  // Interactive Line Items
  const [lineItems, setLineItems] = useState<BillingItem[]>([
    { id: 'item-1', name: 'Annual Checkup', description: 'Comprehensive physical exam', quantity: 1, unitPrice: 65.00 },
    { id: 'item-2', name: 'DHPP Vaccine', description: '5-in-1 canine vaccine', quantity: 1, unitPrice: 45.00 },
    { id: 'item-3', name: 'Heartworm Test', description: 'Snap 4DX test', quantity: 1, unitPrice: 55.00 },
    { id: 'item-4', name: 'Heartgard Plus', description: 'Monthly prevention, 6-pack', quantity: 1, unitPrice: 68.00 }
  ]);

  // Load pending items from completed clinical medical records on initialization
  React.useEffect(() => {
    const pendingRaw = localStorage.getItem('vethub_pending_billing_items');
    if (pendingRaw) {
      try {
        const pendingItems: BillingItem[] = JSON.parse(pendingRaw);
        if (pendingItems.length > 0) {
          setLineItems(pendingItems);
          triggerToast(`Loaded ${pendingItems.length} active clinical procedures and prescriptions!`, 'success');
          localStorage.removeItem('vethub_pending_billing_items');
        }
      } catch (e) {
        console.error("Error loading pending medical items", e);
      }
    }
    
    // Check custom active patient billing triggers
    const petTarget = localStorage.getItem('vethub_active_bill_pet');
    if (petTarget) {
      setPetName(petTarget);
      if (petTarget.toLowerCase() === 'coco') {
        setPetDetails('Poodle, Toy Size');
      } else if (petTarget.toLowerCase() === 'charlie') {
        setPetDetails('Domestic Shorthair, 2y');
      } else if (petTarget.toLowerCase() === 'luna') {
        setPetDetails('Siamese, 1y');
      } else {
        setPetDetails('Patient Referral');
      }
      localStorage.removeItem('vethub_active_bill_pet');
    }
    const clientNameTarget = localStorage.getItem('vethub_active_bill_client_name');
    if (clientNameTarget) {
      setClientName(clientNameTarget);
      localStorage.removeItem('vethub_active_bill_client_name');
    }
    const clientEmailTarget = localStorage.getItem('vethub_active_bill_client_email');
    if (clientEmailTarget) {
      setClientEmail(clientEmailTarget);
      localStorage.removeItem('vethub_active_bill_client_email');
    }
  }, []);

  // Payment UI selector configurations
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH' | 'WECHAT' | 'STORED'>('CARD');
  const [cardNumber, setCardNumber] = useState('**** **** **** 4242');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvv, setCardCvv] = useState('***');
  const [enablePartial, setEnablePartial] = useState(false);
  const [partialAmount, setPartialAmount] = useState('100.00');

  // Membership discount benefit configurations
  const [membershipPlan, setMembershipPlan] = useState<'Gold' | 'Standard' | 'Platinum'>('Gold');
  const [benefitApplied, setBenefitApplied] = useState(true);

  // Stored Clinical Balance configuration
  const [storedBalance, setStoredBalance] = useState(150.00);
  const [topUpAmount, setTopUpAmount] = useState('50');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // Interactive line items input form helper
  const [showAddLineForm, setShowAddLineForm] = useState(false);
  const [newLineName, setNewLineName] = useState('');
  const [newLineDesc, setNewLineDesc] = useState('');
  const [newLinePrice, setNewLinePrice] = useState('35.00');
  const [newLineQty, setNewLineQty] = useState('1');

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Past Payment ledger history items
  const [paymentHistory, setPaymentHistory] = useState([
    { id: 'hist-1', service: 'Lab Services', date: 'Jan 12, 2026', type: 'charge', amount: -112.50 },
    { id: 'hist-2', service: 'Balance Recharge', date: 'Dec 20, 2025', type: 'deposit', amount: 200.00 },
    { id: 'hist-3', service: 'Dental Cleaning', date: 'Nov 15, 2025', type: 'charge', amount: -185.00 }
  ]);

  // Calculations: apply membership rate (e.g. Platinum: 20%, Gold: 15%, Standard: 0%)
  const discountRate = useMemo(() => {
    if (!benefitApplied) return 0;
    if (membershipPlan === 'Platinum') return 0.20;
    if (membershipPlan === 'Gold') return 0.15;
    return 0;
  }, [membershipPlan, benefitApplied]);

  const calculations = useMemo(() => {
    const rawSubtotal = lineItems.reduce((acc, obj) => acc + (obj.unitPrice * obj.quantity), 0);
    const discountAmount = rawSubtotal * discountRate;
    const discountedSubtotal = Math.max(0, rawSubtotal - discountAmount);
    const taxAmount = discountedSubtotal * 0.08; // 8% tax
    const grandTotal = discountedSubtotal + taxAmount;
    
    return {
      subtotal: rawSubtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: grandTotal
    };
  }, [lineItems, discountRate]);

  // Helper actions
  const handleAddLineItem = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newLinePrice);
    const qty = parseInt(newLineQty);
    if (!newLineName) {
      triggerToast('Line item name is required', 'warning');
      return;
    }
    if (isNaN(price) || price < 0) {
      triggerToast('Please input a valid price value', 'warning');
      return;
    }

    const newItem: BillingItem = {
      id: `item-${Date.now()}`,
      name: newLineName,
      description: newLineDesc || 'Clinical item service',
      quantity: isNaN(qty) || qty < 1 ? 1 : qty,
      unitPrice: price
    };

    setLineItems(prev => [...prev, newItem]);
    triggerToast(`Added "${newLineName}" to active invoice stack`, 'success');

    // Reset inputs
    setNewLineName('');
    setNewLineDesc('');
    setNewLinePrice('35.00');
    setNewLineQty('1');
    setShowAddLineForm(false);
  };

  const handleDeleteLineItem = (id: string, name: string) => {
    if (lineItems.length <= 1) {
      triggerToast('Your ledger requires at least one item to remain valid', 'warning');
      return;
    }
    setLineItems(prev => prev.filter(item => item.id !== id));
    triggerToast(`Removed "${name}" from invoice draft`, 'info');
  };

  const handleProcessPayment = () => {
    const amountToCharge = enablePartial ? parseFloat(partialAmount) : calculations.total;
    if (isNaN(amountToCharge) || amountToCharge <= 0) {
      triggerToast('Please state a valid payment amount', 'warning');
      return;
    }

    if (paymentMethod === 'STORED') {
      if (storedBalance < amountToCharge) {
        triggerToast(`Insufficient stored clinical funds! ($${storedBalance.toFixed(2)} available)`, 'warning');
        return;
      }
      setStoredBalance(prev => prev - amountToCharge);
    }

    // record in history
    const newHistItem = {
      id: `hist-${Date.now()}`,
      service: enablePartial ? `Partial payment on ${invoiceId}` : `Cleared ${invoiceId}`,
      date: 'Today',
      type: 'charge',
      amount: -amountToCharge
    };
    setPaymentHistory(prev => [newHistItem, ...prev]);

    if (!enablePartial || amountToCharge >= calculations.total) {
      setInvoiceStatus('PAID');
      triggerToast(`Invoice ${invoiceId} marked as Fully Paid! Notification receipt sent to ${clientEmail}`, 'success');
    } else {
      triggerToast(`Processed partial check payment of $${amountToCharge.toFixed(2)}! Remainder open on INV stack.`, 'success');
    }
  };

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(topUpAmount);
    if (isNaN(amt) || amt <= 0) {
      triggerToast('Please type a valid deposit target', 'warning');
      return;
    }
    setStoredBalance(prev => prev + amt);
    
    // Add deposit record
    const depositLog = {
      id: `hist-${Date.now()}`,
      service: 'Balance Recharge',
      date: 'Today',
      type: 'deposit',
      amount: amt
    };
    setPaymentHistory(prev => [depositLog, ...prev]);
    
    triggerToast(`Successfully top-up of $${amt.toFixed(2)} added to Stored Balance!`, 'success');
    setIsTopUpOpen(false);
    setTopUpAmount('50');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendInvoice = () => {
    triggerToast(`Emailed secure payment link & detailed ledger PDF to ${clientEmail}`, 'success');
    setInvoiceStatus('SENT');
  };

  return (
    <div className="space-y-6" id="billing-view-workspace-root">
      
      {/* Search and Navigation Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice templates, historical record, or clients..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 pr-8 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00647c]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Active Client Search:
          </span>
          <select 
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'sarah') {
                setClientName('Sarah Johnson');
                setClientEmail('sarah.j@example.com');
                setPetName('Max');
                setPetDetails('Golden Retriever, 4y');
                setMembershipPlan('Gold');
                setInvoiceId('INV-2026-0342');
              } else if (val === 'john') {
                setClientName('John Doe');
                setClientEmail('john.doe@gmail.com');
                setPetName('Cooper');
                setPetDetails('Goldendoodle, 3y');
                setMembershipPlan('Platinum');
                setInvoiceId('INV-2026-0343');
              } else {
                setClientName('Emily Stone');
                setClientEmail('emstone@hollywood.com');
                setPetName('Kiwi');
                setPetDetails('Parrot, 2y');
                setMembershipPlan('Platinum');
                setInvoiceId('INV-2026-0344');
              }
              triggerToast(`Loaded invoice records for client "${clientName}"`, 'info');
            }}
            className="bg-slate-50 hover:bg-slate-150 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#00647c] cursor-pointer"
          >
            <option value="sarah">Sarah Johnson (Max)</option>
            <option value="john">John Doe (Cooper)</option>
            <option value="emily">Emily Stone (Kiwi)</option>
          </select>
        </div>
      </div>

      {/* Main split grid: 2/3 billing column + 1/3 card support widget bar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Services lists & Payment options */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* TOP INVOICE SUMMARY CARD */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-[#0d1c2e] tracking-tight">{invoiceId}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                    invoiceStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                    invoiceStatus === 'SENT' ? 'bg-sky-100 text-sky-850' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {invoiceStatus}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  Issued: {serviceDate} • Terms: Net 15
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-3 py-1.5 border border-[#00647c] text-[#00647c] hover:bg-[#00647c]/5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Roster</span>
                </button>
                <button
                  type="button"
                  onClick={handleSendInvoice}
                  className="flex items-center gap-1 px-3.5 py-1.5 bg-[#00647c] text-white hover:bg-[#007f9d] rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Invoice</span>
                </button>
              </div>
            </div>

            {/* Quick stats grid below summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="flex items-start gap-2 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                <div className="p-1.5 bg-[#00647c]/15 hover:bg-[#00647c]/20 text-[#00647c] rounded-full shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wide mb-0.5">Client Owner</p>
                  <p className="text-[#0d1c2e] font-black">{clientName}</p>
                  <p className="text-[10px] text-slate-500 font-bold">{clientEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                  <span className="text-[14px] leading-none font-bold">🐾</span>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wide mb-0.5">Patient Pet</p>
                  <p className="text-[#0d1c2e] font-black">{petName}</p>
                  <p className="text-[10px] text-slate-500 font-bold">{petDetails}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                <div className="p-1.5 bg-amber-100 text-amber-800 rounded-full shrink-0">
                  <span className="text-[14px] leading-none font-bold">📅</span>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wide mb-0.5">Schedule Matrix</p>
                  <p className="text-[#0d1c2e] font-black">Admitted: {serviceDate}</p>
                  <p className="text-[10px] text-slate-550 font-medium">Re-evaluation: {followUpDate}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ITEMIZED SERVICES TABLE */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-50/85 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#00647c]" />
                <span>Line Items Ledger</span>
              </h3>
              <span className="text-[9px] font-mono bg-white text-slate-500 border border-slate-200/50 px-2 py-0.5 rounded-full font-bold">
                {lineItems.length} Records
              </span>
            </div>

            <div className="overflow-x-auto text-[11px] font-semibold text-[#0d1c2e]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-150 uppercase text-[9px]">
                    <th className="px-4 py-3">Treatments & Services</th>
                    <th className="px-4 py-3">Clinic Description</th>
                    <th className="px-4 py-3 text-center w-12">Qty</th>
                    <th className="px-4 py-3 text-right w-20">Unit</th>
                    <th className="px-4 py-3 text-right w-24">Total</th>
                    <th className="px-4 py-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-2.5 font-bold tracking-tight">{item.name}</td>
                      <td className="px-4 py-2.5 text-slate-400 font-bold">{item.description}</td>
                      <td className="px-4 py-2.5 text-center font-mono font-bold text-slate-500">{item.quantity}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-black text-slate-400">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-black text-[#0d1c2e]">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteLineItem(item.id, item.name)}
                          className="p-1 text-slate-350 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete Charge Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal summary calculations bar */}
            <div className="p-4 bg-slate-50/30 border-t border-slate-200/50 flex flex-col md:flex-row justify-between gap-4">
              <div>
                {!showAddLineForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddLineForm(true)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-[#00647c] text-[#00647c] hover:bg-[#00647c]/5 rounded-lg text-[10px] font-bold tracking-tight uppercase cursor-pointer select-none"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Custom Line Item</span>
                  </button>
                ) : (
                  <form onSubmit={handleAddLineItem} className="bg-slate-50 p-3 rounded-lg border border-slate-200/70 max-w-md space-y-2 text-xs">
                    <p className="font-extrabold uppercase text-[9px] text-slate-500 tracking-wider">New Charge Form</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={newLineName}
                        onChange={(e) => setNewLineName(e.target.value)}
                        placeholder="Service Name"
                        className="bg-white border border-slate-200 rounded p-1.5 text-xs text-[#0d1c2e]"
                        required
                      />
                      <input 
                        type="text" 
                        value={newLineDesc}
                        onChange={(e) => setNewLineDesc(e.target.value)}
                        placeholder="Brief notes description"
                        className="bg-white border border-slate-200 rounded p-1.5 text-xs text-[#0d1c2e]"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <input 
                        type="number" 
                        step="0.01"
                        value={newLinePrice}
                        onChange={(e) => setNewLinePrice(e.target.value)}
                        placeholder="Price"
                        className="bg-white border border-slate-200 rounded p-1.5 text-xs text-center font-mono"
                        required
                      />
                      <input 
                        type="number" 
                        min="1"
                        value={newLineQty}
                        onChange={(e) => setNewLineQty(e.target.value)}
                        placeholder="Qty"
                        className="bg-white border border-slate-200 rounded p-1.5 text-xs text-center font-mono"
                        required
                      />
                      <div className="flex gap-1 justify-end">
                        <button 
                          type="button" 
                          onClick={() => setShowAddLineForm(false)}
                          className="bg-slate-200 hover:bg-slate-250 text-slate-650 px-2 rounded font-black text-[10px]"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="bg-[#00647c] hover:bg-[#007f9d] text-white px-2 rounded font-black text-[10px]"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Dynamic calculations panel aligned right */}
              <div className="w-full md:w-72 space-y-2 text-xs font-semibold">
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>Gross Subtotal</span>
                  <span className="font-mono text-slate-700 font-extrabold">${calculations.subtotal.toFixed(2)}</span>
                </div>
                {benefitApplied && calculations.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      <span>{membershipPlan} Discount ({(discountRate * 100).toFixed(0)}%)</span>
                    </span>
                    <span className="font-mono font-extrabold">-${calculations.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>Sales Tax (8%)</span>
                  <span className="font-mono text-slate-700 font-extrabold">${calculations.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black pt-2 border-t border-slate-200 text-[#0d1c2e]">
                  <span>Total Amount</span>
                  <span className="font-mono text-[#00647c] font-black">${calculations.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* PROCESS PAYMENT SECTION */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-black text-[#0d1c2e] uppercase tracking-wider mb-4">Process Payment Methods</h3>
            
            {/* Payment Method Selector Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
              {[
                { id: 'CARD', label: 'Credit Card', icon: CreditCard },
                { id: 'CASH', label: 'Cash Drawer', icon: Wallet },
                { id: 'WECHAT', label: 'WeChat Pay', icon: Globe },
                { id: 'STORED', label: 'Stored Value', icon: Receipt }
              ].map(m => {
                const IconComponent = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id as any);
                      triggerToast(`Switched payment routing to "${m.label}"`, 'info');
                    }}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#00647c] bg-[#00647c]/5 text-[#00647c] font-black' 
                        : 'border-slate-100/80 bg-slate-50/50 text-slate-450 hover:bg-slate-55'
                    }`}
                  >
                    <IconComponent className={`w-6 h-6 mb-1 ${isSelected ? 'text-[#00647c]' : 'text-slate-400'}`} />
                    <span className="text-[10px] uppercase font-bold tracking-tight">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Conditional input fields based on selected billing method */}
            {paymentMethod === 'CARD' && (
              <div className="space-y-3 p-4 bg-slate-50/50 rounded-lg border border-slate-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold">
                  <div className="space-y-1">
                    <label className="block text-slate-400 uppercase text-[9px]">Secure Card Line</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-[#0d1c2e]"
                        placeholder="Card format"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#00647c] opacity-80 uppercase font-mono">
                        VISA/AMEX
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-slate-400 uppercase text-[9px]">Expires</label>
                      <input 
                        type="text" 
                        value={cardExpiry} 
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-center rounded p-2 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-400 uppercase text-[9px]">CVV Line</label>
                      <input 
                        type="password" 
                        value={cardCvv} 
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-center rounded p-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'STORED' && (
              <div className="p-3 bg-blue-50/60 text-blue-900 border border-blue-200/50 rounded-lg mb-6 text-xs flex justify-between items-center">
                <div>
                  <p className="font-extrabold uppercase text-[9px] text-blue-500">Available Account Wallet Balance</p>
                  <p className="text-sm font-black text-[#0d1c2e] mt-0.5">${storedBalance.toFixed(2)} USD</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTopUpOpen(true)}
                  className="px-3 py-1.5 bg-white border border-blue-200 hover:bg-white/80 rounded font-black text-[10px] uppercase text-[#00647c] cursor-pointer"
                >
                  🔋 Direct Recharge
                </button>
              </div>
            )}

            {paymentMethod === 'WECHAT' && (
              <div className="p-4 bg-slate-50/80 rounded-lg border text-center mb-6 max-w-xs mx-auto space-y-2">
                <p className="font-extrabold uppercase text-[9px] text-[#00647c]">Dynamic Live QR Code Generated</p>
                <div className="w-32 h-32 bg-slate-200 mx-auto rounded border-2 border-slate-400 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-slate-400">QR CODE SECURE</span>
                </div>
                <p className="text-[10px] text-slate-500">Scan using WeChat or AliPay registers</p>
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div className="p-3 bg-amber-50/50 border border-amber-200/50 text-xs text-amber-900 rounded-lg mb-6">
                <strong>📝 Drawer Register Protocol:</strong> Cash payments recorded immediately sync to physical till ledger logs. Ensure physical drawer totals are audited post-consultation.
              </div>
            )}

            {/* Partial Payments trigger bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-t border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2.5">
                <input 
                  type="checkbox" 
                  id="enable-partial-cb"
                  checked={enablePartial}
                  onChange={(e) => setEnablePartial(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00647c] focus:ring-[#00647c] border-slate-200"
                />
                <label htmlFor="enable-partial-cb" className="text-xs font-bold text-slate-550 select-none cursor-pointer">
                  Activate partial payment split
                </label>
              </div>

              {enablePartial && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d1c2e]">
                  <span>Amount to pay: $</span>
                  <input 
                    type="number" 
                    value={partialAmount} 
                    onChange={(e) => setPartialAmount(e.target.value)}
                    className="w-20 bg-slate-50 border border-slate-200 py-1 px-1.5 rounded text-center text-xs ml-0.5 font-mono"
                  />
                </div>
              )}

              <div className="text-right">
                <p className="text-[9px] uppercase font-bold text-slate-400 leading-none">Net Amount Due</p>
                <p className="text-base font-black text-[#00647c] tracking-tight mt-0.5">
                  ${enablePartial ? parseFloat(partialAmount || '0').toFixed(2) : calculations.total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="button"
                onClick={handleProcessPayment}
                className="flex-grow w-full py-3 bg-[#00647c] hover:bg-[#007f9d] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 duration-150 cursor-pointer"
              >
                {enablePartial ? 'Confirm Partial Charge' : 'Process Full Payment & Close Invoice'}
              </button>
              <button 
                type="button"
                onClick={() => triggerToast('Initializing multi-staff practitioner splits calculation dashboard...', 'info')}
                className="text-xs font-bold text-[#00647c] hover:underline cursor-pointer select-none py-1 px-4 text-center border border-slate-200 rounded-lg hover:bg-slate-50 shrink-0"
              >
                Split Splits Allocation
              </button>
            </div>

          </section>

        </div>

        {/* Right Side: Sidebar Plans and History details */}
        <div className="space-y-6">
          
          {/* MEMBERSHIP PLAN CARD WITH AMBIENT GRADIENT */}
          <section className="bg-gradient-to-br from-[#00647c] to-[#004e61] text-white rounded-xl p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 opacity-8 transform rotate-12 transition-transform duration-500 group-hover:scale-110">
              <Sparkles className="w-28 h-28" />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#b7eaff]/80">Membership Tier</span>
                  <h4 className="text-sm font-black mt-0.5">Wellness {membershipPlan} Plan</h4>
                </div>
                <span className="bg-white/20 text-white border border-white/10 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-xs">
                  Active
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg backdrop-blur-md">
                  <p className="text-[8px] font-bold uppercase tracking-wider opacity-80">Discount Benefit</p>
                  <p className="text-[11px] font-extrabold mt-0.5">{(discountRate * 100).toFixed(0)}% Discount Auto-Applied</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    const nextPlan = membershipPlan === 'Gold' ? 'Platinum' : membershipPlan === 'Platinum' ? 'Standard' : 'Gold';
                    setMembershipPlan(nextPlan);
                    triggerToast(`Switched virtual membership simulation to "${nextPlan}" tier`, 'info');
                  }}
                  className="p-1 px-2 hover:bg-white/10 border border-white/20 rounded text-[10px] font-bold text-white transition-colors cursor-pointer shrink-0"
                >
                  Toggle plan
                </button>
              </div>
            </div>
          </section>

          {/* STORED VALUE CARD */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-bold text-[#0d1c2e] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-[#00647c]" />
                <span>Account Balance</span>
              </h4>
              <span className="text-[8px] font-bold bg-slate-100 text-slate-550 px-2 py-0.5 rounded-lg border border-slate-150 uppercase">
                USD Wallet
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center border mb-3">
              <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">Available Clinical Deposit Balance</p>
              <p className="text-xl font-black text-[#0d1c2e] mt-1 tracking-tight">${storedBalance.toFixed(2)}</p>
            </div>

            <button
              onClick={() => setIsTopUpOpen(true)}
              className="w-full border-2 border-[#00647c] hover:bg-[#00647c]/5 text-[#00647c] font-black py-2.5 rounded-lg text-xs transition-all tracking-wide uppercase cursor-pointer"
            >
              Top Up Stored Balance
            </button>
          </section>

          {/* PAYMENT HISTORY & RECENT LEDGER ACTIVITY */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50/85">
              <h4 className="font-bold text-[#0d1c2e] text-xs uppercase tracking-wider">Payment History Logs</h4>
              <span className="text-[9px] font-bold text-[#00647c]">Live Feed</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {paymentHistory.map(hist => (
                <div key={hist.id} className="p-3 hover:bg-slate-50/40 transition-colors flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${hist.type === 'deposit' ? 'bg-[#00647c]' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-slate-800 font-extrabold tracking-tight shrink">{hist.service}</p>
                      <p className="text-[9px] text-slate-400 font-bold leading-none mt-0.5">{hist.date}</p>
                    </div>
                  </div>
                  <p className={`font-mono text-xs font-black shrink-0 ${hist.type === 'deposit' ? 'text-[#00647c]' : 'text-slate-600'}`}>
                    {hist.type === 'deposit' ? '+' : ''}${Math.abs(hist.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-3 text-center text-[10px] text-slate-400 border-t font-semibold">
              Live secure operations logger synced securely • 14 days activity shown
            </div>
          </section>

          {/* QUICK SUPPORT PROTOCOL BANNER */}
          <div className="rounded-xl border border-dashed border-[#00647c]/50 p-5 bg-[#00647c]/5">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-[#00647c]" />
              <h5 className="font-black text-[#0d1c2e] text-xs uppercase tracking-wider">Need Invoice Support?</h5>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mb-3">
              Our clinic finance and invoice reconciliation department is available Mon-Fri, 9am - 5pm. Please reference ID <strong className="font-mono text-[#00647c]">{invoiceId}</strong>.
            </p>
            <a
              href="tel:5550123"
              className="block text-center bg-white border border-slate-200 hover:bg-slate-50 text-[#00647c] py-2 rounded-lg text-xs font-extrabold transition-all hover:shadow-2xs select-none"
            >
              📞 Backoffice Finance Support
            </a>
          </div>

        </div>

      </div>

      {/* MODAL 1: Balance top-up popover dialog */}
      {isTopUpOpen && (
        <div className="fixed inset-0 bg-[#0d1c2e]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="top-up-popover-modal">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-150 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-[#0d1c2e] tracking-wider flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-[#00647c]" />
                <span>Top Up Balance</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsTopUpOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleTopUp} className="p-4 space-y-4 text-xs font-semibold">
              <p className="text-slate-500 text-[11px]">
                Recharging your local stored balance automatically triggers automated deposit invoices and maps securely for patient use records.
              </p>

              <div className="space-y-1">
                <label className="block text-slate-450 uppercase text-[9px]">Recharge USD amount</label>
                <input 
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-center text-sm font-mono font-black text-[#00647c]"
                  required
                  placeholder="e.g. 100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setIsTopUpOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-550 rounded font-black uppercase text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00647c] hover:bg-[#007f9d] text-white rounded font-black uppercase text-[10px]"
                >
                  Deposit Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Overlay Backup */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none" id="billing-overlay-toasts">
        {toasts.map(t => (
          <div 
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 p-3.5 rounded-lg border shadow-xl text-xs font-semibold tracking-wide ${
              t.type === 'success' ? 'bg-[#00647c] border-cyan-500/30 text-white animate-pulse' :
              t.type === 'warning' ? 'bg-amber-800 border-amber-700 text-white' :
              'bg-slate-900 border-slate-700 text-slate-100 animate-slide-in'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
