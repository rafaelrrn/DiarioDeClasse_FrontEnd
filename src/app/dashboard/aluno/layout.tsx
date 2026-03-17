'use client';

import Protected from '@/components/Protected';

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected roles={['ALUNO']}>
      {children}
    </Protected>
  );
}
