/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Mic, Play, Plus, Trash2, CheckCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { MedicalRecord, Prescription, Staff, Role } from '../types';

interface SoapEditorProps {
  initialRecord: MedicalRecord | null;
  petName: string;
  allStaff: Staff[];
  onSave: (updatedRecord: MedicalRecord) => void;
  onCancel: () => void;
}

export default function SoapEditor({
  initialRecord,
  petName,
  allStaff,
  onSave,
  onCancel
}: SoapEditorProps) {
  const [subjective, setSubjective] = useState(initialRecord?.soap.subjective || '');
  const [objective, setObjective] = useState(initialRecord?.soap.objective || '');
  const [assessment, setAssessment] = useState(initialRecord?.soap.assessment || '');
  const [plan, setPlan] = useState(initialRecord?.soap.plan || '');
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialRecord?.prescriptions || []);
  const [procedureTeam, setProcedureTeam] = useState<string[]>(initialRecord?.procedureTeam || ['staff-dvm-1']);
  
  // Script Simulator states
  const [isDictating, setIsDictating] = useState(false);
  const [dictationStep, setDictationStep] = useState(0); // 0=idle, 1=recording, 2=generating

  // New Prescription Form state
  const [newMed, setNewMed] = useState('');
  const [newDose, setNewDose] = useState('');
  const [newFreq, setNewFreq] = useState('');
  const [newDur, setNewDur] = useState('');

  const handleAddPrescription = () => {
    if (!newMed) return;
    const newRx: Prescription = {
      id: `rx-new-${Date.now()}`,
      medicationName: newMed,
      dosage: newDose || 'As directed',
      frequency: newFreq || 'Once daily',
      duration: newDur || '7 Days'
    };
    setPrescriptions([...prescriptions, newRx]);
    setNewMed('');
    setNewDose('');
    setNewFreq('');
    setNewDur('');
  };

  const handleRemovePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  const toggleTeamMember = (staffId: string) => {
    if (procedureTeam.includes(staffId)) {
      setProcedureTeam(procedureTeam.filter(id => id !== staffId));
    } else {
      setProcedureTeam([...procedureTeam, staffId]);
    }
  };

  // Simulated Dictation Feature for Clinic AI Assist
  const triggerAiScribe = () => {
    setIsDictating(true);
    setDictationStep(1);

    // Step 1: Simulated Listening (listening to the voice of Dr. Alexander Smith)
    setTimeout(() => {
      setDictationStep(2);
      
      // Step 2: Simulated Structuring SOAP Sections
      setTimeout(() => {
        setSubjective(
          `Cooper presented with a slightly elevated heart rate and occasional dry coughing spells following running in the yard, according to the client. Normal daily water consumption. No history of vomiting.`
        );
        setObjective(
          `Heart rate measured at 110 bpm. Trachea is mildly sensitive on deep palpation. Thoracic auscultation: clear airway fields bilaterally, no bronchial whistles. Left tympanic membrane intact, but external auditory canal shows moderate cream-colored exudate, erythema.`
        );
        setAssessment(
          `1. Exercise-induced airway hypersensitivity / potential mild tracheobronchitis.\n2. Left-sided mild Otis externa requiring focused topical hygiene drops.`
        );
        setPlan(
          `1. Place on restricted running play for 5 days.\n2. Apply Otomax / Mometamax drops, 4 drops in left ear daily for one week.\n3. Re-evaluate if cough frequency spikes or if discharge turns purulent.`
        );
        
        // Auto-add appropriate prescription
        const autoRxItem: Prescription = {
          id: `rx-auto-${Date.now()}`,
          medicationName: 'Mometamax Topical Otic Drops',
          dosage: '4 drops',
          frequency: 'Every 24 hours',
          duration: '7 Days',
          notes: 'Massage base of left ear canal for 10 seconds post instillation.'
        };
        setPrescriptions(prev => {
          if (prev.some(p => p.medicationName.includes('Mometamax'))) return prev;
          return [...prev, autoRxItem];
        });

        // Toggle anesthesia/nurse as team
        const techStaff = allStaff.find(s => s.role === Role.TECH);
        if (techStaff && !procedureTeam.includes(techStaff.id)) {
          setProcedureTeam(prev => [...prev, techStaff.id]);
        }

        setIsDictating(false);
        setDictationStep(0);
      }, 2000);
    }, 2500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resultRecord: MedicalRecord = {
      id: initialRecord?.id || `mr-new-${Date.now()}`,
      petId: initialRecord?.petId || 'pet-1',
      appointmentId: initialRecord?.appointmentId,
      dvmId: initialRecord?.dvmId || 'staff-dvm-1',
      date: initialRecord?.date || new Date().toISOString().split('T')[0],
      isComplete: true, // Marked complete on saving
      soap: {
        subjective,
        objective,
        assessment,
        plan
      },
      procedureTeam,
      prescriptions,
      labOrders: initialRecord?.labOrders || [],
      images: initialRecord?.images || []
    };
    onSave(resultRecord);
  };

  return (
    <div className="bg-white border border-outline-variant/60 rounded-xl shadow-sm overflow-hidden" id="soap-editor-pane">
      {/* SOAP Header */}
      <div className="bg-primary px-6 py-4 flex items-center justify-between text-on-primary">
        <div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold uppercase font-mono tracking-wider">
            EHR CLINIC SHEET
          </span>
          <h3 className="text-lg font-bold text-white mt-1">
            Clinical SOAP Notes: {petName}
          </h3>
        </div>
        
        {/* Action button */}
        <button
          type="button"
          onClick={onCancel}
          className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all rounded-md px-3 py-1 text-xs font-semibold cursor-pointer"
        >
          Close
        </button>
      </div>

      {/* AI Scribe Assistive Panel */}
      <div className="bg-gradient-to-r from-[#eff4ff] to-[#f8f9ff] border-b border-outline-variant/60 p-5">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0d1c2e] flex items-center gap-1.5 leading-snug">
                VetHub Instant dictation Scribe
                <span className="bg-primary/10 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded">AI PRO</span>
              </p>
              <p className="text-[11px] text-[#545d62] mt-0.5">
                Simulate listening to clinical recording lines (e.g. vocalizing heart sounds &amp; ear redness) and let AI generate organized medical SOAP notes.
              </p>
            </div>
          </div>
          
          <div>
            {dictationStep === 0 && (
              <button
                type="button"
                onClick={triggerAiScribe}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary-container active:scale-[0.98] cursor-pointer transition-all shadow-sm shadow-primary/10 select-none whitespace-nowrap"
              >
                <Mic className="w-4 h-4" />
                Listen and Auto-Generate Notes
              </button>
            )}

            {dictationStep === 1 && (
              <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-error px-3.5 py-2 rounded-lg text-xs font-bold animate-pulse">
                <span className="w-2.5 h-2.5 bg-error rounded-full animate-ping" />
                🎙️ AI Listening to Dr. Smith's voice...
              </div>
            )}

            {dictationStep === 2 && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-lg text-xs font-medium">
                <svg className="animate-spin h-3.5 w-3.5 text-emerald-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing neural SOAP transcripts...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main SOAP Sheet Form */}
      <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
        
        {/* SOAP Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Subjective */}
          <div className="space-y-1.5">
            <span className="inline-block text-[10px] bg-[#dce9ff]/60 text-primary font-bold px-2 py-0.5 rounded font-mono uppercase">
              S - Subjective
            </span>
            <label className="block text-xs font-bold text-[#0d1c2e]" htmlFor="soap-s">
              Owner description, habits, concerns &amp; symptoms
            </label>
            <textarea
              id="soap-s"
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              placeholder="e.g. Cooper presented for right ear scratching. Lethargy reported..."
              rows={4}
              className="w-full text-xs p-3 border border-outline-variant rounded-lg bg-[#f8f9ff]/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all"
            />
          </div>

          {/* Objective */}
          <div className="space-y-1.5">
            <span className="inline-block text-[10px] bg-[#dce9ff]/60 text-primary font-bold px-2 py-0.5 rounded font-mono uppercase">
              O - Objective
            </span>
            <label className="block text-xs font-bold text-[#0d1c2e]" htmlFor="soap-o">
              Vital stats, clinical measurements &amp; physical tests
            </label>
            <textarea
              id="soap-o"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g. Temp: 38.4°C. Pupils equal. Lungs clear on auscultation..."
              rows={4}
              className="w-full text-xs p-3 border border-outline-variant rounded-lg bg-[#f8f9ff]/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all"
            />
          </div>

          {/* Assessment */}
          <div className="space-y-1.5">
            <span className="inline-block text-[10px] bg-[#dce9ff]/60 text-primary font-bold px-2 py-0.5 rounded font-mono uppercase">
              A - Assessment
            </span>
            <label className="block text-xs font-bold text-[#0d1c2e]" htmlFor="soap-a">
              Veterinary diagnosis, rule-outs &amp; medical evaluation
            </label>
            <textarea
              id="soap-a"
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="e.g. 1) Borderline otitis externa left ear. 2)..."
              rows={4}
              className="w-full text-xs p-3 border border-outline-variant rounded-lg bg-[#f8f9ff]/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all"
            />
          </div>

          {/* Plan */}
          <div className="space-y-1.5">
            <span className="inline-block text-[10px] bg-[#dce9ff]/60 text-primary font-bold px-2 py-0.5 rounded font-mono uppercase">
              P - Plan
            </span>
            <label className="block text-xs font-bold text-[#0d1c2e]" htmlFor="soap-p">
              Operational therapy, followups, surgery booking or home restrictions
            </label>
            <textarea
              id="soap-p"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="e.g. Restrict exertion for 1 week. Administer Otic drops daily..."
              rows={4}
              className="w-full text-xs p-3 border border-outline-variant rounded-lg bg-[#f8f9ff]/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Prescription Management Module */}
        <div className="border border-outline-variant/60 rounded-xl p-5 bg-stone-50/50">
          <h4 className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wide mb-4">
            💊 Associated Prescribed Medication
          </h4>
          
          {prescriptions.length === 0 ? (
            <div className="p-3 bg-[#f8f9ff] rounded-lg text-center text-xs text-[#545d62] font-medium border border-dashed border-outline-variant/60">
              No prescriptions requested. Add a medication below if needed.
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="flex items-center justify-between p-3 bg-white border border-outline-variant bg-gradient-to-r from-emerald-50/20 to-white rounded-lg">
                  <div>
                    <h5 className="text-xs font-bold text-emerald-800">{rx.medicationName}</h5>
                    <p className="text-[10px] text-[#545d62] font-semibold mt-0.5">
                      Dosage: <span className="text-[#0d1c2e] font-bold">{rx.dosage}</span> • Frequency: <span className="text-[#0d1c2e] font-bold">{rx.frequency}</span> • Duration: <span className="text-[#0d1c2e] font-bold">{rx.duration}</span>
                    </p>
                    {rx.notes && <p className="text-[9px] text-[#6e797e] mt-1 font-mono">Note: {rx.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePrescription(rx.id)}
                    className="p-1.5 text-error hover:bg-error-container/25 rounded transition-all cursor-pointer"
                    title="Remove medicine"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Prescription Inline form */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-outline-variant/60">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-[#545d62] mb-1">Medication Name</label>
              <input
                type="text"
                value={newMed}
                onChange={(e) => setNewMed(e.target.value)}
                placeholder="e.g. Mometamax suspension"
                className="w-full text-xs p-2 border border-outline-variant bg-white rounded-md focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#545d62] mb-1">Dosage</label>
              <input
                type="text"
                value={newDose}
                onChange={(e) => setNewDose(e.target.value)}
                placeholder="4 drops / 1 tablet"
                className="w-full text-xs p-2 border border-outline-variant bg-white rounded-md focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#545d62] mb-1">Frequency</label>
              <input
                type="text"
                value={newFreq}
                onChange={(e) => setNewFreq(e.target.value)}
                placeholder="Once daily"
                className="w-full text-xs p-2 border border-outline-variant bg-white rounded-md focus:outline-none"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="grow">
                <label className="block text-[10px] font-bold text-[#545d62] mb-1">Duration</label>
                <input
                  type="text"
                  value={newDur}
                  onChange={(e) => setNewDur(e.target.value)}
                  placeholder="7 days"
                  className="w-full text-xs p-2 border border-outline-variant bg-white rounded-md focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddPrescription}
                className="p-2.5 bg-primary text-on-primary rounded-md hover:bg-opacity-90 active:scale-95 transition-all text-xs font-semibold cursor-pointer shrink-0"
                title="Add to prescription list"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Procedure Clinical Team Assignee */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Team Selector */}
          <div className="md:col-span-2">
            <span className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide mb-3">
              🏥 Clinic Treatment Team (Sign-off Group)
            </span>
            <div className="flex flex-wrap gap-2">
              {allStaff.map((staff) => {
                const isActive = procedureTeam.includes(staff.id);
                return (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => toggleTeamMember(staff.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#e6eeff] border-primary text-primary font-bold shadow-xs'
                        : 'bg-white hover:bg-[#f8f9ff] border-outline-variant text-[#0d1c2e]'
                    }`}
                  >
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <p className="leading-none text-[11px] font-bold">{staff.name.replace('Dr. ', '')}</p>
                      <span className="text-[8px] text-[#545d62] leading-none">{staff.role}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-[#6e797e] mt-2 italic font-sans">
              *Procedure members are automatically computed for revenue split validation.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col items-stretch justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-white border border-outline-variant text-[#0d1c2e] text-xs font-semibold rounded-lg hover:bg-[#f8f9ff] transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container shadow-sm shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer transition-all text-center"
            >
              <CheckCircle className="w-4 h-4" />
              Complete &amp; Archive Record
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
