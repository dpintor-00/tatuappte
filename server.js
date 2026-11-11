import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Supabase
const DEFAULT_SUPABASE_URL = 'https://kgkrhrxsztbzbwlcwtvt.supabase.co';
const rawEnvUrl = process.env.SUPABASE_URL?.trim();
const supabaseUrl = (rawEnvUrl && !rawEnvUrl.includes('your-project-id')) 
  ? rawEnvUrl 
  : DEFAULT_SUPABASE_URL;

const rawEnvKey = process.env.SUPABASE_ANON_KEY?.trim();
const supabaseAnonKey = (rawEnvKey && !rawEnvKey.includes('your-supabase-anon-key')) 
  ? rawEnvKey 
  : '';

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
  console.warn(`⚠️ [TatuAppte] Supabase configurado hacia: ${supabaseUrl}`);
  console.warn('⚠️ Nota: Proporciona SUPABASE_ANON_KEY en las variables de entorno para activar la persistencia en PostgreSQL.');
}

// Almacenamiento fallback en memoria para pruebas inmediatas si aún no se conectan las credenciales de Supabase
const memoryUsers = [];

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// RUTAS DE VISTAS (HTML)
// ==========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/probador', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'probador.html'));
});

// ==========================================
// RUTAS DE LA API - AUTENTICACIÓN
// ==========================================

// Estado del sistema y verificación de Supabase
app.get('/api/status', (req, res) => {
  res.json({
    app: 'TatuAppte API',
    status: 'online',
    supabaseConnected: isSupabaseConfigured,
    time: new Date().toISOString()
  });
});

// Registro de usuario (Tatuador o Cliente)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validaciones básicas
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const assignedRole = role === 'tattooist' ? 'tattooist' : 'customer';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Si Supabase está conectado
    if (supabase) {
      // Verificar si ya existe usuario con ese correo
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (existingUser) {
        return res.status(409).json({ error: 'El correo electrónico ya se encuentra registrado.' });
      }

      // Insertar nuevo usuario
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: assignedRole,
          }
        ])
        .select('id, username, email, role')
        .single();

      if (insertError) {
        console.error('Error insertando en Supabase:', insertError);
        return res.status(500).json({ error: 'Error al registrar en la base de datos: ' + insertError.message });
      }

      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser,
        source: 'supabase'
      });
    }

    // Modo Fallback en memoria si aún no han configurado las claves de Supabase
    const existing = memoryUsers.find(u => u.email === email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'El correo electrónico ya se encuentra registrado en el entorno local.' });
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
      message: 'Usuario registrado exitosamente (Modo prueba local)',
      user: {
        id: localUser.id,
        username: localUser.username,
        email: localUser.email,
        role: localUser.role
      },
      warning: 'Configura SUPABASE_URL y SUPABASE_ANON_KEY en .env para persistencia en PostgreSQL.',
      source: 'memory'
    });
  } catch (err) {
    console.error('Error en /api/auth/register:', err);
    res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' });
  }
});

// Inicio de sesión
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Ingresa tu correo y contraseña.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Si Supabase está conectado
    if (supabase) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Credenciales inválidas. Revisa tu correo o contraseña.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Credenciales inválidas. Revisa tu correo o contraseña.' });
      }

      const { password: _, ...userWithoutPassword } = user;
      return res.json({
        message: 'Inicio de sesión exitoso',
        user: userWithoutPassword,
        source: 'supabase'
      });
    }

    // Fallback memoria
    const localUser = memoryUsers.find(u => u.email === cleanEmail);
    if (!localUser) {
      return res.status(401).json({ error: 'Usuario no encontrado. Regístrate primero o revisa tus credenciales.' });
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
    console.error('Error en /api/auth/login:', err);
    res.status(500).json({ error: 'Error del servidor al iniciar sesión.' });
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ [TatuAppte] Servidor Express corriendo en http://localhost:${PORT}`);
  console.log(`📁 Archivos estáticos servidos desde: ${path.join(__dirname, 'public')}`);
});
