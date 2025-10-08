import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock user data
    const mockUser: User = {
      id: '1',
      firstName: 'John',
      lastName: 'Contractor',
      email: 'john@contractor.com',
      phone: '555-0123',
      role: 'Admin',
      company: {
        id: '1',
        name: 'ABC Construction',
        accountNumber: 'ABC123',
        billingAddresses: [],
        shippingAddresses: [],
        contacts: []
      }
    };
    setUser(mockUser);
  }, []);

  const logout = (): void => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};