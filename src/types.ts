/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DVM = 'DVM',
  TECH = 'TECH',
  RECEPTION = 'RECEPTION',
  FINANCE = 'FINANCE'
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  active: boolean;
  specialty?: string;
  billingRate?: number;
  permissions?: string[];
  password?: string;
  phone?: string;
  emergencyPhone?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  joinedDate: string;
  membershipType: 'Standard' | 'Gold' | 'Platinum';
}

export interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Exotic';
  breed: string;
  age: string; // e.g., "3 years 2 months"
  dob?: string; // e.g., "2023-03-23"
  weight: number; // in kg
  gender: 'Male' | 'Female' | 'Neutered Male' | 'Spayed Female';
  status: 'Checked In' | 'In Surgery' | 'In Treatment' | 'Discharged' | 'Overnight Stay';
  ownerId: string;
  alertAllergies: string[];
  avatar: string;
}

export const calculateAgeFromDob = (dobString: string | undefined): string => {
  if (!dobString) return 'Unknown Age';
  const birthDate = new Date(dobString);
  const today = new Date('2026-05-23'); // Anchored around system today's date for consistency
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }
  
  if (years < 0) return '0 Yr. 0 Mo.'; // Guard
  
  return `${years} Yr. ${months} Mo.`;
};

export interface Appointment {
  id: string;
  petId: string;
  clientId: string;
  staffId: string; // Assigned Vet
  dateTime: string;
  duration: number; // in minutes
  reason: string;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  visitType?: 'Phone' | 'Walk-In' | 'Emergency';
  vitals?: {
    temp?: string;       // Temperature e.g. "101.5 °F"
    hr?: string;         // Heart Rate e.g. "90 bpm"
    rr?: string;         // Respiratory Rate e.g. "20 rpm"
    bp?: string;         // Blood Pressure e.g. "120/80"
    vitalsTakenBy?: string; // Tech Staff ID
  };
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  careInstructions?: string;     // Outpatient care instructions
  restRestrictions?: string;     // Home rest / activity limitations
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Treatment {
  id: string;
  name: string;
  dosageOrRoute?: string;
  notes?: string;
  administeredBy?: string; // Staff ID
  status: 'PENDING' | 'ADMINISTERED' | 'CANCELLED';
  dateTime?: string;
}

export interface VaccineRecord {
  id: string;
  name: string;
  date: string;
  nextDueDate: string;
  dosage?: string;
  status: 'Administered' | 'Due' | 'Overdue';
  manufacturer?: string;
  serialNumber?: string;
  type?: 'Active' | 'Killed' | 'Inactive';
}

export interface MedicalRecord {
  id: string;
  petId: string;
  appointmentId?: string;
  dvmId: string;
  date: string;
  isComplete: boolean;
  soap: SoapNote;
  procedureTeam: string[]; // staff IDs
  prescriptions: Prescription[];
  treatments?: Treatment[];
  vaccinations?: VaccineRecord[];
  labOrders: string[]; // lab order IDs
  images: { id: string; name: string; url: string; notes?: string }[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  category: 'Consultation' | 'Medication' | 'Lab' | 'Surgery' | 'General';
}

export interface Invoice {
  id: string;
  appointmentId?: string;
  clientId: string;
  date: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID';
  items: InvoiceItem[];
  total: number;
}

export interface RevenueSplit {
  id: string;
  invoiceId: string;
  itemId: string;
  staffId: string;
  role: Role;
  percentage: number;
  splitAmount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID';
}

export interface AccessGrant {
  id: string;
  staffId: string;
  grantorId: string;
  refId: string; // e.g. medicalRecordId or consultationId
  grantType: 'TEMPORARY_COVERAGE' | 'CONSULTATION' | 'REFERRAL';
  validFrom: string;
  validUntil: string;
  revokedAt: string | null;
}

export interface Consultation {
  id: string;
  medicalRecordId: string;
  requesterDvmId: string;
  targetDvmId: string;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  question: string;
  notes: string | null;
  revenueAmount: number;
  validUntil: string;
}

export interface LabOrder {
  id: string;
  petId: string;
  medicalRecordId?: string;
  staffId: string; // orderer
  testName: string;
  status: 'PENDING' | 'SAMPLE_COLLECTED' | 'COMPLETED';
  resultNotes: string | null;
  isHighRisk: boolean;
  date: string;
}

export const getStaticRoleDefaultPermissions = (role: Role): string[] => {
  switch (role) {
    case Role.OWNER:
      return [
        'dashboard',
        'patients',
        'appointments',
        'calendar',
        'board',
        'soap_edit',
        'records_view',
        'orders_create',
        'treatment_exec',
        'pharmacy',
        'inpatient',
        'discharge',
        'billing',
        'staff_manage',
        'scheduling',
        'permissions_edit',
        'pricing',
        'inventory',
        'suppliers',
        'reports',
        'audit_logs',
        'promotions',
        'settings'
      ];
    case Role.ADMIN:
    case Role.MANAGER:
      return [
        'dashboard',
        'patients',
        'appointments',
        'calendar',
        'board',
        'records_view', // read-only context is handled in UI checks
        'pharmacy',
        'inpatient',
        'discharge',
        'billing',
        'staff_manage',
        'scheduling',
        'permissions_edit',
        'pricing',
        'inventory',
        'suppliers',
        'reports',
        'audit_logs',
        'promotions',
        'settings'
      ];
    case Role.DVM:
      return [
        'dashboard',
        'patients',
        'appointments',
        'calendar',
        'board',
        'soap_edit',
        'records_view',
        'orders_create',
        'pharmacy',
        'inpatient'
      ];
    case Role.TECH:
      return [
        'dashboard',
        'patients',
        'board',
        'records_view',
        'treatment_exec',
        'inpatient',
        'inventory'
      ];
    case Role.RECEPTION:
      return [
        'dashboard',
        'patients',
        'appointments',
        'calendar',
        'board',
        'discharge',
        'billing'
      ];
    case Role.FINANCE:
      return [
        'dashboard',
        'billing',
        'reports',
        'audit_logs'
      ];
    default:
      return ['dashboard'];
  }
};

export const getRoleDefaultPermissions = (role: Role): string[] => {
  if (role === Role.OWNER) {
    return getStaticRoleDefaultPermissions(Role.OWNER);
  }
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('vet_clinic_role_permissions_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed[role])) {
          return parsed[role];
        }
      }
    } catch (e) {
      console.error('Error reading saved role permissions:', e);
    }
  }
  return getStaticRoleDefaultPermissions(role);
};

