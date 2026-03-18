'use client';
import { useEffect } from 'react';
import { buscarMe } from '@/features/auth/authService';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function AuthInitializer() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    buscarMe()
      .then((user) => setUser(user))
      .catch(() => setUser(null));
  }, [setUser]);

  return null;
}
