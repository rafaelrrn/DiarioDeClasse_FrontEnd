'use client';
import Link from 'next/link';
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
import type { TurmaDTO } from '@/features/turma/types';

export function TurmaTable({ turmas }: { turmas: TurmaDTO[] }) {
  if (turmas.length === 0) {
    return <p className="text-muted-foreground mt-4">Nenhuma turma encontrada.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {turmas.map((t) => (
          <TableRow key={t.idTurma}>
            <TableCell>{t.idTurma}</TableCell>
            <TableCell>{t.nome}</TableCell>
            <TableCell className="flex gap-2">
              <Link
                href={`/turmas/${t.idTurma}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                Ver alunos
              </Link>
              <Link
                href={`/turmas/${t.idTurma}/frequencia`}
                className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
              >
                Frequência
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
