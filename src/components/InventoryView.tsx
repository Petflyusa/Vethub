/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Package, DollarSign, PlusCircle, Edit2, Trash2, Search, 
  Stethoscope, Sparkles, Plus, Info, X, Check, ArrowUpDown,
  Truck, AlertTriangle, CheckCircle, RefreshCw, Layers
} from 'lucide-react';
import { Staff } from '../types';

interface TreatmentPrice {
  id: string;
  name: string;
  price: number;
  category?: 'Consultation' | 'Medication' | 'Lab' | 'Surgery' | 'General';
}

interface MedicationPrice {
  id: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
}

interface SupplierOrder {
  id: string;
  supplier: string;
  drugName: string;
  qty: number;
  status: string;
  date: string;
  cost: number;
}

interface InventoryViewProps {
  treatmentPrices: TreatmentPrice[];
  onChangeTreatmentPrices: React.Dispatch<React.SetStateAction<TreatmentPrice[]>>;
  medicationPrices: MedicationPrice[];
  onChangeMedicationPrices: React.Dispatch<React.SetStateAction<MedicationPrice[]>>;
  supplierOrders: SupplierOrder[];
  onChangeSupplierOrders: React.Dispatch<React.SetStateAction<SupplierOrder[]>>;
  allStaff: Staff[];
  loggedInStaff: Staff | null;
}

