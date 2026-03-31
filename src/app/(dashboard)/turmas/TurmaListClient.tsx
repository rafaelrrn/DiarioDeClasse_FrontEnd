'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import { useTurmas, useTurmasDoProfessor, useCriarTurma, useAtualizarTurma, useDeletarTurma } from '@/features/turma/turmaQueries';
import { useRoles } from '@/shared/hooks/useRoles';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { PageHeader } from '@/shared/components/PageHeader';
import { buttonVariants } from '@/lib/buttonVariants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import type { TurmaDTO } from '@/features/turma/types';

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
});
type FormData = z.infer<typeof schema>;

export function TurmaListClient() {
  const { hasAny, is } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR');
  const isProfessor = is('PROFESSOR');
  const user = useAuthStore((s) => s.user);

  const turmasAdmin = useTurmas(!isProfessor);
  const turmasProf = useTurmasDoProfessor(isProfessor ? (user?.idPessoa ?? null) : null);

  const { data: turmas = [], isLoading, isError, refetch } = isProfessor ? turmasProf : turmasAdmin;
  const criar = useCriarTurma();
  const atualizar = useAtualizarTurma();
  const deletar = useDeletarTurma();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<TurmaDTO | undefined>();
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    form.reset({ nome: editando?.nome ?? '' });
  }, [editando, dialogOpen]);

  function abrirCriar() {
    setEditando(undefined);
    setDialogOpen(true);
  }

  function abrirEditar(turma: TurmaDTO) {
    setEditando(turma);
    setDialogOpen(true);
  }

  function onSubmit(data: FormData) {
    if (editando?.idTurma) {
      atualizar.mutate(
        { id: editando.idTurma, dto: data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      criar.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  }

  const isPending = criar.isPending || atualizar.isPending;

  return (
    <div>
      <PageHeader
        title="Turmas"
        action={
          podeEscrever ? (
            <Button size="sm" onClick={abrirCriar}>+ Nova Turma</Button>
          ) : undefined
        }
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-8 space-y-2">
          <p className="text-muted-foreground">Não foi possível carregar as turmas.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="w-48">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {turmas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  Nenhuma turma encontrada.
                </TableCell>
              </TableRow>
            ) : (
              turmas.map((t) => (
                <TableRow key={t.idTurma}>
                  <TableCell>{t.idTurma}</TableCell>
                  <TableCell>{t.nome}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Link
                      href={`/turmas/${t.idTurma}`}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                    >
                      Ver alunos
                    </Link>
                    {podeEscrever && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => abrirEditar(t)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletandoId(t.idTurma!)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Dialog criar / editar */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditando(undefined); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Turma' : 'Nova Turma'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl><Input placeholder="Ex: 5º Ano A" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog excluir */}
      <AlertDialog open={deletandoId !== null} onOpenChange={(open) => { if (!open) setDeletandoId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir turma?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A turma será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletandoId !== null) {
                  deletar.mutate(deletandoId, { onSuccess: () => setDeletandoId(null) });
                }
              }}
              disabled={deletar.isPending}
            >
              {deletar.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
