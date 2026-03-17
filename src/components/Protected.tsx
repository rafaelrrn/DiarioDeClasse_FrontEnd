'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types/role';

type ProtectedProps = {
  roles?: Role[]; // agora opcional
  children: ReactNode;
};

export default function Protected({ roles, children }: ProtectedProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (roles && !roles.includes(user.role)) {
        router.push('/unauthorized');
      }
    }
  }, [loading, user, roles, router]);

  if (loading || !user) {
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}