'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/types/role';
import api from '@/services/api';


export type User = {
  id: number;
  nome: string;
  email: string;
  role: Role;
};


type AuthContextData = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  async function loadUser() {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadUser();
  }, []);

  async function refreshUser() {
    setLoading(true);
    await loadUser();
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout');
    }
  }
 

  return (
    <AuthContext.Provider
      value={{
      user,
      isAuthenticated,
      loading,
      logout,
      refreshUser
    }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context = useContext(AuthContext);
  return context;

}