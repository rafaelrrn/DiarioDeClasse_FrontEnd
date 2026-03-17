'use client';

import Protected from '@/components/Protected';

export default function AdministradorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected roles={['ADMINISTRADOR']}>
      {children}
    </Protected>
  );
}
