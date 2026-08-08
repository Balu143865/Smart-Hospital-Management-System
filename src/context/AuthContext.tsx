import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { safeFetchJson } from '../utils/apiHelper';

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeRole: UserRole;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  verifyEmail: () => Promise<boolean>;
  updateProfile: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'usr-admin',
    name: 'Eleanor Vance',
    email: 'admin@hospital.com',
    role: 'Hospital Admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    phone: '+1 (555) 018-9921',
    isVerified: true,
    createdAt: '2025-01-12T09:30:00Z',
  });
  const [token, setToken] = useState<string | null>('jwt_enterprise_mock_token_123');
  const [activeRole, setActiveRole] = useState<UserRole>('Hospital Admin');

  const login = async (email: string, password?: string, role?: UserRole): Promise<boolean> => {
    try {
      const data = await safeFetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: role || 'Hospital Admin' })
      });
      if (data && data.success) {
        setUser(data.user);
        setToken(data.token);
        setActiveRole(data.user.role);
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
    } else {
      setUser({
        id: 'usr-admin',
        name: 'Eleanor Vance',
        email: `${role.toLowerCase().replace(/\s+/g, '')}@hospital.com`,
        role: role,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        phone: '+1 (555) 018-9921',
        isVerified: true,
        createdAt: '2025-01-12T09:30:00Z',
      });
      setToken('jwt_enterprise_mock_token_123');
    }
  };

  const verifyEmail = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      const data = await safeFetchJson('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (data && data.success) {
        setUser(data.user);
        return true;
      }
    } catch (err) {
      console.error('Verify error:', err);
    }
    return false;
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, activeRole, login, logout, switchRole, verifyEmail, updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
