'use client';

import Protected from '@/components/Protected';

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected roles={['PROFESSOR']}>
      {children}
    </Protected>
  );
}
