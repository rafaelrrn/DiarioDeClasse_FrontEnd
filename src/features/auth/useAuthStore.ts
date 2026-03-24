'use client';
import { create } from 'zustand';
import type { UserMe } from './types';

interface AuthState {
  user: UserMe | null;
  setUser: (user: UserMe | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}));
