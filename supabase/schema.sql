-- STREAMING_CHUNK:Enabling required PostgreSQL extensions...
-- ==========================================================
-- MICRO-UNIT AREA COMMAND CENTER DATABASE SCHEMA (ENTERPRISE EDITION)
-- Target Database: PostgreSQL / Supabase
-- Features: Row Level Security (RLS), Auto-Update Triggers, Performance Indexes, Seed Data
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STREAMING_CHUNK:Defining application enum types...
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'AREA_HEAD', 'KEPALA_UNIT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE performance_status AS ENUM ('GREEN', 'YELLOW', 'RED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('PENDING', 'APPROVED', 'REVISION', 'SUBMITTED', 'REVIEWED', 'NEEDS_ACTION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('WARNING', 'INFO', 'SUCCESS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- STREAMING_CHUNK:Creating units master table...
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(100) DEFAULT 'Wilayah Operasional Regional 1',
    head_name VARCHAR(150),
    ao_count INT DEFAULT 4,
    staff_count INT DEFAULT 6,
    total_customers INT DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- STREAMING_CHUNK:Creating users mapping table...
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'KEPALA_UNIT',
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- STREAMING_CHUNK:Creating performance metrics table...
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    period_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_kredit NUMERIC(15, 2) NOT NULL DEFAULT 0,
    realisasi_kredit NUMERIC(15, 2) NOT NULL DEFAULT 0,
    target_funding NUMERIC(15, 2) NOT NULL DEFAULT 0,
    realisasi_funding NUMERIC(15, 2) NOT NULL DEFAULT 0,
    target_collection NUMERIC(5, 2) NOT NULL DEFAULT 95.00,
    realisasi_collection NUMERIC(5, 2) NOT NULL DEFAULT 90.00,
    npl_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    dkp_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    profit NUMERIC(15, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_unit_period UNIQUE (unit_id, period_date)
);

-- STREAMING_CHUNK:Creating daily operational reports table...
CREATE TABLE IF NOT EXISTS public.daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    report_type VARCHAR(20) DEFAULT 'HARIAN',
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    operational_summary TEXT NOT NULL,
    obstacles TEXT,
    area_head_notes TEXT,
    status report_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- STREAMING_CHUNK:Creating prospect pipelines table...
CREATE TABLE IF NOT EXISTS public.prospect_pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    prospect_name VARCHAR(150) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    potential_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    stage VARCHAR(50) NOT NULL DEFAULT 'PROSPECT',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- STREAMING_CHUNK:Creating broadcast messages table...
CREATE TABLE IF NOT EXISTS public.broadcast_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sender VARCHAR(150) DEFAULT 'Head Area Regional 1',
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    read_by_units JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- STREAMING_CHUNK:Creating system notifications table...
CREATE TABLE IF NOT EXISTS public.system_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- STREAMING_CHUNK:Creating database indexes for high-speed queries...
CREATE INDEX IF NOT EXISTS idx_units_code ON public.units(code);
CREATE INDEX IF NOT EXISTS idx_users_unit ON public.users(unit_id);
CREATE INDEX IF NOT EXISTS idx_metrics_unit_period ON public.performance_metrics(unit_id, period_date);
CREATE INDEX IF NOT EXISTS idx_reports_unit_date ON public.daily_reports(unit_id, report_date);
CREATE INDEX IF NOT EXISTS idx_pipelines_unit ON public.prospect_pipelines(unit_id);

-- STREAMING_CHUNK:Creating automatic timestamp update triggers...
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_metrics_timestamp ON public.performance_metrics;
CREATE TRIGGER trg_update_metrics_timestamp
    BEFORE UPDATE ON public.performance_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();

-- STREAMING_CHUNK:Enabling Row Level Security (RLS)...
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- STREAMING_CHUNK:Defining security helper functions...
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_unit()
RETURNS UUID AS $$
    SELECT unit_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- STREAMING_CHUNK:Creating RLS policies for units...
CREATE POLICY "Units Read Policy" ON public.units
FOR SELECT USING (TRUE);

-- STREAMING_CHUNK:Creating RLS policies for users...
CREATE POLICY "Users Read Policy" ON public.users
FOR SELECT USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'AREA_HEAD') OR
    id = auth.uid()
);

-- STREAMING_CHUNK:Creating RLS policies for performance metrics...
CREATE POLICY "Metrics Select Policy" ON public.performance_metrics
FOR SELECT USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'AREA_HEAD') OR
    unit_id = public.get_user_unit()
);

CREATE POLICY "Metrics Upsert Policy" ON public.performance_metrics
FOR ALL USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'AREA_HEAD') OR
    unit_id = public.get_user_unit()
);

