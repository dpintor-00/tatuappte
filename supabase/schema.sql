-- ========================================================
-- Schema de Migración para TatuAppte en Supabase
-- Proyecto: https://kgkrhrxsztbzbwlcwtvt.supabase.co
-- Ejecutar en el SQL Editor de tu Dashboard de Supabase
-- ========================================================

-- 1. Habilitar extensión pgcrypto para UUIDs y cifrado
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabla de Usuarios (Tatuadores y Clientes)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'tattooist', 'admin')),
    phone TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Citas y Cotizaciones de Tatuajes
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    client_name TEXT NOT NULL,
    tattooist_id TEXT,
    tattooist_name TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
    price NUMERIC NOT NULL DEFAULT 0,
    design_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Horarios y Disponibilidad Semanal
CREATE TABLE IF NOT EXISTS public.schedules (
    id TEXT PRIMARY KEY,
    tattooist_id TEXT NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 1=Lunes, etc.
    day_name TEXT NOT NULL,
    start_time TEXT NOT NULL DEFAULT '11:00',
    end_time TEXT NOT NULL DEFAULT '20:00',
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tattooist ON public.appointments(tattooist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_schedules_tattooist ON public.schedules(tattooist_id);

-- 6. Habilitar Row Level Security (RLS) con políticas permisivas para la API backend
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura para clave anon y service_role
CREATE POLICY "Permitir lectura y registro en users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en schedules" ON public.schedules FOR ALL USING (true) WITH CHECK (true);

-- 7. Datos iniciales (Seed) de prueba para agendamiento y cotizador 3D
INSERT INTO public.schedules (id, tattooist_id, day_of_week, day_name, start_time, end_time, is_active)
VALUES
  ('sch-1', 'tatt_01', 1, 'Lunes', '11:00', '20:00', true),
  ('sch-2', 'tatt_01', 2, 'Martes', '11:00', '20:00', true),
  ('sch-3', 'tatt_01', 3, 'Miércoles', '11:00', '20:00', true),
  ('sch-4', 'tatt_01', 4, 'Jueves', '11:00', '20:00', true),
  ('sch-5', 'tatt_01', 5, 'Viernes', '12:00', '21:00', true),
  ('sch-6', 'tatt_01', 6, 'Sábado', '12:00', '19:00', true),
  ('sch-7', 'tatt_01', 0, 'Domingo', '00:00', '00:00', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.appointments (id, client_id, client_name, tattooist_id, tattooist_name, date, time, status, price, design_data)
VALUES
  (
    'apt-101', 
    'usr_01', 
    'Alex Valenzuela', 
    'tatt_01', 
    'Carlos Ink (Blackwork)', 
    '2026-11-18', 
    '15:30', 
    'confirmed', 
    135000, 
    '{"widthCm": 15, "heightCm": 10, "rotation": 45, "opacity": 90, "bodyLocation": "Antebrazo Derecho", "notes": "Líneas finas con sombreado whip shading"}'::jsonb
  ),
  (
    'apt-102', 
    'usr_02', 
    'Fernanda Ríos', 
    'tatt_01', 
    'Carlos Ink (Blackwork)', 
    '2026-11-20', 
    '11:00', 
    'pending', 
    180000, 
    '{"widthCm": 18, "heightCm": 12, "rotation": 0, "opacity": 100, "bodyLocation": "Omóplato / Espalda", "notes": "Diseño geométrico sagrado testeado en 3D"}'::jsonb
  ),
  (
    'apt-103', 
    'usr_03', 
    'Matías Silva', 
    'tatt_02', 
    'Elena Tatuajes (Neotradicional)', 
    '2026-11-22', 
    '17:00', 
    'confirmed', 
    95000, 
    '{"widthCm": 8, "heightCm": 8, "rotation": 15, "opacity": 85, "bodyLocation": "Pantorrilla", "notes": "Rosa neotradicional a color"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
