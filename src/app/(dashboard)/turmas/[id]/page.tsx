import { TurmaDetalheClient } from './TurmaDetalheClient';

export default async function TurmaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TurmaDetalheClient idTurma={Number(id)} />;
}
