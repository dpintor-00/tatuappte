import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  switchRoleForDemo: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuario de muestra inicial para navegación instantánea
const DEFAULT_DEMO_USER: User = {
  id: 'usr_demo_01',
  username: 'Alex Valenzuela',
  email: 'alex@tatuappte.com',
  role: 'customer',
  bio: 'Amante del estilo tradicional japonés y blackwork.'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('tatuappte_user');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_DEMO_USER;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('tatuappte_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tatuappte_user');
    }
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRoleForDemo = (newRole: UserRole) => {
    if (!user) {
      setUser({
        id: 'usr_demo_02',
        username: newRole === 'tattooist' ? 'Studio BlackInk (Carlos)' : 'Cliente Visitante',
        email: `${newRole}@tatuappte.com`,
        role: newRole
      });
      return;
    }
    setUser({
      ...user,
      role: newRole,
      username: newRole === 'tattooist' ? 'Studio BlackInk (Carlos)' : 'Alex Valenzuela'
    });
  };

  const role: UserRole = user?.role || 'customer';
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, login, logout, switchRoleForDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
