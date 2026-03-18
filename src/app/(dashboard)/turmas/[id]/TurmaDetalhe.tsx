'use client';
import Link from 'next/link';
import { useAlunosDaTurma, useTurma } from '@/features/turma/turmaQueries';
import { PageHeader } from '@/shared/components/PageHeader';
import { buttonVariants } from '@/lib/buttonVariants';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Role } from '@/features/auth/types';

export function TurmaDetalhe({ idTurma, userRole }: { idTurma: number; userRole: Role }) {
  const { data: turma } = useTurma(idTurma);
  const { data: alunos = [], isLoading } = useAlunosDaTurma(idTurma);

  const podeMatricular = ['ADMINISTRADOR', 'COORDENADOR'].includes(userRole);

  return (
    <div>
      <PageHeader
        title={turma?.nome ?? 'Turma'}
        action={
          podeMatricular ? (
            <Link
              href={`/turmas/${idTurma}/frequencia`}
              className={cn(buttonVariants({ size: 'sm' }))}
            >
              Lançar Frequência
            </Link>
          ) : undefined
        }
      />

      {isLoading ? (
        <p className="text-muted-foreground">Carregando alunos...</p>
      ) : alunos.length === 0 ? (
        <p className="text-muted-foreground">Nenhum aluno matriculado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Aluno</TableHead>
              <TableHead>Observação</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alunos.map((a) => (
              <TableRow key={a.idAlunoTurma}>
                <TableCell>{a.idAluno}</TableCell>
                <TableCell>{a.obs ?? '—'}</TableCell>
                <TableCell>
                  <Link
                    href={`/alunos/${a.idAluno}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    Ver aluno
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
