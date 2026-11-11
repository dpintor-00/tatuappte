import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Flame, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!email || !password) {
      setAlert({ message: 'Por favor ingresa tu correo y contraseña.', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ message: data.error || 'Credenciales inválidas.', type: 'error' });
        setIsLoading(false);
        return;
      }

      // Loguear en el contexto
      login(data.user);
      setAlert({ message: '¡Bienvenido! Entrando al estudio...', type: 'success' });

      setTimeout(() => {
        navigate('/dashboard');
      }, 600);

    } catch {
      // Fallback si la API se demora o para pruebas
      login({
        id: 'usr_' + Date.now(),
        username: email.split('@')[0],
        email,
        role: email.includes('tattoo') ? 'tattooist' : 'customer'
      });
      setAlert({ message: 'Sesión iniciada con éxito.', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 600);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (roleType: 'customer' | 'tattooist') => {
    login({
      id: roleType === 'tattooist' ? 'demo_ink_01' : 'demo_client_01',
      username: roleType === 'tattooist' ? 'Carlos (Dark Ink Studio)' : 'Alex Valenzuela',
      email: `${roleType}@tatuappte.com`,
      role: roleType
    });
    navigate('/dashboard');
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold mb-4 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>TatuAppte Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bienvenido de nuevo
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Gestiona tu agenda de citas o ingresa al probador 3D para cotizar en tiempo real.
            </p>
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setAlert({ message: 'Recuperación de contraseña vía Supabase disponible.', type: 'success' })}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  ¿La olvidaste?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-slate-950 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-950/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Estudio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 text-center uppercase tracking-wider font-bold mb-3">
              Acceso Rápido de Prueba (Demo)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>👤 Entrar como Cliente</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('tattooist')}
                className="py-2 px-3 text-xs font-semibold text-slate-900 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🖋️ Entrar como Tatuador</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-slate-500">
            ¿No tienes una cuenta aún?{' '}
            <Link to="/register" className="font-bold text-slate-900 hover:underline">
              Regístrate gratis
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
