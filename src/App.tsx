/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Calendar, Users, FileText, Pill, CreditCard, Award, BarChart3, Settings as SettingsIcon, LogOut, Search, Bell, HelpCircle, Heart, Plus, Menu, X, PawPrint, Shield, Sparkles, Package, User, Phone, ShieldAlert, Eye, EyeOff, Lock
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
import TreatmentView from './components/TreatmentView';
import InventoryView from './components/InventoryView';
import StaffView from './components/StaffView';
import { Stethoscope } from 'lucide-react';
import BillingView from './components/BillingView';
import { 
  VetDashboard, ManagerDashboard, ReceptionDashboard, TechDashboard, FinanceDashboard 
} from './components/RoleDashboards';
import ReportsView from './components/ReportsView';

const AVATAR_BG_PRESETS = [
  { id: 'sunset', name: 'Sunset Glow', from: '#FF512F', to: '#DD2476' },
  { id: 'cosmic', name: 'Cosmic Ocean', from: '#1A2980', to: '#26D0CE' },
  { id: 'emerald', name: 'Emerald', from: '#0F766E', to: '#38EF7D' },
  { id: 'orchid', name: 'Purple', from: '#6441A5', to: '#2A0845' },
  { id: 'steel', name: 'Steel Blue', from: '#373B44', to: '#4286F4' }
];

const AVATAR_ICON_PRESETS = [
  { id: 'cat', label: '🐱 Cat', name: 'cat' },
  { id: 'dog', label: '🐶 Dog', name: 'dog' },
  { id: 'doctor', label: '🧑‍⚕️ Vet', name: 'doctor' },
  { id: 'paw', label: '🐾 Paw', name: 'paw' },
  { id: 'star', label: '✨ Sparkle', name: 'star' }
];

