/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Pill, Search, Plus, ShoppingCart, Check, ExternalLink, Calendar, 
  Trash2, AlertTriangle, RefreshCw, RefreshCw as RefillIcon, Eye, Filter, ArrowUpRight, 
  ArrowDownRight, CheckCircle, Clock, Users, X, Barcode
} from 'lucide-react';
import StatCard from './ui/StatCard';
import Badge from './ui/Badge';
import { Staff, Client, Pet } from '../types';

interface PharmacyViewProps {
  pets?: Pet[];
  clients?: Client[];
  allStaff?: Staff[];
  loggedInStaff?: Staff | null;
}

interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  stock: number;
  maxStock: number;
  unitPrice: number;
  expiryDate: string;
  sku?: string;
}

interface PrescriptionQueueItem {
  id: string;
  patientName: string;
  ownerName: string;
  medication: string;
  dosage: string;
  prescribingVet: string;
  status: 'PENDING' | 'FILLING' | 'READY';
  date: string;
}

interface RefillRequest {
  id: string;
  patientName: string;
  breed: string;
  ownerName: string;
  medication: string;
  quantity: number;
  timeAgo: string;
}

export default function PharmacyView({
  pets = [],
  clients = [],
  allStaff = [],
  loggedInStaff
}: PharmacyViewProps) {
  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'warning' }[]>([]);
  const addToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Search and Filtering states
  const [rxSearchQuery, setRxSearchQuery] = useState('');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Dynamic Dialog Forms
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [isNewRxOpen, setIsNewRxOpen] = useState(false);

  // New Medication Form State
  const [newMedName, setNewMedName] = useState('');
  const [newMedBrand, setNewMedBrand] = useState('');
  const [newMedCategory, setNewMedCategory] = useState('Antibiotic');
  const [newMedStock, setNewMedStock] = useState('100');
  const [newMedMaxStock, setNewMedMaxStock] = useState('500');
  const [newMedPrice, setNewMedPrice] = useState('1.50');
  const [newMedExpiry, setNewMedExpiry] = useState('12/2026');
  const [newMedSku, setNewMedSku] = useState('');
  const [isScanningSku, setIsScanningSku] = useState(false);

  // Play synthesized laser scanner beep for real tactile fidelity
  const playScanBeep = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1400, audioCtx.currentTime); // High-pitched scanner beep
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.10);
    } catch (e) {
      console.warn("Audio Context scan audio beep blocked or failed:", e);
    }
  };

  const handleScanSkuMock = () => {
    setIsScanningSku(true);
    addToast('Activating state-level pharmacy laser packaging sensor...', 'info');
    
    setTimeout(() => {
      const codeSuffix = Math.floor(10 + Math.random() * 89);
      const codeMiddle = Math.floor(1000 + Math.random() * 8999);
      const codePrefix = newMedCategory === 'Antibiotic' ? 'NDC-0085' :
                         newMedCategory === 'Pain Management' ? 'NDC-5766' : 'NDC-0110';
      const scannedCode = `${codePrefix}-${codeMiddle}-${codeSuffix}`;
      
      setNewMedSku(scannedCode);
      setIsScanningSku(false);
      playScanBeep();
      addToast(`Packaging sensor aligned: SKU recorded [${scannedCode}]`, 'success');
    }, 1250);
  };

  // New Prescription Form State
  const [newRxPatient, setNewRxPatient] = useState('');
  const [newRxOwner, setNewRxOwner] = useState('');
  const [newRxMed, setNewRxMed] = useState('');
  const [newRxDose, setNewRxDose] = useState('');
  const [newRxVet, setNewRxVet] = useState('');

  // Auto-complete Search Focus States
  const [showPetSuggestions, setShowPetSuggestions] = useState(false);
  const [showOwnerSuggestions, setShowOwnerSuggestions] = useState(false);

  // Search through database (props: pets, clients)
  const matchedPets = useMemo(() => {
    if (!newRxPatient.trim()) return [];
    const query = newRxPatient.toLowerCase();
    return pets.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.breed.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [pets, newRxPatient]);

  const matchedOwners = useMemo(() => {
    if (!newRxOwner.trim()) return [];
    const query = newRxOwner.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query)
    ).slice(0, 5);
  }, [clients, newRxOwner]);

  const handleSelectPet = (pet: Pet) => {
    setNewRxPatient(pet.name);
    setShowPetSuggestions(false);
    
    // Find owner to automatically assign or prompt
    const owner = clients.find(c => c.id === pet.ownerId);
    if (owner) {
      setNewRxOwner(owner.name);
      addToast(`Selected Pet "${pet.name}" and mapped Owner "${owner.name}"`, 'success');
    } else {
      addToast(`Selected Patient profile: "${pet.name}"`, 'info');
    }
  };

  const handleSelectOwner = (owner: Client) => {
    setNewRxOwner(owner.name);
    setShowOwnerSuggestions(false);
    
    // Check if they only have search-filtered pets
    const ownerPets = pets.filter(p => p.ownerId === owner.id);
    if (ownerPets.length === 1) {
      setNewRxPatient(ownerPets[0].name);
      addToast(`Selected Owner "${owner.name}". Found 1 pet "${ownerPets[0].name}" - autofilled.`, 'success');
    } else if (ownerPets.length > 1) {
      addToast(`Selected Owner "${owner.name}". Found ${ownerPets.length} registered pets. Please select which one.`, 'info');
      // Set focus or show matching pet hints
      setNewRxPatient('');
      setShowPetSuggestions(true);
    } else {
      addToast(`Selected Owner: "${owner.name}"`, 'info');
    }
  };

  // Initial Seed Prescription Queue matching mockup exactly
  const [prescriptionQueue, setPrescriptionQueue] = useState<PrescriptionQueueItem[]>([
    {
      id: 'rx-q-1',
      patientName: 'Buddy',
      ownerName: 'John Miller',
      medication: 'Amoxicillin 250mg',
      dosage: '1 tab BID x 10d',
      prescribingVet: 'Dr. Adams',
      status: 'PENDING',
      date: '2026-05-21'
    },
    {
      id: 'rx-q-2',
      patientName: 'Luna',
      ownerName: 'Sarah Chen',
      medication: 'Carprofen 75mg',
      dosage: '0.5 tab SID prn',
      prescribingVet: 'Dr. Jenkins',
      status: 'FILLING',
      date: '2026-05-21'
    },
    {
      id: 'rx-q-3',
      patientName: 'Max',
      ownerName: 'Robert White',
      medication: 'Apoquel 16mg',
      dosage: '1 tab SID x 30d',
      prescribingVet: 'Dr. Adams',
      status: 'READY',
      date: '2026-05-21'
    }
  ]);

  // Initial Seed Inventory items matching mockup exactly
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([
    {
      id: 'med-1',
      name: 'Gabapentin 100mg Caps',
      brand: 'Generic (TEVA)',
      category: 'Pain Management',
      stock: 750,
      maxStock: 1000,
      unitPrice: 0.45,
      expiryDate: '12/2025',
      sku: 'NDC-57664-0010-08'
    },
    {
      id: 'med-2',
      name: 'Enrofloxacin 68mg',
      brand: 'Baytril',
      category: 'Antibiotic',
      stock: 12,
      maxStock: 100,
      unitPrice: 2.15,
      expiryDate: '05/2024', // Low Stock Alert / Expired/Expiring warning!
      sku: 'NDC-0085-0574-02'
    },
    {
      id: 'med-3',
      name: 'Meloxicam 1.5mg/ml',
      brand: 'Metacam 10ml',
      category: 'NSAID',
      stock: 45,
      maxStock: 100,
      unitPrice: 18.90,
      expiryDate: '08/2026',
      sku: 'NDC-0110-3884-10'
    }
  ]);

  // Initial Seed Refill Requests matching mockup exactly
  const [refillRequests, setRefillRequests] = useState<RefillRequest[]>([
    {
      id: 'ref-1',
      patientName: 'Bella',
      breed: 'Labrador',
      ownerName: 'Sarah Johnson',
      medication: 'Rimadyl 100mg',
      quantity: 30,
      timeAgo: '10m ago'
    },
    {
      id: 'ref-2',
      patientName: 'Cooper',
      breed: 'Golden',
      ownerName: 'John Miller',
      medication: 'Methimazole 5mg',
      quantity: 60,
      timeAgo: '2h ago'
    }
  ]);

  // Static items for low stock alerts from mockup
  const lowStockAlerts = useMemo(() => {
    const fromInventory = inventoryList.filter(item => item.stock / item.maxStock < 0.2);
    // Add additional critical ones from graphic to match fidelity
    const staticAlerts = [
      { id: 'crit-1', name: 'Prednisone 5mg', detail: 'Only 8 tabs remaining', status: 'critical', stock: 8 },
      { id: 'crit-2', name: 'Vetmedin 5mg', detail: 'Out of Stock', status: 'empty', stock: 0 },
      { id: 'crit-3', name: 'Synulox 50mg', detail: '15 tabs remaining', status: 'low', stock: 15 }
    ];
    return [...fromInventory.map(item => ({
      id: `crit-inv-${item.id}`,
      name: item.name,
      detail: `${item.stock} remains (${item.brand})`,
      status: item.stock === 0 ? 'empty' : 'low',
      stock: item.stock
    })), ...staticAlerts];
  }, [inventoryList]);

  // Form handle helper - medication add
  const handleAddMedicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName) {
      addToast('Medication name is required!', 'warning');
      return;
    }
    const item: InventoryItem = {
      id: `med-${Date.now()}`,
      name: newMedName,
      brand: newMedBrand || 'Generic',
      category: newMedCategory,
      stock: Math.max(0, parseInt(newMedStock) || 0),
      maxStock: Math.max(1, parseInt(newMedMaxStock) || 100),
      unitPrice: Math.max(0, parseFloat(newMedPrice) || 0),
      expiryDate: newMedExpiry || '12/2026',
      sku: newMedSku || undefined
    };

    setInventoryList(prev => [item, ...prev]);
    addToast(`${newMedName} successfully added to central inventory list.`, 'success');
    
    // Clear state
    setNewMedName('');
    setNewMedBrand('');
    setNewMedStock('100');
    setNewMedMaxStock('500');
    setNewMedPrice('1.50');
    setNewMedSku('');
    setIsAddMedOpen(false);
  };

  // Form handle helper - direct manual prescription entry
  const handleAddNewRxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRxPatient || !newRxMed || !newRxDose) {
      addToast('Patient Name, Medication, and Dosage are required!', 'warning');
      return;
    }

    const item: PrescriptionQueueItem = {
      id: `rx-q-${Date.now()}`,
      patientName: newRxPatient,
      ownerName: newRxOwner || 'Walk-in Client',
      medication: newRxMed,
      dosage: newRxDose,
      prescribingVet: newRxVet || loggedInStaff?.name || 'Dr. Jenkins',
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0]
    };

    setPrescriptionQueue(prev => [item, ...prev]);
    addToast(`Prescription for ${newRxPatient} queued in pending state.`, 'success');

    // Reset Form
    setNewRxPatient('');
    setNewRxOwner('');
    setNewRxMed('');
    setNewRxDose('');
    setNewRxVet('');
    setIsNewRxOpen(false);
  };

  // Interaction handlers
  const handleFillPrescription = (id: string, currentStatus: PrescriptionQueueItem['status']) => {
    setPrescriptionQueue(prev => prev.map(item => {
      if (item.id === id) {
        if (currentStatus === 'PENDING') {
          addToast(`Fulfillment in progress for ${item.patientName}. Labeled "Filling".`, 'info');
          return { ...item, status: 'FILLING' };
        } else if (currentStatus === 'FILLING') {
          addToast(`Prescription for ${item.patientName} is filled and labeled "Ready". Alert sent to owner.`, 'success');
          return { ...item, status: 'READY' };
        }
      }
      return item;
    }));
  };

  const handleApproveRefill = (refill: RefillRequest) => {
    // Add approved refill directly to the prescription queue
    const queuedRx: PrescriptionQueueItem = {
      id: `rx-q-ref-${refill.id}`,
      patientName: refill.patientName,
      ownerName: refill.ownerName,
      medication: refill.medication,
      dosage: `${refill.quantity} tabs SID`,
      prescribingVet: loggedInStaff?.name || 'Dr. Sarah Jenkins',
      status: 'READY', // Refills can go straight to READY or FILLING
      date: new Date().toISOString().split('T')[0]
    };

    setPrescriptionQueue(prev => [queuedRx, ...prev]);
    setRefillRequests(prev => prev.filter(r => r.id !== refill.id));
    addToast(`Refill request for ${refill.patientName} approved. Transferred to clinical Rx Queue as "Ready"!`, 'success');
  };

  const handleDeclineRefill = (id: string, patientName: string) => {
    setRefillRequests(prev => prev.filter(r => r.id !== id));
    addToast(`Refill request for ${patientName} declined. Logs updated.`, 'warning');
  };

  const handleQuickRestock = (itemName: string) => {
    addToast(`Ordering central stock shipment for "${itemName}". Order logged with Merck/Covetrus suppliers.`, 'success');
    
    // Increase inventory if it exists in list
    setInventoryList(prev => prev.map(item => {
      if (item.name.toLowerCase().includes(itemName.toLowerCase())) {
        return { ...item, stock: Math.min(item.maxStock, item.stock + 150) };
      }
      return item;
    }));
  };

  // Helper values for categories from inventory
  const categories = useMemo(() => {
    const cats = new Set(inventoryList.map(item => item.category));
    return ['All', ...Array.from(cats)];
  }, [inventoryList]);

  // Statistics calculation
  const totalRxToday = prescriptionQueue.length;
  const pendingFulfillment = prescriptionQueue.filter(r => r.status === 'PENDING' || r.status === 'FILLING').length;
  const criticalStockCount = lowStockAlerts.length;
  const expiringSoonCount = 5; // Fixed high-fidelity representation of upcoming audits

  // Filter lists based on inputs
  const filteredPrescriptionQueue = useMemo(() => {
    return prescriptionQueue.filter(item => {
      const matchText = (item.patientName + ' ' + item.ownerName + ' ' + item.medication + ' ' + item.prescribingVet).toLowerCase();
      return matchText.includes(rxSearchQuery.toLowerCase());
    });
  }, [prescriptionQueue, rxSearchQuery]);

  const filteredInventory = useMemo(() => {
    return inventoryList.filter(item => {
      const matchText = (item.name + ' ' + item.brand + ' ' + item.category).toLowerCase();
      const matchCategory = selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;
      return matchText.includes(inventorySearchQuery.toLowerCase()) && matchCategory;
    });
  }, [inventoryList, inventorySearchQuery, selectedCategoryFilter]);

  return (
    <div className="space-y-6" id="pharmacy-workplace-canvas">
      
      {/* Dynamic Floating Notification Toast feedback */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-xl border text-xs font-semibold tracking-wide animate-slide-in ${
              toast.type === 'success' ? 'bg-[#00647c] border-cyan-500/30 text-white' :
              toast.type === 'warning' ? 'bg-red-800 border-red-700 text-white' :
              'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {toast.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <p className="flex-1 leading-snug">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Header section with live buttons and metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/40 pb-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#0d1c2e] tracking-tight flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary stroke-[2.5px]" /> 
            Pharmacy Management &amp; Drug Ledger
          </h1>
          <p className="text-xs text-[#545d62] font-semibold mt-0.5">
            Monitor state-level controlled substance dispensing, auto-track stock quantities, and verify prescription refills.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNewRxOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0d1c2e] text-xs font-bold rounded-lg border border-slate-200 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-primary" />
            New Prescription
          </button>
          
          <button
            type="button"
            onClick={() => {
              addToast('Initiating real-time state database drug inventory synchronization...', 'info');
              setTimeout(() => addToast('Drug audit ledger sync complete! Federal reporting records secure.', 'success'), 1500);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00647c] text-white text-xs font-black rounded-lg hover:bg-cyan-700 transition-all select-none active:scale-[0.98] cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Ledger
          </button>
        </div>
      </div>

      {/* 1. Pharmacy Overview Stats Bento Grid Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="pharmacy-stats-bento">
        <StatCard 
          title="TOTAL RX TODAY" 
          value={totalRxToday} 
          icon={Pill} 
          color="teal" 
        />
        <StatCard 
          title="PENDING FULFILLMENT" 
          value={pendingFulfillment} 
          icon={Clock} 
          color="orange" 
        />
        <StatCard 
          title="LOW STOCK ALERTS" 
          value={criticalStockCount} 
          icon={AlertTriangle} 
          color="red" 
        />
        <StatCard 
          title="EXPIRING SOON" 
          value={expiringSoonCount} 
          icon={Calendar} 
          color="blue" 
        />
      </section>

      {/* Main Grid Content Panels Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Columns - Tables Stack */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Prescription Queue Panel */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden" id="prescription-queue-table">
            <div className="px-5 py-4 border-b border-[#E2E8F0] bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-1.5">
                  Prescription Queue
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold font-mono">
                  {filteredPrescriptionQueue.length} Active Rx
                </span>
              </div>
              
              {/* Table search filter widget */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  value={rxSearchQuery}
                  onChange={(e) => setRxSearchQuery(e.target.value)}
                  placeholder="Search animal, owner, vet..."
                  className="w-full bg-white border border-outline-variant/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-[#00647c]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-500 uppercase font-black tracking-wider border-b border-[#E2E8F0]">
                    <th className="px-5 py-3">Patient &amp; Owner</th>
                    <th className="px-5 py-3">Medication</th>
                    <th className="px-5 py-3">Dose / Frequency</th>
                    <th className="px-5 py-3">Prescribing Vet</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredPrescriptionQueue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                        No prescriptions matching filters in current clinic audit queue.
                      </td>
                    </tr>
                  ) : (
                    filteredPrescriptionQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-cyan-100/60 border border-cyan-200 flex items-center justify-center font-black text-xs text-primary">
                              {item.patientName[0]}
                            </div>
                            <div>
                              <p className="font-extrabold text-[#0d1c2e] text-xs">
                                {item.patientName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold">
                                Owner: {item.ownerName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-750">
                          {item.medication}
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600">
                          {item.dosage}
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-medium">
                          {item.prescribingVet}
                        </td>
                        <td className="px-5 py-4">
                          <Badge 
                            variant={
                              item.status === 'READY' ? 'success' :
                              item.status === 'FILLING' ? 'info' : 'warning'
                            }
                            size="sm"
                            dot
                          >
                            {item.status === 'FILLING' ? 'Filling' : item.status === 'READY' ? 'Ready' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {item.status !== 'READY' ? (
                            <button
                              type="button"
                              onClick={() => handleFillPrescription(item.id, item.status)}
                              className="px-3.5 py-1.5 bg-[#00647c] hover:bg-cyan-700 text-white text-[11px] font-black rounded-lg transition-all shadow-xs shrink-0 cursor-pointer"
                            >
                              {item.status === 'PENDING' ? 'Fill Rx' : 'Set Ready'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="px-3.5 py-1.5 bg-slate-100 text-slate-400 text-[11px] font-bold rounded-lg cursor-not-allowed border border-slate-200"
                            >
                              Filled &amp; Close
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Inventory Management Panel */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden" id="pharmacy-inventory-ledger">
            <div className="px-5 py-4 border-b border-[#E2E8F0] bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide">
                  Inventory Management
                </h3>
                
                {/* Category filters tags list */}
                <div className="flex gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                        selectedCategoryFilter === cat
                          ? 'bg-[#00647c] border-[#00647c] text-white shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-500'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                {/* Search query widget */}
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={inventorySearchQuery}
                    onChange={(e) => setInventorySearchQuery(e.target.value)}
                    placeholder="Filter medication name..."
                    className="w-full bg-white border border-outline-variant/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-[#00647c]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddMedOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#00647c] text-white text-xs font-black rounded-lg hover:bg-cyan-700 transition-all cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5 shrink-0" />
                  Add Stock
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-500 uppercase font-black tracking-wider border-b border-[#E2E8F0]">
                    <th className="px-5 py-3">Medication Name</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3" style={{ minWidth: '160px' }}>Stock Level</th>
                    <th className="px-5 py-3 text-right">Unit Price</th>
                    <th className="px-5 py-3">Expiry Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredInventory.map((item) => {
                    const ratio = item.stock / item.maxStock;
                    const progressColor = ratio < 0.2 ? 'bg-red-500' : ratio < 0.5 ? 'bg-amber-500' : 'bg-primary';
                    const isExpiring = item.expiryDate.includes('2024') || item.expiryDate.includes('05/');

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-all duration-150">
                        <td className="px-5 py-4">
                          <p className="font-extrabold text-[#0d1c2e] text-xs">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold flex flex-wrap items-center gap-1.5">
                            <span>{item.brand}</span>
                            {item.sku && (
                              <>
                                <span className="text-slate-300">|</span>
                                <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                                  SKU: {item.sku}
                                </span>
                              </>
                            )}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 font-semibold text-slate-600">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-150 h-2 rounded-full overflow-hidden w-24">
                              <div className={`h-full ${progressColor}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                            </div>
                            <span className={`text-[11px] font-bold font-mono ${ratio < 0.2 ? 'text-red-600' : 'text-slate-700'}`}>
                              {item.stock}/{item.maxStock}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-slate-700 font-bold">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`font-medium ${isExpiring ? 'text-red-650 font-bold text-red-600' : 'text-slate-650'}`}>
                            {item.expiryDate} {isExpiring && '⚠️'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleQuickRestock(item.name)}
                            className="p-1 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                            title="Order Restock Shipment"
                          >
                            <ShoppingCart className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-slate-50/40 border-t border-[#E2E8F0] flex justify-between items-center text-[11px] text-slate-500 font-bold font-sans">
              <p>Showing {filteredInventory.length} of {inventoryList.length} total drug catalog records</p>
              <div className="flex gap-1">
                <button type="button" disabled className="px-2.5 py-1 border border-slate-250 bg-white text-slate-400 rounded-md cursor-not-allowed">Prior</button>
                <button type="button" disabled className="px-2.5 py-1 border border-slate-250 bg-white text-slate-400 rounded-md cursor-not-allowed">Next</button>
              </div>
            </div>
          </section>

        </div>

        {/* Right Sidebar Column - Actions Panels */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Refill Requests Segment */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden" id="pharmacy-refill-widget">
            <div className="px-4 py-3 border-b border-[#E2E8F0] bg-cyan-50/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefillIcon className="w-4 h-4 text-primary animate-spin-slow text-[#00647c]" />
                <h4 className="text-xs font-extrabold text-[#0d1c2e] uppercase tracking-wider">
                  Refill Requests
                </h4>
              </div>
              <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-black font-mono leading-none">
                {refillRequests.length}
              </span>
            </div>

            <div className="p-4 space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar">
              {refillRequests.length === 0 ? (
                <div className="text-center py-6 text-slate-400 font-medium text-[11px]">
                  No pending patient refill requests under audit.
                </div>
              ) : (
                refillRequests.map((ref) => (
                  <div 
                    key={ref.id}
                    className="p-3.5 bg-slate-55 bg-slate-50/50 border border-slate-200/70 rounded-xl hover:border-primary/45 hover:shadow-xs transition-all relative group"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <p className="font-extrabold text-[#0d1c2e] tracking-tight text-xs flex items-center gap-1">
                          {ref.patientName} 
                          <span className="text-[9px] text-slate-400 font-bold uppercase font-sans">
                            ({ref.breed})
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Owner: {ref.ownerName}
                        </p>
                      </div>
                      <span className="text-[9px] text-slate-405 text-slate-400 font-mono font-bold shrink-0">
                        {ref.timeAgo}
                      </span>
                    </div>

                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/50 my-2.5">
                      <p className="text-[11px] font-extrabold text-[#00647c]">
                        {ref.medication}
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold font-mono mt-0.5">
                        Quantity request: {ref.quantity} tablets
                      </p>
                    </div>

                    <div className="flex gap-2 mt-3 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleApproveRefill(ref)}
                        className="flex-1 py-1.5 bg-[#00647c] text-white text-[10px] font-black rounded-lg hover:bg-cyan-700 cursor-pointer shadow-2xs text-center border border-[#00647c]"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclineRefill(ref.id, ref.patientName)}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Critical Stock alerts sidebar */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden" id="critical-substance-stock">
            <div className="px-4 py-3 border-b border-[#E2E8F0] bg-red-50/10 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h4 className="text-xs font-extrabold text-red-750 text-red-700 uppercase tracking-wider">
                Critical Drug Alerts
              </h4>
            </div>

            <div className="p-4 space-y-3.5">
              {lowStockAlerts.map((crit) => (
                <div 
                  key={crit.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-red-50/25 border-l-4 border-red-500 hover:bg-red-50/40 transition-all"
                >
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-black text-[#0d1c2e] truncate">
                      {crit.name}
                    </p>
                    <p className="text-[10px] text-red-600 font-extrabold mt-0.5 flex items-center gap-1 font-mono">
                      {crit.detail}
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleQuickRestock(crit.name)}
                    className="p-1 rounded-full text-red-600 hover:bg-red-100/60 transition-colors cursor-pointer"
                    title="Quick Order Restock"
                  >
                    <ShoppingCart className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Representative Support Sidebar promo */}
          <section className="bg-[#00647c] p-5 rounded-xl text-white shadow-md relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                Supplier Directory
              </h4>
              <p className="text-[11px] leading-snug mt-1.5 opacity-90">
                Facing supplier deficits or require emergency clinical transport for controlled veterinary substances?
              </p>
              
              <button
                type="button"
                onClick={() => {
                  alert('Central Supplier Rep Hotline: 1-800-VET-DRUG (Mon-Fri). Emergency courier dispatch active.');
                }}
                className="w-full mt-4 py-2 bg-white text-primary text-xs font-black rounded-lg hover:bg-opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-[#00647c] shadow-md shadow-[#00647c]/10"
              >
                Contact Rep Support
              </button>
            </div>
            
            {/* Decors */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute -left-6 -top-6 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          </section>

        </div>

      </div>

      {/* FOOTER SYSTEM SYNC */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 font-black tracking-wider uppercase pt-6 border-t border-slate-100 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span>FSA DEA Audit Checkpoint: Compliant</span>
        </div>
        <span>VetHub Client v4.6.2</span>
      </div>

      {/* DIALOG DIALOGUE 1: Add new inventory medication stock item */}
      {isAddMedOpen && (
        <div className="fixed inset-0 bg-[#0d1c2e]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-medication-dialog">
          <div className="bg-white rounded-xl shadow-2xl border border-outline-variant/60 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-[#eff4ff] px-5 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-[#0d1c2e] tracking-wider">
                📦 Add Medication to Inventory
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddMedOpen(false)}
                className="text-slate-400 hover:text-slate-650 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedicationSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Medication Name</label>
                <input 
                  type="text"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g. Levothyroxine Sodium"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00647c]"
                  required
                />
              </div>

              {/* SKU / Barcode Entry and Simulation Laser Scan Field */}
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold flex items-center justify-between">
                  <span>SKU / Barcode (Enter or Scan)</span>
                  {newMedSku && (
                    <span className="font-mono text-[9px] text-[#00647c] bg-cyan-50 border border-cyan-155 px-1 rounded-sm uppercase font-extrabold animate-pulse">
                      Code Verified
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text"
                      value={newMedSku}
                      onChange={(e) => setNewMedSku(e.target.value)}
                      placeholder="e.g. NDC-57664-0010-08 or click 'Scan'"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00647c]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleScanSkuMock}
                    disabled={isScanningSku}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0d1c2e] hover:text-[#00647c] text-xs font-black rounded-lg border border-slate-200 transition-all select-none cursor-pointer"
                  >
                    <Barcode className="w-4 h-4 text-[#00647c] shrink-0" />
                    <span>Scan</span>
                  </button>
                </div>
              </div>

              {/* Barcode scanner active simulation laser sweeper beam */}
              {isScanningSku && (
                <div className="bg-[#0b1329] text-white p-3.5 rounded-lg border border-slate-800 space-y-2 relative overflow-hidden shadow-inner">
                  {/* Neon active horizontal laser sweep line */}
                  <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-lg shadow-red-500 animate-pulse top-1/2" />
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-red-950/80 flex items-center justify-center animate-pulse">
                      <Barcode className="w-4.5 h-4.5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-bold text-[11px] text-slate-200 uppercase tracking-widest flex items-center gap-1.5 label-sans">
                        <span>RFID/Laser Scanner Active</span>
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium">
                        Centering optical viewport... Scan laser active...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold">Brand / Lab</label>
                  <input 
                    type="text"
                    value={newMedBrand}
                    onChange={(e) => setNewMedBrand(e.target.value)}
                    placeholder="e.g. Thyro-Tabs"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00647c]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold">Category</label>
                  <select
                    value={newMedCategory}
                    onChange={(e) => setNewMedCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00647c]"
                  >
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Pain Management">Pain Management</option>
                    <option value="NSAID">NSAID</option>
                    <option value="Cardiac">Cardiac</option>
                    <option value="Hormonal">Hormonal</option>
                    <option value="General Oral">General Oral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold">Current Stock</label>
                  <input 
                    type="number"
                    value={newMedStock}
                    onChange={(e) => setNewMedStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold">Max Target Stock</label>
                  <input 
                    type="number"
                    value={newMedMaxStock}
                    onChange={(e) => setNewMedMaxStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold">Price per Unit ($)</label>
                  <input 
                    type="text"
                    value={newMedPrice}
                    onChange={(e) => setNewMedPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold">Expiry Date</label>
                  <input 
                    type="text"
                    value={newMedExpiry}
                    onChange={(e) => setNewMedExpiry(e.target.value)}
                    placeholder="MM/YYYY"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00647c] text-white font-black rounded-lg hover:bg-cyan-700 transition-all cursor-pointer"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG DIALOGUE 2: Direct Prescription Dispatch Entry */}
      {isNewRxOpen && (
        <div className="fixed inset-0 bg-[#0d1c2e]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-prescription-dialog">
          <div className="bg-white rounded-xl shadow-2xl border border-outline-variant/60 w-full max-w-md overflow-visible flex flex-col">
            <div className="bg-[#eff4ff] px-5 py-4 border-b border-[#E2E8F0] flex justify-between items-center rounded-t-xl">
              <h3 className="text-xs font-bold uppercase text-[#0d1c2e] tracking-wider">
                💊 Write Direct Prescription Entry
              </h3>
              <button 
                type="button"
                onClick={() => setIsNewRxOpen(false)}
                className="text-slate-400 hover:text-slate-650 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewRxSubmit} className="p-5 space-y-4 text-xs overflow-visible">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 relative">
                  <label className="block text-slate-500 font-bold">Pet / Patient Name</label>
                  <input 
                    type="text"
                    value={newRxPatient}
                    onChange={(e) => {
                      setNewRxPatient(e.target.value);
                      setShowPetSuggestions(true);
                    }}
                    onFocus={() => setShowPetSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowPetSuggestions(false), 250)}
                    placeholder="e.g. Max"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00647c]"
                    required
                  />

                  {/* Pet Suggestions overlay */}
                  {showPetSuggestions && matchedPets.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 divide-y divide-slate-100">
                      {matchedPets.map(pet => {
                        const owner = clients.find(c => c.id === pet.ownerId);
                        return (
                          <button
                            key={pet.id}
                            type="button"
                            onMouseDown={() => handleSelectPet(pet)}
                            className="w-full text-left px-3 py-2 hover:bg-[#00647c]/5 transition-colors flex flex-col gap-0.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0d1c2e]">{pet.name}</span>
                              <span className="text-[9px] font-mono uppercase bg-[#00647c]/10 text-[#00647c] px-1 rounded">
                                {pet.species}
                              </span>
                            </div>
                            {owner && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                Owner: {owner.name}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {showPetSuggestions && newRxPatient.trim() && matchedPets.length === 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50 text-slate-400 text-center text-[10px]">
                      No pets matched in DB
                    </div>
                  )}
                </div>

                <div className="space-y-1 relative">
                  <label className="block text-slate-500 font-bold">Owner Name</label>
                  <input 
                    type="text"
                    value={newRxOwner}
                    onChange={(e) => {
                      setNewRxOwner(e.target.value);
                      setShowOwnerSuggestions(true);
                    }}
                    onFocus={() => setShowOwnerSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowOwnerSuggestions(false), 250)}
                    placeholder="e.g. Sarah J."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00647c]"
                  />

                  {/* Owner Suggestions overlay */}
                  {showOwnerSuggestions && matchedOwners.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 divide-y divide-slate-100">
                      {matchedOwners.map(owner => {
                        const ownerPetsCount = pets.filter(p => p.ownerId === owner.id).length;
                        return (
                          <button
                            key={owner.id}
                            type="button"
                            onMouseDown={() => handleSelectOwner(owner)}
                            className="w-full text-left px-3 py-2 hover:bg-[#00647c]/5 transition-colors flex flex-col gap-0.5"
                          >
                            <span className="font-bold text-[#0d1c2e]">{owner.name}</span>
                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                              <span>{owner.phone}</span>
                              <span className="text-[10px] text-[#00647c] font-semibold bg-cyan-50 px-1 rounded-xs">
                                {ownerPetsCount} {ownerPetsCount === 1 ? 'pet' : 'pets'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {showOwnerSuggestions && newRxOwner.trim() && matchedOwners.length === 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50 text-slate-400 text-center text-[10px]">
                      No owners matched in DB
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Medication &amp; Strength</label>
                <input 
                  type="text"
                  value={newRxMed}
                  onChange={(e) => setNewRxMed(e.target.value)}
                  placeholder="e.g. Gabapentin 100mg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Dosage instructions</label>
                <input 
                  type="text"
                  value={newRxDose}
                  onChange={(e) => setNewRxDose(e.target.value)}
                  placeholder="e.g. 1 cap BID x 7 days AU"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Prescribing Vet</label>
                <input 
                  type="text"
                  value={newRxVet}
                  onChange={(e) => setNewRxVet(e.target.value)}
                  placeholder="Dr. Sarah Jenkins"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00647c] text-white font-black rounded-lg hover:bg-cyan-700 transition-all cursor-pointer"
                >
                  Send to Dispensing Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
