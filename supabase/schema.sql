-- ==========================================================
-- MICRO-UNIT AREA COMMAND CENTER DATABASE SCHEMA
-- Target Database: PostgreSQL / Supabase
-- Features: Row Level Security (RLS), Auto Triggers, Seed Data
-- ==========================================================

-- Enable Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM DEFINITIONS
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'AREA_HEAD', 'KEPALA_UNIT');
CREATE TYPE performance_status AS ENUM ('GREEN', 'YELLOW', 'RED');
CREATE TYPE report_status AS ENUM ('SUBMITTED', 'REVIEWED', 'NEEDS_ACTION');

-- 2. TABEL UNITS (17 Kantor Mikro Regional)
CREATE TABLE IF NOT EXISTS public.units (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
code VARCHAR(10) UNIQUE NOT NULL,
name VARCHAR(100) NOT NULL,
region VARCHAR(50) DEFAULT 'Regional Office',
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL USERS (Profil Pengguna & Role Mapping)
CREATE TABLE IF NOT EXISTS public.users (
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
email VARCHAR(255) NOT NULL UNIQUE,
full_name VARCHAR(100) NOT NULL,
role user_role NOT NULL DEFAULT 'KEPALA_UNIT',
unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL PERFORMANCE METRICS (Kredit, Funding, NPL)
CREATE TABLE IF NOT EXISTS public.performance_metrics (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
period_date DATE NOT NULL,
target_kredit NUMERIC(15, 2) NOT NULL DEFAULT 0,
realisasi_kredit NUMERIC(15, 2) NOT NULL DEFAULT 0,
target_dpk NUMERIC(15, 2) NOT NULL DEFAULT 0,
realisasi_dpk NUMERIC(15, 2) NOT NULL DEFAULT 0,
npl_ratio NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT unique_unit_period UNIQUE (unit_id, period_date)
);

-- 5. TABEL DAILY REPORTS (Laporan Operasional Harian & Supervisory Notes)
CREATE TABLE IF NOT EXISTS public.daily_reports (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
report_date DATE NOT NULL DEFAULT CURRENT_DATE,
summary_activities TEXT NOT NULL,
operational_issues TEXT,
area_head_notes TEXT,
status report_status DEFAULT 'SUBMITTED',
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL PROSPECT PIPELINES (Pipeline Calon Debitur Unit)
CREATE TABLE IF NOT EXISTS public.prospect_pipelines (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
prospect_name VARCHAR(150) NOT NULL,
sector VARCHAR(100) NOT NULL,
potential_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
stage VARCHAR(50) NOT NULL DEFAULT 'PROSPECT', -- PROSPECT, VERIFICATION, APPROVED, REJECTED
notes TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_pipelines ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check User Role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS 

$$SELECT role FROM public.users WHERE id = auth.uid();$$

 LANGUAGE sql SECURITY DEFINER;

-- Helper Function: Check User Unit
CREATE OR REPLACE FUNCTION public.get_user_unit()
RETURNS UUID AS 

$$SELECT unit_id FROM public.users WHERE id = auth.uid();$$

 LANGUAGE sql SECURITY DEFINER;

-- Policy untuk Performance Metrics:
-- Area Head & Super Admin bisa melihat SEMUA unit.
-- Kepala Unit HANYA bisa melihat unit milik sendiri.
CREATE POLICY "Metrics Visibility Policy" ON public.performance_metrics
FOR SELECT
USING (
public.get_user_role() IN ('SUPER_ADMIN', 'AREA_HEAD') OR
unit_id = public.get_user_unit()
);

-- Policy untuk Daily Reports:
CREATE POLICY "Daily Reports Select Policy" ON public.daily_reports
FOR SELECT
USING (
public.get_user_role() IN ('SUPER_ADMIN', 'AREA_HEAD') OR
unit_id = public.get_user_unit()
);

CREATE POLICY "Daily Reports Insert Policy" ON public.daily_reports
FOR INSERT
WITH CHECK (
unit_id = public.get_user_unit()
);

CREATE POLICY "Daily Reports Update Policy (Area Head Notes)" ON public.daily_reports
FOR UPDATE
USING (
public.get_user_role() IN ('SUPER_ADMIN', 'AREA_HEAD') OR
unit_id = public.get_user_unit()
);

-- ==========================================================
-- SEED DATA SETUP (17 KANTOR MIKRO REGIONAL)
-- ==========================================================

INSERT INTO public.units (code, name) VALUES
('UM-001', 'Unit Mikro Pasar Besar'),
('UM-002', 'Unit Mikro Merdeka'),
('UM-003', 'Unit Mikro Sudirman'),
('UM-004', 'Unit Mikro Ahmad Yani'),
('UM-005', 'Unit Mikro Gatot Subroto'),
('UM-006', 'Unit Mikro Diponegoro'),
('UM-007', 'Unit Mikro Pahlawan'),
('UM-008', 'Unit Mikro Veteran'),
('UM-009', 'Unit Mikro Kartini'),
('UM-010', 'Unit Mikro Pemuda'),
('UM-011', 'Unit Mikro Gajah Mada'),
('UM-012', 'Unit Mikro Hayam Wuruk'),
('UM-013', 'Unit Mikro Borobudur'),
('UM-014', 'Unit Mikro Prambanan'),
('UM-015', 'Unit Mikro Cenderawasih'),
('UM-016', 'Unit Mikro Imam Bonjol'),
('UM-017', 'Unit Mikro Raden Intan')
ON CONFLICT (code) DO NOTHING;