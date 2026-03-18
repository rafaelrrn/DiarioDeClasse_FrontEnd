import { buscarTurmasServer } from '@/features/turma/turmaService';
import { TurmaTable } from './TurmaTable';
import { PageHeader } from '@/shared/components/PageHeader';

export default async function TurmasPage() {
  const turmas = await buscarTurmasServer();

  return (
    <div>
      <PageHeader title="Turmas" />
      <TurmaTable turmas={turmas} />
    </div>
  );
}
