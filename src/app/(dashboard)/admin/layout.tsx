import { buscarMeServer } from '@/features/auth/authService';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await buscarMeServer();

  if (user?.role !== 'ADMINISTRADOR') {
    redirect('/acesso-negado');
  }

  return <>{children}</>;
}
