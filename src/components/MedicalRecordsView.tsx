'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Mic, 
  Plus, 
  Trash2, 
  CheckCircle, 
  RotateCcw, 
  FileText, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Bell, 
  HelpCircle, 
  Heart, 
  ChevronDown, 
  ChevronUp, 
  Printer, 
  Lock, 
  ShieldCheck, 
  Check, 
  User, 
  Clock, 
  Bookmark, 
  AlertTriangle, 
  Activity, 
  Info,
  Sliders,
  Play,
  Pause,
  ArrowRight,
  FileSpreadsheet,
  Search
} from 'lucide-react';
import { Staff, Client, Pet, MedicalRecord, Prescription, Treatment, Role, Appointment, VaccineRecord } from '../types';

interface MedicalRecordsViewProps {
  pets?: Pet[];
  clients?: Client[];
  allStaff?: Staff[];
  loggedInStaff?: Staff | null;
  appointments?: Appointment[];
  medicalRecords?: MedicalRecord[];
  onSaveSoapNote?: (record: MedicalRecord) => void;
}

export default function MedicalRecordsView({
  pets = [],
  clients = [],
  allStaff = [],
  loggedInStaff,
  appointments = [],
  medicalRecords = [],
  onSaveSoapNote
}: MedicalRecordsViewProps) {
  
  // Find pets and clients for the appointments in Today's Queue
  const appointmentQueue = React.useMemo(() => {
    // Collect active appointment items
    const items = (appointments || []).map(apt => {
      const pet = pets.find(p => p.id === apt.petId);
      const client = clients.find(c => c.id === apt.clientId);
      return {
        id: apt.id,
        appointment: apt,
        pet,
        client,
      };
    }).filter(item => item.pet !== undefined) as Array<{
      id: string;
      appointment: any;
      pet: Pet;
      client: Client | undefined;
    }>;

    // Add Max as the initial demo pet (if not already included) so we don't break the default Golden Retriever experience!
    const hasMax = items.some(item => item.pet?.name === 'Max');
    if (!hasMax) {
      // Find or create Max
      const maxPet: Pet = pets.find(p => p.name === 'Max') || {
        id: 'pet-demo-max',
        name: 'Max',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: '4 yrs',
        weight: 32.4,
        gender: 'Male',
        status: 'Checked In',
        ownerId: 'client-demo-sarah',
        alertAllergies: [],
        avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80'
      };
      
      const maxClient: Client = {
        id: 'client-demo-sarah',
        name: 'Sarah Johnson',
        email: 'sarah.j@gmail.com',
        phone: '555-0122',
        address: '12 State St, Maplewood',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        joinedDate: '2025-05-21',
        membershipType: 'Gold'
      };

      const maxApt = {
        id: 'apt-demo-max',
        petId: maxPet.id,
        clientId: maxClient.id,
        staffId: 'staff-dvm-1',
        dateTime: '2026-05-21T10:30:00Z',
        duration: 30,
        reason: 'Annual Checkup & Ear Cytology',
        status: 'CHECKED_IN' as const
      };

      items.unshift({
        id: 'apt-demo-max',
        appointment: maxApt,
        pet: maxPet,
        client: maxClient
      });
    }

    return items;
  }, [appointments, pets, clients]);

  // Track currently selected patient from the queue
  const [selectedQueueId, setSelectedQueueId] = useState<string>('apt-demo-max');

  // Currently active patient info
  const activeQueueItem = appointmentQueue.find(item => item.id === selectedQueueId) || appointmentQueue[0];

  // 1. Core Record Configuration (Defaults to Max from uploaded mockup)
  const [patientStatus, setPatientStatus] = useState<'In Progress' | 'Pending Lab' | 'Completed'>('In Progress');
  
  // Subjective Section States
  const [subjectiveText, setSubjectiveText] = useState(
    'Max presented for right ear scratching. Lethargy reported by owner for past 2 days. Appetite remains mostly normal.'
  );
  const [durationInput, setDurationInput] = useState('3 days');

  // Objective Section States
  const [tempF, setTempF] = useState('101.2');
  const [hrBpm, setHrBpm] = useState('88');
  const [rrBpm, setRrBpm] = useState('24');
  const [weightKg, setWeightKg] = useState('32.4');
  const [bcsScore, setBcsScore] = useState<number>(5);

  // Physical Exam NSF checkbox toggles & custom note values (Uploaded Design alignment)
  const [examFindings, setExamFindings] = useState([
    { system: 'General Appearance', isNsf: true, notes: 'BAR (Bright, Alert, Responsive). Good muscle mass.' },
    { system: 'Ears / Eyes', isNsf: false, notes: 'Mild erythema left pinna; moderate waxy discharge.' },
    { system: 'Cardiovascular', isNsf: true, notes: 'Normal sinus rhythm. No heart murmurs or clicks.' },
    { system: 'Respiratory System', isNsf: true, notes: 'Clear airway fields bilaterally. Eupneic.' },
    { system: 'Musculoskeletal', isNsf: true, notes: 'No joint swelling or visible lameness.' },
  ]);

  // Assessment States
  const [selectedDxTags, setSelectedDxTags] = useState<string[]>(['OTITIS EXTERNA']);
  const [newDxTagInput, setNewDxTagInput] = useState('');
  const [assessmentText, setAssessmentText] = useState(
    'Primary diagnosis: Mild left-sided Otitis Externa. Rule out foreign body or secondary deep ear canal infection.'
  );

  // Plan States
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: 'rx-1',
      medicationName: 'Mometamax Otic Suspension',
      dosage: '4 drops AU',
      frequency: 'BID (twice daily)',
      duration: '7 days',
    }
  ]);
  const TREATMENT_CATALOG = [
    { name: 'Annual Wellness Physical Exam', description: 'Comprehensive physical examination', price: 65.00, route: 'Bilateral External' },
    { name: 'Bilateral Ear Canal Swab Cytology', description: 'Canal swab microscopic cytology evaluation', price: 55.00, route: 'AU (Both Ears)' },
    { name: 'Otic Flush & Deep Cleansing', description: 'In-clinic antiseptic deep flush washing', price: 85.00, route: 'Bilateral External' },
    { name: 'IV Fluid Therapy Bolus (Lactated Ringer)', description: 'Subcutaneous or Intravenous hydration administration', price: 95.00, route: 'IV (Intravenous)' },
    { name: 'Dental Scale & Polish', description: 'Ultrasonic plaque removal and clinical polish', price: 120.00, route: 'Oral Cavity' },
    { name: 'DHPP Core Canine Vaccine', description: '5-in-1 core immunizations administration', price: 45.00, route: 'SQ (Subcutaneous)' },
    { name: 'Rabies Core Vaccine (3-Year Renewal)', description: 'State-certified protective immune registration', price: 35.00, route: 'SQ (Subcutaneous)' },
    { name: 'Feline Leukemia (FeLV/FIV) Combistrip Test', description: 'Rapid snap dual immune response screening', price: 50.00, route: 'Blood/Serum' },
    { name: 'Microchip Administration & Registrar Log', description: 'Subscapular secure transponder implantation', price: 40.00, route: 'Subscapular' }
  ];

  const MEDICATION_CATALOG = [
    { name: 'Mometamax Otic Suspension', description: 'Antibacterial, anti-inflammatory ear droplets', price: 45.00, dosage: '4 drops AU', frequency: 'BID (twice daily)', duration: '7 days' },
    { name: 'Clavamox Chewable Tablets (125mg)', description: 'Amoxicillin/Clavulanate potassium formulation', price: 38.00, dosage: '1 tablet PO', frequency: 'BID', duration: '10 days' },
    { name: 'Carprofen Caplets (75mg - Rimadyl)', description: 'Non-steroidal anti-inflammatory post-op relief', price: 35.00, dosage: '1 tablet PO', frequency: 'SID (once daily)', duration: '5 days' },
    { name: 'Apoquel Immune-suppressing Tablets (16mg)', description: 'Atopic dermatitis localized itching suppression', price: 52.00, dosage: '0.5 tablet PO', frequency: 'BID', duration: '14 days' },
    { name: 'Heartgard Plus Chewables (6-Pack Box)', description: 'Monthly heartworm preventative prescription chew', price: 68.00, dosage: '1 chew PO', frequency: 'Monthly', duration: '180 days' },
    { name: 'NexGard Chewables (Afoxolaner)', description: 'Flea & tick infestation broad spectrum preventative', price: 74.00, dosage: '1 chew PO', frequency: 'Monthly', duration: '90 days' },
    { name: 'Gabapentin Capsules (100mg)', description: 'Neuropathic chronic pain & severe anxiety sedation', price: 22.00, dosage: '1 capsule PO', frequency: 'TID', duration: '7 days' }
  ];

  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('');
  const [newMedDur, setNewMedDur] = useState('');
  const [newMedPrice, setNewMedPrice] = useState('35.00');
  const [showMedPrice, setShowMedPrice] = useState(true);
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [isMedDropdownOpen, setIsMedDropdownOpen] = useState(false);

  const [planSummaryText, setPlanSummaryText] = useState(
    'Avoid swimming or moisture entry in ear canals for 1 week. Re-evaluate if symptoms persist past day 6.'
  );

  // In-Clinic Treatment Section States
  const [treatments, setTreatments] = useState<Treatment[]>([
    {
      id: 'tx-1',
      name: 'Otic Flush & Cytology Preparation',
      dosageOrRoute: 'Bilateral External',
      notes: 'In-clinic ear washing and canal swab cytology prep. Evaluated under clinical microscope.',
      status: 'ADMINISTERED',
      administeredBy: 'staff-dvm-1',
      dateTime: 'Feb 15, 2026'
    }
  ]);
  const [newTxtName, setNewTxtName] = useState('');
  const [newTxtRoute, setNewTxtRoute] = useState('');
  const [newTxtNotes, setNewTxtNotes] = useState('');
  const [newTxtPrice, setNewTxtPrice] = useState('85.00');
  const [showTxtPrice, setShowTxtPrice] = useState(true);
  const [txtSearchQuery, setTxtSearchQuery] = useState('');
  const [isTxtDropdownOpen, setIsTxtDropdownOpen] = useState(false);

  // Vaccine Section States
  const [vaccinations, setVaccinations] = useState<VaccineRecord[]>([]);
  const [newVacName, setNewVacName] = useState('');
  const [newVacDate, setNewVacDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVacDueDate, setNewVacDueDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newVacDosage, setNewVacDosage] = useState('1.0 mL');
  const [newVacStatus, setNewVacStatus] = useState<'Administered' | 'Due' | 'Overdue'>('Administered');

  // 2. AI Assist Voice Drawer Panel States
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(true);
  const [voiceSeconds, setVoiceSeconds] = useState(222); // Start at 03:42 -> 222 seconds
  const [voiceLanguage, setVoiceLanguage] = useState('English');
  const [expandedDraftTab, setExpandedDraftTab] = useState<'S' | 'O' | 'A' | 'P' | null>('S');

  // Interactive Toast log notifications
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'info' | 'warn' }>>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    const newToast = { id: Date.now(), message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  // Stopwatch Logic for Voice Scribe Panel
  useEffect(() => {
    let timerId: any = null;
    if (isVoiceRecording && showVoicePanel) {
      timerId = setInterval(() => {
        setVoiceSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isVoiceRecording, showVoicePanel]);

  const formatVoiceTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load and sync records dynamically for the selected appointment pet
  useEffect(() => {
    if (!activeQueueItem) return;
    const pet = activeQueueItem.pet;
    const apt = activeQueueItem.appointment;

    // Find if there is an existing medical record for this pet or appointment
    const record = medicalRecords?.find(mr => mr.appointmentId === apt.id || mr.petId === pet.id);
    
    if (record) {
      setSubjectiveText(record.soap?.subjective || `${pet.name} presented for evaluation.`);
      
      const objective = record.soap?.objective || '';
      const tempMatch = objective.match(/Temp:\s*([0-9.]+)/i);
      const hrMatch = objective.match(/Heart\s*Rate:\s*([0-9.]+)/i);
      const rrMatch = objective.match(/Respiratory:\s*([0-9.]+)/i);
      
      setTempF(tempMatch ? tempMatch[1] : '101.2');
      setHrBpm(hrMatch ? hrMatch[1] : pet.species === 'Cat' ? '140' : pet.species === 'Rabbit' ? '180' : '88');
      setRrBpm(rrMatch ? rrMatch[1] : pet.species === 'Cat' ? '30' : pet.species === 'Rabbit' ? '45' : '24');
      setWeightKg(pet.weight?.toString() || '15.0');
      
      const bcsMatch = objective.match(/Body\s*Condition\s*Score:\s*([0-9])/i) || record.soap?.assessment?.match(/Body\s*Condition\s*Score\s*([0-9])/i);
      setBcsScore(bcsMatch ? parseInt(bcsMatch[1]) : 5);
      
      setAssessmentText(record.soap?.assessment || `Clinical evaluation for ${pet.name}.`);
      setPlanSummaryText(record.soap?.plan || `Recommended home-care and recovery guidelines.`);
      setPrescriptions(record.prescriptions || []);
      setTreatments(record.treatments || []);
      setVaccinations(record.vaccinations || []);
      setPatientStatus(record.isComplete ? 'Completed' : 'In Progress');
    } else {
      // Load sensible defaults for other pets
      if (pet.name === 'Max') {
        setSubjectiveText('Max presented for right ear scratching. Lethargy reported by owner for past 2 days. Appetite remains mostly normal.');
        setTempF('101.2');
        setHrBpm('88');
        setRrBpm('24');
        setWeightKg('32.4');
        setBcsScore(5);
        setAssessmentText('Primary diagnosis: Mild left-sided Otitis Externa. Rule out foreign body or secondary deep ear canal infection.');
        setPlanSummaryText('Avoid swimming or moisture entry in ear canals for 1 week. Re-evaluate if symptoms persist past day 6.');
        setPrescriptions([
          {
            id: 'rx-1',
            medicationName: 'Mometamax Otic Suspension',
            dosage: '4 drops AU',
            frequency: 'BID (twice daily)',
            duration: '7 days',
          }
        ]);
        setTreatments([
          {
            id: 'tx-1',
            name: 'Otic Flush & Cytology Preparation',
            dosageOrRoute: 'Bilateral External',
            notes: 'In-clinic ear washing and canal swab cytology prep. Evaluated under clinical microscope.',
            status: 'ADMINISTERED',
            administeredBy: 'staff-dvm-1',
            dateTime: 'Feb 15, 2026'
          }
        ]);
        setVaccinations([
          {
            id: 'vac-max-1',
            name: 'Rabies 3-Year Booster',
            date: '2026-02-15',
            nextDueDate: '2029-02-15',
            dosage: '1.0 mL',
            status: 'Administered'
          },
          {
            id: 'vac-max-2',
            name: 'DHPP Core Vaccine',
            date: '2026-02-15',
            nextDueDate: '2027-02-15',
            dosage: '1.0 mL',
            status: 'Administered'
          }
        ]);
        setPatientStatus('In Progress');
      } else {
        // Load custom initial text based on the appointment reason!
        setSubjectiveText(`${pet.name} presented today for ${apt.reason || 'evaluation'}. ${apt.notes || ''}`);
        setTempF('101.5');
        setHrBpm(pet.species === 'Cat' ? '140' : pet.species === 'Rabbit' ? '180' : '90');
        setRrBpm(pet.species === 'Cat' ? '30' : pet.species === 'Rabbit' ? '45' : '22');
        setWeightKg(pet.weight?.toString() || '12.4');
        setBcsScore(5);
        setAssessmentText(`1. Evaluation of ${apt.reason || 'presenting complaint'}.\n2. Overall general health looks excellent, no visible secondary complications.`);
        setPlanSummaryText(`Monitor clinical signs carefully. Follow outpatient guidance and instructions.`);
        setPrescriptions([]);
        setTreatments([]);
        setVaccinations([]);
        setPatientStatus('In Progress');
      }
    }
  }, [selectedQueueId, medicalRecords]);

  // Saves record changes securely back to database
  const [treatmentPrices, setTreatmentPrices] = useState<Record<string, number>>({ 'tx-1': 85.00 });
  const [prescriptionPrices, setPrescriptionPrices] = useState<Record<string, number>>({});

  const handleSaveCurrentRecord = (isComplete: boolean) => {
    if (!activeQueueItem) return;
    const { pet, appointment } = activeQueueItem;
    
    // Construct objective text to align with saving format
    const objectiveCompiled = `Weight: ${weightKg} kg. Temp: ${tempF}°F. Heart Rate: ${hrBpm} bpm. Respiratory: ${rrBpm} bpm. Body Condition Score: ${bcsScore}/9.`;

    const updatedRecord: MedicalRecord = {
      id: `mr-active-${pet.id}-${Date.now()}`,
      petId: pet.id,
      appointmentId: appointment.id,
      dvmId: loggedInStaff?.id || 'staff-dvm-1',
      date: new Date().toISOString().split('T')[0],
      isComplete: isComplete,
      soap: {
        subjective: subjectiveText,
        objective: objectiveCompiled,
        assessment: assessmentText,
        plan: planSummaryText
      },
      procedureTeam: [loggedInStaff?.id || 'staff-dvm-1'],
      prescriptions: prescriptions,
      treatments: treatments,
      vaccinations: vaccinations,
      labOrders: [],
      images: []
    };

    // When compiling the record ("everything is done"), export performed treatments and prescriptions to billing
    if (isComplete) {
      const billingItemsToAdd: any[] = [];
      
      // 1. Gather performed/administered treatments
      treatments.forEach(tx => {
        if (tx.status === 'ADMINISTERED') {
          // Check if there's an overridden price
          const priceVal = treatmentPrices[tx.id] !== undefined ? treatmentPrices[tx.id] : 85.00;
          billingItemsToAdd.push({
            id: `item-tx-${tx.id}-${Date.now()}`,
            name: tx.name,
            description: `Administered via ${tx.dosageOrRoute || 'Direct'} route - clinical procedure`,
            quantity: 1,
            unitPrice: priceVal
          });
        }
      });

      // 2. Gather prescribed medicines
      prescriptions.forEach(rx => {
        const priceVal = prescriptionPrices[rx.id] !== undefined ? prescriptionPrices[rx.id] : 45.00;
        billingItemsToAdd.push({
          id: `item-rx-${rx.id}-${Date.now()}`,
          name: rx.medicationName,
          description: `Dispensed: ${rx.dosage} (${rx.frequency} for ${rx.duration})`,
          quantity: 1,
          unitPrice: priceVal
        });
      });

      if (billingItemsToAdd.length > 0) {
        const currentPendingRaw = localStorage.getItem('vethub_pending_billing_items');
        let currentPending = [];
        if (currentPendingRaw) {
          try { currentPending = JSON.parse(currentPendingRaw); } catch (e) {}
        }
        
        // Merge without duplicates
        const updatedPending = [...currentPending, ...billingItemsToAdd];
        localStorage.setItem('vethub_pending_billing_items', JSON.stringify(updatedPending));
        
        // Update client & pet settings in local storage dynamically so BillingView knows to bill sarah/max or active client/pet!
        localStorage.setItem('vethub_active_bill_pet', pet.name);
        const ownerName = activeQueueItem?.client?.name || 'Sarah Johnson';
        const ownerEmail = activeQueueItem?.client?.email || 'sarah.j@example.com';
        localStorage.setItem('vethub_active_bill_client_name', ownerName);
        localStorage.setItem('vethub_active_bill_client_email', ownerEmail);
        
        addToast(`Successfully billing: Dispatched ${billingItemsToAdd.length} items totaling $${billingItemsToAdd.reduce((sum, item) => sum + item.unitPrice, 0).toFixed(2)} to Invoice!`, 'success');
      }
    }

    if (onSaveSoapNote) {
      onSaveSoapNote(updatedRecord);
      addToast(`Health record for ${pet.name} successfully updated & compiled!`, 'success');
    } else {
      addToast(`Saved state for ${pet.name} locally.`, 'success');
    }
  };

  // Body Condition Score verbal lookup
  const getBcsDescription = (score: number) => {
    switch (score) {
      case 1: return 'Very Thin';
      case 2: case 3: return 'Underweight';
      case 4: case 5: return 'Ideal';
      case 6: case 7: return 'Overweight';
      case 8: return 'Obese';
      case 9: return 'Severely Obese';
      default: return 'Ideal';
    }
  };

  // Quick Add Symptoms Handlers
  const handleQuickAddSymptom = (symptom: string) => {
    setSubjectiveText(prev => {
      if (prev.toLowerCase().includes(symptom.toLowerCase())) return prev;
      return prev.trim() + ` Checked positive for ${symptom.toLowerCase()}.`;
    });
    addToast(`Added clinical symptom: ${symptom}`, 'info');
  };

  // Exam Findings NSF Toggles
  const handleToggleNsf = (index: number) => {
    setExamFindings(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          isNsf: !item.isNsf,
          notes: !item.isNsf ? 'No significant findings observed on detailed clinical evaluation.' : ''
        };
      }
      return item;
    }));
  };

  const handleExamNotesChange = (index: number, val: string) => {
    setExamFindings(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, notes: val };
      }
      return item;
    }));
  };

  // Dx Tags Add / Delete Handlers
  const handleAddDxTag = () => {
    if (!newDxTagInput.trim()) return;
    const cleanTag = newDxTagInput.toUpperCase().trim();
    if (!selectedDxTags.includes(cleanTag)) {
      setSelectedDxTags([...selectedDxTags, cleanTag]);
      addToast(`Added diagnostic classification: ${cleanTag}`);
    }
    setNewDxTagInput('');
  };

  const handleRemoveDxTag = (tagToRemove: string) => {
    setSelectedDxTags(selectedDxTags.filter(t => t !== tagToRemove));
    addToast(`Removed classification: ${tagToRemove}`, 'warn');
  };

  // Medication Prescription Inline Add / Delete
  const handleAddNewMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) {
      addToast('Medication name is required.', 'warn');
      return;
    }
    const rxId = `rx-${Date.now()}`;
    const newRx: Prescription = {
      id: rxId,
      medicationName: newMedName,
      dosage: newMedDose || 'As directed',
      frequency: newMedFreq || 'SID',
      duration: newMedDur || '5 days'
    };
    
    if (showMedPrice) {
      const parsedPrice = parseFloat(newMedPrice);
      setPrescriptionPrices(prev => ({
        ...prev,
        [rxId]: isNaN(parsedPrice) ? 35.00 : parsedPrice
      }));
    }

    setPrescriptions([...prescriptions, newRx]);
    addToast(`Prescribed: ${newMedName} ($${showMedPrice ? parseFloat(newMedPrice).toFixed(2) : '0.00'})`);
    setNewMedName('');
    setNewMedDose('');
    setNewMedFreq('');
    setNewMedDur('');
    setMedSearchQuery('');
    setIsMedDropdownOpen(false);
  };

  const handleRemovePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
    setPrescriptionPrices(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    addToast('Medication prescription removed.', 'warn');
  };

  // Treatment handlers
  const handleAddNewTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxtName.trim()) {
      addToast('Treatment/Procedure name is required.', 'warn');
      return;
    }
    const txId = `tx-${Date.now()}`;
    const newTx: Treatment = {
      id: txId,
      name: newTxtName,
      dosageOrRoute: newTxtRoute || 'Direct',
      notes: newTxtNotes || 'Standard procedure',
      status: 'PENDING',
      administeredBy: loggedInStaff?.id || 'staff-dvm-1',
      dateTime: new Date().toISOString()
    };

    if (showTxtPrice) {
      const parsedPrice = parseFloat(newTxtPrice);
      setTreatmentPrices(prev => ({
        ...prev,
        [txId]: isNaN(parsedPrice) ? 85.00 : parsedPrice
      }));
    }

    setTreatments([...treatments, newTx]);
    addToast(`Scheduled treatment: ${newTxtName} ($${showTxtPrice ? parseFloat(newTxtPrice).toFixed(2) : '0.00'})`, 'success');
    setNewTxtName('');
    setNewTxtRoute('');
    setNewTxtNotes('');
    setTxtSearchQuery('');
    setIsTxtDropdownOpen(false);
  };

  const handleToggleTreatmentStatus = (id: string) => {
    setTreatments(prev => prev.map(tx => {
      if (tx.id === id) {
        const nextStatus = tx.status === 'PENDING' ? 'ADMINISTERED' : 'PENDING';
        if (nextStatus === 'ADMINISTERED') {
          addToast(`Marked ${tx.name} as Administered! Ready for Billing.`, 'success');
        } else {
          addToast(`Marked ${tx.name} as Pending.`, 'info');
        }
        return { ...tx, status: nextStatus };
      }
      return tx;
    }));
  };

  const handleRemoveTreatment = (id: string) => {
    setTreatments(treatments.filter(t => t.id !== id));
    setTreatmentPrices(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    addToast('Treatment removed.', 'warn');
  };

  // AI SOAP Generator (Populate main sheet with generated voice recorder details)
  const handleGenerateAndPopulateSoap = () => {
    const petName = activeQueueItem?.pet.name || 'Max';
    const ownerName = activeQueueItem?.client?.name || 'Sarah Johnson';
    const petWeight = activeQueueItem?.pet.weight?.toString() || '32.4';
    
    setSubjectiveText(
      `${petName} presented today with a history of localized scratching and irritation. Per owner ${ownerName}, activity levels are normal directly within the home, with appetite remaining good.`
    );
    setTempF('101.4');
    setHrBpm(activeQueueItem?.pet.species === 'Cat' ? '135' : activeQueueItem?.pet.species === 'Rabbit' ? '180' : '92');
    setRrBpm(activeQueueItem?.pet.species === 'Cat' ? '28' : activeQueueItem?.pet.species === 'Rabbit' ? '42' : '26');
    setWeightKg(petWeight);
    setBcsScore(5);
    
    // Update ears/eyes description with simulated AI observation
    setExamFindings(prev => prev.map(item => {
      if (item.system === 'Ears / Eyes') {
        return { ...item, isNsf: false, notes: `${petName}'s ear canal displays mild to moderate erythema; discharge is currently minimal, waxy brown. Left otoscopic evaluation checks stable.` };
      }
      return item;
    }));

    setSelectedDxTags(['OTITIS EXTERNA', 'PINNA ERYTHEMA']);
    setAssessmentText(
      `Otitis externa localized to left external ear pinna for ${petName}. No clinical indication of deep ear canal swelling. Excellent prognosis expected under topical care.`
    );

    const generatedMed: Prescription = {
      id: `rx-gen-${Date.now()}`,
      medicationName: 'Mometamax Otic Drops',
      dosage: '4 drops AU',
      frequency: 'BID (Twice Daily)',
      duration: '7 Days'
    };

    setPrescriptions(prev => {
      if (prev.some(p => p.medicationName.includes('Mometamax'))) return prev;
      return [generatedMed, ...prev];
    });

    setPlanSummaryText(
      `Avoid swimming or bath water entry in ears for ${petName} during recovery. Follow up cytological review in 1 week if signs persist.`
    );

    addToast(`AI Scribe metrics populated into active EHR note for ${petName}!`, 'success');
    setShowVoicePanel(false);
  };

  return (
    <div className="relative min-h-screen pb-24" id="medical-records-dashboard-view">
      
      {/* Dynamic Toast Stream Popups */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`p-3.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 transition-all duration-300 transform translate-x-0 ${
              t.type === 'success' ? 'bg-[#00647c] text-white border-[#004e61]' :
              t.type === 'warn' ? 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]/30' :
              'bg-[#e6eeff] text-[#0d1c2e] border-[#d5e3fc]'
            }`}
          >
            {t.type === 'success' && <CheckCircle className="w-4.5 h-4.5 shrink-0" />}
            {t.type === 'warn' && <AlertTriangle className="w-4.5 h-4.5 shrink-0" />}
            {t.type === 'info' && <Sparkles className="w-4.5 h-4.5 shrink-0" />}
            <div>{t.message}</div>
          </div>
        ))}
      </div>

      {/* Active Appointment Patients Selector Card */}
      <div className="bg-[#0b1329] border border-[#1e293b] rounded-xl p-4.5 mb-6 shadow-md" id="clinical-queue-pet-selector">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2d3a4f]">
          <div className="flex items-center gap-2 font-sans">
            <Users className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
              Clinical Appointment Queue (Select Active EHR)
            </span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 font-extrabold px-2.5 py-0.5 rounded-full font-mono uppercase border border-slate-700">
            {appointmentQueue.length} Active Patients
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {appointmentQueue.map((item) => {
            const isSelected = item.id === selectedQueueId;
            const speciesEmoji = item.pet.species === 'Cat' ? '🐱' : item.pet.species === 'Rabbit' ? '🐰' : item.pet.species === 'Bird' ? '🦜' : '🐶';
            
            return (
              <button
                key={item.id}
                id={`queue-pet-button-${item.pet.id}`}
                onClick={() => {
                  setSelectedQueueId(item.id);
                  addToast(`Loaded diagnostic chart for ${item.pet.name}`, 'info');
                }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border text-left min-w-[200px] shrink-0 ${
                  isSelected
                    ? 'bg-[#00647c] border-[#0092b3] text-white shadow-lg scale-[1.01]'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center font-bold text-base border border-slate-700 shrink-0">
                  {speciesEmoji}
                </div>
                <div className="overflow-hidden">
                  <div className="font-extrabold text-xs flex items-center gap-1.5">
                    <span className="truncate">{item.pet.name}</span>
                    <span className={`text-[8px] px-1.5 py-0.2 font-black rounded uppercase ${
                      item.pet.status === 'Checked In' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      item.pet.status === 'In Treatment' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}>
                      {item.pet.status}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-80 truncate font-mono mt-0.5 text-slate-400">
                    Owner: {item.client?.name || 'Unknown Owner'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Embedded Navbar Panel - Unique Header for Selected Medical Record Editor */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4" id="active-pet-details-header">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#00647c]/10 text-[#00647c] rounded-xl flex items-center justify-center font-bold text-lg border border-[#00647c]/20">
            {activeQueueItem?.pet.species === 'Cat' ? '🐱' : activeQueueItem?.pet.species === 'Rabbit' ? '🐰' : activeQueueItem?.pet.species === 'Bird' ? '🦜' : '🐶'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-base font-extrabold text-[#0d1c2e] font-sans">
                {activeQueueItem?.pet.name || 'Unknown Patient'}
              </h2>
              <span className="text-[10px] bg-slate-100 text-[#3e484d] font-bold px-2 py-0.5 rounded font-mono uppercase border border-slate-200">
                {activeQueueItem?.pet.breed} • {activeQueueItem?.pet.age} • {activeQueueItem?.pet.gender}
              </span>
              {activeQueueItem?.pet.alertAllergies && activeQueueItem.pet.alertAllergies.length > 0 && (
                <span className="text-[9px] bg-red-100/80 text-red-700 font-extrabold px-2 py-0.5 rounded uppercase border border-red-200 flex items-center gap-1 animate-pulse">
                  ⚠️ Allergies: {activeQueueItem.pet.alertAllergies.join(', ')}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-[#545d62] font-medium">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Owner: <strong className="text-[#0d1c2e] font-bold">{activeQueueItem?.client?.name || 'Sarah Johnson'}</strong>
              </span>
              <span className="hidden md:inline text-slate-300">|</span>
              <span className="flex items-center gap-1 text-primary">
                <Calendar className="w-3.5 h-3.5 text-[#00647c]/70" />
                Reason: <strong className="text-[#00647c]/90 font-bold">{activeQueueItem?.appointment?.reason || 'Clinical Checkup'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Sub Header actions: State selector and AI Assist Launcher */}
        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#e6eeff] border border-[#bdc8ce] rounded-lg">
            <span className={`w-2.5 h-2.5 rounded-full ${
              patientStatus === 'Completed' ? 'bg-emerald-500' :
              patientStatus === 'Pending Lab' ? 'bg-amber-500' : 'bg-[#007f9d] animate-pulse'
            }`} />
            <select 
              value={patientStatus} 
              onChange={(e) => {
                setPatientStatus(e.target.value as any);
                addToast(`Record status transitioned to ${e.target.value}`);
              }}
              className="bg-transparent border-none text-xs font-bold text-[#0d1c2e] focus:ring-0 p-0 cursor-pointer outline-none font-sans"
            >
              <option value="In Progress">In Progress</option>
              <option value="Pending Lab">Pending Lab</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <button
            onClick={() => {
              setShowVoicePanel(true);
              addToast('AI Assist active. Dictate notes to auto-format SOAP sections.', 'info');
            }}
            className="bg-[#00647c] hover:bg-[#004e61] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-sm text-xs font-bold leading-none select-none cursor-pointer border border-[#004e61]"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>AI Assist</span>
          </button>
        </div>
      </div>

      {/* Main Medical Sheet Grid */}
      <div className="space-y-6">
        
        {/* SECTION 1: SUBJECTIVE (Wide layout aligned with mockup) */}
        <section className="bg-white border border-[#bdc8ce] rounded-xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold flex items-center gap-2 text-[#00647c] uppercase tracking-wide">
              <FileSpreadsheet className="w-4 h-4 text-[#00647c]" />
              Subjective
            </h3>
            <span className="text-[10px] text-slate-400 font-bold font-mono uppercase bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              Auto-saved state
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#3e484d] mb-2 leading-none">
                Chief Complaint, Daily Routine, and History
              </label>
              <textarea
                value={subjectiveText}
                onChange={(e) => setSubjectiveText(e.target.value)}
                rows={4}
                className="w-full text-xs p-3 border border-[#bdc8ce] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00647c]/10 focus:border-[#00647c] transition-all bg-slate-50/20 font-mono leading-relaxed"
                placeholder="Describe patient's history and key concerns..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="text-[9px] font-black text-[#545d62] uppercase tracking-widest font-mono">
                Quick Add Symptoms:
              </span>
              {['Vomiting', 'Lethargy', 'Diarrhea', 'Coughing', 'Itching', 'Shaking'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleQuickAddSymptom(sym)}
                  className="px-2.5 py-1 rounded-full border border-[#00647c]/20 hover:border-[#00647c] text-[#00647c] text-[10px] font-bold hover:bg-[#00647c]/5 transition-all cursor-pointer"
                >
                  + {sym}
                </button>
              ))}

              <div className="flex items-center gap-2 ml-auto shrink-0 bg-slate-100/60 p-1.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-[#545d62] font-semibold">Symptom Duration:</span>
                <input
                  type="text"
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  placeholder="e.g. 3 days"
                  className="w-24 px-2 py-0.5 border border-[#bdc8ce] rounded text-xs bg-white text-right font-bold text-[#0d1c2e] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2 Column subgrid: OBJECTIVE vs ASSESSMENT & PLAN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Column 1: OBJECTIVE metrics card */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white border border-[#bdc8ce] rounded-xl p-6 shadow-2xs">
              <h3 className="text-sm font-extrabold flex items-center gap-2 text-[#00647c] uppercase tracking-wide border-b border-slate-100 pb-3 mb-6">
                <Activity className="w-4 h-4 text-[#00647c]" />
                Objective Vitals &amp; Lab Parameters
              </h3>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-3.5 bg-[#e6eeff] rounded-xl border border-[#bdc8ce]/40 flex flex-col justify-between">
                  <label className="text-[9px] font-black text-[#6e797e] uppercase tracking-wider mb-1 font-mono">
                    Temp (°F)
                  </label>
                  <input
                    type="text"
                    value={tempF}
                    onChange={(e) => setTempF(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-lg font-extrabold text-[#0d1c2e] focus:ring-0 outline-none font-mono"
                  />
                </div>

                <div className="p-3.5 bg-[#e6eeff] rounded-xl border border-[#bdc8ce]/40 flex flex-col justify-between">
                  <label className="text-[9px] font-black text-[#6e797e] uppercase tracking-wider mb-1 font-mono">
                    HR (BPM)
                  </label>
                  <input
                    type="text"
                    value={hrBpm}
                    onChange={(e) => setHrBpm(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-lg font-extrabold text-[#0d1c2e] focus:ring-0 outline-none font-mono"
                  />
                </div>

                <div className="p-3.5 bg-[#e6eeff] rounded-xl border border-[#bdc8ce]/40 flex flex-col justify-between">
                  <label className="text-[9px] font-black text-[#6e797e] uppercase tracking-wider mb-1 font-mono">
                    RR (BPM)
                  </label>
                  <input
                    type="text"
                    value={rrBpm}
                    onChange={(e) => setRrBpm(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-lg font-extrabold text-[#0d1c2e] focus:ring-0 outline-none font-mono"
                  />
                </div>

                <div className="p-3.5 bg-[#e6eeff] rounded-xl border border-[#bdc8ce]/40 flex flex-col justify-between">
                  <label className="text-[9px] font-black text-[#6e797e] uppercase tracking-wider mb-1 font-mono">
                    Weight (kg)
                  </label>
                  <input
                    type="text"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-lg font-extrabold text-[#0d1c2e] focus:ring-0 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Body Condition Score Selector */}
              <div className="mb-8 p-4 bg-slate-50/60 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-[#3e484d] font-sans">
                    Body Condition Score (1 - 9 Standard)
                  </label>
                  <span className="text-xs font-extrabold text-[#00647c] bg-[#00647c]/10 px-3 py-1 rounded-full border border-[#00647c]/25 select-none font-mono">
                    Score: {bcsScore} • {getBcsDescription(bcsScore)}
                  </span>
                </div>
                
                {/* 1 to 9 interactive block items */}
                <div className="flex gap-1.5" id="bcs-selector-matrix">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((score) => {
                    const isSelected = bcsScore === score;
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => {
                          setBcsScore(score);
                          addToast(`BCS set to ${score} - ${getBcsDescription(score)}`, 'info');
                        }}
                        className={`h-9 flex-1 rounded text-xs font-extrabold transition-all duration-155 border cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[#00647c] text-white border-[#004e61] shadow-inner scale-[1.05]'
                            : 'bg-white hover:bg-slate-100 text-[#3e484d] border-[#bdc8ce]/60'
                        }`}
                      >
                        {score}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Physical Exam Findings Rows */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide border-b border-slate-200 pb-2 mb-3">
                  Physical Examination Status
                </label>

                <div className="space-y-3.5">
                  {examFindings.map((finding, idx) => (
                    <div 
                      key={finding.system} 
                      className="grid grid-cols-12 gap-3 items-center p-2.5 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                    >
                      {/* Name of clinical system */}
                      <div className="col-span-4">
                        <span className="text-xs font-bold text-[#0d1c2e] leading-none">
                          {finding.system}
                        </span>
                      </div>

                      {/* NSF Toggle switch */}
                      <div className="col-span-2.5 flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={finding.isNsf}
                            onChange={() => handleToggleNsf(idx)}
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00647c]" />
                          <span className={`ml-2 text-[10px] font-black uppercase font-mono ${
                            finding.isNsf ? 'text-[#00647c]' : 'text-slate-400'
                          }`}>
                            NSF
                          </span>
                        </label>
                      </div>

                      {/* Custom Specific Input Note context field */}
                      <div className="col-span-5.5">
                        <input
                          type="text"
                          value={finding.notes}
                          onChange={(e) => handleExamNotesChange(idx, e.target.value)}
                          placeholder="No specific observations..."
                          className={`w-full text-xs px-3 py-1.5 border rounded-lg focus:outline-none font-mono transition-colors ${
                            finding.isNsf 
                              ? 'bg-slate-50 border-slate-200 text-slate-500 italic text-[11px]' 
                              : 'bg-white border-red-300 focus:border-[#00647c] text-[#0d1c2e] font-semibold'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Column 2: ASSESSMENT and PLAN widgets */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* ASSESSMENT Block card */}
            <section className="bg-white border border-[#bdc8ce] rounded-xl p-6 shadow-2xs">
              <h3 className="text-sm font-extrabold flex items-center gap-2 text-[#00647c] uppercase tracking-wide mb-4">
                <Bookmark className="w-4 h-4 text-[#00647c]" />
                Assessment
              </h3>

              {/* Tag Editor widgets */}
              <div className="mb-4 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
                <label className="block text-[9px] font-black text-[#545d62] uppercase tracking-wider mb-2 font-mono">
                  Active Clinical Diagnosis Codes
                </label>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedDxTags.map(tag => (
                    <span 
                      key={tag} 
                      className="bg-[#00647c]/10 text-[#00647c] text-[10px] font-black px-2.5 py-1 rounded-lg border border-[#00647c]/25 flex items-center gap-1.5 select-none font-mono"
                    >
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveDxTag(tag)}
                        className="hover:bg-[#00647c]/20 text-xs font-black p-0.5 rounded leading-none text-red-700"
                        title="Delete code"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {/* Inline form to append tags */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newDxTagInput}
                    onChange={(e) => setNewDxTagInput(e.target.value)}
                    placeholder="Enter diagnosis (e.g. ALLERGIES)"
                    className="w-full text-xs p-2.5 bg-white border border-[#bdc8ce] rounded-lg focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDxTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddDxTag}
                    className="px-3 py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Add dx
                  </button>
                </div>
              </div>

              {/* Text evaluation summation */}
              <div>
                <label className="block text-xs font-bold text-[#3e484d] mb-2 leading-none">
                  Differential Evaluation &amp; Diagnostics Plan Summary
                </label>
                <textarea
                  value={assessmentText}
                  onChange={(e) => setAssessmentText(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 border border-[#bdc8ce] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00647c]/10 focus:border-[#00647c] transition-all bg-slate-50/20 font-mono leading-relaxed"
                  placeholder="Clinical diagnostic descriptions..."
                />
              </div>
            </section>

            {/* PLAN Block Card */}
            <section className="bg-white border border-[#bdc8ce] rounded-xl p-6 shadow-2xs">
              <h3 className="text-sm font-extrabold flex items-center gap-2 text-[#00647c] uppercase tracking-wide mb-4">
                <Sliders className="w-4 h-4 text-[#00647c]" />
                Plan, Treatments &amp; Prescriptions
              </h3>

              {/* In-Clinic Treatments & Clinical Procedures */}
              <div className="space-y-4 mb-6 border-b border-dashed border-slate-200 pb-5">
                <div className="flex items-center justify-between">
                  <label className="block text-[9px] font-black text-[#545d62] uppercase tracking-wider font-mono">
                    🏥 In-Clinic Treatments &amp; Procedures Administered
                  </label>
                  <span className="text-[9px] font-bold text-slate-400">
                    Click status to toggle execution
                  </span>
                </div>

                {treatments.length === 0 ? (
                  <div className="p-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400 font-medium">
                    No active in-clinic treatments ordered. Use form below to schedule or record.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {treatments.map((tx) => (
                      <div 
                        key={tx.id} 
                        className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                          tx.status === 'ADMINISTERED' 
                            ? 'bg-emerald-50/40 border-emerald-250 pb-2.5' 
                            : 'bg-amber-50/40 border-amber-250 pb-2.5'
                        }`}
                      >
                        <div className="overflow-hidden pr-2 flex-grow">
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-extrabold text-[#00647c] truncate flex items-center gap-1.5">
                              <span>{tx.name}</span>
                              {treatmentPrices[tx.id] !== undefined && (
                                <span className="text-[#00647c] font-mono text-[9px] font-black px-1.5 py-0.2 bg-[#00647c]/5 border border-[#00647c]/10 rounded">
                                  ${treatmentPrices[tx.id].toFixed(2)}
                                </span>
                              )}
                            </h5>
                            <button
                              type="button"
                              onClick={() => handleToggleTreatmentStatus(tx.id)}
                              className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider font-mono cursor-pointer transition-all border ${
                                tx.status === 'ADMINISTERED'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                              }`}
                              title="Click to toggle status"
                            >
                              {tx.status}
                            </button>
                          </div>
                          <p className="text-[10px] text-[#545d62] font-semibold mt-1 flex flex-wrap items-center gap-1.5 leading-none">
                            {tx.dosageOrRoute && <span>Route/Method: <strong className="text-[#0d1c2e] font-bold">{tx.dosageOrRoute}</strong></span>}
                            {tx.dosageOrRoute && tx.notes && <span>•</span>}
                            {tx.notes && <span className="italic">Notes: "{tx.notes}"</span>}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTreatment(tx.id)}
                          className="p-1.5 text-[#ba1a1a] hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0"
                          title="Remove treatment procedure"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline form to record treatment with search box selector */}
                <div className="bg-[#eff4ff]/40 p-3.5 rounded-xl border border-[#dce9ff] space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-[#545d62] uppercase tracking-widest font-mono">
                      Log/Order In-Clinic Treatment Form
                    </span>
                    <span className="text-[8px] font-bold text-[#00647c] font-mono bg-[#00647c]/10 px-2 py-0.5 rounded">
                      Interactive Catalog Search
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* Search box Selector widget */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Search className="h-3 w-3 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={txtSearchQuery}
                        onChange={(e) => {
                          setTxtSearchQuery(e.target.value);
                          setIsTxtDropdownOpen(true);
                          setNewTxtName(e.target.value); // Custom entry
                        }}
                        onFocus={() => setIsTxtDropdownOpen(true)}
                        placeholder="Search standard treatment catalog..."
                        className="w-full text-xs pl-7 p-2 border border-[#bdc8ce] rounded-lg focus:outline-none bg-white font-sans text-[#0d1c2e] placeholder-slate-400 shadow-3xs"
                      />
                      
                      {isTxtDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100">
                          {(() => {
                            const filtered = TREATMENT_CATALOG.filter(item => 
                              item.name.toLowerCase().includes(txtSearchQuery.toLowerCase()) ||
                              item.description.toLowerCase().includes(txtSearchQuery.toLowerCase())
                            );
                            
                            if (filtered.length === 0) {
                              return (
                                <div 
                                  className="p-3 text-xs text-slate-500 cursor-pointer hover:bg-slate-50 font-medium"
                                  onClick={() => {
                                    setNewTxtName(txtSearchQuery);
                                    setIsTxtDropdownOpen(false);
                                  }}
                                >
                                  No matches. Add Custom: <strong className="text-[#00647c]">"{txtSearchQuery}"</strong>
                                </div>
                              );
                            }
                            
                            return filtered.map((item, idx) => (
                              <div 
                                key={idx}
                                className="p-2.5 hover:bg-slate-50 cursor-pointer text-left transition-colors"
                                onClick={() => {
                                  setNewTxtName(item.name);
                                  setNewTxtRoute(item.route);
                                  setNewTxtNotes(item.description);
                                  setNewTxtPrice(item.price.toFixed(2));
                                  setTxtSearchQuery(item.name);
                                  setIsTxtDropdownOpen(false);
                                }}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <span className="text-xs font-extrabold text-[#0d1c2e]">{item.name}</span>
                                  <span className="text-[11px] font-black text-[#00647c] bg-[#00647c]/5 px-1.5 py-0.5 rounded font-mono shrink-0">${item.price.toFixed(2)}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{item.description}</p>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>

                    {isTxtDropdownOpen && (
                      <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsTxtDropdownOpen(false)} />
                    )}

                    {/* Pre-filled parameters / Customize route and notes */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[8px] font-black text-slate-400 font-mono uppercase">Route / Parameter</label>
                        <input
                          type="text"
                          value={newTxtRoute}
                          onChange={(e) => setNewTxtRoute(e.target.value)}
                          placeholder="e.g. SQ, AU, IV"
                          className="w-full text-xs p-2 border border-[#bdc8ce] rounded-lg focus:outline-none bg-white font-mono text-[#0d1c2e]"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[8px] font-black text-slate-400 font-mono uppercase">Procedural Notes</label>
                        <input
                          type="text"
                          value={newTxtNotes}
                          onChange={(e) => setNewTxtNotes(e.target.value)}
                          placeholder="e.g. Evaluated bilateral wash"
                          className="w-full text-xs p-2 border border-[#bdc8ce] rounded-lg focus:outline-none bg-white font-mono text-[#0d1c2e]"
                        />
                      </div>
                    </div>

                    {/* Pricing Config switch with responsive toggle */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between transition-all">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="toggleTxtBilling"
                          checked={showTxtPrice}
                          onChange={(e) => setShowTxtPrice(e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#00647c] cursor-pointer"
                        />
                        <label htmlFor="toggleTxtBilling" className="text-[10px] font-black text-slate-600 select-none cursor-pointer uppercase font-mono tracking-tight">
                          Link Price To Billing
                        </label>
                      </div>

                      {showTxtPrice && (
                        <div className="flex items-center gap-1.5 animate-fade-in">
                          <span className="text-[10px] font-extrabold text-[#00647c]">Charge Price:</span>
                          <div className="relative rounded-md shrink-0">
                            <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-[10px] font-extrabold text-slate-450">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={newTxtPrice}
                              onChange={(e) => setNewTxtPrice(e.target.value)}
                              className="w-18 text-[11px] font-black font-mono pl-4 pr-1 py-0.5 bg-white border border-slate-350 rounded text-[#00647c] focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddNewTreatment}
                    className="w-full py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Schedule/Record Treatment
                  </button>
                </div>
              </div>

              {/* Prescriptions Stack */}
              <div className="space-y-4 mb-4">
                <label className="block text-[9px] font-black text-[#545d62] uppercase tracking-wider font-mono">
                  Prescribed Therapy &amp; Pharmacy Orders
                </label>

                {prescriptions.length === 0 ? (
                  <div className="p-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400 font-medium">
                    No active medicines prescribed. Use the form below to dispense.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {prescriptions.map((rx) => (
                      <div 
                        key={rx.id} 
                        className="flex items-center justify-between p-3 bg-white border border-[#bdc8ce]/70 bg-gradient-to-r from-emerald-50/30 to-white rounded-lg"
                      >
                        <div className="overflow-hidden pr-2">
                          <h5 className="text-xs font-extrabold text-[#00647c] truncate flex items-center gap-1.5">
                            <span>{rx.medicationName}</span>
                            {prescriptionPrices[rx.id] !== undefined && (
                              <span className="text-[#00647c] font-mono text-[9px] font-black px-1.5 py-0.2 bg-[#00647c]/5 border border-[#00647c]/10 rounded">
                                ${prescriptionPrices[rx.id].toFixed(2)}
                              </span>
                            )}
                          </h5>
                          <p className="text-[10px] text-[#545d62] font-semibold mt-0.5 truncate gap-1.5 flex flex-wrap items-center">
                            <span>Dose: <strong className="text-[#0d1c2e] font-bold">{rx.dosage}</strong></span>
                            <span>•</span>
                            <span>Freq: <strong className="text-[#0d1c2e] font-bold">{rx.frequency}</strong></span>
                            <span>•</span>
                            <span>Dur: <strong className="text-[#0d1c2e] font-bold">{rx.duration}</strong></span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePrescription(rx.id)}
                          className="p-1.5 text-[#ba1a1a] hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0"
                          title="Cancel drug dispatch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Prescription Inline Input Add workflow with interactive search box selector */}
              <div className="bg-[#e6eeff]/40 p-3.5 rounded-xl border border-[#d5e3fc] space-y-3 relative">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-[#545d62] uppercase tracking-widest font-mono">
                    Dispense New Medication Form
                  </span>
                  <span className="text-[8px] font-bold text-[#00647c] font-mono bg-[#00647c]/10 px-2 py-0.5 rounded">
                    Interactive Rx Search
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Search input field widget */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <Search className="h-3 w-3 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={medSearchQuery}
                      onChange={(e) => {
                        setMedSearchQuery(e.target.value);
                        setIsMedDropdownOpen(true);
                        setNewMedName(e.target.value); // Custom entries permitted
                      }}
                      onFocus={() => setIsMedDropdownOpen(true)}
                      placeholder="Search standard pharmaceuticals catalog..."
                      className="w-full text-xs pl-7 p-2 border border-[#bdc8ce] rounded-lg focus:outline-none bg-white font-sans text-[#0d1c2e] placeholder-slate-400 shadow-3xs"
                    />
                    
                    {isMedDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100 font-sans">
                        {(() => {
                          const filtered = MEDICATION_CATALOG.filter(item => 
                            item.name.toLowerCase().includes(medSearchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(medSearchQuery.toLowerCase())
                          );
                          
                          if (filtered.length === 0) {
                            return (
                              <div 
                                className="p-3 text-xs text-slate-500 cursor-pointer hover:bg-slate-50 font-medium"
                                onClick={() => {
                                  setNewMedName(medSearchQuery);
                                  setIsMedDropdownOpen(false);
                                }}
                              >
                                No matches. Add Custom: <strong className="text-[#00647c]">"{medSearchQuery}"</strong>
                              </div>
                            );
                          }
                          
                          return filtered.map((item, id) => (
                            <div 
                              key={id}
                              className="p-2.5 hover:bg-slate-50 cursor-pointer text-left transition-colors"
                              onClick={() => {
                                setNewMedName(item.name);
                                setNewMedDose(item.dosage);
                                setNewMedFreq(item.frequency);
                                setNewMedDur(item.duration);
                                setNewMedPrice(item.price.toFixed(2));
                                setMedSearchQuery(item.name);
                                setIsMedDropdownOpen(false);
                              }}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-xs font-extrabold text-[#0d1c2e]">{item.name}</span>
                                <span className="text-[11px] font-black text-[#00647c] bg-[#00647c]/5 px-1.5 py-0.5 rounded font-mono shrink-0">${item.price.toFixed(2)}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{item.description}</p>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>

                  {isMedDropdownOpen && (
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsMedDropdownOpen(false)} />
                  )}

                  {/* Parameter Fields */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[8px] font-black text-slate-400 font-mono uppercase">Dosage Size</label>
                      <input
                        type="text"
                        value={newMedDose}
                        onChange={(e) => setNewMedDose(e.target.value)}
                        placeholder="e.g. 1 cap"
                        className="w-full text-xs p-2 border border-[#bdc8ce] rounded-lg focus:outline-none bg-white font-mono text-[#0d1c2e]"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] font-black text-slate-400 font-mono uppercase">Frequency</label>
                      <input
                        type="text"
                        value={newMedFreq}
                        onChange={(e) => setNewMedFreq(e.target.value)}
                        placeholder="e.g. BID"
                        className="w-full text-xs p-2 border border-[#bdc8ce] rounded-lg focus:outline-none bg-white font-mono text-[#0d1c2e]"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] font-black text-slate-400 font-mono uppercase">Duration</label>
                      <input
                        type="text"
                        value={newMedDur}
                        onChange={(e) => setNewMedDur(e.target.value)}
                        placeholder="e.g. 7 days"
                        className="w-full text-xs p-2 border border-[#bdc8ce] rounded-lg focus:outline-none bg-white font-mono text-[#0d1c2e]"
                      />
                    </div>
                  </div>

                  {/* Pricing switch block */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="toggleMedBilling"
                        checked={showMedPrice}
                        onChange={(e) => setShowMedPrice(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#00647c] cursor-pointer"
                      />
                      <label htmlFor="toggleMedBilling" className="text-[10px] font-black text-slate-600 select-none cursor-pointer uppercase font-mono tracking-tight">
                        Link Price To Billing
                      </label>
                    </div>

                    {showMedPrice && (
                      <div className="flex items-center gap-1.5 animate-fade-in">
                        <span className="text-[10px] font-extrabold text-[#00647c]">Charge Price:</span>
                        <div className="relative rounded-md shrink-0">
                          <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-[10px] font-extrabold text-slate-450">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={newMedPrice}
                            onChange={(e) => setNewMedPrice(e.target.value)}
                            className="w-18 text-[11px] font-black font-mono pl-4 pr-1 py-0.5 bg-white border border-slate-350 rounded text-[#00647c] focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddNewMedication}
                  className="w-full py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Prescribed Medicine
                </button>
              </div>

              {/* Text plan summary instructions field */}
              <div className="mt-4">
                <label className="block text-xs font-bold text-[#3e484d] mb-2 leading-none">
                  Operation Care Instructions &amp; Home Rest Restrictions
                </label>
                <textarea
                  value={planSummaryText}
                  onChange={(e) => setPlanSummaryText(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-3 border border-[#bdc8ce] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00647c]/10 focus:border-[#00647c] transition-all bg-slate-50/20 font-mono leading-relaxed"
                  placeholder="Describe treatment followups and home restrictions..."
                />
              </div>

            </section>

            {/* 💉 VACCINATION BOOSTERS Card */}
            <section className="bg-white border border-[#bdc8ce] rounded-xl p-6 shadow-2xs">
              <h3 className="text-sm font-extrabold flex items-center gap-2 text-[#00647c] uppercase tracking-wide mb-4">
                <span className="text-lg">💉</span>
                Immunization &amp; Vaccine Boosters
              </h3>

              {/* Vaccine List */}
              <div className="space-y-3 mb-5">
                {vaccinations.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-dashed border-[#bdc8ce]/60 rounded-xl text-center text-xs text-slate-400 font-medium">
                    No active vaccine boosters recorded for this session. Use the presets or form below to catalog a booster.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {vaccinations.map((vac) => (
                      <div key={vac.id || vac.name} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-3xs hover:bg-slate-50/50 transition-colors">
                        <div>
                          <strong className="text-[#0d1c2e] text-xs font-bold block">{vac.name}</strong>
                          <div className="text-[10px] text-slate-500 font-semibold font-mono mt-0.5">
                            Given: {vac.date} | dose: {vac.dosage || '1.0 mL'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="text-right">
                            <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                              vac.status === 'Administered' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' :
                              vac.status === 'Overdue' ? 'text-red-700 bg-red-50 border border-red-100' :
                              'text-amber-700 bg-amber-50 border border-amber-100'
                            }`}>
                              {vac.status}
                            </span>
                            <div className="text-[9px] text-[#00647c] font-semibold mt-0.5 block font-mono">
                              Due: {vac.nextDueDate}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setVaccinations(vaccinations.filter(v => v.id !== vac.id));
                              addToast(`Removed booster: ${vac.name}`, 'warn');
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0 cursor-pointer"
                            title="Remove booster"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vaccine Quick Presets */}
              <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Quick-Apply Standard Booster Presets
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Rabies Booster', nextY: 3, dose: '1.0 mL' },
                    { name: 'DHPP Core Vaccine', nextY: 1, dose: '1.0 mL' },
                    { name: 'Bordetella Oral', nextY: 1, dose: '1.0 mL' },
                    { name: 'Leptospirosis', nextY: 1, dose: '1.0 mL' }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setNewVacName(preset.name);
                        setNewVacDosage(preset.dose);
                        const today = new Date();
                        setNewVacDate(today.toISOString().split('T')[0]);
                        const due = new Date();
                        due.setFullYear(today.getFullYear() + preset.nextY);
                        setNewVacDueDate(due.toISOString().split('T')[0]);
                        setNewVacStatus('Administered');
                        addToast(`Applied booster preset: ${preset.name}`, 'info');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-705 hover:text-sky-900 text-[10px] font-bold border border-[#bdc8ce]/60 rounded-lg transition-all cursor-pointer shadow-3xs"
                    >
                      + {preset.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vaccine Form Fields */}
              <div className="bg-[#e6eeff]/40 p-3.5 rounded-xl border border-[#d5e3fc] space-y-3">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">
                  Log Immunization Dose
                </div>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newVacName}
                    onChange={(e) => setNewVacName(e.target.value)}
                    placeholder="Vaccine Name (e.g. Rabies 3-Year)"
                    className="w-full text-xs p-2 border border-[#bdc8ce] rounded-lg focus:outline-none bg-white font-sans text-[#0d1c2e]"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 font-mono uppercase">Administered</label>
                      <input
                        type="date"
                        value={newVacDate}
                        onChange={(e) => setNewVacDate(e.target.value)}
                        className="w-full text-xs p-1.5 border border-[#bdc8ce] rounded-lg focus:outline-none bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 font-mono uppercase">Next Due Date</label>
                      <input
                        type="date"
                        value={newVacDueDate}
                        onChange={(e) => setNewVacDueDate(e.target.value)}
                        className="w-full text-xs p-1.5 border border-[#bdc8ce] rounded-lg focus:outline-none bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 font-mono uppercase">Dosage</label>
                      <input
                        type="text"
                        value={newVacDosage}
                        onChange={(e) => setNewVacDosage(e.target.value)}
                        placeholder="1.0 mL"
                        className="w-full text-xs p-2 border border-[#bdc8ce] rounded-lg focus:outline-none bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 font-mono uppercase">Clinical Status</label>
                      <select 
                        value={newVacStatus}
                        onChange={(e) => setNewVacStatus(e.target.value as any)}
                        className="w-full text-xs p-2 bg-white border border-[#bdc8ce] rounded-lg focus:outline-none"
                      >
                        <option value="Administered">Administered</option>
                        <option value="Due">Due</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!newVacName.trim()) {
                      addToast('Please enter a vaccine name.', 'warn');
                      return;
                    }
                    const updatedVac: VaccineRecord = {
                      id: `vac-${Date.now()}`,
                      name: newVacName,
                      date: newVacDate,
                      nextDueDate: newVacDueDate,
                      dosage: newVacDosage || '1.0 mL',
                      status: newVacStatus
                    };
                    setVaccinations([...vaccinations, updatedVac]);
                    addToast(`Recorded administered vaccine: ${newVacName}`, 'success');
                    setNewVacName('');
                  }}
                  className="w-full py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Vaccine Booster
                </button>
              </div>
            </section>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* AI Voice Recorder Drawer Layer Slide-out Panel (Meticulous mock alignment) */}
      {/* ========================================================================= */}
      {showVoicePanel && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-3xs flex justify-end">
          
          {/* Overlay backdrop */}
          <div 
            className="absolute inset-0"
            onClick={() => setShowVoicePanel(false)}
          />

          {/* Drawer content component */}
          <div className="relative w-full max-w-lg h-full bg-[#1E293B] text-slate-100 flex flex-col shadow-2xl border-l border-slate-700 animate-slide-in">
            
            {/* 1. Inside Section Floating AI Context cards (Hovering left of drawer) */}
            <div className="absolute top-24 -left-52 w-48 space-y-3.5 hidden md:block z-10 select-none">
              
              <div 
                className="bg-[#065f46] text-white p-3.5 rounded-xl text-[11px] shadow-lg border border-emerald-400/20 transform hover:-translate-x-1 transition-transform cursor-pointer"
                onClick={() => addToast('EHR Interaction verification check complete: safe for mometamax dispense')}
              >
                <div className="font-extrabold flex items-center gap-1.5 mb-1 text-emerald-300 font-sans tracking-tight">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Interaction Check
                </div>
                <p className="text-slate-200/90 leading-relaxed font-medium">Medication interaction check: no conflicts found.</p>
              </div>

              <div 
                className="bg-[#78350f] text-white p-3.5 rounded-xl text-[11px] shadow-lg border border-amber-400/20 transform hover:-translate-x-1 transition-transform cursor-pointer"
                onClick={() => addToast('Vitals database audit: complete')}
              >
                <div className="font-extrabold flex items-center gap-1.5 mb-1 text-amber-300 font-sans tracking-tight">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Missing Data
                </div>
                <p className="text-slate-200/90 leading-relaxed font-medium">Auto scribe warning: missing dental health score logs.</p>
              </div>

              <div 
                className="bg-[#1e3a8a] text-white p-3.5 rounded-xl text-[11px] shadow-lg border border-blue-400/20 transform hover:-translate-x-1 transition-transform cursor-pointer"
                onClick={() => addToast('Loaded matching case from history')}
              >
                <div className="font-extrabold flex items-center gap-1.5 mb-1 text-blue-300 font-sans tracking-tight">
                  <Bookmark className="w-4 h-4 text-blue-400" />
                  Patient History
                </div>
                <p className="text-slate-200/90 leading-relaxed font-medium">Similar case: Max (Jan 2025) — same historical diagnosis.</p>
              </div>

            </div>

            {/* 2. Scribe panel header with mic pulsar */}
            <div className="p-6 border-b border-slate-700 bg-slate-800/60 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center shrink-0">
                    <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
                      <Mic className={`w-4 h-4 ${isVoiceRecording ? 'text-red-500' : 'text-slate-400'}`} />
                    </div>
                    {isVoiceRecording && (
                      <span className="absolute inset-0 rounded-full border border-red-500 animate-ping-once opacity-70" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-extrabold text-[#f1f5f9] text-sm leading-none flex items-center gap-1.5 font-sans">
                      VetHub Scribe AI Recorder
                      <span className="bg-sky-500/20 text-sky-300 text-[8px] font-black px-1.5 py-0.5 rounded font-mono">
                        LIVE TRANSCRIPT PRO
                      </span>
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {/* Responsive wave anim bars mimicking live voice capture */}
                      <div className="flex items-end gap-0.5 h-3.5 w-12 shrink-0">
                        <div className={`w-[2.5px] bg-sky-450 bg-sky-400 rounded-xs ${isVoiceRecording ? 'h-4 animate-pulse' : 'h-1'}`} />
                        <div className={`w-[2.5px] bg-sky-450 bg-sky-400 rounded-xs ${isVoiceRecording ? 'h-3.5 animate-pulse' : 'h-1'}`} style={{ animationDelay: '0.15s' }} />
                        <div className={`w-[2.5px] bg-sky-450 bg-sky-400 rounded-xs ${isVoiceRecording ? 'h-4 animate-pulse' : 'h-1'}`} style={{ animationDelay: '0.3s' }} />
                        <div className={`w-[2.5px] bg-sky-450 bg-sky-400 rounded-xs ${isVoiceRecording ? 'h-3 animate-pulse' : 'h-1'}`} style={{ animationDelay: '0.45s' }} />
                        <div className={`w-[2.5px] bg-sky-450 bg-sky-400 rounded-xs ${isVoiceRecording ? 'h-4.5 animate-pulse' : 'h-1'}`} style={{ animationDelay: '0.2s' }} />
                      </div>
                      
                      <span className="text-xs font-bold font-mono text-slate-300">
                        {formatVoiceTime(voiceSeconds)}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowVoicePanel(false)}
                  className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-lg transition-colors border border-slate-650"
                  title="Close AI helper"
                >
                  ✕
                </button>
              </div>

              {/* Language selection dropdown */}
              <div className="flex items-center justify-between bg-slate-800/70 py-2 px-3 rounded-lg border border-slate-700">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                  Input Language Scribe
                </span>
                <select 
                  value={voiceLanguage}
                  onChange={(e) => {
                    setVoiceLanguage(e.target.value);
                    addToast(`Voice language swapped: ${e.target.value}`, 'info');
                  }}
                  className="bg-slate-700 border-none text-xs font-bold text-white rounded p-1 cursor-pointer outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="English">English</option>
                  <option value="Chinese">中文 / Chinese</option>
                  <option value="Spanish">Español / Spanish</option>
                  <option value="German">Deutsch / German</option>
                </select>
              </div>
            </div>

            {/* 3. Transcription streams with simulated timeline highlights */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Real time transcription visual log */}
              <div className="bg-slate-900/60 rounded-xl p-4.5 border border-slate-750 space-y-3.5 min-h-[160px]">
                <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    Neural Voice Scribe Feed
                  </span>
                  <span>UTC TIME SYNCED</span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300 font-mono leading-relaxed">
                  <p>
                    <span className="text-slate-500 font-semibold">[00:01]</span> <strong className="text-sky-300">DR. SMITH:</strong> Alright Max, let's inspect these ears carefully. External pinna checks show right side looks mostly clear, but left side looks red.
                  </p>
                  <p>
                    <span className="text-slate-500 font-semibold">[00:15]</span> <strong className="text-sky-300">DR. SMITH:</strong> Noticed mild <span className="text-cyan-300 underline font-bold">erythema</span> in left ear pinna. There is moderate thickness, waxy brown discharge. Body condition score is ideal at five out of nine.
                  </p>
                  <p className="text-slate-500 font-bold tracking-widest uppercase border-y border-slate-800 py-1 text-[10px] text-center">
                    // SECTION BREAK DETECTED: CLINICAL ASSESSMENT
                  </p>
                  <p>
                    <span className="text-slate-500 font-semibold">[00:52]</span> <strong className="text-sky-300">DR. SMITH:</strong> Likely uncomplicated <span className="text-cyan-300 underline font-bold">Otitis Externa</span>. Let's dispense 4 drops Mometamax Otic suspension twice daily for one week. Avoid water exposure.
                  </p>
                  {isVoiceRecording && (
                    <div className="flex items-center gap-1 text-slate-500">
                      <span className="text-sky-300 animate-pulse font-bold">|</span>
                      <span>Scribing live voice...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. SOAP Auto-draft collapse containers */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                  Real-time Neural SOAP Drafter
                </h4>

                {/* Subjective template */}
                <div className="border border-slate-700 rounded-xl bg-slate-900/40 overflow-hidden">
                  <button 
                    onClick={() => setExpandedDraftTab(expandedDraftTab === 'S' ? null : 'S')}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-800/80 text-left text-xs font-bold font-sans text-white hover:bg-slate-750"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-700 text-slate-300 text-[10px] font-extrabold flex items-center justify-center font-mono">S</span>
                      <span>SUBJECTIVE SUMMARY DRAFT</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedDraftTab === 'S' ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedDraftTab === 'S' && (
                    <div className="p-3.5 bg-slate-900/20 text-[11px] text-slate-300 space-y-3 border-t border-slate-750">
                      <p className="leading-relaxed">Patient presenting with ear scratching x 3 days. Activity is BAR, minor lethargy, appetite remains normal. Handled well.</p>
                      <div className="flex gap-2.5 pt-2 border-t border-slate-800">
                        <button 
                          onClick={() => {
                            setSubjectiveText('Max presenting with right ear scratching for 3 days. BAR, activity normal, appetite normal. Handled nicely.');
                            addToast('S subjective draft imported');
                          }}
                          className="text-sky-400 font-extrabold hover:underline cursor-pointer"
                        >
                          Accept
                        </button>
                        <button className="text-slate-500 hover:text-slate-300 font-bold">Edit</button>
                        <button className="text-red-400/70 hover:text-red-400">Reject</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Objective draft */}
                <div className="border border-slate-700 rounded-xl bg-slate-900/40 overflow-hidden">
                  <button 
                    onClick={() => setExpandedDraftTab(expandedDraftTab === 'O' ? null : 'O')}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-800/80 text-left text-xs font-bold font-sans text-white hover:bg-slate-750"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-700 text-slate-300 text-[10px] font-extrabold flex items-center justify-center font-mono">O</span>
                      <span>OBJECTIVE VITALS &amp; EXAM DRAFT</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedDraftTab === 'O' ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedDraftTab === 'O' && (
                    <div className="p-3.5 bg-slate-900/20 text-[11px] text-slate-300 space-y-3 border-t border-slate-750">
                      <p className="leading-relaxed">Otoscopic exam: Mild erythema present left pinna with moderate cream discharge. Body condition score ideal (5/9).</p>
                      <div className="flex gap-2.5 pt-2 border-t border-slate-800">
                        <button 
                          onClick={() => {
                            setBcsScore(5);
                            setTempF('101.4');
                            addToast('Objective draft parameters imported');
                          }}
                          className="text-sky-400 font-extrabold hover:underline cursor-pointer"
                        >
                          Accept
                        </button>
                        <button className="text-slate-500 hover:text-slate-300 font-bold">Edit</button>
                        <button className="text-red-400/70 hover:text-red-400">Reject</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Assessment draft */}
                <div className="border border-slate-700 rounded-xl bg-slate-900/40 overflow-hidden">
                  <button 
                    onClick={() => setExpandedDraftTab(expandedDraftTab === 'A' ? null : 'A')}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-800/80 text-left text-xs font-bold font-sans text-white hover:bg-slate-750"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-700 text-slate-300 text-[10px] font-extrabold flex items-center justify-center font-mono">A</span>
                      <span>ASSESSMENT SPECIFICATIONS DRAFT</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedDraftTab === 'A' ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedDraftTab === 'A' && (
                    <div className="p-3.5 bg-slate-900/20 text-[11px] text-slate-300 space-y-3 border-t border-slate-750">
                      <p className="leading-relaxed">Otitis Externa - localized left side.</p>
                      <div className="flex gap-2.5 pt-2 border-t border-slate-800">
                        <button 
                          onClick={() => {
                            setSelectedDxTags(['OTITIS EXTERNA']);
                            addToast('Assessment diagnosis imported');
                          }}
                          className="text-sky-400 font-extrabold hover:underline cursor-pointer"
                        >
                          Accept
                        </button>
                        <button className="text-slate-500 hover:text-slate-300 font-bold">Edit</button>
                        <button className="text-red-400/70 hover:text-red-400">Reject</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Plan draft */}
                <div className="border border-slate-700 rounded-xl bg-slate-900/40 overflow-hidden">
                  <button 
                    onClick={() => setExpandedDraftTab(expandedDraftTab === 'P' ? null : 'P')}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-800/80 text-left text-xs font-bold font-sans text-white hover:bg-slate-750"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-700 text-slate-300 text-[10px] font-extrabold flex items-center justify-center font-mono">P</span>
                      <span>PLAN &amp; PRESCRIPTION DISPATCH DRAFT</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedDraftTab === 'P' ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedDraftTab === 'P' && (
                    <div className="p-3.5 bg-slate-900/20 text-[11px] text-slate-300 space-y-3 border-t border-slate-750">
                      <p className="leading-relaxed">Mometamax Otic suspension drops BID for 7 days. Limit swimming and bath play during recovery.</p>
                      <div className="flex gap-2.5 pt-2 border-t border-slate-800">
                        <button 
                          onClick={() => {
                            setPlanSummaryText('Avoid bath play or swimming during mometamax ear recovery.');
                            addToast('Plan actions imported');
                          }}
                          className="text-sky-400 font-extrabold hover:underline cursor-pointer"
                        >
                          Accept
                        </button>
                        <button className="text-slate-500 hover:text-slate-300 font-bold">Edit</button>
                        <button className="text-red-400/70 hover:text-red-400">Reject</button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* 5. Recorder controls and Generate action */}
            <div className="p-6 border-t border-slate-700 bg-slate-800/90 backdrop-blur-md">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={() => {
                    setIsVoiceRecording(false);
                    addToast('AI Live Transcriber listening paused', 'warn');
                  }}
                  className="py-2.5 rounded-lg bg-slate-700 hover:bg-slate-650 font-bold text-xs flex items-center justify-center gap-2 border border-slate-600 cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause Scribe
                </button>
                <button 
                  onClick={() => {
                    setIsVoiceRecording(true);
                    addToast('AI Live Transcriber listening resumed', 'info');
                  }}
                  className="py-2.5 rounded-lg bg-slate-700 hover:bg-slate-650 font-bold text-xs flex items-center justify-center gap-2 border border-slate-600 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> Resume
                </button>
              </div>

              <button 
                onClick={handleGenerateAndPopulateSoap}
                className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-900/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                <span>Generate SOAP &amp; Populate</span>
              </button>

              <div className="text-center mt-3">
                <button 
                  onClick={() => {
                    setVoiceSeconds(0);
                    setIsVoiceRecording(false);
                    addToast('Scribe feed reset.', 'warn');
                  }}
                  className="text-red-400 text-[10px] font-bold hover:underline"
                >
                  Discard Dictation &amp; Restart
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* Sticky Bottom Operations Toolbar footer matches mockup dimensions precisely */}
      {/* ========================================================================= */}
      <footer className="fixed bottom-0 right-0 w-full lg:w-[calc(100%-16rem)] h-20 bg-white border-t border-[#bdc8ce]/60 flex items-center justify-between px-6 md:px-8 z-45 shadow-lg">
        
        {/* Left Side: Database auto-saved sync confirmation indicator */}
        <div className="flex items-center gap-2 text-[#0d1c2e] font-sans">
          <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-extrabold text-[#545d62] font-sans">
            All clinical changes auto-saved
          </span>
        </div>

        {/* Right Side Action controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSaveCurrentRecord(false)}
            className="px-5 py-2.5 text-[#3e484d] hover:bg-slate-100 text-xs font-bold tracking-tight rounded-lg cursor-pointer"
          >
            Save Draft
          </button>

          <button
            onClick={() => {
              window.print();
            }}
            className="px-4 py-2.5 border border-[#bdc8ce] hover:border-slate-400 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print</span>
          </button>

          <button
            onClick={() => handleSaveCurrentRecord(true)}
            className="px-7 py-2.5 bg-[#00647c] hover:bg-[#004e61] text-on-primary text-xs font-black rounded-lg flex items-center gap-2 shadow-md shadow-[#00647c]/10 hover:shadow-[#00647c]/20 transition-all select-none active:scale-[0.98] cursor-pointer"
          >
            <Lock className="w-4 h-4 text-cyan-300" />
            <span>Complete &amp; Lock</span>
          </button>
        </div>

      </footer>

    </div>
  );
}
