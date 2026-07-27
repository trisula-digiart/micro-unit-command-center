-- ==========================================================
-- MICRO-UNIT AREA COMMAND CENTER — DATABASE SCHEMA & RLS
-- PostgreSQL / Supabase Migration Script
-- ==========================================================

-- 1. DROP EXISTING TABLES IF EXISTS (CLEAN RESET)
DROP TABLE IF EXISTS public.area_head_notes CASCADE;
DROP TABLE IF EXISTS public.daily_reports CASCADE;
DROP TABLE IF EXISTS public.performance_metrics CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.units CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- 2. CREATE ROLES TABLE
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'SUPER_ADMIN', 'AREA_HEAD', 'KEPALA_UNIT'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE UNITS TABLE (17 KANTOR MIKRO)
CREATE TABLE public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE PROFILES / USERS TABLE
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role_id UUID REFERENCES public.roles(id) ON DELETE RESTRICT,
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL, -- Null untuk Area Head / Super Admin
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE PERFORMANCE METRICS TABLE
CREATE TABLE public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
    period_date DATE NOT NULL,
    target_kredit NUMERIC(15, 2) DEFAULT 0,
    realisasi_kredit NUMERIC(15, 2) DEFAULT 0,
    target_funding NUMERIC(15, 2) DEFAULT 0,
    realisasi_funding NUMERIC(15, 2) DEFAULT 0,
    npl_percentage NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATE DAILY REPORTS TABLE
CREATE TABLE public.daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    operational_summary TEXT NOT NULL,
    obstacles TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREATE AREA HEAD NOTES TABLE
CREATE TABLE public.area_head_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_report_id UUID REFERENCES public.daily_reports(id) ON DELETE CASCADE,
    area_head_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    notes TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- SEED DATA SETUP (17 KANTOR MIKRO PERBANKAN)
-- ==========================================================

-- Seed Roles
INSERT INTO public.roles (name) VALUES 
('SUPER_ADMIN'),
('AREA_HEAD'),
('KEPALA_UNIT');

-- Seed 17 Kantor Mikro
INSERT INTO public.units (code, name, location) VALUES
('UM-001', 'Unit Mikro Sudirman', 'Jl. Jend. Sudirman No. 45'),
('UM-002', 'Unit Mikro Thamrin', 'Jl. M.H. Thamrin No. 12'),
('UM-003', 'Unit Mikro Gatot Subroto', 'Jl. Gatot Subroto No. 88'),
('UM-004', 'Unit Mikro Kuningan', 'Jl. HR Rasuna Said Kav 5'),
('UM-005', 'Unit Mikro Kemang', 'Jl. Kemang Raya No. 20'),
('UM-006', 'Unit Mikro Senayan', 'Jl. Asia Afrika No. 8'),
('UM-007', 'Unit Mikro Blok M', 'Jl. Melawai IV No. 15'),
('UM-008', 'Unit Mikro Kebayoran', 'Jl. Kebayoran Baru No. 33'),
('UM-009', 'Unit Mikro Pondok Indah', 'Jl. Metro Pondok Indah No. 10'),
('UM-010', 'Unit Mikro Cilandak', 'Jl. TB Simatupang No. 7'),
('UM-011', 'Unit Mikro Pasar Minggu', 'Jl. Ragunan No. 18'),
('UM-012', 'Unit Mikro Pancoran', 'Jl. Raya Pasar Minggu No. 42'),
('UM-013', 'Unit Mikro Tebet', 'Jl. Tebet Raya No. 99'),
('UM-014', 'Unit Mikro Manggarai', 'Jl. Sultan Agung No. 50'),
('UM-015', 'Unit Mikro Tanah Abang', 'Jl. KH Mas Mansyur No. 25'),
('UM-016', 'Unit Mikro Harmoni', 'Jl. Gajah Mada No. 3'),
('UM-017', 'Unit Mikro Kelapa Gading', 'Jl. Boulevard Barat No. 16');

-- Seed Performance Metrics Samples for 17 Units
INSERT INTO public.performance_metrics 
(unit_id, period_date, target_kredit, realisasi_kredit, target_funding, realisasi_funding, npl_percentage)
SELECT 
    u.id,
    CURRENT_DATE,
    15000000000, -- Target Kredit 15 Milyar
    CASE 
        WHEN u.code IN ('UM-001', 'UM-003', 'UM-007', 'UM-009', 'UM-017') THEN 16200000000 -- >= 100% (Hijau)
        WHEN u.code IN ('UM-002', 'UM-004', 'UM-005', 'UM-008', 'UM-010', 'UM-012') THEN 13200000000 -- 80-99% (Kuning)
        ELSE 10500000000 -- < 80% (Merah)
    END,
    10000000000, -- Target Funding 10 Milyar
    CASE 
        WHEN u.code IN ('UM-001', 'UM-003', 'UM-007', 'UM-009', 'UM-017') THEN 11500000000
        WHEN u.code IN ('UM-002', 'UM-004', 'UM-005', 'UM-008', 'UM-010', 'UM-012') THEN 9100000000
        ELSE 7200000000
    END,
    CASE 
        WHEN u.code IN ('UM-001', 'UM-003', 'UM-007') THEN 1.45
        WHEN u.code IN ('UM-002', 'UM-004', 'UM-005') THEN 2.80
        ELSE 4.25
    END
FROM public.units u;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_head_notes ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check User Role Name
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS VARCHAR AS $$
DECLARE
    role_name VARCHAR;
BEGIN
    SELECT r.name INTO role_name
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = user_uuid;
    
    RETURN role_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policy: Units Visibility
CREATE POLICY "Units access policy" ON public.units
FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'AREA_HEAD')
    OR id = (SELECT unit_id FROM public.users WHERE id = auth.uid())
);

-- RLS Policy: Performance Metrics Read/Write
CREATE POLICY "Metrics access policy" ON public.performance_metrics
FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'AREA_HEAD')
    OR unit_id = (SELECT unit_id FROM public.users WHERE id = auth.uid())
);

-- RLS Policy: Daily Reports
CREATE POLICY "Daily reports policy" ON public.daily_reports
FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'AREA_HEAD')
    OR unit_id = (SELECT unit_id FROM public.users WHERE id = auth.uid())
);

-- RLS Policy: Area Head Notes
CREATE POLICY "Area head notes policy" ON public.area_head_notes
FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'AREA_HEAD')
    OR daily_report_id IN (
        SELECT id FROM public.daily_reports 
        WHERE unit_id = (SELECT unit_id FROM public.users WHERE id = auth.uid())
    )
);