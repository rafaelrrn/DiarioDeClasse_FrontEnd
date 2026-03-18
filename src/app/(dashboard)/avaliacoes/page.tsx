'use client';
import Link from 'next/link';
import { useAvaliacoes } from '@/features/avaliacao/avaliacaoQueries';
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

export default function AvaliacoesPage() {
  const { data: avaliacoes = [], isLoading } = useAvaliacoes();

  return (
    <div>
      <PageHeader title="Avaliações" />
      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Matéria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {avaliacoes.map((a) => (
              <TableRow key={a.idAvaliacao}>
                <TableCell>{a.idAvaliacao}</TableCell>
                <TableCell>{a.materia ?? '—'}</TableCell>
                <TableCell>{a.dia ?? '—'}</TableCell>
                <TableCell>{a.peso ?? '—'}</TableCell>
                <TableCell>
                  <Link
                    href={`/avaliacoes/${a.idAvaliacao}/notas`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    Lançar Notas
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
