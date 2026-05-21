/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, Pet, Staff, Appointment, MedicalRecord, Invoice, RevenueSplit, Consultation, LabOrder, Role } from './types';

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'staff-dvm-1',
    name: 'Dr. Alexander Smith',
    email: 'dr.smith@vethub.com',
    role: Role.DVM,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    active: true,
    specialty: 'Orthopedic Surgery & Canine Cardiology',
    billingRate: 150
  },
  {
    id: 'staff-dvm-2',
    name: 'Dr. Elena Rostova',
    email: 'dr.rostova@vethub.com',
    role: Role.DVM,
    avatar: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&auto=format&fit=crop&q=80',
    active: true,
    specialty: 'Exotic Animals & Feline Medicine',
    billingRate: 140
  },
  {
    id: 'staff-mgr-1',
    name: 'Emily Watson',
    email: 'emily.watson@vethub.com',
    role: Role.MANAGER,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    active: true
  },
  {
    id: 'staff-tech-1',
    name: 'Marcus Vance',
    email: 'marcus.vance@vethub.com',
    role: Role.TECH,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    active: true,
    specialty: 'Anesthesia & Vet Lab Systems'
  },
  {
    id: 'staff-rec-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@vethub.com',
    role: Role.RECEPTION,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    active: true
  },
  {
    id: 'staff-fin-1',
    name: 'Carl Peterson',
    email: 'carl.peterson@vethub.com',
    role: Role.FINANCE,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    active: true
  },
  {
    id: 'staff-owner-1',
    name: 'Dr. Henry Jekyll',
    email: 'director@vethub.com',
    role: Role.OWNER,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    active: true,
    specialty: 'Chief Medical Officer & Administration',
    billingRate: 200
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    phone: '555-0192',
    address: '742 Evergreen Terrace, Springfield',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2023-01-15',
    membershipType: 'Platinum'
  },
  {
    id: 'client-2',
    name: 'Sarah Connor',
    email: 'sconnor@cyberdyne.net',
    phone: '555-0144',
    address: '121 Rogue Highway, Los Angeles',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2023-11-02',
    membershipType: 'Gold'
  },
  {
    id: 'client-3',
    name: 'Robert Smith',
    email: 'robert.smith@cure.org',
    phone: '555-0182',
    address: '42 Forest Lane, Crawley',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2024-02-28',
    membershipType: 'Standard'
  },
  {
    id: 'client-4',
    name: 'Emily Stone',
    email: 'emstone@hollywood.com',
    phone: '555-0167',
    address: '89 Sunset Blvd, Los Angeles',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2022-06-11',
    membershipType: 'Platinum'
  }
];

export const INITIAL_PETS: Pet[] = [
  {
    id: 'pet-1',
    name: 'Cooper',
    species: 'Dog',
    breed: 'Goldendoodle',
    age: '3 years 2 months',
    weight: 24.5,
    gender: 'Neutered Male',
    status: 'Checked In',
    ownerId: 'client-1',
    alertAllergies: ['Penicillin', 'Shellfish'],
    avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'pet-2',
    name: 'Luna',
    species: 'Cat',
    breed: 'Bengal Cat',
    age: '1 year 4 months',
    weight: 4.2,
    gender: 'Spayed Female',
    status: 'Checked In',
    ownerId: 'client-2',
    alertAllergies: ['Beef derivatives'],
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'pet-3',
    name: 'Bugs',
    species: 'Rabbit',
    breed: 'English Lop',
    age: '2 years',
    weight: 3.1,
    gender: 'Male',
    status: 'In Treatment',
    ownerId: 'client-3',
    alertAllergies: [],
    avatar: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'pet-4',
    name: 'Kiwi',
    species: 'Bird',
    breed: 'Blue-and-Gold Macaw',
    age: '5 years 8 months',
    weight: 1.05,
    gender: 'Spayed Female',
    status: 'Discharged',
    ownerId: 'client-4',
    alertAllergies: ['Avian Sulfa meds'],
    avatar: 'https://images.unsplash.com/photo-1552728089-57bdde30ebd3?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'pet-5',
    name: 'Bella',
    species: 'Dog',
    breed: 'French Bulldog',
    age: '2 years 1 month',
    weight: 11.2,
    gender: 'Spayed Female',
    status: 'In Treatment',
    ownerId: 'client-1',
    alertAllergies: [],
    avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'pet-6',
    name: 'Oliver',
    species: 'Cat',
    breed: 'Siamese Cat',
    age: '4 years',
    weight: 5.1,
    gender: 'Neutered Male',
    status: 'Discharged',
    ownerId: 'client-2',
    alertAllergies: ['Certain grains'],
    avatar: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    petId: 'pet-1',
    clientId: 'client-1',
    staffId: 'staff-dvm-1',
    dateTime: '2026-05-21T09:30:00Z',
    duration: 30,
    reason: 'Annual Checkup & Rabies Vaccine Booster',
    status: 'CHECKED_IN',
    notes: 'Owner requests weight counseling.'
  },
  {
    id: 'apt-2',
    petId: 'pet-2',
    clientId: 'client-2',
    staffId: 'staff-dvm-1',
    dateTime: '2026-05-21T10:30:00Z',
    duration: 45,
    reason: 'Acute Limping on Rear Right Leg',
    status: 'CHECKED_IN',
    notes: 'Started yesterday after jump from cabinet.'
  },
  {
    id: 'apt-3',
    petId: 'pet-3',
    clientId: 'client-3',
    staffId: 'staff-dvm-2',
    dateTime: '2026-05-21T11:15:00Z',
    duration: 60,
    reason: 'Dental Scaling & Abscess Prep',
    status: 'IN_PROGRESS',
    notes: 'High stress pet, requires pre-sedative.'
  },
  {
    id: 'apt-4',
    petId: 'pet-4',
    clientId: 'client-4',
    staffId: 'staff-dvm-2',
    dateTime: '2026-05-21T14:00:00Z',
    duration: 30,
    reason: 'Feather Plucking Behavioral consultation',
    status: 'CONFIRMED',
    notes: 'Highly environmental stress likely.'
  }
];

