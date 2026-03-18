import { redirect } from 'next/navigation';
import { buscarMeServer } from '@/features/auth/authService';

export default async function DashboardPage() {
  const user = await buscarMeServer();

  if (!user) redirect('/login');

  if (user.role === 'ALUNO' || user.role === 'RESPONSAVEL') {
    redirect('/alunos');
  }

  redirect('/turmas');
}
