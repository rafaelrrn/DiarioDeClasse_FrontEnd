'use client';

import Protected from '@/components/Protected';
import { Role } from '@/types/role';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected>
      {children}
    </Protected>
  );
}