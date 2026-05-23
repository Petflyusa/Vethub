import React, { useState, useMemo } from 'react';
import { 
  Activity, DollarSign, PlusCircle, Edit2, Trash2, Search, 
  Stethoscope, Sparkles, Plus, Info, X, Check, ArrowUpDown 
} from 'lucide-react';
import { Staff } from '../types';

interface TreatmentPrice {
  id: string;
  name: string;
  price: number;
  category?: 'Consultation' | 'Medication' | 'Lab' | 'Surgery' | 'General';
}

interface TreatmentViewProps {
  treatmentPrices: TreatmentPrice[];
  onChangeTreatmentPrices: React.Dispatch<React.SetStateAction<TreatmentPrice[]>>;
  allStaff: Staff[];
  loggedInStaff: Staff | null;
}

export default function TreatmentView({
  treatmentPrices,
  onChangeTreatmentPrices,
  allStaff,
  loggedInStaff
}: TreatmentViewProps) {
  // Search and Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceSortOrder, setPriceSortOrder] = useState<'asc' | 'desc' | 'none'>('none');

  // Modal / Form state for Add Treatment
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTxName, setNewTxName] = useState('');
  const [newTxPrice, setNewTxPrice] = useState('');
  const [newTxCategory, setNewTxCategory] = useState<'Consultation' | 'Medication' | 'Lab' | 'Surgery' | 'General'>('General');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPrice, setEditingPrice] = useState('');
  const [editingCategory, setEditingCategory] = useState<'Consultation' | 'Medication' | 'Lab' | 'Surgery' | 'General'>('General');

  // Notification Toast Helper (client-side mock)
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Categories helper
  const categories = ['all', 'Consultation', 'Medication', 'Lab', 'Surgery', 'General'];

  // Map existing items to have category to keep high-fidelity layout
  const enrichedTreatments = useMemo(() => {
    return treatmentPrices.map(tx => {
      if (tx.category) return tx;
      // Heuristic categorization based on name details
      let cat: 'Consultation' | 'Medication' | 'Lab' | 'Surgery' | 'General' = 'General';
      const nameLower = tx.name.toLowerCase();
      if (nameLower.includes('exam') || nameLower.includes('consultation')) {
        cat = 'Consultation';
      } else if (nameLower.includes('booster') || nameLower.includes('vaccin') || nameLower.includes('drug')) {
        cat = 'Medication';
      } else if (nameLower.includes('blood') || nameLower.includes('test') || nameLower.includes('assay') || nameLower.includes('lab')) {
        cat = 'Lab';
      } else if (nameLower.includes('suture') || nameLower.includes('repair') || nameLower.includes('surg') || nameLower.includes('polish') || nameLower.includes('dental')) {
        cat = 'Surgery';
      }
      return { ...tx, category: cat };
    });
  }, [treatmentPrices]);

  // Filter and Sort Treatments
  const filteredTreatments = useMemo(() => {
    let result = enrichedTreatments.filter(tx => {
      const matchesSearch = tx.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (priceSortOrder === 'asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (priceSortOrder === 'desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [enrichedTreatments, searchQuery, selectedCategory, priceSortOrder]);

  const handleCreateTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxName.trim() || !newTxPrice) {
      addToast('Please input both name and valid price!', 'error');
      return;
    }

    const priceNum = parseFloat(newTxPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      addToast('Please enter a valid positive price!', 'error');
      return;
    }

    const newTx: TreatmentPrice = {
      id: `tx-custom-${Date.now()}`,
      name: newTxName.trim(),
      price: priceNum,
      category: newTxCategory
    };

    onChangeTreatmentPrices(prev => [...prev, newTx]);
    setNewTxName('');
    setNewTxPrice('');
    setNewTxCategory('General');
    setIsAddModalOpen(false);
    addToast(`Successfully added clinical treatment: ${newTx.name}`, 'success');
  };

  const handleStartEdit = (tx: TreatmentPrice) => {
    setEditingId(tx.id);
    setEditingName(tx.name);
    setEditingPrice(tx.price.toString());
    setEditingCategory(tx.category || 'General');
  };

  const handleSaveEdit = (id: string) => {
    if (!editingName.trim() || !editingPrice) {
      addToast('Please input both name and price!', 'error');
      return;
    }

    const priceNum = parseFloat(editingPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      addToast('Please enter a valid positive price!', 'error');
      return;
    }

    onChangeTreatmentPrices(prev => prev.map(tx => {
      if (tx.id === id) {
        return {
          ...tx,
          name: editingName.trim(),
          price: priceNum,
          category: editingCategory
        };
      }
      return tx;
    }));

    setEditingId(null);
    addToast('Clinical service pricing adjusted successfully!', 'success');
  };

  const handleDeleteTreatment = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete the treatment "${name}" from the active database?`)) {
      onChangeTreatmentPrices(prev => prev.filter(tx => tx.id !== id));
      addToast(`Permanently deleted service: ${name}`, 'info');
    }
  };

  const toggleSortOrder = () => {
    setPriceSortOrder(prev => {
      if (prev === 'none') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'none';
    });
  };

  return (
    <div className="space-y-6 relative" id="treatment-management-view">
      
      {/* Dynamic Visual Toast Stack */}
      <div className="fixed top-4 right-4 z-55 flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div 
            key={t.id}
            className={`p-3.5 rounded-xl border shadow-lg text-xs font-bold font-sans flex items-center justify-between gap-3 animate-fade-in ${
              t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
              t.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800 animate-pulse' :
              'bg-sky-50 border-sky-150 text-sky-800'
            }`}
          >
            <span className="flex-1">{t.message}</span>
            <button 
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-slate-400 hover:text-black shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Header and Action Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-outline-variant/45 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#00647c]">
            <Stethoscope className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase font-mono bg-[#00647c]/10 px-2 py-0.5 rounded-md">
              Clinical Procedures Directory
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0d1c2e] tracking-tight font-sans">
            Treatments &amp; Pricing Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Formulate new diagnostic procedures, update standard surgical charges, and align client invoicing templates.
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#00647c] hover:bg-[#007f9d] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer font-sans"
            id="add-treatment-button"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>Add Treatment</span>
          </button>
        </div>
      </div>

      {/* Database Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search treatments by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00647c]"
          />
        </div>

        {/* Categories Tab Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-150">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-[#00647c] shadow-xs border border-slate-150'
                  : 'text-slate-500 hover:text-slate-900 border border-transparent'
              }`}
            >
              {cat === 'all' ? 'All Modules' : cat}
            </button>
          ))}
        </div>

        {/* Sort and Statistics controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            title="Sort by charge fee"
          >
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <span>Price: {priceSortOrder === 'asc' ? 'Low to High' : priceSortOrder === 'desc' ? 'High to Low' : 'Default'}</span>
          </button>

          <span className="text-[10px] bg-slate-50 border px-3 py-1.5 rounded-lg text-slate-600 font-mono font-bold">
            Total count: {filteredTreatments.length}
          </span>
        </div>
      </div>

      {/* Interactive Treatments Grid Layout */}
      {filteredTreatments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">No matches found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              We couldn't find any treatment matches for your active filter constraints. Try adjusting your search keyword or selected category.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="treatments-grid">
          {filteredTreatments.map((tx) => {
            const isEditing = editingId === tx.id;
            
            // Custom high contrast tag labels based on category
            const tagStyles = 
              tx.category === 'Surgery' ? 'bg-rose-50 border-rose-100 text-rose-700' :
              tx.category === 'Consultation' ? 'bg-sky-50 border-sky-100 text-sky-700' :
              tx.category === 'Lab' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
              tx.category === 'Medication' ? 'bg-purple-50 border-purple-100 text-purple-700' :
              'bg-slate-50 border-slate-100 text-slate-700';

            return (
              <div 
                key={tx.id}
                className={`group bg-white rounded-3xl border transition-all p-6 relative overflow-hidden flex flex-col justify-between min-h-[190px] ${
                  isEditing 
                    ? 'border-[#00647c] ring-1 ring-[#00647c]' 
                    : 'border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] hover:-translate-y-0.5'
                }`}
              >
                {/* Back decorative glowing element */}
                <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-10 group-hover:bg-sky-50/30 transition-colors" />

                {/* Card Top: Category and Editing Mode */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100/60 mb-4">
                  {isEditing ? (
                    <select
                      value={editingCategory}
                      onChange={(e) => setEditingCategory(e.target.value as any)}
                      className="text-[10px] p-1 font-bold border rounded-lg bg-slate-50"
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Medication">Medication</option>
                      <option value="Lab">Lab</option>
                      <option value="Surgery">Surgery</option>
                      <option value="General">General</option>
                    </select>
                  ) : (
                    <span className={`text-[9px] font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full border ${tagStyles}`}>
                      {tx.category || 'General'}
                    </span>
                  )}

                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                      <>
                        <button 
                          onClick={() => handleSaveEdit(tx.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                          title="Save adjustments"
                        >
                          <Check className="w-4 h-4 stroke-[3px]" />
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-4 h-4 stroke-[3px]" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleStartEdit(tx)}
                          className="p-1.5 text-slate-500 hover:text-[#00647c] hover:bg-slate-50 rounded-lg cursor-pointer"
                          title="Edit pricing coordinates"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTreatment(tx.id, tx.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete from catalogue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Card middle: Name Input or text display */}
                <div className="flex-1 flex flex-col justify-center">
                  {isEditing ? (
                    <div className="space-y-2">
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase">Procedure Name</label>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full text-xs font-bold p-2 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white"
                      />
                    </div>
                  ) : (
                    <h3 className="text-xs font-black text-slate-800 leading-snug tracking-tight font-sans text-balance">
                      {tx.name}
                    </h3>
                  )}
                </div>

                {/* Card bottom: Pricing layout */}
                <div className="mt-4 pt-3 border-t border-dashed border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                    PROCEDURAL COST
                  </span>
                  
                  {isEditing ? (
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#00647c]">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editingPrice}
                        onChange={(e) => setEditingPrice(e.target.value)}
                        className="w-full text-xs font-black font-mono pl-5 pr-2 py-1 bg-slate-50 border rounded-lg focus:outline-none flex text-right text-[#00647c]"
                      />
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">$</span>
                      <span className="text-lg font-black text-slate-900 font-mono tracking-tight">
                        {tx.price.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Slide Drawer / Modal Overlay for Add Treatment */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
            
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-teal-50 to-sky-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#00647c]/10 rounded-xl text-[#00647c]">
                  <PlusCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-sans tracking-tight">
                    Add Clinical Service Service
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono mt-0.5">
                    Authorized Master Ledger addition
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-black transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTreatment} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Procedure / Treatment Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Feline Dental Ultrasonic Scaling"
                  value={newTxName}
                  onChange={(e) => setNewTxName(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00647c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Category Module
                  </label>
                  <select
                    value={newTxCategory}
                    onChange={(e) => setNewTxCategory(e.target.value as any)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white cursor-pointer"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Medication">Medication</option>
                    <option value="Lab">Lab</option>
                    <option value="Surgery">Surgery</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Clinical Charge Fee ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="250.00"
                    value={newTxPrice}
                    onChange={(e) => setNewTxPrice(e.target.value)}
                    className="w-full text-xs p-3 border border-[#CBD5E1] rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00647c] font-semibold text-[#00647c]"
                  />
                </div>
              </div>

              {/* Informative Help Box */}
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl flex items-start gap-2.5">
                <Info className="w-4.5 h-4.5 text-sky-600 shrink-0 mt-0.5 animate-bounce" />
                <p className="text-[10px] text-sky-800 leading-normal font-sans font-semibold">
                  Once registered, this treatment fee split parameters are automatically updated for DVM allocations within the finance and invoice ledger templates.
                </p>
              </div>

              {/* Actions Footer */}
              <div className="border-t border-slate-100 pt-4 mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00647c] hover:bg-[#007f9d] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer font-sans"
                >
                  Create clinical service
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
