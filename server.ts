import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Port 3000 is required by AI Studio runtime environment
const PORT = 3000;

// Inicialización de Supabase con el nuevo proyecto
const DEFAULT_SUPABASE_URL = 'https://kgkrhrxsztbzbwlcwtvt.supabase.co';
const rawEnvUrl = process.env.SUPABASE_URL?.trim();
const supabaseUrl = (rawEnvUrl && !rawEnvUrl.includes('your-project-id')) 
  ? rawEnvUrl 
  : DEFAULT_SUPABASE_URL;

const DEFAULT_SUPABASE_ANON_KEY = '';
const rawEnvKey = process.env.SUPABASE_ANON_KEY?.trim();
const supabaseAnonKey = (rawEnvKey && !rawEnvKey.includes('your-supabase-anon-key')) 
  ? rawEnvKey 
  : DEFAULT_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') && 
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.warn(`⚠️ [TatuAppte] Supabase conectado a URL: ${supabaseUrl}`);
  console.warn('⚠️ Nota: Proporciona SUPABASE_ANON_KEY en las variables de entorno para activar la persistencia completa en PostgreSQL.');
} else {
  console.log(`✅ [TatuAppte] Conectado exitosamente a Supabase: ${supabaseUrl}`);
}

// Memoria local de usuarios para pruebas si no hay Supabase
const memoryUsers: any[] = [];

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos legacy en /public si se solicitan directamente
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// API REST DE AUTENTICACIÓN & ESTADO
// ==========================================

app.get('/api/status', (req, res) => {
  res.json({
    app: 'TatuAppte Full-Stack API',
    status: 'online',
    supabaseUrl: supabaseUrl,
    supabaseConnected: isSupabaseConfigured,
    time: new Date().toISOString()
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const assignedRole = role === 'tattooist' ? 'tattooist' : 'customer';
    const hashedPassword = await bcrypt.hash(password, 10);

    if (supabase) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (existingUser) {
        return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
      }

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: assignedRole
          }
        ])
        .select('id, username, email, role')
        .single();

      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }

      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser,
        source: 'supabase'
      });
    }

    // Fallback local
    const existing = memoryUsers.find(u => u.email === email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'El correo electrónico ya se encuentra registrado.' });
    }

    const localUser = {
      id: 'local-' + Date.now(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: assignedRole,
      created_at: new Date().toISOString()
    };
    memoryUsers.push(localUser);

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: localUser.id,
        username: localUser.username,
        email: localUser.email,
        role: localUser.role
      },
      source: 'memory'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor al registrarse.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Ingresa correo y contraseña.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (supabase) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
      }

      const { password: _, ...userWithoutPassword } = user;
      return res.json({
        message: 'Inicio de sesión exitoso',
        user: userWithoutPassword,
        source: 'supabase'
      });
    }

    // Fallback local
    const localUser = memoryUsers.find(u => u.email === cleanEmail);
    if (!localUser) {
      // Usuario de prueba predeterminado si es la primera vez
      if (cleanEmail.includes('@')) {
        const dummyUser = {
          id: 'demo-' + Date.now(),
          username: cleanEmail.split('@')[0],
          email: cleanEmail,
          role: cleanEmail.includes('tattoo') ? 'tattooist' : 'customer'
        };
        return res.json({
          message: 'Inicio de sesión demo exitoso',
          user: dummyUser,
          source: 'demo'
        });
      }
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    const match = await bcrypt.compare(password, localUser.password);
    if (!match) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    const { password: _, ...safeUser } = localUser;
    return res.json({
      message: 'Inicio de sesión exitoso',
      user: safeUser,
      source: 'memory'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor al iniciar sesión.' });
  }
});

// ==========================================
// API REST DE CITAS Y DISPONIBILIDAD (SUPABASE & FALLBACK)
// ==========================================

let memoryAppointments: any[] = [
  {
    id: 'apt-101',
    client_id: 'usr_01',
    client_name: 'Alex Valenzuela',
    tattooist_id: 'tatt_01',
    tattooist_name: 'Carlos Ink (Blackwork)',
    date: '2026-11-18',
    time: '15:30',
    status: 'confirmed',
    price: 135000,
    design_data: {
      widthCm: 15,
      heightCm: 10,
      rotation: 45,
      opacity: 90,
      bodyLocation: 'Antebrazo Derecho',
      notes: 'Líneas finas con sombreado whip shading'
    }
  },
  {
    id: 'apt-102',
    client_id: 'usr_02',
    client_name: 'Fernanda Ríos',
    tattooist_id: 'tatt_01',
    tattooist_name: 'Carlos Ink (Blackwork)',
    date: '2026-11-20',
    time: '11:00',
    status: 'pending',
    price: 180000,
    design_data: {
      widthCm: 18,
      heightCm: 12,
      rotation: 0,
      opacity: 100,
      bodyLocation: 'Omóplato / Espalda',
      notes: 'Diseño geométrico sagrado testeado en 3D'
    }
  },
  {
    id: 'apt-103',
    client_id: 'usr_03',
    client_name: 'Matías Silva',
    tattooist_id: 'tatt_02',
    tattooist_name: 'Elena Tatuajes (Neotradicional)',
    date: '2026-11-22',
    time: '17:00',
    status: 'confirmed',
    price: 95000,
    design_data: {
      widthCm: 8,
      heightCm: 8,
      rotation: 15,
      opacity: 85,
      bodyLocation: 'Pantorrilla',
      notes: 'Rosa neotradicional a color'
    }
  }
];

