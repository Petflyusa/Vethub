/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Calendar, CreditCard, DollarSign, Users, ShieldAlert,
  ClipboardList, Stethoscope, AlertTriangle, CheckSquare, 
  Send, Layers, Activity, UserCheck, PlusSquare, FileCheck
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
  onOpenSoapNote: (aptId: string, petName: string) => void;
  onSendConsultation: (cons: Consultation) => void;
}

export function VetDashboard({
  appointments,
  pets,
  clients,
  allStaff,
  consultations,
  labOrders,
  onOpenSoapNote,
  onSendConsultation
}: VetDashboardProps) {
  const [consQuestion, setConsQuestion] = useState('');
  const [consTargetId, setConsTargetId] = useState('staff-dvm-2');
  const [consFee, setConsFee] = useState(50);

  // Filter appointments assigned to this Vet or overall active
  const activeApts = appointments.filter(a => ['CHECKED_IN', 'IN_PROGRESS'].includes(a.status));
  const otherApts = appointments.filter(a => !['CHECKED_IN', 'IN_PROGRESS'].includes(a.status));

  const handlePostConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consQuestion) return;

    const newCons: Consultation = {
      id: `cons-new-${Date.now()}`,
      medicalRecordId: 'mr-1', // Sandbox reference
      requesterDvmId: 'staff-dvm-1', // Alexander Smith
      targetDvmId: consTargetId,
      status: 'PENDING',
      question: consQuestion,
      notes: null,
      revenueAmount: Number(consFee) || 50,
      validUntil: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString() // 7 Days
    };

    onSendConsultation(newCons);
    setConsQuestion('');
    alert('Collaboration consultation requested! Target specialist will act on the request.');
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Grid: Active Queue */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Active patients checkout queue (2 columns) */}
        <div className="xl:col-span-2 bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" /> Today's Active Patient Session Queue
          </h3>
          
          {activeApts.length === 0 ? (
            <div className="p-6 bg-[#f8f9ff] text-center rounded-xl text-xs text-[#545d62]">
              No patients checked in at front desk. Inform reception or schedule a booster!
            </div>
          ) : (
            <div className="space-y-3">
              {activeApts.map((apt) => {
                const pet = pets.find(p => p.id === apt.petId);
                const client = clients.find(c => c.id === apt.clientId);
                return (
                  <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-outline-variant/60 rounded-xl bg-gradient-to-r from-emerald-50/10 to-[#f8f9ff] shadow-2xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={pet?.avatar}
                        alt={pet?.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-cover rounded-lg border border-outline-variant/40"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#0d1c2e]">{pet?.name}</h4>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full uppercase">
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#545d62] font-semibold mt-0.5">
                          Reason: <span className="text-primary font-bold">{apt.reason}</span>
                        </p>
                        <p className="text-[10px] text-[#6e797e] font-mono">
                          Owner: {client?.name} • Duration: {apt.duration} min
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenSoapNote(apt.id, pet?.name || 'Patient')}
                      className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container active:scale-95 transition-all text-center cursor-pointer shadow-sm shrink-0"
                    >
                      Write Clinical SOAP Notes
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rapid X-Ray interactive annotations box (1 column) */}
        <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-2">
            📸 X-Ray Radiopaque Annotation Panel
          </h3>
          <div className="relative group overflow-hidden rounded-lg border">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80"
              alt="Medical Dental Xray"
              className="w-full h-36 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
              <p className="text-[10px] text-white font-medium text-center">
                Molar Spur #4 alignment abnormality. Infiltration ruled out.
              </p>
            </div>
            <span className="absolute top-2 left-2 text-[8px] bg-red-600 text-white font-bold px-2 py-0.5 rounded uppercase">
              Bugs - English Lop
            </span>
          </div>
          <p className="text-[11px] text-[#545d62] leading-relaxed">
            Toggle annotations inside patient profiles under the <strong>Clients &amp; Pets</strong> directory.
          </p>
        </div>

      </div>

      {/* Primary Grid: Consultations & Labs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Collaborative Inner-Clinic Consultations */}
        <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Active Expert Consultations
          </h3>

          <div className="space-y-3">
            {consultations.map((c) => {
              const requester = allStaff.find(s => s.id === c.requesterDvmId);
              const target = allStaff.find(s => s.id === c.targetDvmId);
              return (
                <div key={c.id} className="p-3 bg-stone-50 border border-outline-variant/60 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${
                      c.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {c.status}
                    </span>
                    <span className="text-[9px] font-bold text-primary font-mono">${c.revenueAmount} consultation Fee</span>
                  </div>
                  <p className="text-xs text-[#0a1523] leading-relaxed italic">"{c.question}"</p>
                  
                  {c.notes ? (
                    <div className="p-2.5 bg-emerald-50/40 border border-emerald-200/50 rounded text-[11px] text-[#2c4e3f]">
                      <strong>Advice / Response:</strong> {c.notes}
                    </div>
                  ) : (
                    <div className="text-[10px] text-[#6e797e] font-semibold">
                      Waiting for specialist {target?.name}'s analysis.
                    </div>
                  )}

                  <p className="text-[9px] text-[#6e797e] font-mono pt-1 text-right">
                    From: {requester?.name.replace('Dr. ', '')} to {target?.name.replace('Dr. ', '')}
                  </p>
                </div>
              );
            })}
          </div>

          <form onSubmit={handlePostConsultation} className="border-t border-outline-variant/40 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-[#0d1c2e]">Ask a Specialist for Advice</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-[#545d62] mb-1">Target Specialist</label>
                <select
                  value={consTargetId}
                  onChange={(e) => setConsTargetId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-outline-variant rounded focus:outline-none"
                >
                  {allStaff.filter(s => s.role === Role.DVM && s.id !== 'staff-dvm-1').map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.specialty?.split('&')[0]})</option>
                  ))}
                  <option value="staff-owner-1">Dr. Henry Jekyll (Medical Director)</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-[#545d62] mb-1">Assigned Consultation Fee ($)</label>
                <input
                  type="number"
                  value={consFee}
                  onChange={(e) => setConsFee(Number(e.target.value))}
                  className="w-full text-xs p-2 bg-white border border-outline-variant rounded focus:outline-none"
                />
              </div>
            </div>
            <textarea
              required
              value={consQuestion}
              onChange={(e) => setConsQuestion(e.target.value)}
              placeholder="e.g. Requesting study of pulmonary margins. Is early metastasis present?"
              rows={2}
              className="w-full text-xs p-2.5 bg-[#f8f9ff] border border-outline-variant rounded-lg focus:bg-white focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="w-full py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container transition-all cursor-pointer shadow-xs"
            >
              Post Specialist Consultation Request
            </button>
          </form>
        </div>

        {/* Labs and Vitals overview panel */}
        <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <h1 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-2">
            🔬 Active Laboratory Orders
          </h1>
          <div className="space-y-3">
            {labOrders.map((lab) => {
              const pet = pets.find(p => p.id === lab.petId);
              return (
                <div key={lab.id} className="p-3 bg-gradient-to-r from-[#eff4ff]/30 to-white border border-outline-variant/40 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#0d1c2e]">{lab.testName}</h4>
                    <p className="text-[10px] text-[#545d62] font-semibold mt-0.5">
                      Patient: <strong className="text-primary">{pet?.name}</strong> • Date: {lab.date}
                    </p>
                    {lab.resultNotes && (
                      <p className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded mt-2 border border-emerald-100 font-mono">
                        Result: {lab.resultNotes}
                      </p>
                    )}
                  </div>
                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                    lab.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {lab.status}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* History queue */}
          <div className="border-t border-outline-variant/40 pt-4 space-y-2">
            <h4 className="text-xs font-bold text-[#0a1523]">Completed / Scheduled booster queue</h4>
            <div className="space-y-2">
              {otherApts.slice(0, 3).map((apt) => {
                const pet = pets.find(p => p.id === apt.petId);
                return (
                  <div key={apt.id} className="flex items-center justify-between text-xs py-1.5 border-b border-outline-variant/30 last:border-0 text-[#545d62]">
                    <span>{pet?.name} - {apt.reason}</span>
                    <span className="font-mono text-[10px] text-[#0d1c2e] font-bold">{apt.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}


/* ==========================================
   MANAGER / OWNER (ADMIN) DASHBOARD
   ========================================== */
interface ManagerDashboardProps {
  pets: Pet[];
  clients: Client[];
  invoices: Invoice[];
  splits: RevenueSplit[];
  allStaff: Staff[];
  onApproveSplit: (id: string) => void;
  onPaySplit: (id: string) => void;
  currentStaff?: Staff;
  onNavigateTab?: (tab: 'dashboard' | 'patients') => void;
}

export function ManagerDashboard({
  pets,
  clients,
  invoices,
  splits,
  allStaff,
  onApproveSplit,
  onPaySplit,
  currentStaff,
  onNavigateTab
}: ManagerDashboardProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'splits' | 'staff'>('overview');
  const [selectedPetDetail, setSelectedPetDetail] = useState<Pet | null>(null);

  // Financial KPI aggregation
  const paidInvoices = invoices.filter(i => i.status === 'PAID');
  const outstandingInvoices = invoices.filter(i => i.status === 'SENT');

  const totalPaidRevenue = paidInvoices.reduce((acc, i) => acc + i.total, 0);
  const totalOutstanding = outstandingInvoices.reduce((acc, i) => acc + i.total, 0);

  // Active clinic staffs
  const activeStaffCount = allStaff.filter(s => s.active).length;

  return (
    <div className="space-y-6">
      
      {/* Sub-navigation tabs for the executive controller */}
      <div className="flex border-b border-outline-variant/40 gap-4 mb-4">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`pb-2.5 text-xs font-bold tracking-wide transition-all uppercase px-1 border-b-2 cursor-pointer ${
            activeSubTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-tertiary hover:text-primary'
          }`}
        >
          Clinic Operations Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('splits')}
          className={`pb-2.5 text-xs font-bold tracking-wide transition-all uppercase px-1 border-b-2 cursor-pointer ${
            activeSubTab === 'splits'
              ? 'border-primary text-primary'
              : 'border-transparent text-tertiary hover:text-primary'
          }`}
        >
          ⚖️ Revenue Splits Auditor ({splits.filter(s => s.status === 'PENDING').length} Pending)
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('staff')}
          className={`pb-2.5 text-xs font-bold tracking-wide transition-all uppercase px-1 border-b-2 cursor-pointer ${
            activeSubTab === 'staff'
              ? 'border-primary text-primary'
              : 'border-transparent text-tertiary hover:text-primary'
          }`}
        >
          Coverage Schedule &amp; Rota
        </button>
      </div>

      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Stat Cards Grid exactly mirroring the uploaded image high-fidelity style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Today's Appointments */}
            <div className="bg-white border border-outline-variant/60 p-6 rounded-lg hover:shadow-md transition-shadow flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Today's Appointments</p>
                <p className="text-[32px] font-bold text-on-surface leading-tight">12</p>
              </div>
            </div>

            {/* Card 2: Patients Checked In */}
            <div className="bg-white border border-outline-variant/60 p-6 rounded-lg hover:shadow-md transition-shadow flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary shrink-0">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Patients Checked In</p>
                <p className="text-[32px] font-bold text-on-surface leading-tight">3</p>
              </div>
            </div>

            {/* Card 3: Revenue Today */}
            <div className="bg-white border border-outline-variant/60 p-6 rounded-lg hover:shadow-md transition-shadow flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <DollarSign className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Revenue Today</p>
                <p className="text-[32px] font-bold text-on-surface leading-tight">$2,450</p>
              </div>
            </div>

            {/* Card 4: Pending Tasks (splits requiring owner release authority) */}
            <div className="bg-white border border-outline-variant/60 p-6 rounded-lg hover:shadow-md transition-shadow flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-error-container/40 flex items-center justify-center text-error shrink-0">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Pending Tasks</p>
                <p className="text-[32px] font-bold text-error leading-tight">7</p>
              </div>
            </div>
          </div>

          {/* Core high-fidelity interactive sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Upcoming Appointments Table (2/3 width) */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-outline-variant/60 flex flex-col justify-between">
              <div>
                <div className="p-6 border-b border-outline-variant/40 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-on-surface">Upcoming Appointments</h3>
                  <button
                    type="button"
                    onClick={() => onNavigateTab ? onNavigateTab('patients') : alert('Navigating to Patient Schedule diary.')}
                    className="text-primary font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    View Schedule <span className="text-sm font-semibold select-none">→</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#e6eeff]/60 text-on-surface-variant text-[11px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Pet Name</th>
                        <th className="px-6 py-4">Owner</th>
                        <th className="px-6 py-4">Doctor</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30 text-xs text-on-surface">
                      {/* Interactive Row 1 - Bella */}
                      <tr 
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => {
                          const mat = pets.find(p => p.name === 'Bella') || pets[0];
                          if (mat) setSelectedPetDetail(mat);
                        }}
                      >
                        <td className="px-6 py-4 font-medium text-slate-600">09:00 AM</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#b7eaff] text-primary font-bold text-xs flex items-center justify-center">
                              B
                            </div>
                            <span className="font-bold text-primary hover:underline">Bella</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">Sarah Jenkins</td>
                        <td className="px-6 py-4 text-on-surface-variant">Dr. Miller</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">Confirmed</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); alert('Options: Edit Record, Reschedule, Bill client.'); }}
                            className="text-outline hover:text-primary transition-colors focus:outline-none"
                          >
                            •••
                          </button>
                        </td>
                      </tr>

                      {/* Interactive Row 2 - Max */}
                      <tr 
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => {
                          const mat = pets.find(p => p.name === 'Max') || pets[1] || pets[0];
                          if (mat) setSelectedPetDetail(mat);
                        }}
                      >
                        <td className="px-6 py-4 font-semibold text-primary">09:45 AM</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#d3e4fe] text-secondary-container font-bold text-xs flex items-center justify-center">
                              🐾
                            </div>
                            <span className="font-bold text-primary hover:underline">Max</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">Robert Chen</td>
                        <td className="px-6 py-4 text-on-surface-variant">Dr. Wilson</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">Checked In</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); alert('Options: Edit Record, Reschedule, Bill client.'); }}
                            className="text-outline hover:text-primary transition-colors focus:outline-none"
                          >
                            •••
                          </button>
                        </td>
                      </tr>

                      {/* Interactive Row 3 - Cooper */}
                      <tr 
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => {
                          const mat = pets.find(p => p.name === 'Cooper') || pets[2] || pets[0];
                          if (mat) setSelectedPetDetail(mat);
                        }}
                      >
                        <td className="px-6 py-4 font-medium text-slate-600">10:30 AM</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                              C
                            </div>
                            <span className="font-bold text-primary hover:underline">Cooper</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">Emma Thompson</td>
                        <td className="px-6 py-4 text-on-surface-variant">Dr. Miller</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700">In Progress</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); alert('Options: Edit Record, Reschedule, Bill client.'); }}
                            className="text-outline hover:text-primary transition-colors focus:outline-none"
                          >
                            •••
                          </button>
                        </td>
                      </tr>

                      {/* Interactive Row 4 - Luna */}
                      <tr 
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => {
                          const mat = pets.find(p => p.name === 'Luna') || pets[3] || pets[0];
                          if (mat) setSelectedPetDetail(mat);
                        }}
                      >
                        <td className="px-6 py-4 font-medium text-outline">08:15 AM</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 opacity-60">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">
                              L
                            </div>
                            <span className="font-semibold text-slate-700 hover:underline">Luna</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-outline">Alice Cooper</td>
                        <td className="px-6 py-4 text-outline">Dr. Wilson</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500">Completed</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); alert('Options: Edit Record, Reschedule, Bill client.'); }}
                            className="text-outline hover:text-primary transition-colors focus:outline-none"
                          >
                            •••
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="p-4 bg-[#eff4ff]/40 border-t border-outline-variant/30 text-center">
                <p className="text-[11px] text-slate-500 font-semibold uppercase">
                  ⚡ Operational Tip: Click on a patient's row to review medical chart stats in real time.
                </p>
              </div>
            </div>

            {/* Recent Activity Panel (1/3 width) */}
            <div className="bg-white rounded-lg border border-outline-variant/60 flex flex-col justify-between">
              <div className="p-6 border-b border-outline-variant/40">
                <h3 className="text-lg font-bold text-on-surface">Recent Activity</h3>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto max-h-[350px]">
                <div className="relative space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/50">
                  
                  {/* Activity Item 1 */}
                  <div className="relative pl-10">
                    <div className="absolute left-[3px] top-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center z-10 ring-4 ring-white">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div>
                      <p className="text-xs text-on-surface">
                        Lab results uploaded for <span className="font-bold text-primary">Bella</span>
                      </p>
                      <p className="text-[10px] text-outline mt-0.5 uppercase font-medium">10:42 AM • Dr. Miller</p>
                    </div>
                  </div>

                  {/* Activity Item 2 */}
                  <div className="relative pl-10">
                    <div className="absolute left-[3px] top-1.5 w-4 h-4 rounded-full bg-green-600 flex items-center justify-center z-10 ring-4 ring-white">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div>
                      <p className="text-xs text-on-surface">
                        Payment processed for <span className="font-bold text-slate-700">Invoice #IV-20492</span>
                      </p>
                      <p className="text-[10px] text-outline mt-0.5 uppercase font-medium">09:15 AM • Admin</p>
                    </div>
                  </div>

                  {/* Activity Item 3 */}
                  <div className="relative pl-10">
                    <div className="absolute left-[3px] top-1.5 w-4 h-4 rounded-full bg-red-650 bg-[#ba1a1a] flex items-center justify-center z-10 ring-4 ring-white">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-error">Urgent: Prescription refill needed</p>
                      <p className="text-xs text-on-surface mt-0.5">Case #9021 for Charlie (Feline)</p>
                      <p className="text-[10px] text-outline mt-0.5 uppercase font-medium">08:30 AM • Pharmacy</p>
                    </div>
                  </div>

                  {/* Activity Item 4 */}
                  <div className="relative pl-10">
                    <div className="absolute left-[3px] top-1.5 w-4 h-4 rounded-full bg-slate-500 flex items-center justify-center z-10 ring-4 ring-white">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div>
                      <p className="text-xs text-on-surface">
                        New patient registered: <span className="font-bold text-primary">Toby</span>
                      </p>
                      <p className="text-[10px] text-outline mt-0.5 uppercase font-medium">Yesterday • Reception</p>
                    </div>
                  </div>

                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-outline-variant/30">
                <button 
                  type="button"
                  onClick={() => setActiveSubTab('splits')}
                  className="w-full py-2 bg-white border border-outline-variant/60 text-on-surface-variant rounded-lg text-xs hover:bg-[#eff4ff] hover:text-primary transition-colors font-bold cursor-pointer shadow-2xs"
                >
                  View Revenue Division Audit Log
                </button>
              </div>
            </div>

          </div>

          {/* Quick Info Drawer Modal (When a pet row is clicked) */}
          {selectedPetDetail && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-end">
              <div className="w-full max-w-sm bg-white h-screen p-6 shadow-xl flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-bold text-sm text-on-surface">Patient Health Registry</h3>
                    <button 
                      type="button" 
                      onClick={() => setSelectedPetDetail(null)}
                      className="text-tertiary hover:text-primary font-bold text-xs"
                    >
                      Close ✕
                    </button>
                  </div>

                  <div className="text-center space-y-2">
                    <img
                      src={selectedPetDetail.avatar}
                      alt={selectedPetDetail.name}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-primary"
                    />
                    <h4 className="text-lg font-bold text-primary">{selectedPetDetail.name}</h4>
                    <span className="text-xs text-tertiary uppercase font-mono font-bold">
                      {selectedPetDetail.species} • {selectedPetDetail.breed}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-outline-variant/40">
                    <div>
                      <p className="text-outline uppercase text-[9px] font-bold">Age</p>
                      <p className="font-bold text-[#0d1c2e]">{selectedPetDetail.age}</p>
                    </div>
                    <div>
                      <p className="text-outline uppercase text-[9px] font-bold">Weight</p>
                      <p className="font-bold text-[#0d1c2e]">{selectedPetDetail.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-outline uppercase text-[9px] font-bold">Gender</p>
                      <p className="font-bold text-[#0d1c2e]">{selectedPetDetail.gender}</p>
                    </div>
                    <div>
                      <p className="text-outline uppercase text-[9px] font-bold">Status Queue</p>
                      <p className="font-bold text-primary">{selectedPetDetail.status}</p>
                    </div>
                  </div>

                  {selectedPetDetail.alertAllergies.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                      <strong>⚠ Critical Allergy Alerts:</strong>
                      <p className="mt-1">{selectedPetDetail.alertAllergies.join(', ')}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPetDetail(null);
                      if (onNavigateTab) onNavigateTab('patients');
                    }}
                    className="w-full py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg text-center"
                  >
                    Open Full EHR Medical History
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedPetDetail(null); alert('Clinic alert systems broadcast complete.'); }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-tertiary font-bold text-xs rounded-lg text-center"
                  >
                    Broadcast Emergency Alert
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* REVENUE SPLITS TAB MODULE */}
      {activeSubTab === 'splits' && (
        <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
            <div>
              <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide">
                ⚖️ Revenue Division and Split Auditor
              </h3>
              <p className="text-[10px] text-[#545d62] mt-0.5">
                Calculate, verify and authorize automatic payouts for active procedure surgeons &amp; nurses.
              </p>
            </div>
            <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded font-mono">
              ROLE AUDIT CONTROL
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#f8f9ff] text-[#545d62] font-bold text-[10px] border-b">
                  <th className="p-3">Team Member</th>
                  <th className="p-3">Staff Role</th>
                  <th className="p-3">Invoice</th>
                  <th className="p-3">Percentage</th>
                  <th className="p-3">Split Share</th>
                  <th className="p-3">status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {splits.map((s) => {
                  const staff = allStaff.find(st => st.id === s.staffId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="p-3 flex items-center gap-2">
                        <img
                          src={staff?.avatar}
                          alt={staff?.name}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-full object-cover border"
                        />
                        <span className="font-bold text-[#0d1c2e]">{staff?.name.replace('Dr. ', '')}</span>
                      </td>
                      <td className="p-3 text-[#545d62] font-semibold">{s.role}</td>
                      <td className="p-3 text-primary font-bold font-mono">{s.invoiceId.toUpperCase()}</td>
                      <td className="p-3 text-[#0d1c2e] font-mono">{s.percentage}%</td>
                      <td className="p-3 text-emerald-800 font-bold font-mono">${s.splitAmount.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${
                          s.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : s.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        {s.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => onApproveSplit(s.id)}
                            className="bg-[#eff4ff] hover:bg-primary/20 text-primary text-[10px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        {s.status === 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => onPaySplit(s.id)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer"
                          >
                            Settle Fund
                          </button>
                        )}
                        {s.status === 'PAID' && (
                          <span className="text-[10px] text-emerald-500 font-bold font-mono">Released ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STAFF ON DUTY TAB */}
      {activeSubTab === 'staff' && (
        <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide">
            👨‍⚕️ Clinical Provider Coverage Schedule
          </h3>
          <p className="text-xs text-[#545d62]">
            Monitor active shifts, billing codes and clinical rates for currently registered medical directors and surgeons.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {allStaff.map((staff) => (
              <div key={staff.id} className="flex items-center justify-between p-3 border rounded-xl border-outline-variant/30 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#0d1c2e]">{staff.name}</h4>
                    <p className="text-[10px] text-[#545d62] font-semibold">
                      {staff.role} {staff.specialty ? `• ${staff.specialty}` : ''}
                    </p>
                    {staff.billingRate && (
                      <span className="text-[9px] text-primary font-bold font-mono block mt-0.5">
                        Billing Rate: ${staff.billingRate}/hr
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${staff.active ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
                  <span className="text-[10px] text-slate-500 font-mono">{staff.active ? 'On Shift' : 'Off duty'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
  onAddNewAppointment: (apt: Appointment) => void;
  onUpdatePetStatus: (petId: string, status: any) => void;
  onGenerateInvoice: (invoice: Invoice) => void;
}

export function ReceptionDashboard({
  appointments,
  pets,
  clients,
  allStaff,
  onAddNewAppointment,
  onUpdatePetStatus,
  onGenerateInvoice
}: ReceptionDashboardProps) {
  const [selPetId, setSelPetId] = useState('pet-1');
  const [selVetId, setSelVetId] = useState('staff-dvm-1');
  const [aptReason, setAptReason] = useState('');
  const [aptTime, setAptTime] = useState('2026-05-21T15:30:00Z');

  const handleBookApt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptReason) return;

    const matchedPet = pets.find(p => p.id === selPetId);
    if (!matchedPet) return;

    const newApt: Appointment = {
      id: `apt-new-${Date.now()}`,
      petId: selPetId,
      clientId: matchedPet.ownerId,
      staffId: selVetId,
      dateTime: aptTime,
      duration: 30,
      reason: aptReason,
      status: 'CONFIRMED'
    };

    onAddNewAppointment(newApt);
    setAptReason('');
    alert('Appointment scheduled successfully and associated client alerted!');
  };

  const handleInvoiceCreation = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;

    const owner = clients.find(c => c.id === pet.ownerId);
    if (!owner) return;

    // Create a generic billing statement
    const newInvoice: Invoice = {
      id: `inv-${Date.now().toString().slice(-4)}`,
      clientId: owner.id,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'DRAFT',
      items: [
        { id: `it-g1-${Date.now()}`, description: `${pet.name} Wellness Outpatient Care`, amount: 85.00, quantity: 1, category: 'Consultation' },
        { id: `it-g2-${Date.now()}`, description: 'Routine Vaccine booster administration', amount: 35.00, quantity: 1, category: 'General' }
      ],
      total: 120.00
    };

    onGenerateInvoice(newInvoice);
    alert(`Draft billing folder ${newInvoice.id.toUpperCase()} generated for ${owner.name}! Authorized staff can process payment.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Appointments Checkins */}
      <div className="lg:col-span-2 bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Front Desk Appointment Diary
        </h3>
        
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {appointments.map((apt) => {
            const pet = pets.find(p => p.id === apt.petId);
            const client = clients.find(c => c.id === apt.clientId);
            const dvm = allStaff.find(s => s.id === apt.staffId);
            return (
              <div key={apt.id} className="p-4 bg-stone-50/50 border border-outline-variant/50 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-[#0d1c2e]">
                      {pet?.name} (Owner: <strong className="font-bold">{client?.name}</strong>)
                    </h4>
                    <p className="text-[10px] text-[#545d62] font-semibold mt-0.5">
                      Reason: {apt.reason} • Vet: <span className="text-primary font-bold">{dvm?.name.replace('Dr. ', '')}</span>
                    </p>
                    <span className="text-[9px] text-[#6e797e] font-mono block mt-1">
                      Schedule: {new Date(apt.dateTime).toLocaleTimeString()} ({apt.duration} mins)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Toggles */}
                    <select
                      value={pet?.status || 'Checked In'}
                      onChange={(e) => onUpdatePetStatus(apt.petId, e.target.value as any)}
                      className="text-[10px] p-1.5 bg-white border border-outline-variant rounded focus:outline-none focus:border-primary shrink-0"
                    >
                      <option value="Checked In">Checked In</option>
                      <option value="In Surgery">In Surgery</option>
                      <option value="In Treatment">In Treatment</option>
                      <option value="Discharged">Discharged</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleInvoiceCreation(apt.petId)}
                      className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1.5 rounded border border-emerald-200 cursor-pointer text-center"
                      title="Create billing invoice"
                    >
                      Bill Receipt
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Form scheduler */}
      <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-1.5">
          <PlusSquare className="w-5 h-5 text-primary" /> Book Appointment
        </h3>

        <form onSubmit={handleBookApt} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#545d62] mb-1">Select Patient</label>
            <select
              value={selPetId}
              onChange={(e) => setSelPetId(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none"
            >
              {pets.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#545d62] mb-1">Select Surgeon / DVM</label>
            <select
              value={selVetId}
              onChange={(e) => setSelVetId(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none"
            >
              {allStaff.filter(s => s.role === Role.DVM).map(s => (
                <option key={s.id} value={s.id}>{s.name} • {s.specialty?.split(' ')[0]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#545d62] mb-1">Schedule date / Time</label>
            <input
              type="datetime-local"
              value={aptTime.slice(0, 16)}
              onChange={(e) => setAptTime(new Date(e.target.value).toISOString())}
              className="w-full text-xs p-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#545d62] mb-1">Clinic Reason for Visit</label>
            <textarea
              required
              value={aptReason}
              onChange={(e) => setAptReason(e.target.value)}
              placeholder="e.g. Coughing booster checkup or claw trim"
              rows={2}
              className="w-full text-xs p-2.5 bg-[#f8f9ff] border border-outline-variant rounded-lg focus:outline-none focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container transition-all cursor-pointer shadow-sm text-center"
          >
            Confirm Slot &amp; Dispatch Alert
          </button>
        </form>
      </div>

    </div>
  );
}


/* ==========================================
   TECH / NURSE DASHBOARD
   ========================================== */
interface TechDashboardProps {
  labOrders: LabOrder[];
  pets: Pet[];
  onCompleteLabOrder: (id: string, notes: string) => void;
}

export function TechDashboard({
  labOrders,
  pets,
  onCompleteLabOrder
}: TechDashboardProps) {
  const [resultInput, setResultInput] = useState('');
  const [activeLabId, setActiveLabId] = useState<string | null>(labOrders[0]?.id || null);

  const matchedPet = activeLabId ? pets.find(p => p.id === labOrders.find(l => l.id === activeLabId)?.petId) : null;

  const handleAuditLab = (id: string) => {
    if (!resultInput) {
      alert('Please compile diagnostic laboratory result notes first.');
      return;
    }
    onCompleteLabOrder(id, resultInput);
    setResultInput('');
    alert('Laboratory results processed and linked successfully into patient health database!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left side Lab queue */}
      <div className="lg:col-span-2 bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary animate-pulse" /> Diagnostic Laboratory Assay Drawer
        </h3>

        <div className="space-y-3">
          {labOrders.map((lab) => {
            const pet = pets.find(p => p.id === lab.petId);
            return (
              <button
                key={lab.id}
                onClick={() => setActiveLabId(lab.id)}
                className={`w-full flex items-center justify-between p-3.5 border rounded-xl text-left transition-all hover:translate-x-0.5 cursor-pointer ${
                  activeLabId === lab.id
                    ? 'border-primary bg-primary/5 shadow-2xs'
                    : 'border-outline-variant/60 bg-stone-50/50'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-[#0d1c2e]">{lab.testName}</h4>
                  <p className="text-[10px] text-[#545d62] font-semibold mt-0.5">
                    Patient: <strong className="text-primary">{pet?.name}</strong> • Status: {lab.status}
                  </p>
                </div>
                {lab.isHighRisk && (
                  <span className="text-[8px] bg-red-100 hover:bg-red-200 text-red-800 font-bold px-2 py-0.5 border border-red-200 rounded animate-bounce">
                    HIGH RISK ALERT
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lab Results Submission card */}
      <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-1.5">
          📝 Compile Results Assays
        </h3>

        {activeLabId && matchedPet ? (
          <div className="space-y-4">
            <div className="p-3 bg-[#f8f9ff] border border-outline-variant/50 rounded-lg">
              <span className="block text-[8px] font-bold text-[#545d62] uppercase tracking-wide font-mono">Assay Target Patient</span>
              <p className="text-xs font-bold text-[#0a1523] mt-0.5">{matchedPet.name} ({matchedPet.breed})</p>
              <p className="text-[9px] text-error font-medium mt-1">Allergies: {matchedPet.alertAllergies.join(', ') || 'None'}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#545d62]" htmlFor="assay-notes">
                Laboratory Assessment / Results Transcript
              </label>
              <textarea
                id="assay-notes"
                required
                value={resultInput}
                onChange={(e) => setResultInput(e.target.value)}
                placeholder="e.g. Fecal analysis returns negative for flagellates. Minor active leukocytes observed."
                rows={4}
                className="w-full text-xs p-2.5 border border-outline-variant bg-[#f8f9ff]/50 focus:bg-white rounded-lg focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleAuditLab(activeLabId)}
              className="w-full py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container cursor-pointer transition-all shadow-sm"
            >
              Sign-off &amp; Complete Lab Order
            </button>
          </div>
        ) : (
          <p className="text-xs text-[#545d62] text-center py-6">
            Select an active diagnostic laboratory order from the queue to compile findings.
          </p>
        )}
      </div>

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

  // Sum split payouts
  const payoutByStaff = allStaff.reduce((acc, st) => {
    const staffAmt = splits
      .filter(s => s.staffId === st.id)
      .reduce((sum, item) => sum + item.splitAmount, 0);
    acc[st.id] = staffAmt;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Invoices grid */}
      <div className="lg:col-span-2 bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-2">
          🧾 Invoices and billing folders
        </h3>

        <div className="space-y-3">
          {invoices.map((inv) => {
            const client = clients.find(c => c.id === inv.clientId);
            return (
              <div key={inv.id} className="p-4 bg-gradient-to-r from-[#eff4ff]/20 to-white border border-outline-variant/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[#0d1c2e]" id={`invoice-${inv.id}`}>
                    Billing Fold {inv.id.toUpperCase()} • <span className="font-mono">${inv.total.toFixed(2)}</span>
                  </h4>
                  <p className="text-[10px] text-[#545d62] font-semibold mt-0.5">
                    Client: {client?.name} • Due: {inv.dueDate}
                  </p>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {inv.items.map((item) => (
                      <span key={item.id} className="text-[8px] bg-slate-100 px-1.5 py-0.5 text-[#545d62] font-semibold rounded">
                        {item.description} (${item.amount})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {inv.status}
                  </span>

                  {inv.status !== 'PAID' && (
                    <button
                      type="button"
                      onClick={() => onMarkInvoicePaid(inv.id)}
                      className="px-3 py-1.5 bg-primary text-on-primary text-[10px] font-bold rounded-lg hover:bg-primary-container active:scale-95 transition-all text-center cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      Receive Payment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Payout statistics */}
      <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide">
          💸 Staff Division Ledger Summary
        </h3>
        <p className="text-[10px] text-[#545d62] leading-relaxed">
          Accrued financial bonuses computed from surgical or lab participation:
        </p>

        <div className="space-y-3">
          {allStaff.map((st) => {
            const sum = payoutByStaff[st.id] || 0;
            return (
              <div key={st.id} className="flex items-center justify-between py-2 border-b last:border-none border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <img
                    src={st.avatar}
                    alt={st.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#0d1c2e]">{st.name.replace('Dr. ', '')}</h4>
                    <span className="text-[8px] text-slate-500 font-mono font-bold leading-none">{st.role}</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-800">${sum.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
