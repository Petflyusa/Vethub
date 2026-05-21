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
  weight: number; // in kg
  gender: 'Male' | 'Female' | 'Neutered Male' | 'Spayed Female';
  status: 'Checked In' | 'In Surgery' | 'In Treatment' | 'Discharged';
  ownerId: string;
  alertAllergies: string[];
  avatar: string;
}

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
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
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