const generateSvgAvatarBase64 = (bgGradient: { from: string, to: string }, iconName: string) => {
  let iconContent = '';
  if (iconName === 'paw') {
    iconContent = `
      <path d="M64 54 C54 54 46 64 46 76 C46 88 54 94 64 94 C74 94 82 88 82 76 C82 64 74 54 64 54 Z" fill="white" opacity="0.95"/>
      <circle cx="40" cy="46" r="11" fill="white" opacity="0.95" />
      <circle cx="56" cy="35" r="11" fill="white" opacity="0.95" />
      <circle cx="72" cy="35" r="11" fill="white" opacity="0.95" />
      <circle cx="88" cy="46" r="11" fill="white" opacity="0.95" />
    `;
  } else if (iconName === 'cat') {
    iconContent = `
      <polygon points="34,50 18,15 48,42" fill="white" opacity="0.95" />
      <polygon points="94,50 110,15 80,42" fill="white" opacity="0.95" />
      <polygon points="34,48 24,24 42,42" fill="#FFA7C4" />
      <polygon points="94,48 104,24 86,42" fill="#FFA7C4" />
      <path d="M34 40 L30 80 C30 96 45 102 64 102 C83 102 98 96 98 80 L94 40 Z" fill="white" opacity="0.95"/>
      <circle cx="48" cy="68" r="5" fill="#1E293B" />
      <circle cx="80" cy="68" r="5" fill="#1E293B" />
      <polygon points="64,74 61,71 67,71" fill="#FFA7C4" />
      <path d="M61 77 Q64 80 64 77 Q64 80 67 77" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none" />
    `;
  } else if (iconName === 'dog') {
    iconContent = `
      <path d="M34 43 C20 43 14 74 24 86 C28 90 36 86 36 80 Z" fill="#CBD5E1" />
      <path d="M94 43 C108 43 114 74 104 86 C100 90 92 86 92 80 Z" fill="#CBD5E1" />
      <path d="M36 45 C36 45 32 80 32 90 C32 100 44 106 64 106 C84 106 96 100 96 90 C96 80 92 45 92 45 Z" fill="white" opacity="0.95"/>
      <circle cx="48" cy="65" r="5.5" fill="#1E293B" />
      <circle cx="80" cy="65" r="5.5" fill="#1E293B" />
      <ellipse cx="64" cy="78" rx="12" ry="8" fill="#F1F5F9" />
      <polygon points="64,74 58,70 70,70" fill="#1E293B" />
      <path d="M64 74 L64 79" stroke="#1E293B" stroke-width="2.5" />
    `;
  } else if (iconName === 'doctor') {
    iconContent = `
      <circle cx="64" cy="48" r="22" fill="white" opacity="0.95" />
      <path d="M30 102 C30 84 42 74 64 74 C86 74 98 84 98 102 Z" fill="white" opacity="0.95"/>
      <path d="M52 74 L60 84 L64 84 L68 84 L76 74" stroke="#0F766E" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <circle cx="64" cy="34" r="7" fill="#E2E8F0" stroke="#0F766E" stroke-width="2" />
    `;
  } else if (iconName === 'star') {
    iconContent = `
      <path d="M64 14 L77 51 L114 64 L77 77 L64 114 L51 77 L14 64 L51 51 Z" fill="white" opacity="0.95"/>
      <circle cx="40" cy="30" r="4" fill="#FDE047" />
      <circle cx="88" cy="98" r="4" fill="#FDE047" />
      <circle cx="94" cy="24" r="5" fill="#FDE047" />
    `;
  }

  const svgStr = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
      <defs>
        <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgGradient.from}" stop-opacity="1" />
          <stop offset="100%" stop-color="${bgGradient.to}" stop-opacity="1" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="32" fill="url(#avatarGrad)" />
      <g>
        ${iconContent}
      </g>
    </svg>
  `;

  const base64 = typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(svgStr))) : '';
  return `data:image/svg+xml;base64,${base64}`;
};

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

  const [supplierOrders, setSupplierOrders] = useState([
    { id: 'so-1', supplier: 'Zoetis Vet Supply Global', drugName: 'Apoquel 16mg', qty: 50, status: 'Completed', date: '2026-05-10', cost: 1250.00 },
    { id: 'so-2', supplier: 'Boehringer Ingelheim LLC', drugName: 'Heartgard Plus Chewable', qty: 100, status: 'Pending Approval', date: '2026-05-20', cost: 4200.00 }
  ]);

  const [clinicHours, setClinicHours] = useState('08:00 AM - 08:00 PM');
  const [promotions, setPromotions] = useState([
    { id: 'p-1', name: 'Autumn Vaccine Drive Discount', description: '20% off Rabies & DHPP combos during September', code: 'FALLVACS20', active: true },
    { id: 'p-2', name: 'Dental Awareness Month Drive', description: 'Scale & polish includes complimentary dental kit', code: 'DENTALSMILE', active: true },
  ]);

  // Clinic Settings Persistence & State
  const [clinicInfo, setClinicInfo] = useState(() => {
    const saved = localStorage.getItem('vet_clinic_info');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'Clinical Vitality',
      slogan: 'VETERINARY CARE',
      logoType: 'PawPrint',
      logoUrl: '',
      email: 'contact@clinicalvitality.org',
      phone: '(555) 234-5678',
      address: '120 Medical Center Parkway, Suite 400',
      website: 'www.clinicalvitality.org',
    };
  });

  const [weeklyHours, setWeeklyHours] = useState(() => {
    const saved = localStorage.getItem('vet_weekly_hours');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      Mon: { open: '08:00 AM', close: '08:00 PM', closed: false },
      Tue: { open: '08:00 AM', close: '08:00 PM', closed: false },
      Wed: { open: '08:00 AM', close: '08:00 PM', closed: false },
      Thu: { open: '08:00 AM', close: '08:00 PM', closed: false },
      Fri: { open: '08:00 AM', close: '08:00 PM', closed: false },
      Sat: { open: '09:00 AM', close: '05:00 PM', closed: false },
      Sun: { open: '10:00 AM', close: '04:00 PM', closed: true },
    };
  });

  const [holidays, setHolidays] = useState(() => {
    const saved = localStorage.getItem('vet_holidays');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'h-1', name: 'Memorial Day', date: '2026-05-25', closedEntireDay: true },
      { id: 'h-2', name: 'Independence Day', date: '2026-07-04', closedEntireDay: true },
      { id: 'h-3', name: 'Labor Day', date: '2026-09-07', closedEntireDay: true },
      { id: 'h-4', name: 'Christmas Day', date: '2026-12-25', closedEntireDay: true }
    ];
  });

  const [systemConfigs, setSystemConfigs] = useState(() => {
    const saved = localStorage.getItem('vet_system_configs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.weightUnit) {
          parsed.weightUnit = 'Imperial';
        }
        return parsed;
      } catch (e) {}
    }
    return {
      speechToText: true,
      revenueSplitting: true,
      offlineRecovery: true,
      weightUnit: 'Imperial' // Default to Imperial (lb & inches)
    };
  });

  const [settingsSubTab, setSettingsSubTab] = useState<'info' | 'hours' | 'holidays' | 'system'>('info');

  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayClosed, setNewHolidayClosed] = useState(true);

  // Authentication & session state
  const [loggedInStaff, setLoggedInStaff] = useState<Staff | null>(null);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'patients' | 'appointments' | 'records' | 'pharmacy' | 'treatment' | 'staff' | 'billing' | 'reports' | 'settings'>('dashboard');
  const [searchText, setSearchText] = useState('');
  const [activeFeatureModal, setActiveFeatureModal] = useState<'appointments' | 'pharmacy' | 'invoicing' | 'reports' | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Profile dropdown & modal states
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedAvatar, setEditedAvatar] = useState('');
  const [editedPassword, setEditedPassword] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedEmergencyPhone, setEditedEmergencyPhone] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);

  const [avatarCreatorTab, setAvatarCreatorTab] = useState<'create' | 'upload'>('create');
  const [avatarCreatorBg, setAvatarCreatorBg] = useState('emerald');
  const [avatarCreatorIcon, setAvatarCreatorIcon] = useState('doctor');

  useEffect(() => {
    if (showEditProfileModal && loggedInStaff) {
      setEditedName(loggedInStaff.name || '');
      setEditedEmail(loggedInStaff.email || `${loggedInStaff.id}@vethub.org`);
      const currentAvatar = loggedInStaff.avatar || '';
      setEditedAvatar(currentAvatar);
      setEditedPassword(loggedInStaff.password || '');
      setEditedPhone(loggedInStaff.phone || '');
      setEditedEmergencyPhone(loggedInStaff.emergencyPhone || '');
      
      if (currentAvatar.startsWith('data:image/svg+xml')) {
        setAvatarCreatorTab('create');
      } else {
        setAvatarCreatorTab('upload');
      }
    }
  }, [showEditProfileModal, loggedInStaff]);

  useEffect(() => {
    if (showEditProfileModal && avatarCreatorTab === 'create') {
      const selectedBg = AVATAR_BG_PRESETS.find(p => p.id === avatarCreatorBg) || AVATAR_BG_PRESETS[2];
      const base64Avatar = generateSvgAvatarBase64({ from: selectedBg.from, to: selectedBg.to }, avatarCreatorIcon);
      setEditedAvatar(base64Avatar);
    }
  }, [avatarCreatorBg, avatarCreatorIcon, avatarCreatorTab, showEditProfileModal]);

  // Notifications bell toggle and initial reactive alerts
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'New Appointment Created',
      desc: 'Max (Golden Retriever) booked with Dr. Jenkins (Assigned DVM) via Online Portal.',
      type: 'appointment',
      unread: true,
      time: 'Just now',
      badge: 'Assigned DVM | Dashboard'
    },
    {
      id: 'notif-2',
      title: 'Patient Check-in',
      desc: 'Luna (Bengal Cat) has checked in at Front Desk. Assigned DVM alerted.',
      type: 'checkin',
      unread: true,
      time: '12 mins ago',
      badge: 'DVM Alert | Push'
    },
    {
      id: 'notif-3',
      title: 'Treatment Request Created',
      desc: 'Dr. Jenkins prescribed IV Carprofen Therapy for Cooper. Assigned Tech: Mark.',
      type: 'treatment_created',
      unread: true,
      time: '25 mins ago',
      badge: 'Tech Assignment | Highlight'
    },
    {
      id: 'notif-4',
      title: 'Treatment Completed',
      desc: 'Tech Mark marked IV fluids treatment complete for Cooper. Original DVM notified.',
      type: 'treatment_done',
      unread: false,
      time: '1 hour ago',
      badge: 'Original DVM Alert'
    },
    {
      id: 'notif-5',
      title: 'Lab Result Ready',
      desc: 'Complete Blood Count (CBC) analysis results returned for Bugs. Ordering DVM alerted.',
      type: 'lab_ready',
      unread: false,
      time: '2 hours ago',
      badge: 'Opening DVM | Push'
    },
    {
      id: 'notif-6',
      title: 'Consultation Invitation',
      desc: 'Dr. Jenkins invited you to consult on Oliver\'s dental radiology scans.',
      type: 'consult',
      unread: false,
      time: '3 hours ago',
      badge: 'Invited DVM | Push'
    },
    {
      id: 'notif-7',
      title: 'Discharge Pending 🔊',
      desc: 'Dr. Jenkins marked Bella\'s clinic therapy complete. Front Desk: Ready for discharge.',
      type: 'discharge',
      unread: false,
      time: '4 hours ago',
      badge: 'Front Desk Sound Alert'
    },
    {
      id: 'notif-8',
      title: 'Billing Completed',
      desc: 'Payment processed for invoice #IV-20492. Client: Sarah Jenkins.',
      type: 'billing',
      unread: false,
      time: '5 hours ago',
      badge: 'DVM Accounting'
    },
    {
      id: 'notif-9',
      title: 'Low Stock Warning ⚠️',
      desc: 'Carprofen 50mg Injection dropped below threshold. (Remaining: 4 vials).',
      type: 'stock',
      unread: false,
      time: '1 day ago',
      badge: 'Clinic Manager'
    }
  ]);

  // Handle listening to custom events from calendar or other parts of the clinic
  useEffect(() => {
    const handleNotificationEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent && customEvent.detail) {
        setNotifications(prev => [
          {
            id: customEvent.detail.id || `notif-${Date.now()}`,
            title: `Patient Check-in`,
            desc: customEvent.detail.message || 'Details updated.',
            type: 'checkin',
            unread: true,
            time: 'Just now',
            badge: customEvent.detail.type || 'System Event'
          },
          ...prev
        ]);
        alert(`🔔 System Push Notification:\nNew notification received: ${customEvent.detail.message}`);
      }
    };

    window.addEventListener('vet_notification_triggered', handleNotificationEvent);
    return () => {
      window.removeEventListener('vet_notification_triggered', handleNotificationEvent);
    };
  }, []);

  // Promotions Page / Settings states
  const [newPromoNameInput, setNewPromoNameInput] = useState('');
  const [newPromoCodeInput, setNewPromoCodeInput] = useState('');
  const [newPromoDescInput, setNewPromoDescInput] = useState('');

  const handleAddNewPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoNameInput.trim() || !newPromoCodeInput.trim()) {
      alert('Please fill out the campaign name and promo coupon code!');
      return;
    }
    const newPromo = {
      id: `p-custom-${Date.now()}`,
      name: newPromoNameInput.trim(),
      code: newPromoCodeInput.trim().toUpperCase(),
      description: newPromoDescInput.trim() || 'Complimentary practice wellness giveaway combo.',
      active: true
    };
    setPromotions(prev => [newPromo, ...prev]);
    setNewPromoNameInput('');
    setNewPromoCodeInput('');
    setNewPromoDescInput('');
    alert(`Success! Successfully created and registered promo campaign: #${newPromo.code}`);
  };

  // Active EHR editing sub-view states
  const [editingAptId, setEditingAptId] = useState<string | null>(null);
  const [editingPetName, setEditingPetName] = useState<string | null>(null);
  const [selectedRecordToEdit, setSelectedRecordToEdit] = useState<MedicalRecord | null>(null);
  const [selectedPetIdForNewSoap, setSelectedPetIdForNewSoap] = useState<string | null>(null);

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
    const activeApp = { ...apt, status: 'CHECKED_IN' as const };
    setAppointmentList(prev => [activeApp, ...prev]);
    setPetList(prev => prev.map(p => p.id === apt.petId ? { ...p, status: 'Checked In' } : p));
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
            labOrders={labOrderList}
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
            labOrders={labOrderList}
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
                <div className="w-10 h-10 rounded-lg bg-[#00647c] flex items-center justify-center text-white shadow-xs overflow-hidden">
                  {clinicInfo.logoType === 'Custom' && clinicInfo.logoUrl ? (
                    <img src={clinicInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : clinicInfo.logoType === 'Heart' ? (
                    <Heart className="w-5 h-5 fill-current" />
                  ) : clinicInfo.logoType === 'Shield' ? (
                    <Shield className="w-5 h-5 fill-current" />
                  ) : clinicInfo.logoType === 'Award' ? (
                    <Award className="w-5 h-5 fill-current" />
                  ) : (
                    <PawPrint className="w-5 h-5 fill-current" />
                  )}
                </div>
                <div>
                  <h1 className="text-sm font-bold text-[#00647c] uppercase tracking-tight font-sans leading-none">
                    {clinicInfo.name}
                  </h1>
                  <p className="text-[9px] uppercase tracking-widest text-[#6e797e] font-bold mt-1">
                    {clinicInfo.slogan}
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
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTab('treatment');
                      setEditingAptId(null);
                      setMobileSidebarOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                      currentTab === 'treatment' && !editingAptId
                        ? 'bg-[#00647c]/10 text-[#00647c] font-bold border-r-4 border-[#00647c] shadow-2xs scale-[1.01]'
                        : 'text-[#3e484d] hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 shrink-0" />
                      <span className="text-xs">Inventory &amp; Pricing</span>
                    </div>
                  </button>

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
                      <Users className="w-4 h-4 shrink-0 text-[#00647c]" />
                      <span className="text-xs">Staff &amp; Roster</span>
                    </div>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setCurrentTab('reports');
                  setEditingAptId(null);
                  setActiveFeatureModal(null);
                  setMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                  currentTab === 'reports' && !editingAptId
                    ? 'bg-[#00647c]/10 text-[#00647c] font-bold border-r-4 border-[#00647c] shadow-2xs scale-[1.01]'
                    : 'text-[#3e484d] hover:bg-slate-100 font-medium'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span className="text-xs">Reports</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentTab('settings');
                  setEditingAptId(null);
                  setMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                  currentTab === 'settings' && !editingAptId
                    ? 'bg-[#00647c]/10 text-[#00647c] font-bold border-r-4 border-[#00647c] shadow-2xs scale-[1.01]'
                    : 'text-[#3e484d] hover:bg-slate-100 font-medium'
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
                {/* Interactive Notification Bell and Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative w-9 h-9 flex items-center justify-center text-slate-650 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                    id="notification-bell-trigger"
                    title="View Clinical Alerts"
                  >
                    <Bell className="w-4.5 h-4.5 text-slate-600" />
                    {notifications.some(n => n.unread) && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ba1a1a] text-[8px] font-bold text-white ring-2 ring-white">
                        {notifications.filter(n => n.unread).length}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <>
                      {/* Close overlay */}
                      <div 
                        className="fixed inset-0 z-30 cursor-default" 
                        onClick={() => setNotificationsOpen(false)} 
                      />
                      
                      <div 
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden text-slate-800"
                        id="notifications-dropdown-menu"
                      >
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">🔔 Clinical Alerts</span>
                            {notifications.some(n => n.unread) && (
                              <span className="px-2 py-0.5 bg-red-50 text-red-700 font-bold text-[8px] rounded-full uppercase">
                                {notifications.filter(n => n.unread).length} Unread
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={() => {
                              setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                            }}
                            className="text-[10px] font-bold text-primary hover:underline cursor-pointer uppercase"
                          >
                            Mark all read
                          </button>
                        </div>
                        
                        <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto" id="notification-items-list">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-slate-400">
                              <span className="text-xl block mb-1">📭</span>
                              <p className="text-xs font-medium">No alerts currently active.</p>
                            </div>
                          ) : (
                            notifications.map(n => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                                }}
                                className={`p-3.5 text-left transition-colors cursor-pointer relative hover:bg-slate-50/70 ${
                                  n.unread ? 'bg-blue-50/30' : ''
                                }`}
                              >
                                {n.unread && (
                                  <span className="absolute top-4 left-3 w-1.5 h-1.5 bg-[#ba1a1a] rounded-full" />
                                )}
                                <div className={`${n.unread ? 'pl-2.5' : ''}`}>
                                  <div className="flex items-start justify-between gap-1.5">
                                    <span className="text-[11px] font-bold text-slate-800 leading-snug">
                                      {n.title}
                                    </span>
                                    <span className="text-[8px] text-slate-400 font-mono shrink-0 whitespace-nowrap mt-0.5">
                                      {n.time}
                                    </span>
                                  </div>
                                  <p className="text-[10.5px] text-slate-550 mt-1 leading-normal font-medium">
                                    {n.desc}
                                  </p>
                                  <div className="mt-2 flex items-center justify-between">
                                    <span className="inline-block px-1.5 py-0.5 bg-slate-100/85 text-slate-500 text-[8px] font-bold rounded uppercase tracking-wide">
                                      {n.badge}
                                    </span>
                                    {n.unread && (
                                      <span className="text-[8.5px] text-primary hover:underline font-bold font-mono">
                                        Mark as read
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        
                        <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                            🛡️ Real-time DVM / Technicians Dispatch System
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button 
                  onClick={() => alert('Clinic Resource: VetHub Live 2.6 deployment active. Connected with encrypted health servers.')}
                  className="w-9 h-9 flex items-center justify-center text-slate-650 hover:bg-slate-100 rounded-full transition-colors hidden sm:flex"
                >
                  <HelpCircle className="w-4.5 h-4.5 text-slate-600" />
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

                {/* Draggable user action profile click dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 hover:bg-slate-100 p-1.5 rounded-xl transition-all cursor-pointer select-none border border-transparent hover:border-slate-200"
                    id="profile-dropdown-trigger"
                  >
                    <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                      {loggedInStaff.name.includes('Dr.') ? loggedInStaff.name : `Dr. ${loggedInStaff.name}`}
                    </span>
                    <img 
                      src={loggedInStaff.avatar || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80"}
                      alt={loggedInStaff.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-primary/20 shadow-3xs"
                    />
                  </button>

                  {profileDropdownOpen && (
                    <>
                      {/* Close overlay */}
                      <div 
                        className="fixed inset-0 z-30 cursor-default" 
                        onClick={() => setProfileDropdownOpen(false)} 
                      />
                      
                      <div 
                        className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
                        id="profile-dropdown-menu"
                      >
                        <div className="px-3.5 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                          <p className="text-xs font-bold text-slate-800 truncate">{loggedInStaff.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{loggedInStaff.email || `${loggedInStaff.id}@vethub.org`}</p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase rounded font-mono">
                            {loggedInStaff.role}
                          </span>
                        </div>
                        
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setShowEditProfileModal(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors rounded-lg cursor-pointer text-left"
                          >
                            <User className="w-4 h-4 text-slate-500" />
                            Edit Profile
                          </button>
                          
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-650 hover:bg-red-50/50 transition-colors rounded-lg cursor-pointer text-left"
                          >
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
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
            <main className="flex-grow px-4 md:px-8 py-6 w-full">
              
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
                          const activeApp = { ...newApp, status: 'CHECKED_IN' as const };
                          setAppointmentList(prev => [...prev, activeApp]);
                          setPetList(prev => prev.map(p => p.id === newApp.petId ? { ...p, status: 'Checked In' } : p));
                        }}
                        onAddNewPetAndClient={(pet, client) => {
                          handleAddNewPet(pet, client);
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
                        initialSelectedPetId={selectedPetIdForNewSoap}
                        onClearInitialPetId={() => setSelectedPetIdForNewSoap(null)}
                      />
                    ) : currentTab === 'pharmacy' ? (
                      <PharmacyView
                        pets={petList}
                        clients={clientList}
                        allStaff={staffList}
                        loggedInStaff={loggedInStaff}
                      />
                    ) : currentTab === 'treatment' ? (
                      <InventoryView
                        treatmentPrices={treatmentPrices}
                        onChangeTreatmentPrices={setTreatmentPrices}
                        medicationPrices={medicationPrices}
                        onChangeMedicationPrices={setMedicationPrices}
                        supplierOrders={supplierOrders}
                        onChangeSupplierOrders={setSupplierOrders}
                        allStaff={staffList}
                        loggedInStaff={loggedInStaff}
                      />
                    ) : currentTab === 'staff' ? (
                      <StaffView
                        allStaff={staffList}
                        loggedInStaff={loggedInStaff}
                        onAddStaff={(newS) => setStaffList(prev => [...prev, newS])}
                        onUpdateStaff={(updatedList) => setStaffList(updatedList)}
                      />
                    ) : currentTab === 'billing' ? (
                      <BillingView
                        onAddInvoice={(newI) => setInvoiceList(prev => [newI, ...prev])}
                      />
                    ) : currentTab === 'reports' ? (
                      <ReportsView
                        invoices={invoiceList}
                        splits={splitList}
                        allStaff={staffList}
                        pets={petList}
                        clients={clientList}
                        onMarkInvoicePaid={handleMarkInvoicePaid}
                        onApproveSplit={handleApproveSplit}
                        onPaySplit={handlePaySplit}
                      />
                    ) : currentTab === 'settings' ? (
                      <div className="space-y-6">
                        <div className="border-b border-outline-variant/40 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h1 className="text-xl font-bold font-sans text-[#0d1c2e] tracking-tight">
                              ⚙️ Clinic Settings &amp; Configuration
                            </h1>
                            <p className="text-xs text-[#545d62] font-semibold mt-0.5">
                              Modify practice brand profiles, operational hours, closure schedules, and system capabilities.
                            </p>
                          </div>
                          <div className="text-[10px] bg-[#eff4ff] border border-primary-container/10 px-3 py-1 rounded-md text-[#00647c] font-bold font-mono uppercase">
                            ⚙️ Portal Settings
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6" id="settings-main-panels-page">
                          {/* Tab Headers */}
                          <div className="flex border-b border-slate-200 mb-6">
                            <button
                              type="button"
                              onClick={() => setSettingsSubTab('info')}
                              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                                settingsSubTab === 'info'
                                  ? 'border-[#00647c] text-[#00647c]'
                                  : 'border-transparent text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              Clinic Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => setSettingsSubTab('hours')}
                              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                                settingsSubTab === 'hours'
                                  ? 'border-[#00647c] text-[#00647c]'
                                  : 'border-transparent text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              Hours of Operation
                            </button>
                            <button
                              type="button"
                              onClick={() => setSettingsSubTab('holidays')}
                              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                                settingsSubTab === 'holidays'
                                  ? 'border-[#00647c] text-[#00647c]'
                                  : 'border-transparent text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              Holidays Settings
                            </button>
                            <button
                              type="button"
                              onClick={() => setSettingsSubTab('system')}
                              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                                settingsSubTab === 'system'
                                  ? 'border-[#00647c] text-[#00647c]'
                                  : 'border-transparent text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              System Configs
                            </button>
                          </div>

                          {/* TAB 1: CLINIC PROFILE */}
                          {settingsSubTab === 'info' && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
                                {/* Live Preview Display of branding insignia */}
                                <div className="w-16 h-16 bg-[#00647c] rounded-xl flex items-center justify-center text-white shadow-md overflow-hidden shrink-0">
                                  {clinicInfo.logoType === 'Custom' && clinicInfo.logoUrl ? (
                                    <img src={clinicInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                  ) : clinicInfo.logoType === 'Heart' ? (
                                    <Heart className="w-8 h-8 fill-current" />
                                  ) : clinicInfo.logoType === 'Shield' ? (
                                    <Shield className="w-8 h-8 fill-current" />
                                  ) : clinicInfo.logoType === 'Award' ? (
                                    <Award className="w-8 h-8 fill-current" />
                                  ) : (
                                    <PawPrint className="w-8 h-8 fill-current" />
                                  )}
                                </div>
                                <div className="text-center md:text-left">
                                  <span className="text-[10px] font-bold text-[#00647c] uppercase tracking-wider block">Live Brand Identity Preview</span>
                                  <h4 className="text-sm font-bold text-slate-800 mt-0.5">{clinicInfo.name || 'Unnamed Clinic'}</h4>
                                  <p className="text-[11px] text-slate-500">{clinicInfo.slogan || 'No Slogan Provided'}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider font-mono">Clinic Name</label>
                                  <input
                                    type="text"
                                    value={clinicInfo.name}
                                    onChange={(e) => {
                                      const next = { ...clinicInfo, name: e.target.value };
                                      setClinicInfo(next);
                                      localStorage.setItem('vet_clinic_info', JSON.stringify(next));
                                    }}
                                    placeholder="Clinical Vitality"
                                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#00647c]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider font-mono">Slogan / Tagline</label>
                                  <input
                                    type="text"
                                    value={clinicInfo.slogan}
                                    onChange={(e) => {
                                      const next = { ...clinicInfo, slogan: e.target.value };
                                      setClinicInfo(next);
                                      localStorage.setItem('vet_clinic_info', JSON.stringify(next));
                                    }}
                                    placeholder="VETERINARY CARE"
                                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#00647c]"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider font-mono">Clinician Brand Insignia (Logo)</label>
                                  <select
                                    value={clinicInfo.logoType}
                                    onChange={(e) => {
                                      const next = { ...clinicInfo, logoType: e.target.value };
                                      setClinicInfo(next);
                                      localStorage.setItem('vet_clinic_info', JSON.stringify(next));
                                    }}
                                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#00647c] cursor-pointer"
                                  >
                                    <option value="PawPrint">🐾 Paw Print Icon</option>
                                    <option value="Heart">❤️ Heart Icon</option>
                                    <option value="Shield">🛡️ Shield badge Icon</option>
                                    <option value="Award">🏆 Award Seal Icon</option>
                                    <option value="Custom">🖼️ Custom Image URL</option>
                                  </select>
                                </div>

                                {clinicInfo.logoType === 'Custom' && (
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider font-mono">Custom Logo Image URL</label>
                                    <input
                                      type="text"
                                      value={clinicInfo.logoUrl}
                                      onChange={(e) => {
                                        const next = { ...clinicInfo, logoUrl: e.target.value };
                                        setClinicInfo(next);
                                        localStorage.setItem('vet_clinic_info', JSON.stringify(next));
                                      }}
                                      placeholder="https://images.picsum.photos/seed/vethub/150/150"
                                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#00647c]"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider font-mono">Contact Phone Number</label>
                                  <input
                                    type="text"
                                    value={clinicInfo.phone}
                                    onChange={(e) => {
                                      const next = { ...clinicInfo, phone: e.target.value };
                                      setClinicInfo(next);
                                      localStorage.setItem('vet_clinic_info', JSON.stringify(next));
                                    }}
                                    placeholder="(555) 234-5678"
                                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#00647c]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider font-mono">Contact Email Address</label>
                                  <input
                                    type="email"
                                    value={clinicInfo.email}
                                    onChange={(e) => {
                                      const next = { ...clinicInfo, email: e.target.value };
                                      setClinicInfo(next);
                                      localStorage.setItem('vet_clinic_info', JSON.stringify(next));
                                    }}
                                    placeholder="contact@clinicalvitality.org"
                                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#00647c]"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider font-mono">Clinic Street Address</label>
                                  <input
                                    type="text"
                                    value={clinicInfo.address}
                                    onChange={(e) => {
                                      const next = { ...clinicInfo, address: e.target.value };
                                      setClinicInfo(next);
                                      localStorage.setItem('vet_clinic_info', JSON.stringify(next));
                                    }}
                                    placeholder="120 Medical Center Parkway, Suite 400"
                                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#00647c]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider font-mono">Public Website Link</label>
                                  <input
                                    type="text"
                                    value={clinicInfo.website}
                                    onChange={(e) => {
                                      const next = { ...clinicInfo, website: e.target.value };
                                      setClinicInfo(next);
                                      localStorage.setItem('vet_clinic_info', JSON.stringify(next));
                                    }}
                                    placeholder="www.clinicalvitality.org"
                                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#00647c]"
                                  />
                                </div>
                              </div>
                              
                              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-emerald-800 text-[11px] font-semibold">
                                <span>✓</span> All brand profile changes are saved locally and reflect immediately in headers!
                              </div>
                            </div>
                          )}

                          {/* TAB 2: HOURS OF OPERATION */}
                          {settingsSubTab === 'hours' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                              <div>
                                <label className="block text-[10.5px] font-bold text-slate-600 mb-1 uppercase tracking-wider font-sans">Establish Master Operating Hours Display</label>
                                <input
                                  type="text"
                                  value={clinicHours}
                                  onChange={(e) => {
                                    setClinicHours(e.target.value);
                                    localStorage.setItem('vet_clinic_hours', e.target.value);
                                  }}
                                  placeholder="e.g. 08:00 AM - 08:00 PM"
                                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#00647c]"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">Roster warnings are flagged against this time boundary.</span>
                              </div>

                              <div className="border-t pt-4">
                                <span className="block text-[10.5px] font-bold text-slate-600 mb-2 uppercase tracking-wider font-sans">Day-By-Day Custom Availability</span>
                                
                                <div className="space-y-2.5">
                                  {Object.keys(weeklyHours).map((day) => {
                                    const dayKey = day as keyof typeof weeklyHours;
                                    const dayData = weeklyHours[dayKey];
                                    return (
                                      <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl gap-3">
                                        <div className="flex items-center gap-3">
                                          <span className="w-12 font-bold text-xs text-slate-700 font-mono uppercase">{day}</span>
                                          <label className="inline-flex items-center cursor-pointer gap-2">
                                            <input
                                              type="checkbox"
                                              checked={!dayData.closed}
                                              onChange={(e) => {
                                                const next = {
                                                  ...weeklyHours,
                                                  [dayKey]: {
                                                    ...dayData,
                                                    closed: !e.target.checked
                                                  }
                                                };
                                                setWeeklyHours(next);
                                                localStorage.setItem('vet_weekly_hours', JSON.stringify(next));
                                              }}
                                              className="rounded text-[#00647c] focus:ring-[#00647c]"
                                            />
                                            <span className="text-xs font-semibold text-slate-600">Opened</span>
                                          </label>
                                        </div>

                                        {!dayData.closed ? (
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="text"
                                              value={dayData.open}
                                              onChange={(e) => {
                                                const next = {
                                                  ...weeklyHours,
                                                  [dayKey]: {
                                                    ...dayData,
                                                    open: e.target.value
                                                  }
                                                };
                                                setWeeklyHours(next);
                                                localStorage.setItem('vet_weekly_hours', JSON.stringify(next));
                                              }}
                                              placeholder="08:00 AM"
                                              className="w-24 text-center text-xs p-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                                            />
                                            <span className="text-slate-400 font-extrabold text-xs">to</span>
                                            <input
                                              type="text"
                                              value={dayData.close}
                                              onChange={(e) => {
                                                const next = {
                                                  ...weeklyHours,
                                                  [dayKey]: {
                                                    ...dayData,
                                                    close: e.target.value
                                                  }
                                                };
                                                setWeeklyHours(next);
                                                localStorage.setItem('vet_weekly_hours', JSON.stringify(next));
                                              }}
                                              placeholder="08:00 PM"
                                              className="w-24 text-center text-xs p-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                                            />
                                          </div>
                                        ) : (
                                          <span className="text-xs font-bold text-rose-600 uppercase font-mono bg-rose-100/50 px-2 py-0.5 rounded border border-rose-200">🚫 Closed</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* TAB 3: HOLIDAYS & CLOSURES */}
                          {settingsSubTab === 'holidays' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                              <span className="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider font-sans">Current Registered Practice Holidays</span>
                              
                              <div className="space-y-2">
                                {holidays.length === 0 ? (
                                  <p className="text-xs text-slate-400 font-semibold p-4 text-center bg-slate-50 rounded-xl">No holidays configured yet.</p>
                                ) : (
                                  holidays.map((holiday: any) => (
                                    <div key={holiday.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                      <div>
                                        <span className="font-bold text-slate-800 text-xs block">{holiday.name}</span>
                                        <span className="text-[10px] text-slate-400 font-mono font-bold">{holiday.date} • {holiday.closedEntireDay ? 'Closed Entire Day' : 'Half-Day Only'}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = holidays.filter((h: any) => h.id !== holiday.id);
                                          setHolidays(next);
                                          localStorage.setItem('vet_holidays', JSON.stringify(next));
                                        }}
                                        className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>

                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  if (!newHolidayName.trim() || !newHolidayDate) {
                                    alert('Please provide holiday name and valid calendar date.');
                                    return;
                                  }
                                  const nHoliday = {
                                    id: `h-custom-${Date.now()}`,
                                    name: newHolidayName.trim(),
                                    date: newHolidayDate,
                                    closedEntireDay: newHolidayClosed
                                  };
                                  const next = [...holidays, nHoliday];
                                  setHolidays(next);
                                  localStorage.setItem('vet_holidays', JSON.stringify(next));
                                  setNewHolidayName('');
                                  setNewHolidayDate('');
                                  alert(`Success! Custom holiday Closure added: ${nHoliday.name}`);
                                }}
                                className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 mt-4 space-y-3"
                              >
                                <span className="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider font-sans">Add Custom Closure Date</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase tracking-wider font-mono">Holiday Area</label>
                                    <input
                                      type="text"
                                      required
                                      value={newHolidayName}
                                      onChange={(e) => setNewHolidayName(e.target.value)}
                                      placeholder="Thanksgiving Day"
                                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#00647c]"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase tracking-wider font-mono">Calendar Closure Date</label>
                                    <input
                                      type="date"
                                      required
                                      value={newHolidayDate}
                                      onChange={(e) => setNewHolidayDate(e.target.value)}
                                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#00647c]"
                                    />
                                  </div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer py-1">
                                  <input
                                    type="checkbox"
                                    checked={newHolidayClosed}
                                    onChange={(e) => setNewHolidayClosed(e.target.checked)}
                                    className="rounded text-[#00647c] focus:ring-[#00647c]"
                                  />
                                  <span className="text-xs font-semibold text-slate-600">Mark entire day closed (otherwise half-day operations apply)</span>
                                </label>
                                <button
                                  type="submit"
                                  className="w-full py-2 bg-[#00647c] hover:bg-cyan-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                  Register Clinic Closure Date
                                </button>
                              </form>
                            </div>
                          )}

                          {/* TAB 4: SYSTEM INTEGRATIONS */}
                          {settingsSubTab === 'system' && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                              <div>
                                <span className="block text-[10.5px] font-bold text-slate-600 mb-2 uppercase tracking-wider font-sans">Integrated Software Capabilities</span>
                                <div className="space-y-2">
                                  <label className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-200 transition-colors">
                                    <div>
                                      <span className="font-semibold block text-xs">Speech-To-Text Audio AI Translation</span>
                                      <span className="text-[10px] text-slate-400 block mt-0.5">Enables voice neural transcriptions inside SOAP editors</span>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={systemConfigs.speechToText}
                                      onChange={(e) => {
                                        const next = { ...systemConfigs, speechToText: e.target.checked };
                                        setSystemConfigs(next);
                                        localStorage.setItem('vet_system_configs', JSON.stringify(next));
                                      }}
                                      className="rounded text-[#00647c] focus:ring-[#00647c]"
                                    />
                                  </label>
                                  <label className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-200 transition-colors">
                                    <div>
                                      <span className="font-semibold block text-xs">Automatic Clinical Revenue Splitting</span>
                                      <span className="text-[10px] text-slate-400 block mt-0.5">Calculates individual team commissions instantly upon chart lock</span>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={systemConfigs.revenueSplitting}
                                      onChange={(e) => {
                                        const next = { ...systemConfigs, revenueSplitting: e.target.checked };
                                        setSystemConfigs(next);
                                        localStorage.setItem('vet_system_configs', JSON.stringify(next));
                                      }}
                                      className="rounded text-[#00647c] focus:ring-[#00647c]"
                                    />
                                  </label>
                                  <label className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-200 transition-colors">
                                    <div>
                                      <span className="font-semibold block text-xs">Offline Client Backup State Recovery</span>
                                      <span className="text-[10px] text-slate-400 block mt-0.5">Caches patient record modifications inside standard LocalStorage</span>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={systemConfigs.offlineRecovery}
                                      onChange={(e) => {
                                        const next = { ...systemConfigs, offlineRecovery: e.target.checked };
                                        setSystemConfigs(next);
                                        localStorage.setItem('vet_system_configs', JSON.stringify(next));
                                      }}
                                      className="rounded text-[#00647c] focus:ring-[#00647c]"
                                    />
                                  </label>
                                </div>
                              </div>

                              {/* Measurement Unit Config Selection */}
                              <div className="border-t pt-4 space-y-3">
                                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                                  📐 Unit Measurement Standard
                                </h4>
                                <p className="text-[10px] text-slate-400 font-medium">
                                  Define standard representation of weight and length units throughout medical charts, rosters, billing schedules, and printable patient summary tags.
                                </p>
                                <div className="grid grid-cols-2 gap-3 text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = { ...systemConfigs, weightUnit: 'Imperial' };
                                      setSystemConfigs(next);
                                      localStorage.setItem('vet_system_configs', JSON.stringify(next));
                                    }}
                                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                      systemConfigs.weightUnit === 'Imperial'
                                        ? 'bg-[#eff4ff] border-primary text-primary shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="text-sm">🇺🇸 Imperial Units</span>
                                    <span className="text-[9px] font-mono font-medium text-slate-400">Pounds (lb) &amp; Inches (in) • Default</span>
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = { ...systemConfigs, weightUnit: 'Metric' };
                                      setSystemConfigs(next);
                                      localStorage.setItem('vet_system_configs', JSON.stringify(next));
                                    }}
                                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                      systemConfigs.weightUnit === 'Metric'
                                        ? 'bg-[#eff4ff] border-primary text-primary shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="text-sm">🇪🇺 Metric Units</span>
                                    <span className="text-[9px] font-mono font-medium text-slate-400">Kilograms (kg) &amp; Centimeters (cm)</span>
                                  </button>
                                </div>
                              </div>

                              {/* Practice Promotions & Coupons Configuration */}
                              <div className="border-t pt-4 space-y-4">
                                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                                  🎯 Active Clinic Promotional Campaign Codes
                                </h4>

                                {/* Active lists */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {promotions.map(promo => (
                                    <div key={promo.id} className="p-3 bg-rose-50/20 border border-rose-200/50 rounded-xl text-left flex flex-col justify-between">
                                      <div>
                                        <div className="flex justify-between items-center text-xs font-bold gap-2">
                                          <span className="text-rose-900 truncate">{promo.name}</span>
                                          <span className="text-rose-700 font-mono text-[10px] bg-rose-50 px-1.5 py-0.5 rounded uppercase border border-rose-100 shrink-0">#{promo.code}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">{promo.description}</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = promotions.filter(p => p.id !== promo.id);
                                          setPromotions(next);
                                        }}
                                        className="mt-2 text-left text-[9.5px] text-rose-600 hover:text-rose-800 font-bold w-fit cursor-pointer"
                                      >
                                        Delete Campaign
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                {/* Adding Form */}
                                <form onSubmit={handleAddNewPromotion} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
                                  <span className="text-[10.5px] font-bold text-slate-600 block uppercase tracking-wider font-sans">Register New Promotion Coupon</span>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase tracking-wider font-mono">Campaign Name</label>
                                      <input
                                        type="text" required value={newPromoNameInput} onChange={(e) => setNewPromoNameInput(e.target.value)} placeholder="Summer Tick Drive"
                                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#00647c]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase tracking-wider font-mono">Coupon Code</label>
                                      <input
                                        type="text" required value={newPromoCodeInput} onChange={(e) => setNewPromoCodeInput(e.target.value)} placeholder="TICKFREE"
                                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold uppercase focus:ring-1 focus:ring-[#00647c]"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase tracking-wider font-mono">Description Stipulations</label>
                                    <input
                                      type="text" value={newPromoDescInput} onChange={(e) => setNewPromoDescInput(e.target.value)} placeholder="Get free scale kit with any booster appointment."
                                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-[#00647c]"
                                    />
                                  </div>

                                  <button
                                    type="submit"
                                    className="w-full py-2 bg-[#00647c] hover:bg-cyan-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer uppercase tracking-wider font-mono"
                                  >
                                    Publish Coupon Stimulus Campaign
                                  </button>
                                </form>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
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
                          onStartNewSoap={(petId) => {
                            setSelectedPetIdForNewSoap(petId);
                            setCurrentTab('records');
                          }}
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
                  className="bg-white rounded-xl shadow-2xl border border-outline-variant/60 w-full overflow-hidden flex flex-col max-w-2xl"
                >
                  {/* Modal Header */}
                  <div className="bg-[#eff4ff] px-6 py-4 border-b border-outline-variant/40 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {activeFeatureModal === 'appointments' && <Calendar className="w-5 h-5 text-[#00647c]" />}
                        {activeFeatureModal === 'pharmacy' && <Pill className="w-5 h-5 text-[#00647c]" />}
                        {activeFeatureModal === 'invoicing' && <CreditCard className="w-5 h-5 text-[#00647c]" />}
                        {activeFeatureModal === 'reports' && <BarChart3 className="w-5 h-5 text-[#00647c]" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wide text-[#0d1c2e]">
                          {activeFeatureModal === 'appointments' && '📅 Appointments Control Board'}
                          {activeFeatureModal === 'pharmacy' && '💊 Pharmacy & Controlled Substances'}
                          {activeFeatureModal === 'invoicing' && '🏦 Invoices & Fee-For-Service Ledger'}
                          {activeFeatureModal === 'reports' && '📊 Clinic Productivity & Revenue Reports'}
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

          {/* Edit Profile Modal Dialog */}
          {showEditProfileModal && loggedInStaff && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-205 shadow-2xl w-full max-w-md overflow-hidden text-slate-800"
              >
                <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
                    👤 Edit Staff Profile Detail
                  </h3>
                  <button 
                    onClick={() => setShowEditProfileModal(false)}
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!editedName.trim()) return;
                  handleUpdateStaff({
                    ...loggedInStaff,
                    name: editedName.trim(),
                    email: editedEmail.trim(),
                    avatar: editedAvatar.trim(),
                    password: editedPassword.trim(),
                    phone: editedPhone.trim(),
                    emergencyPhone: editedEmergencyPhone.trim(),
                  });
                  setShowEditProfileModal(false);
                }}
                  className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto"
                >
                  <div className="flex flex-col items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-150 mb-2">
                    <img 
                      src={editedAvatar.trim() || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80"}
                      alt="Profile Preview"
                      className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avatar Preview</span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Full Name
                    </label>
                    <input 
                      type="text"
                      required
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium bg-white text-slate-850"
                      placeholder="Dr. Sarah Jenkins"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Work Email Address
                    </label>
                    <input 
                      type="email"
                      required
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium bg-white text-slate-850"
                      placeholder="s.jenkins@vethub.org"
                    />
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3 mt-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      ✨ Design Your Profile Avatar
                    </label>
                    <div className="flex bg-slate-105 p-0.5 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setAvatarCreatorTab('create')}
                        className={`flex-1 py-1.5 px-2.5 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          avatarCreatorTab === 'create'
                            ? 'bg-white text-slate-800 shadow-xs'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        🎨 Interactive Creator
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatarCreatorTab('upload')}
                        className={`flex-1 py-1.5 px-2.5 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          avatarCreatorTab === 'upload'
                            ? 'bg-white text-slate-800 shadow-xs'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        📤 Upload Custom Photo
                      </button>
                    </div>

                    {avatarCreatorTab === 'create' ? (
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-3">
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">1. Style Background Gradient</span>
                          <div className="flex gap-2.5">
                            {AVATAR_BG_PRESETS.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => setAvatarCreatorBg(preset.id)}
                                title={preset.name}
                                className={`w-8 h-8 rounded-xl cursor-pointer transition-transform duration-200 relative ${
                                  avatarCreatorBg === preset.id 
                                    ? 'scale-110 ring-2 ring-[#0F766E] ring-offset-2' 
                                    : 'hover:scale-105 opacity-85 hover:opacity-100'
                                }`}
                                style={{
                                  background: `linear-gradient(135deg, ${preset.from} 0%, ${preset.to} 100%)`
                                }}
                              >
                                {avatarCreatorBg === preset.id && (
                                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">2. Select Primary Mascot</span>
                          <div className="grid grid-cols-5 gap-1.5">
                            {AVATAR_ICON_PRESETS.map((icon) => (
                              <button
                                key={icon.id}
                                type="button"
                                onClick={() => setAvatarCreatorIcon(icon.id)}
                                className={`py-1.5 px-1 rounded-xl cursor-pointer border text-center transition-all ${
                                  avatarCreatorIcon === icon.id
                                    ? 'bg-[#0F766E]/10 border-[#0F766E] text-[#0F766E] font-black'
                                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600 font-medium'
                                }`}
                              >
                                <div className="text-xs">{icon.label.split(' ')[0]}</div>
                                <div className="text-[8px] font-bold tracking-tight uppercase leading-none mt-0.5">{icon.label.split(' ')[1]}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200/60 flex items-center justify-center border border-slate-300 text-slate-500">
                          <Plus className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-700">Drop your profile picture here or browse</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">Supports PNG, JPG, or SVG up to 5MB</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          id="avatar-upload-file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setEditedAvatar(reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <label
                          htmlFor="avatar-upload-file"
                          className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold tracking-wide uppercase border border-slate-200 shadow-xs cursor-pointer rounded-xl text-[9px] font-mono transition-all"
                        >
                          Select Image File
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Contact Information Section */}
                  <div className="border-t border-slate-100 pt-3.5 mt-2">
                    <h4 className="text-[10px] uppercase font-black tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-[#0F766E] stroke-[2.5]" />
                      📞 Contact & Emergency Information
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Primary Phone
                      </label>
                      <input 
                        type="tel"
                        value={editedPhone}
                        onChange={(e) => setEditedPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium bg-white text-slate-850"
                        placeholder="+1 (555) 124-5678"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-500" />
                        Emergency Contact
                      </label>
                      <input 
                        type="tel"
                        value={editedEmergencyPhone}
                        onChange={(e) => setEditedEmergencyPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-rose-200 focus:border-rose-500 focus:ring-rose-200/20 bg-rose-50/5 focus:outline-none focus:ring-2 rounded-xl font-medium text-slate-850"
                        placeholder="+1 (555) 911-2834"
                      />
                    </div>
                  </div>

                  {/* Security & Password Changes */}
                  <div className="border-t border-slate-100 pt-3.5 mt-2">
                    <h4 className="text-[10px] uppercase font-black tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5 font-mono">
                      <Lock className="w-3.5 h-3.5 text-[#0F766E] stroke-[2.5]" />
                      🔑 Security Credentials
                    </h4>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Update Account Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showModalPassword ? "text" : "password"}
                        value={editedPassword}
                        onChange={(e) => setEditedPassword(e.target.value)}
                        className="w-full px-3 pr-10 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium bg-white text-slate-850"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowModalPassword(!showModalPassword)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showModalPassword ? (
                          <EyeOff className="w-4 h-4 stroke-[2]" />
                        ) : (
                          <Eye className="w-4 h-4 stroke-[2]" />
                        )}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium leading-normal mt-0.5">To alter your current login credentials, enter your newly preferred secure password above.</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button 
                      type="button"
                      onClick={() => setShowEditProfileModal(false)}
                      className="px-4 py-2 text-xs bg-slate-100 font-bold uppercase hover:bg-slate-200 text-slate-600 rounded-lg transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    
                    <button 
                      type="submit"
                      className="px-4 py-2 text-xs bg-primary text-white font-bold uppercase hover:bg-primary-dark rounded-lg transition-all shadow-xs cursor-pointer"
                    >
                      Save Settings
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