-- STREAMING_CHUNK:Creating RLS policies for daily reports...
CREATE POLICY "Daily Reports Select Policy" ON public.daily_reports
FOR SELECT USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'AREA_HEAD') OR
    unit_id = public.get_user_unit()
);

CREATE POLICY "Daily Reports Insert Policy" ON public.daily_reports
FOR INSERT WITH CHECK (
    unit_id = public.get_user_unit() OR public.get_user_role() IN ('SUPER_ADMIN', 'AREA_HEAD')
);

CREATE POLICY "Daily Reports Update Policy" ON public.daily_reports
FOR UPDATE USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'AREA_HEAD') OR
    unit_id = public.get_user_unit()
);

-- STREAMING_CHUNK:Creating RLS policies for broadcasts & notifications...
CREATE POLICY "Broadcast Select Policy" ON public.broadcast_messages
FOR SELECT USING (TRUE);

CREATE POLICY "Broadcast Insert Policy" ON public.broadcast_messages
FOR INSERT WITH CHECK (public.get_user_role() IN ('SUPER_ADMIN', 'AREA_HEAD'));

CREATE POLICY "Notifications Select Policy" ON public.system_notifications
FOR SELECT USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'AREA_HEAD') OR
    unit_id = public.get_user_unit()
);

-- STREAMING_CHUNK:Seeding initial data for 17 Kantor Mikro Regional...
INSERT INTO public.units (code, name, region, head_name, ao_count, staff_count, total_customers) VALUES
('KMU-01', 'Kantor Mikro Unit Sukamaju', 'Wilayah Operasional Sukamaju', 'Ahmad Fauzi, S.E.', 4, 6, 520),
('KMU-02', 'Kantor Mikro Unit Pasar Anyar', 'Wilayah Operasional Pasar Anyar', 'Budi Hermawan', 5, 7, 610),
('KMU-03', 'Kantor Mikro Unit Batu Tulis', 'Wilayah Operasional Batu Tulis', 'Citra Lestari, M.M.', 3, 5, 480),
('KMU-04', 'Kantor Mikro Unit Cibinong', 'Wilayah Operasional Cibinong', 'Dedi Mulyadi', 6, 8, 750),
('KMU-05', 'Kantor Mikro Unit Ciawi', 'Wilayah Operasional Ciawi', 'Eka Putri, S.E.', 4, 6, 540),
('KMU-06', 'Kantor Mikro Unit Parung', 'Wilayah Operasional Parung', 'Fajar Nugraha', 4, 5, 490),
('KMU-07', 'Kantor Mikro Unit Leuwiliang', 'Wilayah Operasional Leuwiliang', 'Gita Gutawa, M.B.A.', 3, 6, 510),
('KMU-08', 'Kantor Mikro Unit Cisarua', 'Wilayah Operasional Cisarua', 'Hendra Setiawan', 4, 6, 530),
('KMU-09', 'Kantor Mikro Unit Gunung Putri', 'Wilayah Operasional Gunung Putri', 'Irfan Bachdim', 5, 7, 680),
('KMU-10', 'Kantor Mikro Unit Citeureup', 'Wilayah Operasional Citeureup', 'Joko Widodo', 4, 6, 560),
('KMU-11', 'Kantor Mikro Unit Jasinga', 'Wilayah Operasional Jasinga', 'Kurnia Meiga', 3, 5, 420),
('KMU-12', 'Kantor Mikro Unit Ciampea', 'Wilayah Operasional Ciampea', 'Lukman Sardi', 4, 6, 500),
('KMU-13', 'Kantor Mikro Unit Ciseeng', 'Wilayah Operasional Ciseeng', 'Maya Ahmad', 4, 5, 470),
('KMU-14', 'Kantor Mikro Unit Klapanunggal', 'Wilayah Operasional Klapanunggal', 'Nabila Syakieb', 4, 6, 550),
('KMU-15', 'Kantor Mikro Unit Dramaga', 'Wilayah Operasional Dramaga', 'Oki Setiana', 5, 7, 630),
('KMU-16', 'Kantor Mikro Unit Rumpin', 'Wilayah Operasional Rumpin', 'Prabowo Subianto', 3, 5, 410),
('KMU-17', 'Kantor Mikro Unit Tanjungsari', 'Wilayah Operasional Tanjungsari', 'Qory Sandioriva', 4, 6, 490)
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name,
    head_name = EXCLUDED.head_name,
    ao_count = EXCLUDED.ao_count,
    staff_count = EXCLUDED.staff_count,
    total_customers = EXCLUDED.total_customers;