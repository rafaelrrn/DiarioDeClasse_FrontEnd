'use client';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Role } from '@/features/auth/types';

export function useRoles() {
  const user = useAuthStore((s) => s.user);
  return {
    is: (role: Role) => user?.role === role,
    hasAny: (...roles: Role[]) => !!user && roles.includes(user.role),
    role: user?.role,
  };
}
