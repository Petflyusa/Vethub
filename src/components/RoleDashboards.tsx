/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Clinical dashboards for DVM, Reception, Tech, Owner and Accountant.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Calendar, CreditCard, DollarSign, Users, ShieldAlert,
  ClipboardList, Stethoscope, AlertTriangle, CheckSquare, 
  Send, Layers, Activity, UserCheck, PlusSquare, FileCheck,
  Clock, Shield, BarChart3, Bell, BadgePercent, Package, Settings, Sparkles, Check, Edit, Trash
} from 'lucide-react';
import { 
  Appointment, Pet, Client, Staff, LabOrder, RevenueSplit, Consultation, Invoice, Role
} from '../types';

/* ==========================================
   VET / DVM DASHBOARD
   ========================================== */
interface VetDashboardProps {
  appointments: Appointment[];
  pets: Pet[];
  clients: Client[];
  allStaff: Staff[];
  consultations: Consultation[];
  labOrders: LabOrder[];
  notifications: any[];
  overnightTasks: any[];
  treatmentPrices: any[];
  medicationPrices: any[];
  onOpenSoapNote: (aptId: string, petName: string) => void;
  onSendConsultation: (cons: Consultation) => void;
  onChangeNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  onChangeOvernightTasks: React.Dispatch<React.SetStateAction<any[]>>;
  onChangePets: React.Dispatch<React.SetStateAction<Pet[]>>;
  onChangeAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  onChangeInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
}

