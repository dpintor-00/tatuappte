import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Navbar';
import { LoginView } from '../views/LoginView';
import { RegisterView } from '../views/RegisterView';
import { DashboardView } from '../views/DashboardView';
import { Probador3DView } from '../views/Probador3DView';

/**
 * Componente de Ruta Protegida:
 * Permite acceso si está autenticado, de lo contrario redirige a /login.
 */
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

/**
 * Componente Router principal de TatuAppte:
 * Gestiona la navegación declarativa con react-router-dom entre
 * Login, Registro, Dashboard de Citas y Probador 3D.
 */
export const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
        {/* Barra de navegación superior estilo Bonitapp */}
        <Navbar />

        {/* Contenedor principal de vistas */}
        <main className="flex-1">
          <Routes>
            {/* Ruta raíz: redirige al dashboard si hay sesión activa, o a login */}
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
            />

            {/* Vista de Inicio de Sesión */}
            <Route 
              path="/login" 
              element={<LoginView />} 
            />

            {/* Vista de Registro con Selector de Rol */}
            <Route 
              path="/register" 
              element={<RegisterView />} 
            />

            {/* Vista de Agenda y Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardView />
                </ProtectedRoute>
              } 
            />

            {/* Vista del Probador 3D & Cotizador en Tiempo Real */}
            <Route 
              path="/probador" 
              element={
                <ProtectedRoute>
                  <Probador3DView />
                </ProtectedRoute>
              } 
            />

            {/* Alias de compatibilidad */}
            <Route 
              path="/probador.html" 
              element={<Navigate to="/probador" replace />} 
            />

            {/* Ruta comodín de fallback */}
            <Route 
              path="*" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </main>

        {/* Footer sutil */}
        <footer className="border-t border-slate-200/60 bg-white py-6 text-center text-xs text-slate-400">
          <p>TatuAppte &copy; 2026 &bull; Sistema de Agendamiento y Cotizador 3D para Estudios de Tatuajes</p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default AppRouter;
