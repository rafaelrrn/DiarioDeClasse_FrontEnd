import { buscarMeServer } from '@/features/auth/authService';
import { redirect } from 'next/navigation';
import { LancarFrequenciaForm } from './LancarFrequenciaForm';

export default async function FrequenciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await buscarMeServer();
  if (!user) redirect('/login');

  const { id } = await params;

  const podelancar = ['ADMINISTRADOR', 'PROFESSOR'].includes(user.role);
  if (!podelancar) redirect('/acesso-negado');

  return <LancarFrequenciaForm idTurma={Number(id)} />;
}