let memorySchedules: any[] = [
  { id: 'sch-1', tattooist_id: 'tatt_01', day_of_week: 1, day_name: 'Lunes', start_time: '11:00', end_time: '20:00', is_active: true },
  { id: 'sch-2', tattooist_id: 'tatt_01', day_of_week: 2, day_name: 'Martes', start_time: '11:00', end_time: '20:00', is_active: true },
  { id: 'sch-3', tattooist_id: 'tatt_01', day_of_week: 3, day_name: 'Miércoles', start_time: '11:00', end_time: '20:00', is_active: true },
  { id: 'sch-4', tattooist_id: 'tatt_01', day_of_week: 4, day_name: 'Jueves', start_time: '11:00', end_time: '20:00', is_active: true },
  { id: 'sch-5', tattooist_id: 'tatt_01', day_of_week: 5, day_name: 'Viernes', start_time: '12:00', end_time: '21:00', is_active: true },
  { id: 'sch-6', tattooist_id: 'tatt_01', day_of_week: 6, day_name: 'Sábado', start_time: '12:00', end_time: '19:00', is_active: true },
  { id: 'sch-7', tattooist_id: 'tatt_01', day_of_week: 0, day_name: 'Domingo', start_time: '00:00', end_time: '00:00', is_active: false },
];

// Obtener todas las citas
app.get('/api/appointments', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return res.json({ appointments: data, source: 'supabase' });
      }
    }
    return res.json({ appointments: memoryAppointments, source: 'memory' });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.json({ appointments: memoryAppointments, source: 'fallback' });
  }
});

// Crear una nueva cita / cotización
app.post('/api/appointments', async (req, res) => {
  try {
    const { 
      client_name, 
      tattooist_name, 
      date, 
      time, 
      status, 
      price, 
      design_data 
    } = req.body;

    const newAppointment = {
      id: 'apt-' + Date.now().toString().slice(-6),
      client_id: req.body.client_id || 'usr_' + Date.now(),
      client_name: client_name || 'Cliente Estudio',
      tattooist_id: req.body.tattooist_id || 'tatt_01',
      tattooist_name: tattooist_name || 'Carlos Ink (Blackwork)',
      date: date || new Date().toISOString().split('T')[0],
      time: time || '16:00',
      status: status || 'pending',
      price: Number(price) || 85000,
      design_data: design_data || {},
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('appointments')
        .insert([newAppointment])
        .select()
        .single();

      if (!error && data) {
        return res.status(201).json({ appointment: data, source: 'supabase' });
      }
    }

    memoryAppointments.unshift(newAppointment);
    return res.status(201).json({ appointment: newAppointment, source: 'memory' });
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: 'No se pudo agendar la cita.' });
  }
});

// Actualizar estado de una cita
app.patch('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (supabase) {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return res.json({ appointment: data, source: 'supabase' });
      }
    }

    const apt = memoryAppointments.find(a => a.id === id);
    if (apt) {
      apt.status = status;
      return res.json({ appointment: apt, source: 'memory' });
    }
    return res.status(404).json({ error: 'Cita no encontrada.' });
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ error: 'Error al actualizar el estado de la cita.' });
  }
});

// Obtener disponibilidad / horarios
app.get('/api/schedules', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (!error && data && data.length > 0) {
        return res.json({ schedules: data, source: 'supabase' });
      }
    }
    return res.json({ schedules: memorySchedules, source: 'memory' });
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.json({ schedules: memorySchedules, source: 'fallback' });
  }
});

// ==========================================
// VITE SPA MIDDLEWARE INTEGRATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'custom'
    });
    app.use(vite.middlewares);

    // Fallback para servir el index.html transformado por Vite en todas las rutas SPA
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexHtmlPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexHtmlPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [TatuAppte] Servidor Full-Stack activo en http://localhost:${PORT}`);
  });
}

startServer();
