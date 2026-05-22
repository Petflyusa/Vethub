/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Calendar, Users, FileText, Pill, CreditCard, Award, BarChart3, Settings as SettingsIcon, LogOut, Search, Bell, HelpCircle, Heart, Plus, Menu, X, PawPrint, Shield, Sparkles
} from 'lucide-react';
import { 
  Staff, Client, Pet, Appointment, MedicalRecord, Invoice, RevenueSplit, Consultation, LabOrder, Role, hasPermission 
} from './types';
import { 
  INITIAL_STAFF, INITIAL_CLIENTS, INITIAL_PETS, INITIAL_APPOINTMENTS, 
  INITIAL_MEDICAL_RECORDS, INITIAL_INVOICES, INITIAL_REVENUE_SPLITS, 
  INITIAL_CONSULTATIONS, INITIAL_LAB_ORDERS 
} from './mockData';

import LoginView from './components/LoginView';
import DashboardHeader from './components/DashboardHeader';
import PetList from './components/PetList';
import SoapEditor from './components/SoapEditor';
import { AppointmentsCalendar } from './components/AppointmentsCalendar';
import MedicalRecordsView from './components/MedicalRecordsView';
import PharmacyView from './components/PharmacyView';
import StaffView from './components/StaffView';
import BillingView from './components/BillingView';
import { 
  VetDashboard, ManagerDashboard, ReceptionDashboard, TechDashboard, FinanceDashboard 
} from './components/RoleDashboards';

