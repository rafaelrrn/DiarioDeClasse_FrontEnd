'use client';
import { usePessoas } from '@/features/pessoa/pessoaQueries';
import { PageHeader } from '@/shared/components/PageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminUsuariosPage() {
  const { data: pessoas = [], isLoading } = usePessoas();

  return (
    <div>
      <PageHeader title="Gerenciar Usuários" />
      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Situação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pessoas.map((p) => (
              <TableRow key={p.idPessoa}>
                <TableCell>{p.idPessoa}</TableCell>
                <TableCell>{p.nome}</TableCell>
                <TableCell>{p.situacao ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
