import { buscarMeServer } from '@/features/auth/authService';
import { redirect } from 'next/navigation';
import { TurmaDetalhe } from './TurmaDetalhe';

export default async function TurmaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await buscarMeServer();
  if (!user) redirect('/login');

  const { id } = await params;
  const idTurma = Number(id);

  return <TurmaDetalhe idTurma={idTurma} userRole={user.role} />;
}
