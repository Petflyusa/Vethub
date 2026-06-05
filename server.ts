import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_STAFF, INITIAL_CLIENTS, INITIAL_PETS, INITIAL_APPOINTMENTS, INITIAL_MEDICAL_RECORDS, INITIAL_INVOICES, INITIAL_REVENUE_SPLITS, INITIAL_CONSULTATIONS, INITIAL_LAB_ORDERS } from './src/mockData.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || 'https://cetpzosfsytjemmkjezf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldHB6b3Nmc3l0amVtbWtqZXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYyNDc1MywiZXhwIjoyMDk2MjAwNzUzfQ.H_OvZw8VerbrZ192Lm5gWuaIgBtTj7TiOcLAPDUqSjg';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Core data seeding on startup
async function seedDatabase() {
  try {
    const { count, error } = await supabase.from('staff').select('*', { count: 'exact', head: true });
    if (error) throw error;

    if (count === 0) {
      console.log('Seeding Supabase database with initial mock data...');
      
      // 1. Seed staff
      await supabase.from('staff').insert(INITIAL_STAFF);
      
      // 2. Seed clients
      await supabase.from('clients').insert(INITIAL_CLIENTS);
      
      // 3. Seed pets
      await supabase.from('pets').insert(INITIAL_PETS);
      
      // 4. Seed appointments
      await supabase.from('appointments').insert(INITIAL_APPOINTMENTS.map(apt => ({
        ...apt,
        vitals: apt.vitals || null
      })));
      
      // 5. Seed medical records
      await supabase.from('medical_records').insert(INITIAL_MEDICAL_RECORDS.map(mr => ({
        ...mr,
        soap: mr.soap || {},
        prescriptions: mr.prescriptions || [],
        treatments: mr.treatments || [],
        vaccinations: mr.vaccinations || [],
        images: mr.images || []
      })));
      
      // 6. Seed invoices
      await supabase.from('invoices').insert(INITIAL_INVOICES.map(inv => ({
        ...inv,
        items: inv.items || []
      })));
      
      // 7. Seed revenue splits
      await supabase.from('revenue_splits').insert(INITIAL_REVENUE_SPLITS);
      
      // 8. Seed consultations
      await supabase.from('consultations').insert(INITIAL_CONSULTATIONS);
      
      // 9. Seed lab orders
      await supabase.from('lab_orders').insert(INITIAL_LAB_ORDERS);

      console.log('Core mock data seeding complete.');
    }

    // Seed settings
    const settingsToSeed: any[] = [
      { key: 'treatmentPrices', value: [
        { id: 'tx-1', name: 'Annual Wellness Exam', price: 65.00 },
        { id: 'tx-2', name: 'Dental Scale & Polish', price: 250.00 },
        { id: 'tx-3', name: 'Blood Panel & CBC Test', price: 120.00 },
        { id: 'tx-4', name: 'Emergency Triage & Fluid Charge', price: 180.00 },
        { id: 'tx-5', name: 'Rabies Core Booster', price: 35.00 },
        { id: 'tx-6', name: 'Leukemia Assay Assay', price: 50.00 },
        { id: 'tx-7', name: 'Soft Tissue Surgical Suture', price: 380.00 }
      ]},
      { key: 'medicationPrices', value: [
        { id: 'med-1', name: 'Apoquel 16mg', price: 45.00, stock: 48, minStock: 20 },
        { id: 'med-2', name: 'Clavamox 250mg', price: 35.00, stock: 18, minStock: 15 },
        { id: 'med-3', name: 'Heartgard Plus Chewable', price: 68.00, stock: 8, minStock: 10 },
        { id: 'med-4', name: 'Carprofen 100mg Tablet', price: 28.00, stock: 54, minStock: 15 },
        { id: 'med-5', name: 'Gabapentin 100mg Capsules', price: 22.00, stock: 11, minStock: 10 }
      ]},
      { key: 'overnightTasks', value: [
        { id: 't-1', petId: 'pet-1', task: 'Administer Carprofen 100mg Tablet', assignedTo: 'staff-tech-1', time: '08:00 PM', done: false },
        { id: 't-2', petId: 'pet-1', task: 'Check vitals and temperature', assignedTo: 'staff-tech-1', time: '10:00 PM', done: true },
        { id: 't-3', petId: 'pet-2', task: 'Pre-surgery fasting verification check', assignedTo: 'staff-tech-1', time: '06:00 AM', done: false },
        { id: 't-4', petId: 'pet-3', task: 'Administer IV hydrating fluids', assignedTo: 'staff-tech-1', time: '12:00 AM', done: false }
      ]},
      { key: 'supplierOrders', value: [
        { id: 'so-1', supplier: 'Zoetis Vet Supply Global', drugName: 'Apoquel 16mg', qty: 50, status: 'Completed', date: '2026-05-10', cost: 1250.00 },
        { id: 'so-2', supplier: 'Boehringer Ingelheim LLC', drugName: 'Heartgard Plus Chewable', qty: 100, status: 'Pending Approval', date: '2026-05-20', cost: 4200.00 }
      ]},
      { key: 'clinicHours', value: '08:00 AM - 08:00 PM' },
      { key: 'promotions', value: [
        { id: 'p-1', name: 'Autumn Vaccine Drive Discount', description: '20% off Rabies & DHPP combos during September', code: 'FALLVACS20', active: true },
        { id: 'p-2', name: 'Dental Awareness Month Drive', description: 'Scale & polish includes complimentary dental kit', code: 'DENTALSMILE', active: true }
      ]},
      { key: 'clinicInfo', value: {
        name: 'Clinical Vitality',
        slogan: 'VETERINARY CARE',
        logoType: 'PawPrint',
        logoUrl: '',
        email: 'contact@clinicalvitality.org',
        phone: '(555) 234-5678',
        address: '120 Medical Center Parkway, Suite 400',
        website: 'www.clinicalvitality.org'
      }},
      { key: 'weeklyHours', value: {
        Mon: { open: '08:00 AM', close: '08:00 PM', closed: false },
        Tue: { open: '08:00 AM', close: '08:00 PM', closed: false },
        Wed: { open: '08:00 AM', close: '08:00 PM', closed: false },
        Thu: { open: '08:00 AM', close: '08:00 PM', closed: false },
        Fri: { open: '08:00 AM', close: '08:00 PM', closed: false },
        Sat: { open: '09:00 AM', close: '05:00 PM', closed: false },
        Sun: { open: '10:00 AM', close: '04:00 PM', closed: true }
      }},
      { key: 'holidays', value: [
        { id: 'h-1', name: 'Memorial Day', date: '2026-05-25', closedEntireDay: true },
        { id: 'h-2', name: 'Independence Day', date: '2026-07-04', closedEntireDay: true },
        { id: 'h-3', name: 'Labor Day', date: '2026-09-07', closedEntireDay: true },
        { id: 'h-4', name: 'Christmas Day', date: '2026-12-25', closedEntireDay: true }
      ]},
      { key: 'systemConfigs', value: {
        speechToText: true,
        revenueSplitting: true,
        offlineRecovery: true,
        weightUnit: 'Imperial'
      }}
    ];

    for (const setting of settingsToSeed) {
      const { data } = await supabase.from('clinic_settings').select('key').eq('key', setting.key).maybeSingle();
      if (!data) {
        await supabase.from('clinic_settings').insert(setting);
      }
    }
    console.log('Database check and seed completed.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

// Initialise DB seeding
seedDatabase();

// Rest Generic API for all data tables
const ALLOWED_TABLES = [
  'staff',
  'clients',
  'pets',
  'appointments',
  'medical_records',
  'invoices',
  'revenue_splits',
  'consultations',
  'lab_orders'
];

// Map frontend table plural paths to actual DB tables if needed
const getDbTableName = (table: string): string => {
  if (table === 'medical-records') return 'medical_records';
  if (table === 'splits') return 'revenue_splits';
  if (table === 'lab-orders') return 'lab_orders';
  return table;
};

app.get('/api/settings', async (req, res) => {
  const { data, error } = await supabase.from('clinic_settings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const settings: Record<string, any> = {};
  data?.forEach(item => {
    settings[item.key] = item.value;
  });
  res.json(settings);
});

app.post('/api/settings/:key', async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  const { data, error } = await supabase.from('clinic_settings').upsert({ key, value }).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
});

app.get('/api/:table', async (req, res) => {
  const table = getDbTableName(req.params.table);
  if (!ALLOWED_TABLES.includes(table)) {
    return res.status(400).json({ error: `Invalid table: ${table}` });
  }
  const { data, error } = await supabase.from(table).select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post('/api/:table', async (req, res) => {
  const table = getDbTableName(req.params.table);
  if (!ALLOWED_TABLES.includes(table)) {
    return res.status(400).json({ error: `Invalid table: ${table}` });
  }
  const { data, error } = await supabase.from(table).insert(req.body).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data ? data[0] : req.body);
});

app.put('/api/:table/:id', async (req, res) => {
  const table = getDbTableName(req.params.table);
  if (!ALLOWED_TABLES.includes(table)) {
    return res.status(400).json({ error: `Invalid table: ${table}` });
  }
  const { data, error } = await supabase.from(table).update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ? data[0] : req.body);
});

app.delete('/api/:table/:id', async (req, res) => {
  const table = getDbTableName(req.params.table);
  if (!ALLOWED_TABLES.includes(table)) {
    return res.status(400).json({ error: `Invalid table: ${table}` });
  }
  const { error } = await supabase.from(table).delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
