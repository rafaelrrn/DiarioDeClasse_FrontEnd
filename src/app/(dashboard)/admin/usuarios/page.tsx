'use client';
import Link from 'next/link';
import { useUsuarios } from '@/features/auth/authQueries';
import { RoleBadge } from '@/shared/components/RoleBadge';
import { PageHeader } from '@/shared/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/lib/buttonVariants';
import { cn } from '@/lib/utils';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export default function AdminUsuariosPage() {
  const { data: usuarios = [], isLoading, isError, refetch } = useUsuarios();

  return (
    <div>
      <PageHeader
        title="Gerenciar Usuários"
        action={
          <Link href="/admin/usuarios/novo" className={cn(buttonVariants({ size: 'sm' }))}>
            + Novo Usuário
          </Link>
        }
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      )}

      {isError && (
        <div className="text-center py-6 space-y-2">
          <p className="text-muted-foreground">Não foi possível carregar os usuários.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      )}

      {!isLoading && !isError && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Pessoa</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((u) => (
                <TableRow key={u.idUser}>
                  <TableCell className="font-medium">{u.nome}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><RoleBadge role={u.role} /></TableCell>
                  <TableCell>
                    {u.idPessoa ? (
                      <Badge variant="secondary">Vinculada #{u.idPessoa}</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Sem vínculo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/usuarios/${u.idUser}`}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                    >
                      Editar
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
