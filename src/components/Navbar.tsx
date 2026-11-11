import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  LayoutDashboard, 
  Box, 
  LogOut, 
  LogIn, 
  UserPlus, 
  UserCheck,
  Flame
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, logout, switchRoleForDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-md shadow-slate-950/20 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">TatuAppte</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                Studio 3D
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Agendamiento & Cotizador</p>
          </div>
        </Link>

        {/* Navigation links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1.5 rounded-full border border-slate-200/60">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isActive('/dashboard')
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Agenda & Citas</span>
            </Link>

            <Link
              to="/probador"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isActive('/probador')
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Box className="w-4 h-4 text-amber-400" />
              <span>Probador 3D</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </Link>
          </nav>
        )}

        {/* User / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Demo Role Switcher */}
              <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-full text-xs">
                <button
                  type="button"
                  onClick={() => switchRoleForDemo('customer')}
                  className={`px-3 py-1 rounded-full font-semibold transition-all ${
                    role === 'customer'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Ver interfaz como Cliente"
                >
                  Cliente
                </button>
                <button
                  type="button"
                  onClick={() => switchRoleForDemo('tattooist')}
                  className={`px-3 py-1 rounded-full font-semibold transition-all ${
                    role === 'tattooist'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Ver interfaz como Tatuador/Estudio"
                >
                  Tatuador
                </button>
              </div>

              {/* User badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user?.username}</p>
                  <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                    {role === 'tattooist' ? 'Tatuador / Estudio' : 'Cliente'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-105"
              >
                <UserPlus className="w-4 h-4" />
                <span>Crear Cuenta</span>
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Mobile secondary bar */}
      {isAuthenticated && (
        <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-2 bg-slate-50/80 px-4">
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 text-xs font-bold py-1 px-3 rounded-lg ${
              isActive('/dashboard') ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Agenda</span>
          </Link>
          <Link
            to="/probador"
            className={`flex items-center gap-1.5 text-xs font-bold py-1 px-3 rounded-lg ${
              isActive('/probador') ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-amber-400" />
            <span>Probador 3D</span>
          </Link>
          <button
            onClick={() => switchRoleForDemo(role === 'customer' ? 'tattooist' : 'customer')}
            className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md"
          >
            Rol: {role === 'tattooist' ? 'Tatuador' : 'Cliente'}
          </button>
        </div>
      )}
    </header>
  );
};