export default function App() {
  // Core Application Database State
  const [staffList, setStaffList] = useState<Staff[]>(INITIAL_STAFF);
  const [clientList, setClientList] = useState<Client[]>(INITIAL_CLIENTS);
  const [petList, setPetList] = useState<Pet[]>(INITIAL_PETS);
  const [appointmentList, setAppointmentList] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [medicalRecordList, setMedicalRecordList] = useState<MedicalRecord[]>(INITIAL_MEDICAL_RECORDS);
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(INITIAL_INVOICES);
  const [splitList, setSplitList] = useState<RevenueSplit[]>(INITIAL_REVENUE_SPLITS);
  const [consultationList, setConsultationList] = useState<Consultation[]>(INITIAL_CONSULTATIONS);
  const [labOrderList, setLabOrderList] = useState<LabOrder[]>(INITIAL_LAB_ORDERS);

  // REAL-LIFE VET HOSPITAL OPERATIONS STATES
  const [treatmentPrices, setTreatmentPrices] = useState([
    { id: 'tx-1', name: 'Annual Wellness Exam', price: 65.00 },
    { id: 'tx-2', name: 'Dental Scale & Polish', price: 250.00 },
    { id: 'tx-3', name: 'Blood Panel & CBC Test', price: 120.00 },
    { id: 'tx-4', name: 'Emergency Triage & Fluid Charge', price: 180.00 },
    { id: 'tx-5', name: 'Rabies Core Booster', price: 35.00 },
    { id: 'tx-6', name: 'Leukemia Assay Assay', price: 50.00 },
    { id: 'tx-7', name: 'Soft Tissue Surgical Suture', price: 380.00 },
  ]);

  const [medicationPrices, setMedicationPrices] = useState([
    { id: 'med-1', name: 'Apoquel 16mg', price: 45.00, stock: 48, minStock: 20 },
    { id: 'med-2', name: 'Clavamox 250mg', price: 35.00, stock: 18, minStock: 15 },
    { id: 'med-3', name: 'Heartgard Plus Chewable', price: 68.00, stock: 8, minStock: 10 }, // Below minStock!
    { id: 'med-4', name: 'Carprofen 100mg Tablet', price: 28.00, stock: 54, minStock: 15 },
    { id: 'med-5', name: 'Gabapentin 100mg Capsules', price: 22.00, stock: 11, minStock: 10 },
  ]);

  const [overnightTasks, setOvernightTasks] = useState([
    { id: 't-1', petId: 'pet-1', task: 'Administer Carprofen 100mg Tablet', assignedTo: 'staff-tech-1', time: '08:00 PM', done: false },
    { id: 't-2', petId: 'pet-1', task: 'Check vitals and temperature', assignedTo: 'staff-tech-1', time: '10:00 PM', done: true },
    { id: 't-3', petId: 'pet-2', task: 'Pre-surgery fasting verification check', assignedTo: 'staff-tech-1', time: '06:00 AM', done: false },
    { id: 't-4', petId: 'pet-3', task: 'Administer IV hydrating fluids', assignedTo: 'staff-tech-1', time: '12:00 AM', done: false },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 'n-1', staffId: 'staff-dvm-1', message: 'Staff Alexander notified: Cooper needs inpatient surgery setup', date: 'Just now', read: false },
    { id: 'n-2', staffId: 'staff-tech-1', message: 'In-clinic treatment ordered for Luna: Feline exam & hydration', date: '5 mins ago', read: false }
  ]);

  const [supplierOrders, setSupplierOrders] = useState([
    { id: 'so-1', supplier: 'Zoetis Vet Supply Global', drugName: 'Apoquel 16mg', qty: 50, status: 'Completed', date: '2026-05-10', cost: 1250.00 },
    { id: 'so-2', supplier: 'Boehringer Ingelheim LLC', drugName: 'Heartgard Plus Chewable', qty: 100, status: 'Pending Approval', date: '2026-05-20', cost: 4200.00 }
  ]);

  const [clinicHours, setClinicHours] = useState('08:00 AM - 08:00 PM');
  const [promotions, setPromotions] = useState([
    { id: 'p-1', name: 'Autumn Vaccine Drive Discount', description: '20% off Rabies & DHPP combos during September', code: 'FALLVACS20', active: true },
    { id: 'p-2', name: 'Dental Awareness Month Drive', description: 'Scale & polish includes complimentary dental kit', code: 'DENTALSMILE', active: true },
  ]);

  // Authentication & session state
  const [loggedInStaff, setLoggedInStaff] = useState<Staff | null>(null);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'patients' | 'appointments' | 'records' | 'pharmacy' | 'staff' | 'billing'>('dashboard');
  const [searchText, setSearchText] = useState('');
  const [activeFeatureModal, setActiveFeatureModal] = useState<'appointments' | 'pharmacy' | 'invoicing' | 'reports' | 'settings' | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active EHR editing sub-view states
  const [editingAptId, setEditingAptId] = useState<string | null>(null);
  const [editingPetName, setEditingPetName] = useState<string | null>(null);
  const [selectedRecordToEdit, setSelectedRecordToEdit] = useState<MedicalRecord | null>(null);

  // AUTHENTICATION HANDLERS
  const handleLogin = (staff: Staff) => {
    setLoggedInStaff(staff);
    setEditingAptId(null);
    setSelectedRecordToEdit(null);
    
    // Check first permitted tab based on permissions
    if (hasPermission(staff, 'DASHBOARD_ACCESS')) {
      setCurrentTab('dashboard');
    } else if (hasPermission(staff, 'APPOINTMENTS_VIEW')) {
      setCurrentTab('appointments');
    } else if (hasPermission(staff, 'PATIENTS_VIEW')) {
      setCurrentTab('patients');
    } else if (hasPermission(staff, 'SOAP_RECORDS_EDIT')) {
      setCurrentTab('records');
    } else if (hasPermission(staff, 'PHARMACY_Dispense')) {
      setCurrentTab('pharmacy');
    } else if (hasPermission(staff, 'BILLING_INVOICE')) {
      setCurrentTab('billing');
    } else if (hasPermission(staff, 'STAFF_PERMISSIONS_EDIT')) {
      setCurrentTab('staff');
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleLogout = () => {
    setLoggedInStaff(null);
  };

  // DIAGNOSTIC APPOINTMENT CRUD & MANAGEMENT
  const handleCreateAppointment = (apt: Appointment) => {
    setAppointmentList(prev => [apt, ...prev]);
  };

  const handleUpdatePetStatus = (petId: string, status: 'Checked In' | 'In Surgery' | 'In Treatment' | 'Discharged') => {
    setPetList(prev => prev.map(p => p.id === petId ? { ...p, status } : p));
  };

  // CLIENT & PATIENT DATABASE CRUD
  const handleAddNewPet = (pet: Pet, client: Client) => {
    setClientList(prev => {
      if (prev.some(c => c.id === client.id)) {
        return prev;
      }
      return [client, ...prev];
    });
    setPetList(prev => [pet, ...prev]);
  };

  const handleUpdatePet = (updatedPet: Pet) => {
    setPetList(prev => prev.map(p => p.id === updatedPet.id ? updatedPet : p));
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClientList(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleUpdateStaff = (updatedStaff: Staff) => {
    setStaffList(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
    if (loggedInStaff && loggedInStaff.id === updatedStaff.id) {
      setLoggedInStaff(updatedStaff);
    }
  };

  // CLINICAL LABORATORY WORKFLOWS
  const handleCompleteLabOrder = (id: string, notes: string) => {
    setLabOrderList(prev => prev.map(l => l.id === id ? { ...l, status: 'COMPLETED', resultNotes: notes } : l));
  };

  // REVENUE SPLITS & ACCOUNTING CONTROLS
  const handleGenerateInvoice = (invoice: Invoice) => {
    setInvoiceList(prev => [invoice, ...prev]);
  };

  const handleMarkInvoicePaid = (invoiceId: string) => {
    setInvoiceList(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'PAID' } : i));
  };

  const handleApproveSplit = (splitId: string) => {
    setSplitList(prev => prev.map(s => s.id === splitId ? { ...s, status: 'APPROVED' } : s));
  };

  const handlePaySplit = (splitId: string) => {
    setSplitList(prev => prev.map(s => s.id === splitId ? { ...s, status: 'PAID' } : s));
  };

  // CLINICAL COLLABORATION CONSULTATIONS
  const handleAddConsultation = (cons: Consultation) => {
    setConsultationList(prev => [cons, ...prev]);
  };

  // OPEN SOAP WRITER
  const handleOpenSoapNote = (aptId: string, petName: string) => {
    const apt = appointmentList.find(a => a.id === aptId);
    let record = medicalRecordList.find(mr => mr.appointmentId === aptId);
    
    if (!record && apt) {
      // Pre-seed an empty soap structure if none exists
      record = {
        id: `mr-${Date.now()}`,
        petId: apt.petId,
        appointmentId: apt.id,
        dvmId: loggedInStaff?.id || 'staff-dvm-1',
        date: new Date().toISOString().split('T')[0],
        isComplete: false,
        soap: { subjective: '', objective: '', assessment: '', plan: '' },
        procedureTeam: [loggedInStaff?.id || 'staff-dvm-1'],
        prescriptions: [],
        labOrders: [],
        images: []
      };
    }
    
    setSelectedRecordToEdit(record || null);
    setEditingAptId(aptId);
    setEditingPetName(petName);
  };

  const handleOpenSoapFromHistory = (record: MedicalRecord, petName: string) => {
    setSelectedRecordToEdit(record);
    setEditingAptId(record.appointmentId || `apt-hist-${record.id}`);
    setEditingPetName(petName);
  };

  // COMPILE & WRITE HEALTH CHART & CALC REVENUE DIVISION SPITS
  const handleSaveSoapNote = (updatedRecord: MedicalRecord) => {
    // 1. Update medical record array
    setMedicalRecordList(prev => {
      const exists = prev.some(mr => mr.id === updatedRecord.id);
      if (exists) {
        return prev.map(mr => mr.id === updatedRecord.id ? updatedRecord : mr);
      }
      return [updatedRecord, ...prev];
    });

    // 2. Automatically transition appointment status to completed
    if (updatedRecord.appointmentId) {
      setAppointmentList(prev => prev.map(a => a.id === updatedRecord.appointmentId ? { ...a, status: 'COMPLETED' } : a));
    }

    // 3. Auto-calculate clinical splits for procedure team!
    // We auto-generate splits for items in this session to simulate automatic Revenue splitting.
    updatedRecord.procedureTeam.forEach((staffId, i) => {
      const activeStaff = staffList.find(st => st.id === staffId);
      if (activeStaff) {
        const isDvm = activeStaff.role === Role.DVM || activeStaff.role === Role.OWNER;
        // Seed calculated revenue division (DVM gets 30%, Tech/Nurse gets 10%)
        const percentage = isDvm ? 30 : 10;
        const baseAmount = isDvm ? 120.00 : 65.00; // Simulated service value base
        const splitAmt = (baseAmount * percentage) / 100;

        const newSplit: RevenueSplit = {
          id: `split-auto-${Date.now()}-${i}`,
          invoiceId: 'inv-1', // Link dynamically
          itemId: `item-soap-${Date.now()}`,
          staffId: staffId,
          role: activeStaff.role,
          percentage: percentage,
          splitAmount: splitAmt,
          status: 'PENDING'
        };

        setSplitList(prev => [newSplit, ...prev]);
      }
    });

    // Close SOAP sub-sheet
    setEditingAptId(null);
    setEditingPetName(null);
    setSelectedRecordToEdit(null);
    alert('Surgical & diagnostics health record compiled and locked. Associated revenue allocation splits calculated!');
  };

  // RENDER SELECTION BY PERMISSIONS
  const renderDashboardByRole = () => {
    if (!loggedInStaff) return null;

    switch (loggedInStaff.role) {
      // DVM (Surgeon / Veterinarian)
      case Role.DVM:
        return (
          <VetDashboard
            appointments={appointmentList}
            pets={petList}
            clients={clientList}
            allStaff={staffList}
            consultations={consultationList}
            labOrders={labOrderList}
            notifications={notifications}
            overnightTasks={overnightTasks}
            treatmentPrices={treatmentPrices}
            medicationPrices={medicationPrices}
            onOpenSoapNote={handleOpenSoapNote}
            onSendConsultation={handleAddConsultation}
            onChangeNotifications={setNotifications}
            onChangeOvernightTasks={setOvernightTasks}
            onChangePets={setPetList}
            onChangeAppointments={setAppointmentList}
            onChangeInvoices={setInvoiceList}
          />
        );

      // MEDICAL DIRECTOR / OWNER / CLINIC MANAGER
      case Role.OWNER:
      case Role.MANAGER:
        return (
          <ManagerDashboard
            pets={petList}
            clients={clientList}
            invoices={invoiceList}
            splits={splitList}
            allStaff={staffList}
            treatmentPrices={treatmentPrices}
            medicationPrices={medicationPrices}
            overnightTasks={overnightTasks}
            notifications={notifications}
            supplierOrders={supplierOrders}
            clinicHours={clinicHours}
            promotions={promotions}
            onApproveSplit={handleApproveSplit}
            onPaySplit={handlePaySplit}
            currentStaff={loggedInStaff || undefined}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onChangeTreatmentPrices={setTreatmentPrices}
            onChangeMedicationPrices={setMedicationPrices}
            onChangeSupplierOrders={setSupplierOrders}
            onChangeClinicHours={setClinicHours}
            onChangePromotions={setPromotions}
            onChangeStaff={setStaffList}
            onChangeOvernightTasks={setOvernightTasks}
            onChangePets={setPetList}
          />
        );

      // FRONT DESK RECEPTIONIST
      case Role.RECEPTION:
        return (
          <ReceptionDashboard
            appointments={appointmentList}
            pets={petList}
            clients={clientList}
            allStaff={staffList}
            invoices={invoiceList}
            onAddNewAppointment={handleCreateAppointment}
            onUpdatePetStatus={handleUpdatePetStatus}
            onGenerateInvoice={handleGenerateInvoice}
            onChangeClients={setClientList}
            onChangePets={setPetList}
            onChangeAppointments={setAppointmentList}
            onChangeInvoices={setInvoiceList}
            onChangeNotifications={setNotifications}
          />
        );

      // REGISTERED TREATMENT VET NURSE
      case Role.TECH:
        return (
          <TechDashboard
            labOrders={labOrderList}
            pets={petList}
            overnightTasks={overnightTasks}
            allStaff={staffList}
            notifications={notifications}
            onCompleteLabOrder={handleCompleteLabOrder}
            onChangeOvernightTasks={setOvernightTasks}
            onChangePets={setPetList}
            onChangeNotifications={setNotifications}
          />
        );

      // CLINICAL ACCOUNTANT
      case Role.FINANCE:
        return (
          <FinanceDashboard
            invoices={invoiceList}
            clients={clientList}
            pets={petList}
            splits={splitList}
            allStaff={staffList}
            onMarkInvoicePaid={handleMarkInvoicePaid}
          />
        );

      // Fallback (e.g. general Admin) -> Default to Manager dashboard
      case Role.ADMIN:
        return (
          <ManagerDashboard
            pets={petList}
            clients={clientList}
            invoices={invoiceList}
            splits={splitList}
            allStaff={staffList}
            treatmentPrices={treatmentPrices}
            medicationPrices={medicationPrices}
            overnightTasks={overnightTasks}
            notifications={notifications}
            supplierOrders={supplierOrders}
            clinicHours={clinicHours}
            promotions={promotions}
            onApproveSplit={handleApproveSplit}
            onPaySplit={handlePaySplit}
            currentStaff={loggedInStaff || undefined}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onChangeTreatmentPrices={setTreatmentPrices}
            onChangeMedicationPrices={setMedicationPrices}
            onChangeSupplierOrders={setSupplierOrders}
            onChangeClinicHours={setClinicHours}
            onChangePromotions={setPromotions}
            onChangeStaff={setStaffList}
            onChangeOvernightTasks={setOvernightTasks}
            onChangePets={setPetList}
          />
        );

      default:
        return (
          <div className="bg-white border rounded-xl p-8 text-center text-xs text-[#545d62]">
            Role Dashboard initialized successfully. No active components required.
          </div>
        );
    }
  };

  // MAIN WRAPPER
  return (
    <div className="flex flex-col min-h-screen font-sans antialiased text-[#0d1c2e]" id="app-root-container">
      {loggedInStaff === null ? (
        /* Login Screen with exact mockup style alignment */
        <AnimatePresence mode="wait">
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <LoginView onLoginSuccess={handleLogin} />
          </motion.div>
        </AnimatePresence>
      ) : (
        /* Authenticated Clinic Systems Workspace with High-Fidelity SidePanel and TopBar */
        <div className="flex-grow flex bg-[#f8f9ff] min-h-screen relative">
          
          {/* SideNavBar Shell (Fixed Left Sidebar Matching Uploaded Graphic) */}
          <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-outline-variant/60 flex flex-col p-4 gap-2 z-50 transform lg:transform-none transition-transform duration-300 ease-in-out ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}>
            {/* Logo and Brand Title Header */}
            <div className="flex items-center justify-between px-2 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00647c] flex items-center justify-center text-white shadow-xs">
                  <PawPrint className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-[#00647c] uppercase tracking-tight font-sans leading-none">
                    Clinical Vitality
                  </h1>
                  <p className="text-[9px] uppercase tracking-widest text-[#6e797e] font-bold mt-1">
                    VETERINARY CARE
                  </p>
                </div>
              </div>
              {/* Close Mobile Sidebar button */}
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden p-1.5 hover:bg-slate-100 rounded text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation links matching mockup exactly */}
            <nav className="flex flex-col gap-1 overflow-y-auto flex-1 pr-1" id="clinic-sidebar-nav">
              {hasPermission(loggedInStaff, 'DASHBOARD_ACCESS') && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('dashboard');
                    setEditingAptId(null);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                    currentTab === 'dashboard' && !editingAptId
                      ? 'bg-[#d0e1fb] text-[#54647a] font-bold shadow-2xs'
                      : 'text-[#3e484d] hover:bg-slate-100 font-medium'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span className="text-xs">Dashboard</span>
                </button>
              )}

              {hasPermission(loggedInStaff, 'APPOINTMENTS_VIEW') && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('appointments');
                    setEditingAptId(null);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                    currentTab === 'appointments' && !editingAptId
                      ? 'bg-[#00647c]/10 text-[#00647c] font-bold border-r-4 border-[#00647c] shadow-2xs scale-[1.01]'
                      : 'text-[#3e484d] hover:bg-teal-50/40 hover:text-[#00647c] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span className="text-xs">Appointments</span>
                  </div>
                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-[1px] rounded-full font-bold">12</span>
                </button>
              )}

              {hasPermission(loggedInStaff, 'PATIENTS_VIEW') && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('patients');
                    setEditingAptId(null);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                    currentTab === 'patients' && !editingAptId
                      ? 'bg-[#d0e1fb] text-[#54647a] font-bold shadow-2xs'
                      : 'text-[#3e484d] hover:bg-slate-100 font-medium'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="text-xs">Clients &amp; Pets</span>
                </button>
              )}

              {hasPermission(loggedInStaff, 'SOAP_RECORDS_EDIT') && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('records');
                    setEditingAptId(null);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                    currentTab === 'records' && !editingAptId
                      ? 'bg-[#00647c]/10 text-[#00647c] font-bold border-r-4 border-[#00647c] shadow-2xs scale-[1.01]'
                      : 'text-[#3e484d] hover:bg-slate-100 font-medium'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-sans">Medical Records</span>
                </button>
              )}

              {hasPermission(loggedInStaff, 'PHARMACY_Dispense') && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('pharmacy');
                    setEditingAptId(null);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                    currentTab === 'pharmacy' && !editingAptId
                      ? 'bg-[#00647c]/10 text-[#00647c] font-bold border-r-4 border-[#00647c] shadow-2xs scale-[1.01]'
                      : 'text-[#3e484d] hover:bg-slate-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Pill className="w-4 h-4 shrink-0" />
                    <span className="text-xs">Pharmacy</span>
                  </div>
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                </button>
              )}

              {hasPermission(loggedInStaff, 'BILLING_INVOICE') && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('billing');
                    setEditingAptId(null);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                    currentTab === 'billing' && !editingAptId
                      ? 'bg-[#00647c]/10 text-[#00647c] font-bold border-r-4 border-[#00647c] shadow-2xs scale-[1.01]'
                      : 'text-[#3e484d] hover:bg-slate-100 font-medium'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span className="text-xs">Billing & Invoicing</span>
                </button>
              )}

              {hasPermission(loggedInStaff, 'STAFF_PERMISSIONS_EDIT') && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('staff');
                    setEditingAptId(null);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                    currentTab === 'staff' && !editingAptId
                      ? 'bg-[#00647c]/10 text-[#00647c] font-bold border-r-4 border-[#00647c] shadow-2xs scale-[1.01]'
                      : 'text-[#3e484d] hover:bg-slate-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 shrink-0" />
                    <span className="text-xs">Staff</span>
                  </div>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveFeatureModal('reports');
                  setMobileSidebarOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-left text-[#3e484d] hover:bg-slate-100 font-medium cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span className="text-xs">Reports</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveFeatureModal('settings');
                  setMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150 cursor-pointer text-[#3e484d] hover:bg-slate-100 font-medium ${
                  activeFeatureModal === 'settings' ? 'bg-[#d0e1fb]/40' : ''
                }`}
              >
                <SettingsIcon className="w-4 h-4 shrink-0" />
                <span className="text-xs">Settings</span>
              </button>
            </nav>

            {/* Bottom Current Staff Section mirroring uploaded design */}
            <div className="mt-auto pt-4 border-t border-slate-100">
              <div className="bg-[#eff4ff] rounded-xl p-3 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <img 
                    src={loggedInStaff.avatar} 
                    alt={loggedInStaff.name} 
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-cyan-400"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[#0d1c2e] truncate leading-tight">
                      {loggedInStaff.name}
                    </p>
                    <p className="text-[10px] text-[#545d62] truncate font-medium mt-0.5">
                      {loggedInStaff.role === Role.OWNER ? 'Chief Veterinarian' : loggedInStaff.role}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  title="Sign Out of Session"
                  className="p-1.5 text-slate-400 hover:text-red-650 hover:text-[#ba1a1a] transition-colors rounded-lg cursor-pointer hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>

          {/* Backdrop for mobile sidebar */}
          {mobileSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}

          {/* Right Sided Header and Page Space Container */}
          <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
            
            {/* High-Fidelity Top Bar matching header fixed layout exactly */}
            <header className="sticky top-0 right-0 bg-[#f8f9ff] h-16 flex items-center justify-between px-4 md:px-8 border-b border-outline-variant/50 z-30">
              
              {/* Left Bar Section: Burger Menu & Search input with instant logic */}
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <button 
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-2 text-[#0d1c2e] hover:bg-slate-100 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center bg-[#eff4ff] px-4 py-2 rounded-full w-full max-w-sm border border-outline-variant/30 focus-within:border-primary/50 transition-all">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input 
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search patients, owners, or records..."
                    className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xs w-full text-[#0d1c2e] placeholder-slate-400 p-0"
                  />
                  {searchText && (
                    <button 
                      onClick={() => setSearchText('')} 
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Right Bar Section: Notification, Help & Account Status Indicators */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => alert('7 Pending splits requiring release authorization logs. Live queue processing normal.')}
                  className="relative w-9 h-9 flex items-center justify-center text-slate-650 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <Bell className="w-4.5 h-4.5 text-slate-600" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full animate-pulse" />
                </button>

                <button 
                  onClick={() => alert('Clinic Resource: VetHub Live 2.6 deployment active. Connected with encrypted health servers.')}
                  className="w-9 h-9 flex items-center justify-center text-slate-650 hover:bg-slate-100 rounded-full transition-colors hidden sm:flex"
                >
                  <HelpCircle className="w-4.5 h-4.5 text-slate-600" />
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                    {loggedInStaff.name.includes('Dr.') ? loggedInStaff.name : `Dr. ${loggedInStaff.name}`}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#d0e1fb] flex items-center justify-center text-secondary font-bold text-xs">
                    🩺
                  </div>
                </div>
              </div>
            </header>

            {/* Interactive Alert if search filter is active */}
            {searchText && (
              <div className="mx-4 md:mx-8 mt-4 p-3 bg-[#e6eeff] border border-[#d0e1fb] rounded-xl flex items-center justify-between text-xs font-bold text-[#54647a]">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00647c]" />
                  Active Search: Showing results matching "{searchText}" in Clinical Patient Database
                </span>
                <button 
                  onClick={() => setSearchText('')}
                  className="underline text-primary hover:text-cyan-700 cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* Core Workplace contents */}
            <main className="flex-grow px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
              
              {editingAptId && editingPetName ? (
                /* SOAP Health Notes compilation sheet (Surgical / DVM action override) */
                <motion.div
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <SoapEditor
                    initialRecord={selectedRecordToEdit}
                    petName={editingPetName}
                    allStaff={staffList}
                    onSave={handleSaveSoapNote}
                    onCancel={() => {
                      setEditingAptId(null);
                      setEditingPetName(null);
                      setSelectedRecordToEdit(null);
                    }}
                  />
                </motion.div>
              ) : (
                /* Tab view panel switches with search filter support injected */
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {currentTab === 'dashboard' ? (
                      /* Dynamic role-based performance dashboard */
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/40 pb-3">
                          <div>
                            <h1 className="text-xl font-bold font-sans text-[#0d1c2e] tracking-tight">
                              Clinical Operations Dashboard
                            </h1>
                            <p className="text-xs text-[#545d62] font-semibold mt-0.5">
                              Logged in session as <span className="text-[#0d1c2e] font-bold">{loggedInStaff.name}</span> ({loggedInStaff.role === Role.OWNER ? 'Chief Executive / Clinic Owner' : loggedInStaff.role})
                            </p>
                          </div>
                          <div className="text-[10px] bg-[#eff4ff] border border-primary-container/10 px-3 py-1 rounded-md text-primary font-bold font-mono">
                            TODAY: MAY 21, 2026
                          </div>
                        </div>

                        {renderDashboardByRole()}
                      </div>
                    ) : currentTab === 'appointments' ? (
                      <AppointmentsCalendar
                        appointments={appointmentList}
                        pets={petList}
                        clients={clientList}
                        allStaff={staffList}
                        onUpdateAppointment={(updated) => {
                          setAppointmentList(prev => prev.map(a => a.id === updated.id ? updated : a));
                        }}
                        onAddAppointment={(newApp) => {
                          setAppointmentList(prev => [...prev, newApp]);
                        }}
                      />
                    ) : currentTab === 'records' ? (
                      <MedicalRecordsView
                        pets={petList}
                        clients={clientList}
                        allStaff={staffList}
                        loggedInStaff={loggedInStaff}
                        appointments={appointmentList}
                        medicalRecords={medicalRecordList}
                        onSaveSoapNote={handleSaveSoapNote}
                      />
                    ) : currentTab === 'pharmacy' ? (
                      <PharmacyView
                        pets={petList}
                        clients={clientList}
                        allStaff={staffList}
                        loggedInStaff={loggedInStaff}
                      />
                    ) : currentTab === 'staff' ? (
                      <StaffView
                        allStaff={staffList}
                        loggedInStaff={loggedInStaff}
                        onAddStaff={(newS) => setStaffList(prev => [...prev, newS])}
                        onUpdateStaff={handleUpdateStaff}
                      />
                    ) : currentTab === 'billing' ? (
                      <BillingView
                        onAddInvoice={(newI) => setInvoiceList(prev => [newI, ...prev])}
                      />
                    ) : (
                      /* Standard database grid list with live search filters applied! */
                      <div className="space-y-6">
                        <div className="border-b border-outline-variant/40 pb-3">
                          <h1 className="text-xl font-bold font-sans text-[#0d1c2e] tracking-tight">
                            Patient Chart &amp; Health Files Database
                          </h1>
                          <p className="text-xs text-[#545d62] font-semibold mt-0.5">
                            Audit animal medical histories, allergy warnings, digital drug logs, and dental orthopantomograms.
                          </p>
                        </div>

                        <PetList
                          pets={
                            searchText
                              ? petList.filter(pet => 
                                  pet.name.toLowerCase().includes(searchText.toLowerCase()) ||
                                  pet.species.toLowerCase().includes(searchText.toLowerCase()) ||
                                  pet.breed.toLowerCase().includes(searchText.toLowerCase()) ||
                                  (pet.status || '').toLowerCase().includes(searchText.toLowerCase()) ||
                                  (clientList.find(c => c.id === pet.ownerId)?.name || '').toLowerCase().includes(searchText.toLowerCase())
                                )
                              : petList
                          }
                          clients={clientList}
                          medicalRecords={medicalRecordList}
                          allStaff={staffList}
                          onAddNewPet={handleAddNewPet}
                          onEditMedicalRecord={handleOpenSoapFromHistory}
                          onUpdatePet={handleUpdatePet}
                          onUpdateClient={handleUpdateClient}
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

            </main>

            {/* Safe simple professional sub-footer panel */}
            <footer className="py-6 border-t border-outline-variant/50 bg-white mt-12 bg-slate-50/50">
              <div className="max-w-7xl w-full mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center text-[#545d62] text-[11px] font-medium gap-3">
                <p>© 2026 Clinical Vitality Operations Ledger. All rights reserved. VetHub Unified Portal.</p>
                <div className="flex gap-4">
                  <a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
                  <a href="#terms" className="hover:text-primary transition-colors">Terms of Service</a>
                  <a href="#support" className="hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); alert('Live secure support link active: support@clinicalvitality.org'); }}>Support Portal</a>
                </div>
              </div>
            </footer>

          </div>

          {/* DYNAMIC HIGH-FIDELITY INTERACTIVE OVERLAY MODALS FOR ADDITIONAL SIDE NAVIGATION SECTIONS */}
          <AnimatePresence>
            {activeFeatureModal !== null && (
              <div className="fixed inset-0 bg-[#0d1c2e]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="feature-overlay-modal">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-white rounded-xl shadow-2xl border border-outline-variant/60 w-full max-w-2xl overflow-hidden flex flex-col"
                >
                  {/* Modal Header */}
                  <div className="bg-[#eff4ff] px-6 py-4 border-b border-outline-variant/40 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {activeFeatureModal === 'appointments' && <Calendar className="w-5 h-5 text-[#00647c]" />}
                        {activeFeatureModal === 'pharmacy' && <Pill className="w-5 h-5 text-[#00647c]" />}
                        {activeFeatureModal === 'invoicing' && <CreditCard className="w-5 h-5 text-[#00647c]" />}
                        {activeFeatureModal === 'reports' && <BarChart3 className="w-5 h-5 text-[#00647c]" />}
                        {activeFeatureModal === 'settings' && <SettingsIcon className="w-5 h-5 text-[#00647c]" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wide text-[#0d1c2e]">
                          {activeFeatureModal === 'appointments' && '📅 Appointments Control Board'}
                          {activeFeatureModal === 'pharmacy' && '💊 Pharmacy & Controlled Substances'}
                          {activeFeatureModal === 'invoicing' && '🏦 Invoices & Fee-For-Service Ledger'}
                          {activeFeatureModal === 'reports' && '📊 Clinic Productivity & Revenue Reports'}
                          {activeFeatureModal === 'settings' && '⚙️ Clinical Systems Configurations'}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5 font-mono">
                          Module: {activeFeatureModal.toUpperCase()} • Live Server Synchronized
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveFeatureModal(null)}
                      className="text-slate-400 hover:text-slate-700 bg-white border rounded-lg p-1.5 shadow-2xs font-bold font-sans cursor-pointer text-xs"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto max-h-[450px] space-y-4 text-xs text-slate-700 leading-relaxed">
                    
                    {activeFeatureModal === 'appointments' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-lg border">
                          <div className="border-r">
                            <span className="block text-slate-400 font-bold uppercase text-[9px]">Check-ups</span>
                            <span className="text-lg font-bold text-slate-700">8 scheduled</span>
                          </div>
                          <div className="border-r">
                            <span className="block text-slate-400 font-bold uppercase text-[9px]">Surgeries</span>
                            <span className="text-lg font-bold text-amber-700">3 in Queue</span>
                          </div>
                          <div>
                            <span className="block text-[#00647c] font-bold uppercase text-[9px]">Completed Today</span>
                            <span className="text-lg font-bold text-[#00647c]">1 discharged</span>
                          </div>
                        </div>
                        <p className="text-slate-500 text-xs">
                          Appointments are updated automatically inside your dashboard queue. To book or schedule a new active patient:
                        </p>
                        <div className="p-3 bg-[#eff4ff] border border-blue-200 rounded-lg">
                          <strong>💡 Operational Tip:</strong> Sign in as receptionist (<strong>staff-recept-1</strong>) to unlock direct calendar entry grid systems, custom walk-in additions, and real-time status queue updates.
                        </div>
                      </div>
                    )}

                    {activeFeatureModal === 'pharmacy' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg">
                          <strong>⚠️ Prescription Substance Safety:</strong> 
                          <p className="mt-1 text-[11px] leading-snug">
                            Federal regulations mandate real-time audit logs for all drug dispensations. Please ensure complete EHR (Electronic Health Record) diagnostics are compiled to enable dispensing controls.
                          </p>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-slate-50 px-3 py-2 border-b font-bold text-[10px] text-slate-500 uppercase">
                            Available Clinic Inventory
                          </div>
                          <div className="divide-y text-[11px]">
                            <div className="p-2.5 flex justify-between">
                              <span>💊 Amoxicillin Liquid 50mg/ml</span>
                              <span className="text-emerald-700 font-bold">120 bottles in stock</span>
                            </div>
                            <div className="p-2.5 flex justify-between">
                              <span>💉 Carprofen Inj 50mg/ml</span>
                              <span className="text-red-700 font-bold">4 vials remaining (LOW)</span>
                            </div>
                            <div className="p-2.5 flex justify-between">
                              <span>🦷 Dental Hygiene Prophy Paste</span>
                              <span className="text-emerald-700 font-bold">18 units in stock</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeFeatureModal === 'invoicing' && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-550">
                          Review live invoice items generated upon finalizing surgery dictations and treatment logs.
                        </p>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-50 border-b font-bold text-slate-500 uppercase text-[9px]">
                              <tr>
                                <th className="p-2.5">Invoice ID</th>
                                <th className="p-2.5">Date</th>
                                <th className="p-2.5">Client</th>
                                <th className="p-2.5">Amount</th>
                                <th className="p-2.5">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              <tr>
                                <td className="p-2.5 font-mono">#IV-20492</td>
                                <td className="p-2.5">2026-05-21</td>
                                <td className="p-2.5">Sarah Jenkins</td>
                                <td className="p-2.5 font-bold">$185.00</td>
                                <td className="p-2.5"><span className="bg-emerald-50 text-emerald-800 border uppercase px-1.5 py-[1px] rounded text-[9px] font-bold">PAID</span></td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-mono">#IV-20493</td>
                                <td className="p-2.5">2026-05-21</td>
                                <td className="p-2.5">Robert Chen</td>
                                <td className="p-2.5 font-bold">$220.00</td>
                                <td className="p-2.5"><span className="bg-amber-50 text-amber-800 border uppercase px-1.5 py-[1px] rounded text-[9px] font-bold">SENT</span></td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-mono">#IV-20494</td>
                                <td className="p-2.5">2026-05-21</td>
                                <td className="p-2.5">Emma Thompson</td>
                                <td className="p-2.5 font-bold">$40.00</td>
                                <td className="p-2.5"><span className="bg-blue-50 text-blue-800 border uppercase px-1.5 py-[1px] rounded text-[9px] font-bold">DRAFT</span></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {activeFeatureModal === 'reports' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 border rounded-lg bg-slate-50/50">
                            <span className="block text-slate-400 font-bold uppercase text-[9px]">Active Shift Providers</span>
                            <span className="text-xl font-bold text-slate-800 mt-1 block">4 Veterinarians</span>
                          </div>
                          <div className="p-4 border rounded-lg bg-slate-50/50">
                            <span className="block text-slate-400 font-bold uppercase text-[9px]">Today's Direct Revenue</span>
                            <span className="text-xl font-bold text-emerald-700 mt-1 block">$2,450.00</span>
                          </div>
                        </div>
                        <p className="text-slate-500">
                          Automatic reports calculate individual commission payouts, surgical splits, nurse duty support logs, and equipment cost margins in the background.
                        </p>
                      </div>
                    )}

                    {activeFeatureModal === 'settings' && (
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Clinical Vitality Portal Controls</h4>
                        <div className="space-y-2 border-t pt-2">
                          <label className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                            <div>
                              <span className="font-semibold block">Speech-To-Text Audio AI Translation</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Enables voice neural transcriptions inside SOAP editors</span>
                            </div>
                            <input type="checkbox" defaultChecked className="rounded text-[#00647c] focus:ring-[#00647c]" />
                          </label>
                          <label className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                            <div>
                              <span className="font-semibold block">Automatic Clinical Revenue Splitting</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Calculates individual team commissions instantly upon chart lock</span>
                            </div>
                            <input type="checkbox" defaultChecked className="rounded text-[#00647c] focus:ring-[#00647c]" />
                          </label>
                          <label className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                            <div>
                              <span className="font-semibold block">Offline Client Recovery State</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Caches patient record modifications inside standard LocalStorage</span>
                            </div>
                            <input type="checkbox" defaultChecked className="rounded text-[#00647c] focus:ring-[#00647c]" />
                          </label>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Modal Footer */}
                  <div className="bg-slate-50 px-6 py-3 border-t border-outline-variant/30 text-right">
                    <button 
                      onClick={() => setActiveFeatureModal(null)}
                      className="px-4 py-2 bg-[#00647c] text-white text-xs font-bold rounded-lg hover:bg-cyan-700 transition-colors uppercase tracking-wide cursor-pointer shadow-xs"
                    >
                      Acknowledge &amp; Return
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}
    </div>
  );
}
