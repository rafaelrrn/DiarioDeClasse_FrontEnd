'use client';
import Link from 'next/link';
import { usePessoas } from '@/features/pessoa/pessoaQueries';
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

export default function AlunosPage() {
  const { data: pessoas = [], isLoading } = usePessoas();

  return (
    <div>
      <PageHeader title="Alunos" />
      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pessoas.map((p) => (
              <TableRow key={p.idPessoa}>
                <TableCell>{p.idPessoa}</TableCell>
                <TableCell>{p.nome}</TableCell>
                <TableCell className="flex gap-2">
                  <Link
                    href={`/alunos/${p.idPessoa}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    Perfil
                  </Link>
                  <Link
                    href={`/alunos/${p.idPessoa}/boletim`}
                    className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                  >
                    Boletim
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
