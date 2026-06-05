-- Create Staff table
CREATE TABLE IF NOT EXISTS public.staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    avatar TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    specialty TEXT,
    billingRate NUMERIC,
    permissions TEXT[],
    password TEXT,
    phone TEXT,
    emergencyPhone TEXT
);

-- Create Clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    avatar TEXT NOT NULL,
    joinedDate TEXT NOT NULL,
    membershipType TEXT NOT NULL
);

-- Create Pets table
CREATE TABLE IF NOT EXISTS public.pets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT NOT NULL,
    age TEXT NOT NULL,
    dob TEXT,
    weight NUMERIC NOT NULL,
    gender TEXT NOT NULL,
    status TEXT NOT NULL,
    ownerId TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    alertAllergies TEXT[] NOT NULL DEFAULT '{}',
    avatar TEXT NOT NULL
);

-- Create Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    petId TEXT NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    clientId TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    staffId TEXT NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    dateTime TEXT NOT NULL,
    duration INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    visitType TEXT,
    vitals JSONB
);

-- Create Medical Records table
CREATE TABLE IF NOT EXISTS public.medical_records (
    id TEXT PRIMARY KEY,
    petId TEXT NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    appointmentId TEXT,
    dvmId TEXT NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    isComplete BOOLEAN NOT NULL DEFAULT false,
    soap JSONB NOT NULL,
    procedureTeam TEXT[] NOT NULL DEFAULT '{}',
    prescriptions JSONB NOT NULL DEFAULT '[]',
    treatments JSONB DEFAULT '[]',
    vaccinations JSONB DEFAULT '[]',
    labOrders TEXT[] DEFAULT '{}',
    images JSONB DEFAULT '[]'
);

-- Create Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    appointmentId TEXT,
    clientId TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    dueDate TEXT NOT NULL,
    status TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    total NUMERIC NOT NULL
);

-- Create Revenue Splits table
CREATE TABLE IF NOT EXISTS public.revenue_splits (
    id TEXT PRIMARY KEY,
    invoiceId TEXT NOT NULL,
    itemId TEXT NOT NULL,
    staffId TEXT NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    percentage NUMERIC NOT NULL,
    splitAmount NUMERIC NOT NULL,
    status TEXT NOT NULL
);

-- Create Consultations table
CREATE TABLE IF NOT EXISTS public.consultations (
    id TEXT PRIMARY KEY,
    medicalRecordId TEXT NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
    requesterDvmId TEXT NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    targetDvmId TEXT NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    question TEXT NOT NULL,
    notes TEXT,
    revenueAmount NUMERIC NOT NULL,
    validUntil TEXT NOT NULL
);

-- Create Lab Orders table
CREATE TABLE IF NOT EXISTS public.lab_orders (
    id TEXT PRIMARY KEY,
    petId TEXT NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    medicalRecordId TEXT,
    staffId TEXT NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    testName TEXT NOT NULL,
    status TEXT NOT NULL,
    resultNotes TEXT,
    isHighRisk BOOLEAN NOT NULL DEFAULT false,
    date TEXT NOT NULL
);

-- Create Clinic Settings table
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all read to staff" ON public.staff;
DROP POLICY IF EXISTS "Allow all write to staff" ON public.staff;
DROP POLICY IF EXISTS "Allow all read to clients" ON public.clients;
DROP POLICY IF EXISTS "Allow all write to clients" ON public.clients;
DROP POLICY IF EXISTS "Allow all read to pets" ON public.pets;
DROP POLICY IF EXISTS "Allow all write to pets" ON public.pets;
DROP POLICY IF EXISTS "Allow all read to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow all write to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow all read to medical_records" ON public.medical_records;
DROP POLICY IF EXISTS "Allow all write to medical_records" ON public.medical_records;
DROP POLICY IF EXISTS "Allow all read to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow all write to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow all read to revenue_splits" ON public.revenue_splits;
DROP POLICY IF EXISTS "Allow all write to revenue_splits" ON public.revenue_splits;
DROP POLICY IF EXISTS "Allow all read to consultations" ON public.consultations;
DROP POLICY IF EXISTS "Allow all write to consultations" ON public.consultations;
DROP POLICY IF EXISTS "Allow all read to lab_orders" ON public.lab_orders;
DROP POLICY IF EXISTS "Allow all write to lab_orders" ON public.lab_orders;
DROP POLICY IF EXISTS "Allow all read to clinic_settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Allow all write to clinic_settings" ON public.clinic_settings;

-- Create Permissive Policies for anonymous/authenticated access in this sandbox
CREATE POLICY "Allow all read to staff" ON public.staff FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all write to staff" ON public.staff FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all read to clients" ON public.clients FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all write to clients" ON public.clients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all read to pets" ON public.pets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all write to pets" ON public.pets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all read to appointments" ON public.appointments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all write to appointments" ON public.appointments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all read to medical_records" ON public.medical_records FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all write to medical_records" ON public.medical_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all read to invoices" ON public.invoices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all write to invoices" ON public.invoices FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all read to revenue_splits" ON public.revenue_splits FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all write to revenue_splits" ON public.revenue_splits FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all read to consultations" ON public.consultations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all write to consultations" ON public.consultations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all read to lab_orders" ON public.lab_orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all write to lab_orders" ON public.lab_orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all read to clinic_settings" ON public.clinic_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all write to clinic_settings" ON public.clinic_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