export const saveRoleDefaultPermissions = (role: Role, permissions: string[]): void => {
  if (role === Role.OWNER) return;
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('vet_clinic_role_permissions_v1');
      const current = saved ? JSON.parse(saved) : {};
      current[role] = permissions;
      localStorage.setItem('vet_clinic_role_permissions_v1', JSON.stringify(current));
    } catch (e) {
      console.error('Error saving role permissions:', e);
    }
  }
};

export const hasPermission = (staff: Staff | null | undefined, permission: string): boolean => {
  if (!staff) return false;
  
  // Owner always has all permissions
  if (staff.role === Role.OWNER) return true;

  // Retrieve active permissions (overridden permissions or fallback to default ones)
  const activePerms = staff.permissions || getRoleDefaultPermissions(staff.role);

  // Map legacy permission hooks check to new keys seamlessly for backward compatibility
  let targetKeys = [permission];
  if (permission === 'DASHBOARD_ACCESS') targetKeys = ['dashboard', 'board'];
  if (permission === 'APPOINTMENTS_VIEW') targetKeys = ['appointments', 'calendar'];
  if (permission === 'PATIENTS_VIEW') targetKeys = ['patients', 'records_view'];
  if (permission === 'SOAP_RECORDS_EDIT') targetKeys = ['soap_edit', 'orders_create'];
  if (permission === 'PHARMACY_Dispense') targetKeys = ['pharmacy'];
  if (permission === 'BILLING_INVOICE') targetKeys = ['billing', 'discharge'];
  if (permission === 'STAFF_PERMISSIONS_EDIT') targetKeys = ['permissions_edit', 'staff_manage'];

  return targetKeys.some(key => activePerms.includes(key));
};

