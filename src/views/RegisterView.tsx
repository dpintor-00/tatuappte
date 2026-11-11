import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Flame, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const RegisterView: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState<UserRole>('customer');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!username || !email || !password || !confirmPassword) {
      setAlert({ message: 'Por favor completa todos los campos requeridos.', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setAlert({ message: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({ message: 'Las contraseñas no coinciden.', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ message: data.error || 'No se pudo crear la cuenta.', type: 'error' });
        setIsLoading(false);
        return;
      }

      setAlert({ message: '¡Cuenta creada con éxito! Redirigiendo...', type: 'success' });
      
      // Auto-login con los datos registrados
      setTimeout(() => {
        login(data.user || {
          id: 'usr_' + Date.now(),
          username,
          email,
          role
        });
        navigate('/dashboard');
      }, 700);

    } catch {
      // Fallback local
      login({
        id: 'usr_' + Date.now(),
        username,
        email,
        role
      });
      setAlert({ message: 'Cuenta creada en entorno local.', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 700);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      
      {/* Decorative background grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40" 
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-md w-full relative z-10">
        
        {/* Bonitapp Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold mb-4 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>TatuAppte Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Crea tu cuenta
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Elige tu perfil para cotizar con el probador 3D o administrar la agenda de tu estudio.
            </p>
          </div>

          {/* Role selector (Bonitapp Tabs) */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/80 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all ${
                role === 'customer'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <UserIcon className="w-3.5 h-3.5" />
                <span>Cliente</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">Quiero tatuarme</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('tattooist')}
              className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all ${
                role === 'tattooist'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <img
                  src="/assets/aistudio/png-clipart-tattoo-machine_391ed3ae.png"
                  alt="Máquina de tatuar"
                  className={`w-4 h-4 object-contain transition-all ${
                    role === 'tattooist' ? 'invert brightness-200' : 'opacity-70'
                  }`}
                />
                <span>Tatuador</span>
              </div>
              <span className={`text-[10px] mt-0.5 ${role === 'tattooist' ? 'text-slate-300' : 'text-slate-400'}`}>
                Tengo un estudio
              </span>
            </button>
          </div>

          {/* Alert */}
          {alert && (
            <div 
              className={`mb-6 p-3.5 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
                alert.type === 'error'
                  ? 'bg-rose-50 text-rose-700 border border-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}
            >
              {alert.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{alert.message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username / Studio name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {role === 'tattooist' ? 'Nombre artístico o del Estudio' : 'Nombre completo'}
              </label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === 'tattooist' ? 'Ej. Dark Ink Studio / Carlos Tattoo' : 'Ej. Alex Valenzuela'}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirmar Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-slate-950 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-950/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <span>Crear mi Cuenta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-slate-500">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-bold text-slate-900 hover:underline">
              Inicia sesión
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