export default function InventoryView({
  treatmentPrices,
  onChangeTreatmentPrices,
  medicationPrices,
  onChangeMedicationPrices,
  supplierOrders,
  onChangeSupplierOrders,
  allStaff,
  loggedInStaff
}: InventoryViewProps) {
  const [activeTab, setActiveTab] = useState<'MEDICATIONS' | 'SERVICES'>('MEDICATIONS');
  
  // Search state
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [srvSearchQuery, setSrvSearchQuery] = useState('');

  // Editing state for procedures/treatment pricing
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  const [newEditedPrice, setNewEditedPrice] = useState(0);

  // Supplier Order form states
  const [targetSupplier, setTargetSupplier] = useState('Zoetis Global Distribution');
  const [targetMedId, setTargetMedId] = useState(medicationPrices[0]?.id || 'med-1');
  const [targetQty, setTargetQty] = useState(50);

  // Adding a standard custom service price form
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState('');
  const [newSrvCategory, setNewSrvCategory] = useState<'Consultation' | 'Medication' | 'Lab' | 'Surgery' | 'General'>('General');

  // Supplier re-order handler
  const handleSupplierOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const med = medicationPrices.find(m => m.id === targetMedId);
    if (!med) return;

    const unitCost = 25.00;
    const totalCost = targetQty * unitCost;

    const newOrder: SupplierOrder = {
      id: `so-new-${Date.now()}`,
      supplier: targetSupplier,
      drugName: med.name,
      qty: targetQty,
      status: 'Ready for Dispatch',
      date: new Date().toISOString().split('T')[0],
      cost: totalCost
    };

    onChangeSupplierOrders([newOrder, ...supplierOrders]);

    // increment stock level
    onChangeMedicationPrices(prev => prev.map(m => m.id === targetMedId ? { ...m, stock: m.stock + targetQty } : m));

    alert(`Supply Chain order dispatched successfully!\nWholesale charge of $${totalCost.toFixed(2)} invoiced to operations. Stock updated.`);
  };

  // Pricing edit save
  const handleSavePriceChange = (id: string) => {
    onChangeTreatmentPrices(prev => prev.map(p => p.id === id ? { ...p, price: newEditedPrice } : p));
    setEditingPricingId(null);
    alert('Procedure fee catalog changes saved successfully and populated across clinical checkout systems.');
  };

  // Add new service item
  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvName || !newSrvPrice) return;

    const priceNum = parseFloat(newSrvPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      alert('Please enter a valid treatment fee price!');
      return;
    }

    const newSrvObj: TreatmentPrice = {
      id: `tx-custom-${Date.now()}`,
      name: newSrvName,
      price: priceNum,
      category: newSrvCategory
    };

    onChangeTreatmentPrices(prev => [...prev, newSrvObj]);
    setNewSrvName('');
    setNewSrvPrice('');
    setShowAddServiceModal(false);
    alert(`Success! Successfully added procedure item: "${newSrvObj.name}" to the service registry.`);
  };

  // Filtering lists
  const filteredMeds = useMemo(() => {
    return medicationPrices.filter(m => 
      m.name.toLowerCase().includes(medSearchQuery.toLowerCase())
    );
  }, [medicationPrices, medSearchQuery]);

  const filteredServices = useMemo(() => {
    return treatmentPrices.filter(s => 
      s.name.toLowerCase().includes(srvSearchQuery.toLowerCase())
    );
  }, [treatmentPrices, srvSearchQuery]);

  return (
    <div className="space-y-6" id="clinical-inventory-pricing-page">
      
      {/* Header */}
      <div className="border-b border-[#eff4ff] pb-4 flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#0d1c2e] tracking-tight flex items-center gap-2">
            <Package className="w-5.5 h-5.5 text-[#00647c]" /> Healthcare Inventory &amp; Pricing Manager
          </h1>
          <p className="text-xs text-[#545d62] font-semibold mt-0.5">
            Audit clinical medical stocks, trigger replenishments, manage pharmaceutical re-orders, and monitor procedure service pricing.
          </p>
        </div>

        {activeTab === 'SERVICES' && (
          <button
            onClick={() => setShowAddServiceModal(true)}
            className="px-3.5 py-2 bg-[#00647c] hover:bg-cyan-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:scale-[1.01] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Add Catalog Service
          </button>
        )}
      </div>

      {/* Adding service item Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#00647c]" /> Add Clinical Service Catalog Item
              </h3>
              <button 
                onClick={() => setShowAddServiceModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-50 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddServiceSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-650 mb-1">Service / Procedure Name</label>
                <input
                  type="text" required placeholder="e.g. Canine Ultrasound Scan"
                  value={newSrvName} onChange={e => setNewSrvName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-650 mb-1">Base Price Fee ($ USD)</label>
                  <input
                    type="number" step="0.01" min="0" required placeholder="125.00"
                    value={newSrvPrice} onChange={e => setNewSrvPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-650 mb-1">Procedure Category</label>
                  <select
                    value={newSrvCategory} onChange={e => setNewSrvCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-white border rounded-xl font-semibold"
                  >
                    <option value="General">General Care</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Lab">Laboratory</option>
                    <option value="Medication">Immunization</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button" onClick={() => setShowAddServiceModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00647c] hover:bg-cyan-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Register Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('MEDICATIONS')}
          className={`py-2.5 px-4 text-xs font-bold uppercase transition-colors tracking-wide cursor-pointer ${
            activeTab === 'MEDICATIONS'
              ? 'border-b-2 border-[#00647c] text-[#00647c]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📦 Medication Stock &amp; Supply Chain Inventory
        </button>
        <button
          onClick={() => setActiveTab('SERVICES')}
          className={`py-2.5 px-4 text-xs font-bold uppercase transition-colors tracking-wide cursor-pointer ${
            activeTab === 'SERVICES'
              ? 'border-b-2 border-[#00647c] text-[#00647c]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          💰 Medical Service fee pricing Catalog
        </button>
      </div>

      {/* TAB 1: MEDICATIONS & RE-ORDER DECK */}
      {activeTab === 'MEDICATIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: STOCK CATALOG */}
          <div className="lg:col-span-8 bg-white border rounded-2xl p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                🧪 Stocks Index Ledger
              </h3>
              
              {/* Search */}
              <div className="relative max-w-xs w-full">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search clinical drugs stock..."
                  value={medSearchQuery}
                  onChange={e => setMedSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8.5 pr-4 py-2 bg-slate-50 border border-slate-200 hover:bg-white focus:bg-white rounded-xl focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* List */}
            <div className="divide-y max-h-[500px] overflow-y-auto pr-1">
              {filteredMeds.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  No matching medications found in clinical database.
                </div>
              ) : (
                filteredMeds.map((item) => {
                  const isUnderstock = item.stock < item.minStock;
                  return (
                    <div key={item.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-850">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9.5px] text-slate-400 font-bold font-mono">CODE: {item.id.toUpperCase()}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[9.5px] text-slate-500 font-semibold">Retail Fee: ${item.price.toFixed(2)}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[9.5px] text-slate-450 font-medium">Alert Level: &lt; {item.minStock} units</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded ${
                          isUnderstock 
                            ? 'bg-rose-50 text-rose-800 border border-rose-200 font-extrabold animate-pulse' 
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-150'
                        }`}>
                          {item.stock} Units in hand
                        </span>
                        {isUnderstock && (
                          <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded tracking-tight">LOW STOCK ALERT</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* RIGHT: REPLENISHMENTS */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Form */}
            <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5 border-b pb-2">
                <Truck className="w-4 h-4 text-[#00647c]" /> Supply Chain Ordering Drawer
              </h3>
              <p className="text-[10.5px] leading-relaxed text-slate-500 font-medium">
                Submit an instant replenishment request to registered wholesale distributors. Upon confirmation, stocks level are updated dynamically in real-time.
              </p>

              <form onSubmit={handleSupplierOrderSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Select Distributor Partner</label>
                  <select
                    value={targetSupplier}
                    onChange={e => setTargetSupplier(e.target.value)}
                    className="w-full p-2.5 bg-white border rounded-xl font-semibold select-none cursor-pointer"
                  >
                    <option value="Zoetis Global Distribution">Zoetis Global Co.</option>
                    <option value="Boehringer Ingelheim LLC">Boehringer Ingelheim</option>
                    <option value="Merck Vet Animal Supply">Merck Health</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Select Medication Re-order Item</label>
                  <select
                    value={targetMedId}
                    onChange={e => setTargetMedId(e.target.value)}
                    className="w-full p-2.5 bg-white border rounded-xl font-semibold select-none cursor-pointer"
                  >
                    {medicationPrices.map(m => (
                      <option key={m.id} value={m.id}>{m.name} (In Store: {m.stock})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Batch Size Quantity (Units)</label>
                  <input
                    type="number" min="10" max="1000" step="5"
                    value={targetQty}
                    onChange={e => setTargetQty(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#00647c] hover:bg-cyan-800 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer leading-none text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Dispatch Wholesale Order
                </button>
              </form>
            </div>

            {/* Recents re-orders history */}
            <div className="bg-slate-50 border rounded-2xl p-4 space-y-3">
              <h3 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">
                Recent Supply Shipments Invoices
              </h3>

              <div className="space-y-2.5 max-h-[170px] overflow-y-auto pre-scroll">
                {supplierOrders.map(order => (
                  <div key={order.id} className="p-2 border border-slate-200 bg-white rounded-xl flex justify-between items-center text-[10px] leading-relaxed">
                    <div>
                      <span className="font-bold text-slate-750 block">{order.drugName} ({order.qty} pcs)</span>
                      <span className="text-slate-400 block mt-0.5">{order.supplier} • {order.date}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold block text-emerald-800 font-mono">${order.cost.toFixed(2)}</span>
                      <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded border uppercase font-bold">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: PROCEDURES PRICING */}
      {activeTab === 'SERVICES' && (
        <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-4">
          
          <div className="flex items-center justify-between gap-3 flex-wrap border-b pb-3.5">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                💰 Procedures Service Fee Catalog Index
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Configure surgical splits, diagnostic rates, or standard vaccine drive immunization fees instantly.</p>
            </div>

            {/* Search */}
            <div className="relative max-w-xs w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search procedures or fees list..."
                value={srvSearchQuery}
                onChange={e => setSrvSearchQuery(e.target.value)}
                className="w-full text-xs pl-8.5 pr-4 py-2 bg-slate-50 border border-slate-200 hover:bg-white focus:bg-white rounded-xl focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="divide-y relative max-h-[550px] overflow-y-auto pr-1">
            {filteredServices.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No procedures found matching your request.
              </div>
            ) : (
              filteredServices.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-850">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-1 py-0.2 rounded uppercase">
                        {item.id}
                      </span>
                      {item.category && (
                        <span className="text-[9px] font-bold bg-indigo-50 border border-indigo-150 text-indigo-800 px-1.5 rounded uppercase">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {editingPricingId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.01"
                          value={newEditedPrice}
                          onChange={(e) => setNewEditedPrice(Number(e.target.value))}
                          className="w-20 text-xs p-1 p-y-1.5 border rounded-xl font-mono font-bold text-slate-800 text-center"
                        />
                        <button
                          onClick={() => handleSavePriceChange(item.id)}
                          className="p-1 px-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 text-[10px] cursor-pointer inline-flex items-center gap-0.5"
                          title="Save change"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button
                          onClick={() => setEditingPricingId(null)}
                          className="p-1 px-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-205 text-[10px] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-sans font-extrabold text-slate-800">${item.price.toFixed(2)}</span>
                        
                        <button
                          onClick={() => { 
                            setEditingPricingId(item.id); 
                            setNewEditedPrice(item.price); 
                          }}
                          className="px-2.5 py-1 text-[9.5px] select-none font-bold bg-slate-50 text-slate-600 hover:text-slate-800 hover:bg-slate-100 border rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-[#00647c]" /> Edit Price
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
}
