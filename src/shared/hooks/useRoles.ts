'use client';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Role } from '@/features/auth/types';

const HIERARCHY: Role[] = [
  'ALUNO',
  'RESPONSAVEL',
  'PROFESSOR',
  'COORDENADOR',
  'DIRETOR',
  'ADMINISTRADOR',
];

export function useRoles() {
  const user = useAuthStore((s) => s.user);
  return {
    role: user?.role,
    is: (role: Role) => user?.role === role,
    hasAny: (...roles: Role[]) => !!user && roles.includes(user.role),
    /** true se o usuário tem nível >= target na hierarquia */
    atLeast: (target: Role): boolean => {
      if (!user) return false;
      return HIERARCHY.indexOf(user.role) >= HIERARCHY.indexOf(target);
    },
  };
}