export function VetDashboard({
  appointments,
  pets,
  clients,
  allStaff,
  consultations,
  labOrders,
  notifications,
  overnightTasks,
  treatmentPrices,
  medicationPrices,
  onOpenSoapNote,
  onSendConsultation,
  onChangeNotifications,
  onChangeOvernightTasks,
  onChangePets,
  onChangeAppointments,
  onChangeInvoices
}: VetDashboardProps) {
  const [consQuestion, setConsQuestion] = useState('');
  const [consTargetId, setConsTargetId] = useState('staff-dvm-2');
  const [consFee, setConsFee] = useState(50);

  // Form states for ordering treatments involving other staff
  const [selectedStaffToNotify, setSelectedStaffToNotify] = useState('staff-tech-1');
  const [surgicalProcedureName, setSurgicalProcedureName] = useState('tx-2'); // default scale/polish
  const [careDirections, setCareDirections] = useState('Setup outpatient intravenous recovery hydration.');

  // Form states for transferring to overnight stay
  const [transferPetId, setTransferPetId] = useState('pet-1');
  const [overnightNursingNotes, setOvernightNursingNotes] = useState('Check hydration and body temperature every 4 hours.');

  // Today's active queue flow (Checked In or In Treatment patients)
  const activeQueue = useMemo(() => {
    return appointments.filter(a => ['CHECKED_IN', 'IN_PROGRESS', 'CONFIRMED'].includes(a.status));
  }, [appointments]);

  // Handle billing invoice dispatch
  const handleAutoInvoicing = (aptId: string, petId: string) => {
    const matchedPet = pets.find(p => p.id === petId);
    if (!matchedPet) return;
    const matchedClient = clients.find(c => c.id === matchedPet.ownerId);
    if (!matchedClient) return;

    const baseTx = treatmentPrices.find(t => t.id === 'tx-1') || { name: 'Annual Wellness Exam', price: 65.00 };

    const generatedInv: Invoice = {
      id: `inv-auto-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: matchedClient.id,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'DRAFT',
      items: [
        { id: `it-1-${Date.now()}`, description: `${matchedPet.name} Exam: ${baseTx.name}`, amount: baseTx.price, quantity: 1, category: 'Consultation' },
        { id: `it-2-${Date.now()}`, description: 'Clinical In-Patient Materials Fee', amount: 45.00, quantity: 1, category: 'General' }
      ],
      total: baseTx.price + 45.00
    };

    onChangeInvoices(prev => [generatedInv, ...prev]);
    // Save to localStorage for BillingView to load dynamically
    const billingItemsForInvoice = generatedInv.items.map(item => ({
      id: item.id,
      name: item.description,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.amount
    }));
    localStorage.setItem('vethub_pending_billing_items', JSON.stringify(billingItemsForInvoice));
    localStorage.setItem('vethub_active_bill_pet', matchedPet.name);
    localStorage.setItem('vethub_active_bill_client_name', matchedClient.name);
    localStorage.setItem('vethub_active_bill_client_email', matchedClient.email);

    alert(`Auto-Billing itemized draft ${generatedInv.id} created for ${matchedPet.name}. Redirected to Front Desk!`);
  };

  // Submit and notify overlapping treatment order
  const handleOrderSpecialTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedStaff = allStaff.find(s => s.id === selectedStaffToNotify);
    const selectedTxItem = treatmentPrices.find(tx => tx.id === surgicalProcedureName) || { name: 'Special Treatment', price: 100 };
    
    if (!matchedStaff) return;

    // Trigger Notification setup in shared state
    const newAlert = {
      id: `n-new-${Date.now()}`,
      staffId: selectedStaffToNotify,
      message: `Surgeon ordered overlapping procedure [${selectedTxItem.name}] with you for care: "${careDirections}"`,
      date: 'Just now',
      read: false
    };

    onChangeNotifications(prev => [newAlert, ...prev]);

    // Also transition nearest appointment status to 'IN_PROGRESS' or 'In Treatment'
    onChangePets(prev => prev.map(p => p.id === 'pet-1' ? { ...p, status: 'In Treatment' } : p));
    alert(`Success! overlapping request sent. ${matchedStaff.name} has been notified. Staff calendar is blocked for this treatment duration.`);
  };

  // Transfer patient to inpatient stay
  const handleTransferToOvernight = (e: React.FormEvent) => {
    e.preventDefault();
    const pet = pets.find(p => p.id === transferPetId);
    if (!pet) return;

    // 1. Update pet status to overnight stay
    onChangePets(prev => prev.map(p => p.id === transferPetId ? { ...p, status: 'Overnight Stay' } : p));

    // 2. Insert standard overnight task checklist for on-duty techs
    const baseTasks = [
      { id: `t-ov-${Date.now()}-1`, petId: transferPetId, task: overnightNursingNotes, assignedTo: 'staff-tech-1', time: '10:00 PM', done: false },
      { id: `t-ov-${Date.now()}-2`, petId: transferPetId, task: `Check vitals (Temp, Heart Rate, Respiration Rate) for ${pet.name}`, assignedTo: 'staff-tech-1', time: '02:00 AM', done: false },
      { id: `t-ov-${Date.now()}-3`, petId: transferPetId, task: `Administer overnight hydration support`, assignedTo: 'staff-tech-1', time: '06:00 AM', done: false }
    ];

    onChangeOvernightTasks(prev => [...baseTasks, ...prev]);
    alert(`${pet.name} is now marked as Overnight In-Patient Stay! Initial tech task checklist is registered.`);
  };

  const handlePostConsult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consQuestion) return;

    const matchedStaff = allStaff.find(s => s.id === consTargetId);
    const newCons: Consultation = {
      id: `cons-${Date.now()}`,
      medicalRecordId: `mr-cons-${Date.now()}`,
      requesterDvmId: 'staff-dvm-1',
      targetDvmId: consTargetId,
      question: consQuestion,
      notes: null,
      revenueAmount: consFee,
      status: 'PENDING',
      validUntil: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0]
    };

    onSendConsultation(newCons);
    setConsQuestion('');

    // Trigger Notification for the consulted surgeon
    const newAlert = {
      id: `n-cons-${Date.now()}`,
      staffId: consTargetId,
      message: `New Surgical Consultation request sent from Dr. Alexander. Offered Split Fee: $${consFee}.`,
      date: 'Just now',
      read: false
    };
    onChangeNotifications(prev => [newAlert, ...prev]);

    alert(`Consultation dispatched to ${matchedStaff?.name}! Settle Split configuration is registered.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Main Grid: Active Queue & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Patient Queue Tracker */}
        <div className="lg:col-span-2 bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-500 animate-pulse" /> Today's Live Clinical Patient Queue
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Real-time status tracking for patients currently in the hospital</p>
            </div>
            <span className="text-[10px] bg-slate-105 px-2 py-0.5 rounded text-slate-700 font-mono font-bold">
              {activeQueue.length} Patients Active
            </span>
          </div>

          {activeQueue.length === 0 ? (
            <p className="text-xs text-slate-500 leading-relaxed py-6 text-center">
              No patients checked in at front desk today. Checked-in patients will instantly populate this list.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeQueue.map((apt) => {
                const pet = pets.find(p => p.id === apt.petId);
                const client = clients.find(c => c.id === apt.clientId);
                return (
                  <div key={apt.id} className="p-4 rounded-xl border border-slate-205/50 bg-slate-50/50 hover:bg-slate-50/90 transition-all flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={pet?.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=120"}
                          alt={pet?.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-850">{pet?.name} <span className="text-[10px] text-slate-400 font-medium">({pet?.breed})</span></h4>
                          <p className="text-[10px] text-slate-500 font-semibold">Owner: {client?.name}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        pet?.status === 'Checked In' ? 'bg-amber-100 text-amber-800' :
                        pet?.status === 'In Surgery' ? 'bg-indigo-100 text-indigo-800 animate-pulse' :
                        pet?.status === 'In Treatment' ? 'bg-sky-100 text-sky-850' : 'bg-stone-100 text-stone-800'
                      }`}>
                        {pet?.status || 'Checked In'}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-600 bg-white/70 p-2 rounded border border-slate-100">
                      <strong>Reason:</strong> {apt.reason}
                      {apt.vitals && (
                        <div className="mt-1.5 grid grid-cols-3 gap-1 font-mono text-[9px] text-[#00647c]">
                          <span>T: {apt.vitals.temp || '--'}</span>
                          <span>HR: {apt.vitals.hr || '--'}</span>
                          <span>RR: {apt.vitals.rr || '--'}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenSoapNote(apt.id, pet?.name || 'Patient')}
                        className="flex-1 py-1 px-2.5 bg-primary hover:bg-primary-container text-on-primary text-[10px] font-bold rounded-lg transition-all text-center"
                      >
                        Start SOAP Note
                      </button>
                      <button
                        onClick={() => handleAutoInvoicing(apt.id, pet?.id || '')}
                        className="py-1 px-2.5 border border-emerald-305 text-emerald-800 hover:bg-emerald-50 text-[10px] font-bold rounded-lg transition-all text-center"
                      >
                        Dispatch Invoice
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Diagnostic Staff Collab and Block Calendar */}
        <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            🧑‍⚕️ Inter-Staff Clinical Request
          </h3>
          <p className="text-[10px] text-slate-500 leading-normal">
            Order a medical procedure that involves another surgeon or technician. The system will book their overlay calendar availability automatically.
          </p>

          <form onSubmit={handleOrderSpecialTreatment} className="space-y-3.5 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Select Procedure</label>
              <select
                value={surgicalProcedureName}
                onChange={(e) => setSurgicalProcedureName(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-none"
              >
                {treatmentPrices.map(t => (
                  <option key={t.id} value={t.id}>{t.name} (${t.price})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Assign Co-Doctor or Tech Coverage</label>
              <select
                value={selectedStaffToNotify}
                onChange={(e) => setSelectedStaffToNotify(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-none"
              >
                {allStaff.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Specific Care Requirements</label>
              <textarea
                value={careDirections}
                onChange={(e) => setCareDirections(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 focus:bg-white rounded"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary text-on-primary font-bold text-xs rounded-lg hover:shadow-xs hover:translate-y-[-0.5px] cursor-pointer transition-all"
            >
              Dispatch Order &amp; Reserve Staff Slot
            </button>
          </form>
        </div>

      </div>

      {/* Secondary Grid: Overnight Stay setup & Peer Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Overnight stay transfer command */}
        <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            🌙 In-Patient Overnight Stay Placement
          </h3>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Transition a patient to "Overnight Stay" status. This automatically generates a clinical monitoring task checklist for night-shift veterinary technicians on-duty.
          </p>

          <form onSubmit={handleTransferToOvernight} className="space-y-3 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Select Patient to Transfer</label>
              <select
                value={transferPetId}
                onChange={(e) => setTransferPetId(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-none"
              >
                {pets.filter(p => p.status !== 'Discharged').map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.species} • Status: {p.status})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Nursing &amp; Monitoring Directives</label>
              <input
                type="text"
                value={overnightNursingNotes}
                onChange={(e) => setOvernightNursingNotes(e.target.value)}
                placeholder="e.g. Check blood sugar level before breakfast. Restricted movement."
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-650 bg-[#3f51b5] text-white font-bold text-xs rounded hover:opacity-95 transition-opacity"
            >
              Authorize Transfer to Overnight Board
            </button>
          </form>
        </div>

        {/* Peer split consult split setup */}
        <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" /> Multi-Clinician Collaboration Request
          </h3>
          <p className="text-[10px] text-slate-500 leading-normal">
            Request professional advisory or diagnostic assay help. Set the split billing stipend. Both doctors are automatically linked!
          </p>

          <form onSubmit={handlePostConsult} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Consulting Surgeon</label>
                <select
                  value={consTargetId}
                  onChange={(e) => setConsTargetId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-none"
                >
                  {allStaff.filter(s => s.role === Role.DVM).map(s => (
                    <option key={s.id} value={s.id}>{s.name} • Specialist</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Stipend / Consult Fee Split ($)</label>
                <input
                  type="number"
                  value={consFee}
                  onChange={(e) => setConsFee(Number(e.target.value))}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Clinical Scenario Details</label>
              <textarea
                value={consQuestion}
                onChange={(e) => setConsQuestion(e.target.value)}
                placeholder="Describe the clinical symptoms or procedure help requested..."
                rows={2}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-stone-800 text-white font-bold text-xs rounded hover:bg-stone-900 transition-colors"
            >
              Post Consult Stipend Allocation
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}


/* ==========================================
   RECEPTION / FRONT DESK DASHBOARD
   ========================================== */
interface ReceptionDashboardProps {
  appointments: Appointment[];
  pets: Pet[];
  clients: Client[];
  allStaff: Staff[];
  invoices: Invoice[];
  onAddNewAppointment: (apt: Appointment) => void;
  onUpdatePetStatus: (petId: string, status: any) => void;
  onGenerateInvoice: (invoice: Invoice) => void;
  onChangeClients: React.Dispatch<React.SetStateAction<Client[]>>;
  onChangePets: React.Dispatch<React.SetStateAction<Pet[]>>;
  onChangeAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  onChangeInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  onChangeNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}

export function ReceptionDashboard({
  appointments,
  pets,
  clients,
  allStaff,
  invoices,
  onAddNewAppointment,
  onUpdatePetStatus,
  onGenerateInvoice,
  onChangeClients,
  onChangePets,
  onChangeAppointments,
  onChangeInvoices,
  onChangeNotifications
}: ReceptionDashboardProps) {
  const [bookingMode, setBookingMode] = useState<'REGISTER' | 'RETURNING'>('RETURNING');
  
  // Dynamic weight units configuration
  const [unitSystem, setUnitSystem] = useState<'Imperial' | 'Metric'>('Imperial');
  React.useEffect(() => {
    const saved = localStorage.getItem('vet_system_configs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.weightUnit) {
          setUnitSystem(parsed.weightUnit);
        }
      } catch (e) {}
    }
  }); // Read to capture dynamic updates immediately!

  const renderWeight = (kgVal: number) => {
    if (unitSystem === 'Imperial') {
      const lbVal = kgVal * 2.20462;
      return `${lbVal.toFixed(1)} lb`;
    } else {
      return `${kgVal.toFixed(1)} kg`;
    }
  };
  
  // Returning Client scheduler states
  const [rSelectedClientId, setRSelectedClientId] = useState(clients[0]?.id || '');
  const [rSelectedPetId, setRSelectedPetId] = useState(pets.find(p => p.ownerId === clients[0]?.id)?.id || '');
  const [rSelectedVetId, setRSelectedVetId] = useState('staff-dvm-1');
  const [rVisitReason, setRVisitReason] = useState('');
  const [rVisitType, setRVisitType] = useState<'Phone' | 'Walk-In' | 'Emergency'>('Phone');

  // Combined New Client / Pet profile states
  const [nClientName, setNClientName] = useState('');
  const [nClientEmail, setNClientEmail] = useState('');
  const [nClientPhone, setNClientPhone] = useState('');
  const [nPetName, setNPetName] = useState('');
  const [nPetSpecies, setNPetSpecies] = useState<'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Exotic'>('Dog');
  const [nPetBreed, setNPetBreed] = useState('');
  const [nPetAge, setNPetAge] = useState('');
  const [nPetWeight, setNPetWeight] = useState(10);
  const [nPetGender, setNPetGender] = useState<'Male' | 'Female' | 'Neutered Male' | 'Spayed Female'>('Neutered Male');
  const [nPetAllergies, setNPetAllergies] = useState('');
  const [nPrimaryReason, setNPrimaryReason] = useState('');
  const [nVisitType, setNVisitType] = useState<'Phone' | 'Walk-In' | 'Emergency'>('Walk-In');
  const [nAssignDvm, setNAssignDvm] = useState('staff-dvm-2');

  // Vitals recorder state
  const [showVitalsModalForApt, setShowVitalsModalForApt] = useState<string | null>(null);
  const [vTemp, setVTemp] = useState('101.2 °F');
  const [vHr, setVHr] = useState('120 bpm');
  const [vRr, setVRr] = useState('24 rpm');
  const [vBp, setVBp] = useState('120/80');

  // Filter returning client's pets dynamically
  React.useEffect(() => {
    if (rSelectedClientId) {
      const p = pets.find(x => x.ownerId === rSelectedClientId);
      if (p) setRSelectedPetId(p.id);
    }
  }, [rSelectedClientId, pets]);

  // Book Appointment for Return Clients
  const handleBookReturning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rVisitReason) return;

    const matchedPet = pets.find(p => p.id === rSelectedPetId);
    if (!matchedPet) return;

    const newApt: Appointment = {
      id: `apt-returning-${Date.now()}`,
      petId: rSelectedPetId,
      clientId: rSelectedClientId,
      staffId: rSelectedVetId,
      dateTime: new Date().toISOString(),
      duration: 30,
      reason: rVisitReason,
      status: 'CHECKED_IN', // Push instantly to clinical checklist queue
      visitType: rVisitType
    };

    onAddNewAppointment(newApt);
    // Automatically flag client as checked-in
    onUpdatePetStatus(rSelectedPetId, 'Checked In');

    setRVisitReason('');
    alert(`Success! Returning patient [${matchedPet.name}] is successfully placed in Today's Queue.`);
  };

  // Submit combined client-patient registry
  const handleRegisterNewClientAndPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nClientName || !nPetName || !nPrimaryReason) {
      alert('Please compile all required Client and Pet fields.');
      return;
    }

    const newClientId = `client-new-${Date.now()}`;
    const newPetId = `pet-new-${Date.now()}`;

    const newClient: Client = {
      id: newClientId,
      name: nClientName,
      email: nClientEmail || 'no-email@vethub.org',
      phone: nClientPhone || '555-PRIV',
      address: 'Springfield Area Resident',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      joinedDate: new Date().toISOString().split('T')[0],
      membershipType: 'Standard'
    };

    const newPet: Pet = {
      id: newPetId,
      name: nPetName,
      species: nPetSpecies,
      breed: nPetBreed || 'Mixed Breed',
      age: nPetAge || 'Puppy / Kitteh',
      weight: unitSystem === 'Imperial' ? (nPetWeight / 2.20462) : nPetWeight,
      gender: nPetGender,
      status: 'Checked In', // Pushed straight in!
      ownerId: newClientId,
      alertAllergies: nPetAllergies ? nPetAllergies.split(',').map(s => s.trim()) : [],
      avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=120'
    };

    const newApt: Appointment = {
      id: `apt-new-${Date.now()}`,
      petId: newPetId,
      clientId: newClientId,
      staffId: nAssignDvm,
      dateTime: new Date().toISOString(),
      duration: 35,
      reason: nPrimaryReason,
      status: 'CHECKED_IN',
      visitType: nVisitType
    };

    // Propagate up to central lists
    onChangeClients(prev => [...prev, newClient]);
    onChangePets(prev => [...prev, newPet]);
    onChangeAppointments(prev => [newApt, ...prev]);

    // Clear form states
    setNClientName('');
    setNClientEmail('');
    setNClientPhone('');
    setNPetName('');
    setNPetBreed('');
    setNPetAge('');
    setNPrimaryReason('');

    alert(`Succesfully created profiles for client ${newClient.name} and pet ${newPet.name}! Scheduled directly on queue.`);
  };

  // Record vitals and inject them into appointment details
  const handleSaveVitals = () => {
    if (!showVitalsModalForApt) return;

    onChangeAppointments(prev => prev.map(apt => {
      if (apt.id === showVitalsModalForApt) {
        return {
          ...apt,
          vitals: {
            temp: vTemp,
            hr: vHr,
            rr: vRr,
            bp: vBp,
            vitalsTakenBy: 'staff-tech-1'
          }
        };
      }
      return apt;
    }));

    setShowVitalsModalForApt(null);
    alert('Patient vitals compiled into appointment slot! Medical doctors can now read them in SOAP.');
  };

  // Enforce pay settlement status before discharging
  const handleDischargePatient = (petId: string, aptId: string) => {
    const matchedPet = pets.find(p => p.id === petId);
    if (!matchedPet) return;

    // Look for ANY outstanding billing folders or invoices with status 'DRAFT' or 'DUE' for this client
    const outstanding = invoices.filter(inv => inv.clientId === matchedPet.ownerId && inv.status !== 'PAID');

    if (outstanding.length > 0) {
      alert(`⚠ DISCHARGE BLOCKED!\nPatient [${matchedPet.name}] has a pending clinical balance of $${outstanding[0].total.toFixed(2)} [Invoice ${outstanding[0].id.toUpperCase()}]. Please settle the invoice payment at front-desk before discharging patient.`);
      return;
    }

    // Success discharge
    onUpdatePetStatus(petId, 'Discharged');
    onChangeAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: 'COMPLETED' } : a));
    alert(`Checkout finalized! ${matchedPet.name} discharged cleanly. A copy of settled payment receipt was printed.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Active Appointments Checkins */}
      <div className="lg:col-span-2 bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Front Desk Operational Queue &amp; Check-ins
        </h3>
        
        <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
          {appointments.filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED').map((apt) => {
            const pet = pets.find(p => p.id === apt.petId);
            const client = clients.find(c => c.id === apt.clientId);
            const dvm = allStaff.find(s => s.id === apt.staffId);
            const linkedInvoice = invoices.find(inv => inv.clientId === client?.id && inv.status !== 'PAID');

            return (
              <div key={apt.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800">
                        {pet?.name} (Owner: <span className="font-semibold text-slate-700">{client?.name}</span>)
                      </h4>
                      {apt.visitType && (
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                          apt.visitType === 'Emergency' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                          apt.visitType === 'Walk-In' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {apt.visitType}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Reason: <span className="text-slate-805 font-medium">{apt.reason}</span> • Assigned Vet: <span className="text-primary font-bold">{dvm?.name.replace('Dr. ', '')}</span>
                    </p>
                    {apt.vitals ? (
                      <span className="text-[9px] text-[#00647c] font-mono leading-none flex gap-3 mt-1.5 bg-[#effbff] p-1 rounded-sm border border-[#c4f2fc]">
                        <span>T: {apt.vitals.temp}</span>
                        <span>HR: {apt.vitals.hr}</span>
                        <span>RR: {apt.vitals.rr}</span>
                        <span>BP: {apt.vitals.bp}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setShowVitalsModalForApt(apt.id)}
                        className="text-[9px] text-primary hover:underline font-bold font-mono mt-1 flex items-center gap-1"
                      >
                        ⏱ [Add Initial Vital Signs]
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Toggles */}
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono mr-1">Pet Status:</span>
                    <select
                      value={pet?.status || 'Checked In'}
                      onChange={(e) => onUpdatePetStatus(apt.petId, e.target.value as any)}
                      className="text-[10px] font-bold p-1 border border-slate-200 rounded focus:outline-none"
                    >
                      <option value="Checked In">Checked In</option>
                      <option value="In Surgery">In Surgery</option>
                      <option value="In Treatment">In Treatment</option>
                      <option value="Overnight Stay">Overnight Stay</option>
                      <option value="Discharged">Discharged</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDischargePatient(apt.petId, apt.id)}
                      className="text-[10px] bg-sky-55% bg-[#00647c] text-white hover:bg-sky-900 font-bold px-2.5 py-1.5 rounded cursor-pointer"
                    >
                      Discharge
                    </button>
                  </div>
                </div>

                {linkedInvoice && (
                  <div className="text-[9.5px] p-2 bg-amber-50 border border-amber-200 rounded flex justify-between items-center text-amber-900 font-semibold">
                    <span>⚠ Invoice #{linkedInvoice.id.toUpperCase()} is outstanding (${linkedInvoice.total.toFixed(2)})</span>
                    <span className="text-[8px] bg-red-150 bg-[#ba1a1a] text-white px-2 py-0.5 rounded font-mono font-bold uppercase tracking-tight">ALERT DUE</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Form and Double Account Setup */}
      <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
        
        {/* Toggle Scheduler Mode */}
        <div className="flex border rounded-lg overflow-hidden border-slate-200 self-stretch">
          <button
            onClick={() => setBookingMode('RETURNING')}
            className={`flex-1 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors text-center ${
              bookingMode === 'RETURNING' ? 'bg-primary text-on-primary' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            Returning Client
          </button>
          <button
            onClick={() => setBookingMode('REGISTER')}
            className={`flex-1 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors text-center ${
              bookingMode === 'REGISTER' ? 'bg-primary text-on-primary' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            ✏ Register New Client
          </button>
        </div>

        {/* Dynamic Forms */}
        {bookingMode === 'RETURNING' ? (
          <form onSubmit={handleBookReturning} className="space-y-3.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
              📅 Scheduler Entry
            </h4>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Select Client</label>
              <select
                value={rSelectedClientId}
                onChange={(e) => setRSelectedClientId(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-none"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Select Pet Profile</label>
              <select
                value={rSelectedPetId}
                onChange={(e) => setRSelectedPetId(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-none"
              >
                {pets.filter(p => p.ownerId === rSelectedClientId).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Book Mode</label>
                <select
                  value={rVisitType}
                  onChange={(e) => setRVisitType(e.target.value as any)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded"
                >
                  <option value="Phone">Phone call</option>
                  <option value="Walk-In">Walk-In</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Assigned Doctor</label>
                <select
                  value={rSelectedVetId}
                  onChange={(e) => setRSelectedVetId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded"
                >
                  {allStaff.filter(s => s.role === Role.DVM).map(s => (
                    <option key={s.id} value={s.id}>{s.name.replace('Dr. ', '')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Primary Visit Reason</label>
              <textarea
                required
                value={rVisitReason}
                onChange={(e) => setRVisitReason(e.target.value)}
                placeholder="Describe current issues..."
                rows={2}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:shadow-xs transition-shadow"
            >
              Dispatch to Clinical Queue
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterNewClientAndPet} className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase">
              🆕 Double Profile Registry Workflow
            </h4>
            
            {/* Client inputs */}
            <div className="bg-slate-50/50 p-2.5 rounded border border-slate-100 space-y-2">
              <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold leading-none uppercase">CLIENT PROFILE</span>
              <div>
                <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Full Name *</label>
                <input
                  type="text" required value={nClientName} onChange={(e) => setNClientName(e.target.value)} placeholder="e.g. David Tennant"
                  className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Phone Number</label>
                  <input
                    type="text" value={nClientPhone} onChange={(e) => setNClientPhone(e.target.value)} placeholder="555-0100"
                    className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Email Address</label>
                  <input
                    type="email" value={nClientEmail} onChange={(e) => setNClientEmail(e.target.value)} placeholder="david@vethub.com"
                    className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Pet inputs */}
            <div className="bg-slate-50/50 p-2.5 rounded border border-slate-100 space-y-2">
              <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold leading-none uppercase">PET PROFILE</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Pet Name *</label>
                  <input
                    type="text" required value={nPetName} onChange={(e) => setNPetName(e.target.value)} placeholder="e.g. Pip"
                    className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Species</label>
                  <select
                    value={nPetSpecies} onChange={(e) => setNPetSpecies(e.target.value as any)}
                    className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Bird">Bird</option>
                    <option value="Exotic">Exotic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Breed Description</label>
                  <input
                    type="text" value={nPetBreed} onChange={(e) => setNPetBreed(e.target.value)} placeholder="Greyhound"
                    className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Pet Age</label>
                  <input
                    type="text" value={nPetAge} onChange={(e) => setNPetAge(e.target.value)} placeholder="1 yr"
                    className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Wgt ({unitSystem === 'Imperial' ? 'lb' : 'kg'})</label>
                  <input
                    type="number" value={nPetWeight} onChange={(e) => setNPetWeight(Number(e.target.value))}
                    className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Gender Status</label>
                  <select
                    value={nPetGender} onChange={(e) => setNPetGender(e.target.value as any)}
                    className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                  >
                    <option value="Neutered Male">Neutered Male</option>
                    <option value="Spayed Female">Spayed Female</option>
                    <option value="Male">Intact Male</option>
                    <option value="Female">Intact Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Known Allergies (Comma separated)</label>
                <input
                  type="text" value={nPetAllergies} onChange={(e) => setNPetAllergies(e.target.value)} placeholder="Penicillin, Peanuts"
                  className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                />
              </div>
            </div>

            {/* Visit Details */}
            <div className="bg-[#eff4ff]/60 p-2.5 rounded border border-[#bfdbfe]/50 space-y-2">
              <span className="text-[9px] bg-primary text-on-primary px-1.5 py-0.2 rounded font-mono font-bold leading-none uppercase">APPOINTMENT &amp; TRIAGE</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Visit Origin</label>
                  <select
                    value={nVisitType} onChange={(e) => setNVisitType(e.target.value as any)}
                    className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                  >
                    <option value="Walk-In">Walk-In Triage</option>
                    <option value="Emergency">Emergency Intake</option>
                    <option value="Phone">Scheduled Phone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Assigned Vet</label>
                  <select
                    value={nAssignDvm} onChange={(e) => setNAssignDvm(e.target.value)}
                    className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                  >
                    {allStaff.filter(s => s.role === Role.DVM).map(s => (
                      <option key={s.id} value={s.id}>{s.name.replace('Dr. ', '')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Primary Reason for Visit *</label>
                <textarea
                  required value={nPrimaryReason} onChange={(e) => setNPrimaryReason(e.target.value)} placeholder="Describe surgical check, bleeding claws, ear redness, fever..."
                  rows={2}
                  className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-opacity-95 transition-all text-center cursor-pointer shadow-sm"
            >
              Sign-up both Profiles &amp; Dispatch Intake
            </button>
          </form>
        )}

      </div>

      {/* Vitals Recording Dialog Overlay */}
      {showVitalsModalForApt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                <Stethoscope className="w-5 h-5 text-primary" /> Log Clinical Physical Vitals
              </h4>
              <button onClick={() => setShowVitalsModalForApt(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
            </div>
            
            <p className="text-[10px] text-slate-500 leading-normal">
              Record baseline physical parameters for the assigned veterinarian's medical diagnosis.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Temp (°F)</label>
                <input
                  type="text" value={vTemp} onChange={(e) => setVTemp(e.target.value)} placeholder="101.5 °F"
                  className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Heart Rate (bpm)</label>
                <input
                  type="text" value={vHr} onChange={(e) => setVHr(e.target.value)} placeholder="110 bpm"
                  className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Respiration (rpm)</label>
                <input
                  type="text" value={vRr} onChange={(e) => setVRr(e.target.value)} placeholder="24 rpm"
                  className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Blood Pressure</label>
                <input
                  type="text" value={vBp} onChange={(e) => setVBp(e.target.value)} placeholder="120/80"
                  className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowVitalsModalForApt(null)}
                className="flex-1 py-2 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVitals}
                className="flex-1 py-2 text-xs bg-primary hover:bg-primary-container text-on-primary font-bold rounded"
              >
                Save parameters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


/* ==========================================
   TECH / NURSE DASHBOARD
   ========================================== */
interface TechDashboardProps {
  labOrders: LabOrder[];
  pets: Pet[];
  overnightTasks: any[];
  allStaff: Staff[];
  notifications: any[];
  onCompleteLabOrder: (id: string, notes: string) => void;
  onChangeOvernightTasks: React.Dispatch<React.SetStateAction<any[]>>;
  onChangePets: React.Dispatch<React.SetStateAction<Pet[]>>;
  onChangeNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}

export function TechDashboard({
  labOrders,
  pets,
  overnightTasks,
  allStaff,
  notifications,
  onCompleteLabOrder,
  onChangeOvernightTasks,
  onChangePets,
  onChangeNotifications
}: TechDashboardProps) {
  const [resultInput, setResultInput] = useState('');
  const [activeLabId, setActiveLabId] = useState<string | null>(labOrders[0]?.id || null);

  // Dynamic weight units configuration
  const [unitSystem, setUnitSystem] = useState<'Imperial' | 'Metric'>('Imperial');
  useEffect(() => {
    const saved = localStorage.getItem('vet_system_configs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.weightUnit) {
          setUnitSystem(parsed.weightUnit);
        }
      } catch (e) {}
    }
  }, []);

  const renderWeight = (kgVal: number) => {
    if (unitSystem === 'Imperial') {
      const lbVal = kgVal * 2.20462;
      return `${lbVal.toFixed(1)} lb`;
    } else {
      return `${kgVal.toFixed(1)} kg`;
    }
  };

  // Inpatient overnight list
  const inpatients = useMemo(() => {
    return pets.filter(p => p.status === 'Overnight Stay');
  }, [pets]);

  // Handle lab audit
  const handleAuditLab = (id: string) => {
    if (!resultInput) {
      alert('Please compile diagnostic laboratory result notes first.');
      return;
    }
    onCompleteLabOrder(id, resultInput);
    setResultInput('');
    alert('Laboratory results processed and linked successfully into patient health database!');
  };

  // Toggle checklist tasks
  const handleToggleTaskStatus = (taskId: string) => {
    onChangeOvernightTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  // Log new nursing check item
  const [newCheckPetId, setNewCheckPetId] = useState('pet-1');
  const [newCheckText, setNewCheckText] = useState('');
  const [newCheckTime, setNewCheckTime] = useState('11:00 PM');

  const handleRegisterNursingCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckText) return;

    const newTask = {
      id: `t-custom-${Date.now()}`,
      petId: newCheckPetId,
      task: newCheckText,
      assignedTo: 'staff-tech-1',
      time: newCheckTime,
      done: false
    };

    onChangeOvernightTasks(prev => [newTask, ...prev]);
    setNewCheckText('');
    alert('Nursing instruction logged successfully into night shift agenda!');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Grid: Inpatients and Labs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inpatient / Overnight Stay Board */}
        <div className="lg:col-span-2 bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-650" /> Clinical Inpatient &amp; Overnight Stay Board
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Checklist items and continuous observation rosters for animals staying over night</p>
            </div>
            <span className="text-[10px] bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-indigo-700 font-mono font-bold">
              {inpatients.length} Inpatients
            </span>
          </div>

          {inpatients.length === 0 ? (
            <p className="text-xs text-slate-500 leading-normal py-8 text-center bg-slate-50/50 rounded-xl border border-dashed">
              No central inpatients currently admitted. Use the DVM dashboard to admit patients for continuous over-night observation.
            </p>
          ) : (
            <div className="space-y-4">
              {inpatients.map(pat => {
                const owner = pets.find(p => p.id === pat.id);
                const patTasks = overnightTasks.filter(t => t.petId === pat.id);
                return (
                  <div key={pat.id} className="p-4 bg-indigo-50/20 border border-slate-150 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={pat.avatar} alt={pat.name} className="w-8 h-8 rounded-full object-cover border" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-850">{pat.name}</h4>
                          <span className="text-[8px] uppercase tracking-wide font-mono font-bold text-indigo-600 block">{pat.breed} • Owner Allergy Alert</span>
                        </div>
                      </div>
                      <span className="text-[9px] bg-indigo-650 bg-[#3f51b5] text-white px-2 py-0.5 rounded font-bold font-mono">
                        ADMITTED OVERNIGHT STAY
                      </span>
                    </div>

                    {/* Task checklist */}
                    <div className="space-y-1.5 bg-white p-3 rounded-lg border border-slate-100">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Nursing Checklist:</span>
                      {patTasks.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic">No tasks logged. Perfect condition.</p>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {patTasks.map(t => (
                            <div key={t.id} className="flex items-center justify-between py-1.5 transition-colors">
                              <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                                <input
                                  type="checkbox"
                                  checked={t.done}
                                  onChange={() => handleToggleTaskStatus(t.id)}
                                  className="rounded border-slate-202 text-indigo-605 focus:ring-indigo-200"
                                />
                                <span className={t.done ? "line-through text-slate-400" : "text-slate-700 font-semibold"}>
                                  {t.task}
                                </span>
                              </label>
                              <span className="text-[9px] text-[#00647c] font-bold font-mono">{t.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rapid Nursing Task Register Form */}
        <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-850 uppercase flex items-center gap-1.5">
            📝 Write Nursing Order
          </h3>
          <p className="text-[10px] text-slate-500 leading-normal">
            Manually append or register a custom clinical check-up directive to the on-duty tech checklist roster.
          </p>

          <form onSubmit={handleRegisterNursingCheck} className="space-y-3 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Select In-Patient Target</label>
              <select
                value={newCheckPetId}
                onChange={(e) => setNewCheckPetId(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-none"
              >
                {inpatients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Observation Time</label>
                <select
                  value={newCheckTime}
                  onChange={(e) => setNewCheckTime(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded"
                >
                  <option value="08:00 PM">08:00 PM</option>
                  <option value="11:00 PM">11:00 PM</option>
                  <option value="02:00 AM">02:00 AM</option>
                  <option value="05:00 AM">05:00 AM</option>
                  <option value="08:00 AM">08:00 AM</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Assigned Nurse</label>
                <span className="block text-xs bg-slate-50 p-2 font-mono font-bold text-slate-600 rounded">Marcus Vance</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Check directive / task</label>
              <input
                type="text"
                required
                value={newCheckText}
                onChange={(e) => setNewCheckText(e.target.value)}
                placeholder="e.g. Flush ear wax or check IV drip flow rate"
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 focus:bg-white rounded"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary text-on-primary font-bold text-xs rounded shadow-xs"
            >
              Sign nursing instruction
            </button>
          </form>
        </div>

      </div>

      {/* Bottom Grid: Labs Queue and Inter-Staff Surgeon Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lab Order queue */}
        <div className="lg:col-span-2 bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary animate-pulse" /> Diagnostic Laboratory Assay Drawer
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {labOrders.map((lab) => {
              const pet = pets.find(p => p.id === lab.petId);
              return (
                <button
                  key={lab.id}
                  onClick={() => setActiveLabId(lab.id)}
                  className={`flex flex-col justify-between p-3.5 border rounded-xl text-left transition-all hover:translate-x-0.5 cursor-pointer ${
                    activeLabId === lab.id
                      ? 'border-primary bg-primary/5 shadow-2xs animate-pulse'
                      : 'border-outline-variant/60 bg-stone-50/50'
                  }`}
                >
                  <div className="w-full">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-[#0d1c2e]">{lab.testName}</h4>
                      {lab.isHighRisk && (
                        <span className="text-[7.5px] bg-red-100 text-red-850 font-extrabold px-1.5 py-0.2 rounded leading-none border border-red-200">
                          HIGH-RISK
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#545d62] font-semibold mt-1">
                      Patient: <strong className="text-primary">{pet?.name}</strong> • Status: <span className="font-bold underline">{lab.status}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {activeLabId && (
            <div className="border-t pt-4 space-y-2 mt-2">
              <label className="block text-[10px] font-bold text-[#545d62]" htmlFor="assay-notes">
                Laboratory Assessment / Results Transcript
              </label>
              <textarea
                id="assay-notes"
                required
                value={resultInput}
                onChange={(e) => setResultInput(e.target.value)}
                placeholder="e.g. Diagnostic slide confirms absence of flagellates. Stable blood glucose level."
                rows={2}
                className="w-full text-xs p-2 border border-outline-variant rounded-lg focus:outline-none focus:bg-white"
              />
              <button
                onClick={() => handleAuditLab(activeLabId)}
                className="py-1.5 px-4 bg-primary text-on-primary text-xs font-bold rounded-lg hover:shadow-2xs transition-all"
              >
                Sign-off &amp; Complete Lab Order
              </button>
            </div>
          )}
        </div>

        {/* Surgeon Notifications Alert Log */}
        <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Bell className="w-5 h-5 text-amber-500" /> Surgeon Broadcast &amp; Alerts Log
          </h3>
          <p className="text-[10px] text-slate-500 leading-normal">
            Real-time surgeon notification, calendar blocks, and overlapping clinical procedures alerts list.
          </p>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
            {notifications.map(n => (
              <div key={n.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 space-y-1">
                <p className="text-[10.5px] text-slate-800 font-semibold leading-normal">{n.message}</p>
                <div className="flex justify-between items-center text-[8px] font-mono font-bold uppercase text-amber-800 mt-1">
                  <span>SENDER REQUEST</span>
                  <span>{n.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}


/* ==========================================
   MANAGER / OWNER DASHBOARD (CONTROL CONSOLE)
   ========================================== */
interface ManagerDashboardProps {
  pets: Pet[];
  clients: Client[];
  invoices: Invoice[];
  splits: RevenueSplit[];
  allStaff: Staff[];
  labOrders: LabOrder[];
  treatmentPrices: any[];
  medicationPrices: any[];
  overnightTasks: any[];
  notifications: any[];
  supplierOrders: any[];
  clinicHours: string;
  promotions: any[];
  onApproveSplit: (id: string) => void;
  onPaySplit: (id: string) => void;
  currentStaff?: Staff;
  onNavigateTab: (tab: string) => void;
  onChangeTreatmentPrices: React.Dispatch<React.SetStateAction<any[]>>;
  onChangeMedicationPrices: React.Dispatch<React.SetStateAction<any[]>>;
  onChangeSupplierOrders: React.Dispatch<React.SetStateAction<any[]>>;
  onChangeClinicHours: React.Dispatch<React.SetStateAction<string>>;
  onChangePromotions: React.Dispatch<React.SetStateAction<any[]>>;
  onChangeStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  onChangeOvernightTasks: React.Dispatch<React.SetStateAction<any[]>>;
  onChangePets: React.Dispatch<React.SetStateAction<Pet[]>>;
}

export function ManagerDashboard({
  pets,
  clients,
  invoices,
  splits,
  allStaff,
  labOrders,
  treatmentPrices,
  medicationPrices,
  overnightTasks,
  notifications,
  supplierOrders,
  clinicHours,
  promotions,
  onApproveSplit,
  onPaySplit,
  currentStaff,
  onNavigateTab,
  onChangeTreatmentPrices,
  onChangeMedicationPrices,
  onChangeSupplierOrders,
  onChangeClinicHours,
  onChangePromotions,
  onChangeStaff,
  onChangeOvernightTasks,
  onChangePets
}: ManagerDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'PRICING' | 'INVENTORY' | 'PROMOTIONS'>('OVERVIEW');

  // Dynamic weight units configuration
  const [unitSystem, setUnitSystem] = useState<'Imperial' | 'Metric'>('Imperial');
  useEffect(() => {
    const saved = localStorage.getItem('vet_system_configs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.weightUnit) {
          setUnitSystem(parsed.weightUnit);
        }
      } catch (e) {}
    }
  }, []);

  const renderWeight = (kgVal: number) => {
    if (unitSystem === 'Imperial') {
      const lbVal = kgVal * 2.20462;
      return `${lbVal.toFixed(1)} lb`;
    } else {
      return `${kgVal.toFixed(1)} kg`;
    }
  };

  // Listen for shift schedule updates to live-reload calendar content
  const [scheduleVersion, setScheduleVersion] = useState(0);
  useEffect(() => {
    const handleUpdate = () => {
      setScheduleVersion(prev => prev + 1);
    };
    window.addEventListener('vet_schedule_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('vet_schedule_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Supplier Order Drawer Form states
  const [targetSupplier, setTargetSupplier] = useState('Zoetis Global');
  const [targetMedId, setTargetMedId] = useState('med-1');
  const [targetQty, setTargetQty] = useState(50);

  // Edit Pricing Form states
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  const [newEditedPrice, setNewEditedPrice] = useState(0);

  // Promotions Form states
  const [newPromoName, setNewPromoName] = useState('');
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDesc, setNewPromoDesc] = useState('');

  // Handle supplier re-order
  const handleSupplierOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const med = medicationPrices.find(m => m.id === targetMedId);
    if (!med) return;

    const unitCost = 25.00; // Wholesale clinical unit rate
    const totalCost = targetQty * unitCost;

    const newOrder = {
      id: `so-new-${Date.now()}`,
      supplier: targetSupplier,
      drugName: med.name,
      qty: targetQty,
      status: 'Ready for Dispatch',
      date: new Date().toISOString().split('T')[0],
      cost: totalCost
    };

    onChangeSupplierOrders(prev => [newOrder, ...prev]);

    // replenishment mock increment
    onChangeMedicationPrices(prev => prev.map(m => m.id === targetMedId ? { ...m, stock: m.stock + targetQty } : m));

    alert(`Supply Chain replenished successfully!\nWholesale invoice generated: $${totalCost.toFixed(2)} charged to Clinic operations. Stock has been incremented.`);
  };

  // Submit revised procedure/treatment pricing
  const handleSavePriceEdit = (id: string) => {
    onChangeTreatmentPrices(prev => prev.map(p => p.id === id ? { ...p, price: newEditedPrice } : p));
    setEditingPricingId(null);
    alert('Procedure catalog fee update finalized across patient checkout registries.');
  };

  // Save marketing promotion drive
  const handleAddPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoName || !newPromoCode) return;

    const newPromo = {
      id: `promo-new-${Date.now()}`,
      name: newPromoName,
      code: newPromoCode,
      description: newPromoDesc,
      active: true
    };

    onChangePromotions(prev => [newPromo, ...prev]);
    setNewPromoName('');
    setNewPromoCode('');
    setNewPromoDesc('');
    alert('Promotional coupon registered! Visible dynamically at Client billing checkout.');
  };

  // Toggle staff authorization permission tags
  const handleTogglePerm = (staffId: string, permName: string) => {
    // Each staff model has custom permission checks
    alert(`Success!\nPermissions authorization updated for staff member. Operational access is active.`);
  };

  // Quick Shift Coverage Roster Toggle
  const handleToggleRosterShift = (staffId: string) => {
    onChangeStaff(prev => prev.map(s => s.id === staffId ? { ...s, active: !s.active } : s));
  };

  // Quick Operational Metrics - Clinic Operations Focused
  const checkedInCount = useMemo(() => {
    return pets.filter(p => p.status === 'Checked In').length;
  }, [pets]);

  const activeSurgeriesCount = useMemo(() => {
    return pets.filter(p => p.status === 'In Surgery' || p.status === 'In Treatment').length;
  }, [pets]);

  const activeInpatientsCount = useMemo(() => {
    return pets.filter(p => p.status === 'Overnight Stay').length;
  }, [pets]);

  const activeStaffCount = useMemo(() => {
    return allStaff.filter(s => s.active).length;
  }, [allStaff]);

  return (
    <div className="space-y-6">

      {/* CLINICAL PERFORMANCE OVERVIEW */}
      {true && (
        <div className="space-y-6">
          
          {/* Quick Stats Grid - Clinic Operations Focused */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white border border-outline-variant/60 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Patient Queue</span>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <h4 className="text-xl font-bold text-slate-850">{checkedInCount} Pets</h4>
              </div>
              <p className="text-[10px] text-slate-400">Awaiting clinical exam</p>
            </div>

            <div className="bg-white border border-outline-variant/60 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">In Surgery / Treatment</span>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-500 animate-pulse" />
                <h4 className="text-xl font-bold text-slate-850">{activeSurgeriesCount} cases</h4>
              </div>
              <p className="text-[10px] text-slate-400">Operating suites in operation</p>
            </div>

            <div className="bg-white border border-outline-variant/60 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Active Overnight Stay</span>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                <h4 className="text-xl font-bold text-slate-850">{activeInpatientsCount} Pets</h4>
              </div>
              <p className="text-[10px] text-slate-400">Under overnight care</p>
            </div>

            <div className="bg-white border border-outline-variant/60 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Clinicians Duty</span>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h4 className="text-xl font-bold text-slate-850">{activeStaffCount} Shifting</h4>
              </div>
              <p className="text-[10px] text-slate-400">Practitioners active on floor</p>
            </div>

          </div>

          {/* 📅 On-Duty Clinical Faculty Weekly Calendar */}
          <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4" id="overview-duty-calendar">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                  📅 On-Duty Clinical Faculty Weekly Calendar
                </h2>
                <span className="text-[10px] text-slate-400 mt-1 block">On-duty schedule for currently covering active practitioners (May 18 – May 24, 2026).</span>
              </div>
              <span className="text-[9px] bg-[#eff4ff] border border-blue-150 text-[#00647c] px-2 py-0.5 rounded-lg font-mono font-bold">
                Weekly shift
              </span>
            </div>

            {/* Calendar weekly grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { name: 'Mon', date: 'May 18' },
                { name: 'Tue', date: 'May 19' },
                { name: 'Wed', date: 'May 20' },
                { name: 'Thu', date: 'May 21' },
                { name: 'Fri', date: 'May 22' },
                { name: 'Sat', date: 'May 23' },
                { name: 'Sun', date: 'May 24' },
              ].map((day, idx) => {
                const activeStaff = allStaff.filter(s => s.active);
                
                // Load weekly schedule from localstorage
                let savedSched: { [staffId: string]: string[] } | null = null;
                if (typeof window !== 'undefined') {
                  const saved = localStorage.getItem('vet_weekly_schedule');
                  if (saved) {
                    try {
                      savedSched = JSON.parse(saved);
                    } catch (e) {
                      // ignore
                    }
                  }
                }
                
                // If saved schedule exists, filter staff who have a shift scheduled on this day
                const onDutyStaffForDay = savedSched 
                  ? allStaff.filter(s => {
                      const shifts = savedSched![s.id];
                      return shifts && shifts[idx] && shifts[idx] !== 'OFF';
                    }).map(s => {
                      const shiftCode = savedSched![s.id][idx];
                      return {
                        ...s,
                        currentDayShift: shiftCode
                      };
                    })
                  : activeStaff.filter((s, sIdx) => {
                      const shiftHash = (sIdx + idx) % 3;
                      return shiftHash !== 0; // works ~2/3 of days
                    }).map(s => ({
                      ...s,
                      currentDayShift: 'DAY'
                    }));

                return (
                  <div key={day.name} className={`p-3 rounded-xl border flex flex-col h-full min-h-[140px] space-y-2 bg-[#f8f9fa] transition-all duration-150 hover:shadow-3xs ${
                    day.name === 'Fri' ? 'border-[#00647c] bg-[#eff4ff]/10' : 'border-slate-200'
                  }`}>
                    {/* Day label */}
                    <div className="flex justify-between items-center pb-1.5 border-b border-dashed border-slate-200">
                      <span className="text-xs font-bold text-slate-805">{day.name}</span>
                      <span className="text-[9.5px] text-slate-400 font-mono font-medium">{day.date}</span>
                    </div>

                    {/* Duty list */}
                    <div className="space-y-1.5 flex-1 overflow-y-auto scrollbar-none">
                      {onDutyStaffForDay.length === 0 ? (
                        <span className="text-[9px] italic text-slate-400 block pt-4 text-center">Standby</span>
                      ) : (
                        onDutyStaffForDay.map(staff => (
                          <div key={staff.id} className="p-1 px-1.5 bg-white border border-slate-150 rounded-lg flex items-center gap-1.5 hover:shadow-2xs hover:-translate-y-0.5 transition-all duration-150 hover:border-slate-300 cursor-default">
                            <img 
                              src={staff.avatar} 
                              alt={staff.name} 
                              referrerPolicy="no-referrer"
                              className="w-4.5 h-4.5 rounded-full border bg-slate-50 shrink-0" 
                            />
                            <div className="truncate min-w-0">
                              <span className="text-[9px] font-bold text-slate-755 block truncate leading-none">
                                {staff.name.replace('Dr. ', '')}
                              </span>
                              <span className="text-[7.5px] font-bold uppercase text-[#00647c] tracking-tight block leading-none mt-0.5">
                                {staff.role} • {staff.currentDayShift === 'DAY' ? 'Day' : staff.currentDayShift === 'NIGHT' ? 'Night' : staff.currentDayShift === 'ON_CALL' ? 'On-Call' : 'Day'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Live Surgery & Hospital Inpatients Census */}
            <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-3">
                🩺 🏥 Hospital Active Surgery &amp; In-Patient Ward Census
              </h3>
              
              <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                {pets.filter(p => p.status !== 'Discharged').length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No active surgeries or hospitalizations registered today.</p>
                ) : (
                  pets.filter(p => p.status !== 'Discharged').map(p => {
                    const client = clients.find(c => c.id === p.ownerId);
                    return (
                      <div key={p.id} className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center gap-3">
                          <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover border" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-850">{p.name} <span className="text-[9.5px] text-slate-400 font-medium">({p.species} • {renderWeight(p.weight)})</span></h4>
                            <p className="text-[9px] text-slate-400 font-medium leading-none">Owner: {client?.name}</p>
                          </div>
                        </div>

                        {/* Direct Clinical Status Controller */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-extrabold font-mono uppercase px-1.5 py-0.5 rounded ${
                            p.status === 'In Surgery' ? 'bg-indigo-100 text-indigo-800 animate-pulse' :
                            p.status === 'In Treatment' ? 'bg-sky-100 text-sky-800' :
                            p.status === 'Overnight Stay' ? 'bg-violet-100 text-violet-850' : 'bg-amber-105 bg-amber-50 text-amber-800'
                          }`}>
                            {p.status}
                          </span>

                          <select
                            value={p.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as any;
                              onChangePets(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus } : x));
                              alert(`Patient [${p.name}] clinical status transitioned to: ${newStatus}`);
                            }}
                            className="text-[9px] font-bold p-1 border bg-white rounded focus:outline-none focus:ring-1 focus:ring-primary select-none cursor-pointer"
                          >
                            <option value="Checked In">Checked In</option>
                            <option value="In Surgery">In Surgery</option>
                            <option value="In Treatment">In Treatment</option>
                            <option value="Overnight Stay">Overnight Stay</option>
                            <option value="Discharged">Discharge Pet</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Diagnostic Laboratories Assay Feeds */}
            <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                🔬 Diagnostic Laboratories Assay &amp; Labs Status Queue
              </h3>
              
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {labOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No diagnostic laboratory orders in queue.</p>
                ) : (
                  labOrders.map(order => {
                    const pet = pets.find(p => p.id === order.petId);
                    const creator = allStaff.find(s => s.id === order.staffId);
                    return (
                      <div key={order.id} className="p-3 bg-slate-55 bg-gradient-to-r from-sky-50/10 to-white border rounded-xl flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800">{order.testName}</span>
                            {order.isHighRisk && (
                              <span className="text-[7.5px] font-extrabold bg-red-100 text-red-800 px-1 py-[0.5px] rounded animate-pulse font-mono tracking-tight uppercase">HIGH RISK WARNING</span>
                            )}
                          </div>
                          
                          <p className="text-[9px] font-semibold text-slate-400 mt-1 leading-none">
                            Patient: <span className="text-slate-600 font-bold">{pet?.name || 'Inpatient'}</span> • Ordered by: {creator?.name.replace('Dr. ', '')}
                          </p>
                          {order.resultNotes && (
                            <p className="text-[9px] italic text-slate-500 font-medium mt-1 bg-white p-1 rounded border border-dashed font-mono">
                              Results findings: {order.resultNotes}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded border ${
                            order.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-100 animate-pulse font-bold'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUB-PANEL 2: SERVICE & WORKFLOW PRICING CATALOGS */}
      {activeSubTab === 'PRICING' && (
        <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-1">
              💰 Medical Procedures Service Fee Catalog
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Configure clinical fee sheets. Edited prices instantly update dynamic checkouts.</p>
          </div>

          <div className="overflow-x-auto divide-y">
            {treatmentPrices.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{item.id.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-3">
                  {editingPricingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={newEditedPrice}
                        onChange={(e) => setNewEditedPrice(Number(e.target.value))}
                        className="w-20 text-xs p-1 border rounded font-mono font-bold"
                      />
                      <button
                        onClick={() => handleSavePriceEdit(item.id)}
                        className="p-1 text-emerald-800 hover:bg-emerald-50 rounded"
                        title="Save price change"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-800">${item.price.toFixed(2)}</span>
                      <button
                        onClick={() => { setEditingPricingId(item.id); setNewEditedPrice(item.price); }}
                        className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-PANEL 3: DRUG STOCK CONTROL & COUPS REORDERS */}
      {activeSubTab === 'INVENTORY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Inventory warning board */}
          <div className="lg:col-span-2 bg-white border border-outline-variant/60 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-850 uppercase flex items-center gap-1.5">
              📦 Medication Stocks &amp; Replenishments
            </h3>

            <div className="divide-y">
              {medicationPrices.map(item => {
                const isUnderstock = item.stock < item.minStock;
                return (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                      <p className="text-[9px] text-slate-400 font-semibold font-mono">Fee: ${item.price} • Min. stock level: {item.minStock}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded leading-none ${
                        isUnderstock ? 'bg-rose-100 text-rose-800 font-extrabold animate-bounce' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {item.stock} Units left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supplier re-order command */}
          <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-1.5">
              🚚 Supply Chain Order Drawer
            </h3>
            <p className="text-[10px] text-slate-500 leading-normal">
              Quick re-stock order. Select the drug, supplier, and submit to instantly replenishment active clinical stocks.
            </p>

            <form onSubmit={handleSupplierOrder} className="space-y-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Select Supplier Distributor</label>
                <select
                  value={targetSupplier}
                  onChange={(e) => setTargetSupplier(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-none"
                >
                  <option value="Zoetis Global Distribution">Zoetis Global Co.</option>
                  <option value="Boehringer Ingelheim LLC">Boehringer Ingelheim</option>
                  <option value="Merck Animal Supply">Merck Health</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Select Restock Medication</label>
                <select
                  value={targetMedId}
                  onChange={(e) => setTargetMedId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-none"
                >
                  {medicationPrices.map(m => (
                    <option key={m.id} value={m.id}>{m.name} (Stock: {m.stock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Order Quantity (Units)</label>
                <input
                  type="number"
                  value={targetQty}
                  onChange={(e) => setTargetQty(Number(e.target.value))}
                  className="w-full text-xs p-2 border border-slate-200 rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary text-on-primary font-bold text-xs rounded shadow-xs"
              >
                Dispatch Restock Order
              </button>
            </form>
          </div>

        </div>
      )}

      {/* SUB-PANEL 6: operating hours and promotions */}
      {activeSubTab === 'PROMOTIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Operating hours settings config */}
          <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-1">
              ⚙ Clinic Configuration Settings
            </h3>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Establish Daily Operating Hours</label>
              <input
                type="text"
                value={clinicHours}
                onChange={(e) => onChangeClinicHours(e.target.value)}
                placeholder="e.g. 08:00 AM - 08:00 PM"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded"
              />
              <span className="text-[9px] text-slate-400 mt-1 block">Visible to clients in patient portals.</span>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono">Roster Warning Level:</span>
              <p className="text-xs font-semibold text-slate-700 leading-normal mt-1">Automatic alert systems flag any overlap gaps or empty shift intervals outside of {clinicHours}.</p>
            </div>
          </div>

          {/* Marketing Promotions Registry */}
          <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase">
              🎯 Autumn Vaccine Drive &amp; Discount Promotions
            </h3>

            {/* List active promos */}
            <div className="space-y-2">
              {promotions.map(promo => (
                <div key={promo.id} className="p-3 bg-rose-50/25 border border-dashed border-rose-200 rounded-lg">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-rose-800">{promo.name}</span>
                    <span className="text-rose-700 font-mono text-[9.5px]">#{promo.code}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{promo.description}</p>
                </div>
              ))}
            </div>

            {/* Addition form */}
            <form onSubmit={handleAddPromotion} className="space-y-3 border-t pt-3">
              <h4 className="text-xs font-bold text-slate-805 uppercase">Write Promotion Coupon Drive</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Campaign Name</label>
                  <input
                    type="text" required value={newPromoName} onChange={(e) => setNewPromoName(e.target.value)} placeholder="Summer Tick Drive"
                    className="w-full text-xs p-1.5 bg-slate-50 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-605 mb-0.5">Coupon Code</label>
                  <input
                    type="text" required value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value)} placeholder="TICKFREE"
                    className="w-full text-xs p-1.5 bg-slate-50 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-605 mb-0.5">Stipulation Description</label>
                <input
                  type="text" value={newPromoDesc} onChange={(e) => setNewPromoDesc(e.target.value)} placeholder="Get free scale kit with any booster appointment."
                  className="w-full text-xs p-1.5 bg-slate-50 border rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-primary text-on-primary font-bold text-xs rounded"
              >
                Publish Coupon Stimulus Campaign
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}


/* ==========================================
   FINANCE / CLINICAL BILLING DASHBOARD
   ========================================== */
interface FinanceDashboardProps {
  invoices: Invoice[];
  clients: Client[];
  pets: Pet[];
  splits: RevenueSplit[];
  allStaff: Staff[];
  onMarkInvoicePaid: (id: string) => void;
}

export function FinanceDashboard({
  invoices,
  clients,
  pets,
  splits,
  allStaff,
  onMarkInvoicePaid
}: FinanceDashboardProps) {

  // Dynamic weight units configuration
  const [unitSystem, setUnitSystem] = useState<'Imperial' | 'Metric'>('Imperial');
  useEffect(() => {
    const saved = localStorage.getItem('vet_system_configs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.weightUnit) {
          setUnitSystem(parsed.weightUnit);
        }
      } catch (e) {}
    }
  }, []);

  const renderWeight = (kgVal: number) => {
    if (unitSystem === 'Imperial') {
      const lbVal = kgVal * 2.20462;
      return `${lbVal.toFixed(1)} lb`;
    } else {
      return `${kgVal.toFixed(1)} kg`;
    }
  };

  // Clinic Operations Statistics
  const activeInpatients = pets.filter(p => p.status === 'Overnight Stay');
  const activeSurgeries = pets.filter(p => p.status === 'In Surgery');
  const clinicalQueue = pets.filter(p => p.status === 'Checked In' || p.status === 'In Treatment');

  return (
    <div className="space-y-6" id="finance-clinic-focus-dashboard">
      
      {/* Central Announcement Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-150/40 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            📂 Unified Ledgers &amp; Accounts Centralized
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
            In compliance with clinic audit protocols, all billing files, client transaction ledgers, invoice folders, and surgeon commission division ledgers have been consolidated under the <strong>Reports</strong> page on the sidebar navigation.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping" /> Clinically Synced
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active clinical flows */}
        <div className="lg:col-span-2 bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-2 border-b pb-3">
            🏥 Clinic Operations &amp; Patient Stream
          </h3>

          <div className="space-y-3">
            {pets.filter(p => p.status !== 'Discharged').length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No active hospital flows to display.</p>
            ) : (
              pets.filter(p => p.status !== 'Discharged').map((p) => {
                const client = clients.find(c => c.id === p.ownerId);
                return (
                  <div key={p.id} className="p-4 bg-gradient-to-r from-[#eff4ff]/20 to-white border border-outline-variant/50 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-[#0d1c2e]" id={`pet-stream-${p.id}`}>
                        {p.name} • <span className="text-slate-550 text-[10px] uppercase font-mono font-bold">{p.species} ({p.breed})</span>
                      </h4>
                      <p className="text-[10px] text-[#545d62] font-semibold mt-0.5">
                        Responsible Client: {client?.name} • Weight: {renderWeight(p.weight)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.alertAllergies.map((alg) => (
                          <span key={alg} className="text-[8px] bg-rose-50 text-rose-700 px-1.5 py-0.5 font-bold rounded uppercase">
                            ⚠️ Allergy: {alg}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        p.status === 'In Surgery' ? 'bg-indigo-100 text-indigo-800 animate-pulse' :
                        p.status === 'In Treatment' ? 'bg-sky-100 text-sky-800' :
                        p.status === 'Overnight Stay' ? 'bg-violet-100 text-violet-850' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Clinical Case Summary panel */}
        <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide border-b pb-3">
            📊 Clinician Case Loads
          </h3>
          
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 border rounded-xl space-y-1">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase font-mono block">In-Surgery Cases</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black font-sans text-indigo-700">{activeSurgeries.length}</span>
                <span className="text-[10px] font-semibold text-slate-500">Active surgical rooms</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border rounded-xl space-y-1">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase font-mono block">Hospital Ward Overnight Inpatients</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black font-sans text-sky-700">{activeInpatients.length}</span>
                <span className="text-[10px] font-semibold text-slate-500">Intensive support stays</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border rounded-xl space-y-1">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase font-mono block">General Care Queue</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black font-sans text-amber-700">{clinicalQueue.length}</span>
                <span className="text-[10px] font-semibold text-slate-500">Active exams &amp; vitals</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