export const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'mr-1',
    petId: 'pet-1',
    appointmentId: 'apt-1',
    dvmId: 'staff-dvm-1',
    date: '2026-05-21',
    isComplete: false,
    soap: {
      subjective: 'Cooper presented for an annual checkup and vaccination boosters. Owner reports Cooper is active, eating well, with normal bowel movements. Mentioned Cooper gained some weight recently and has an occasional dry cough after intense play.',
      objective: 'Weight: 24.5 kg (up 1.8 kg since last visit). Temp: 38.6°C. Heart Rate: 104 bpm, sinus rhythm with active femoral pulses. Hydration normal. Respiratory: clear bronchovesicular breath sounds. Left ear canal shows mild erythema and wax buildup.',
      assessment: '1. Clinically healthy adult canine.\n2. Mild bilateral otitis externa (early wax buildup).\n3. Borderline overweight condition (Body Condition Score 6/9).',
      plan: '1. Administer Rabies (3-yr) and DHPP boosters.\n2. Clean left ear with VetOtic cleanser; apply Mometamax drops once daily for 7 days.\n3. Reduce dry food kibble by 15%, substitute with green beans for volume if hungry.'
    },
    procedureTeam: ['staff-dvm-1', 'staff-tech-1'],
    prescriptions: [
      {
        id: 'rx-1',
        medicationName: 'Mometamax Otic Suspension',
        dosage: '4 drops',
        frequency: 'Once daily',
        duration: '7 Days',
        notes: 'Instill into left ear after thorough cleansing.'
      }
    ],
    vaccinations: [
      {
        id: 'vac-1',
        name: 'Rabies 3-Year Booster',
        date: '2026-05-21',
        nextDueDate: '2029-05-21',
        dosage: '1.0 mL',
        status: 'Administered'
      },
      {
        id: 'vac-2',
        name: 'DHPP Core Vaccine',
        date: '2026-05-21',
        nextDueDate: '2027-05-21',
        dosage: '1.0 mL',
        status: 'Administered'
      }
    ],
    labOrders: ['lab-1'],
    images: []
  },
  {
    id: 'mr-3',
    petId: 'pet-3',
    appointmentId: 'apt-3',
    dvmId: 'staff-dvm-2',
    date: '2026-05-21',
    isComplete: false,
    soap: {
      subjective: 'Bugs the Rabbit presented for dental scaling to resolve sharp molar spurs on the lower right jaw affecting food intake.',
      objective: 'Weight: 3.1kg. Temp: 39.1°C. Alert, but slight drooling under chin. Intraoral assessment reveals grade 2 molar alignment abnormality, small mucosal ulceration on the right tongue border.',
      assessment: '1. Molar spurs causing localized tongue injury.\n2. Mild pain resulting in slight food reduction.',
      plan: '1. General anesthesia (Isoflurane mask + Intubation).\n2. Trim and file sharp molar spurs.\n3. Prescribe Metacam for post-op swelling.'
    },
    procedureTeam: ['staff-dvm-2', 'staff-tech-1'],
    prescriptions: [
      {
        id: 'rx-3',
        medicationName: 'Metacam Oral Suspension (0.5mg/ml)',
        dosage: '0.6 ml',
        frequency: 'Every 24 hours',
        duration: '5 Days',
        notes: 'Administer orally with food. Watch for appetite loss.'
      }
    ],
    labOrders: [],
    images: [
      {
        id: 'img-1',
        name: 'Bugs Dental X-Ray Pre-Op',
        url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80',
        notes: 'Shows right lower molar alignment causing severe inward spur growth.'
      }
    ]
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    appointmentId: 'apt-1',
    clientId: 'client-1',
    date: '2026-05-21',
    dueDate: '2026-05-21',
    status: 'SENT',
    items: [
      { id: 'item-1', description: 'Canine Wellness Consultation Fee', amount: 85.00, quantity: 1, category: 'Consultation' },
      { id: 'item-2', description: 'Rabies Booster Vaccine 3-Year', amount: 35.00, quantity: 1, category: 'General' },
      { id: 'item-3', description: 'Mometamax Otic drops (15g)', amount: 48.50, quantity: 1, category: 'Medication' },
      { id: 'item-4', description: 'Fecal Flotation & Parasite Screen', amount: 65.00, quantity: 1, category: 'Lab' }
    ],
    total: 233.50
  },
  {
    id: 'inv-2',
    appointmentId: 'apt-3',
    clientId: 'client-3',
    date: '2026-05-21',
    dueDate: '2026-05-28',
    status: 'DRAFT',
    items: [
      { id: 'item-5', description: 'Specialist General Anesthesia (Rabbit)', amount: 180.00, quantity: 1, category: 'Surgery' },
      { id: 'item-6', description: 'Molar spur trimming and dental plane file', amount: 220.00, quantity: 1, category: 'Surgery' },
      { id: 'item-7', description: 'Metacam rabbit oral suspension (10ml)', amount: 35.00, quantity: 1, category: 'Medication' }
    ],
    total: 435.00
  },
  {
    id: 'inv-archive-1',
    clientId: 'client-4',
    date: '2026-05-18',
    dueDate: '2026-05-18',
    status: 'PAID',
    items: [
      { id: 'item-8', description: 'Avian Behavioral Specialist Session', amount: 120.00, quantity: 1, category: 'Consultation' },
      { id: 'item-9', description: 'Blood Draw & Chemistry Panel', amount: 165.00, quantity: 1, category: 'Lab' }
    ],
    total: 285.00
  }
];

export const INITIAL_REVENUE_SPLITS: RevenueSplit[] = [
  {
    id: 'split-1',
    invoiceId: 'inv-archive-1',
    itemId: 'item-8',
    staffId: 'staff-dvm-2',
    role: Role.DVM,
    percentage: 30,
    splitAmount: 36.00,
    status: 'PAID'
  },
  {
    id: 'split-2',
    invoiceId: 'inv-archive-1',
    itemId: 'item-9',
    staffId: 'staff-tech-1',
    role: Role.TECH,
    percentage: 15,
    splitAmount: 24.75,
    status: 'APPROVED'
  },
  {
    id: 'split-3',
    invoiceId: 'inv-1',
    itemId: 'item-1',
    staffId: 'staff-dvm-1',
    role: Role.DVM,
    percentage: 25,
    splitAmount: 21.25,
    status: 'PENDING'
  },
  {
    id: 'split-4',
    invoiceId: 'inv-1',
    itemId: 'item-4',
    staffId: 'staff-tech-1',
    role: Role.TECH,
    percentage: 10,
    splitAmount: 6.50,
    status: 'PENDING'
  }
];

export const INITIAL_CONSULTATIONS: Consultation[] = [
  {
    id: 'con-1',
    medicalRecordId: 'mr-1',
    requesterDvmId: 'staff-dvm-1',
    targetDvmId: 'staff-dvm-2',
    status: 'PENDING',
    question: 'Dr. Rostova, in Goldendoodles of Cooper’s age, could this dry cough after play indicate a very early-stage laryngeal dysfunction, or should I rule out primary tracheal sensitivity first? The heart size is completely normal.',
    notes: null,
    revenueAmount: 45.00,
    validUntil: '2026-05-24T00:00:00Z'
  },
  {
    id: 'con-archive-1',
    medicalRecordId: 'mr-3',
    requesterDvmId: 'staff-dvm-2',
    targetDvmId: 'staff-owner-1',
    status: 'COMPLETED',
    question: 'Requesting review of dental X-Ray lines for Bugs. Is the rear molar root structure indicating early abscess infiltration?',
    notes: 'Reviewed X-ray. Root structure is stable, clean scaling is sufficient. Absence of bone-lysis rules out deep alveolar abscess at this time.',
    revenueAmount: 60.00,
    validUntil: '2026-05-20T00:00:00Z'
  }
];

export const INITIAL_LAB_ORDERS: LabOrder[] = [
  {
    id: 'lab-1',
    petId: 'pet-1',
    medicalRecordId: 'mr-1',
    staffId: 'staff-dvm-1',
    testName: 'Fecal Parasite ELISA Screen',
    status: 'SAMPLE_COLLECTED',
    resultNotes: null,
    isHighRisk: false,
    date: '2026-05-21'
  },
  {
    id: 'lab-archive-1',
    petId: 'pet-4',
    staffId: 'staff-dvm-2',
    testName: 'Complete Avian Metabolic Chemistry Profile',
    status: 'COMPLETED',
    resultNotes: 'Uric Acid: 4.8 mg/dL (Normal: 1.5 - 7). AST: 180 U/L (Adequate). Glucose: 270 mg/dL (Normal bird range). Overall endocrine wellness confirmed.',
    isHighRisk: false,
    date: '2026-05-18'
  }
];
