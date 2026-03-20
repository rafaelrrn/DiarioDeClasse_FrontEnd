'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useTiposPessoa,
  useCriarTipoPessoa,
  useAtualizarTipoPessoa,
  useDeletarTipoPessoa,
} from '@/features/pessoa/pessoaQueries';
import { useRoles } from '@/shared/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { TipoPessoaDTO } from '@/features/pessoa/types';

const schema = z.object({ nome: z.string().min(1, 'Nome é obrigatório').max(255) });
type FormData = z.infer<typeof schema>;

export function TipoPessoaTabContent() {
  const { is } = useRoles();

  const { data: tipos = [], isLoading, isError, refetch } = useTiposPessoa();
  const criar = useCriarTipoPessoa();
  const atualizar = useAtualizarTipoPessoa();
  const deletar = useDeletarTipoPessoa();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<TipoPessoaDTO | undefined>();
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    form.reset({ nome: editando?.nome ?? '' });
  }, [editando, dialogOpen]);

  if (!is('ADMINISTRADOR')) {
    return (
      <p className="text-muted-foreground text-sm py-4">
        Acesso restrito ao Administrador.
      </p>
    );
  }

  function onSubmit(data: FormData) {
    if (editando?.idTipoPessoa) {
      atualizar.mutate(
        { id: editando.idTipoPessoa, dto: data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      criar.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={() => { setEditando(undefined); setDialogOpen(true); }}>
          + Novo Tipo
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      )}

      {isError && (
        <div className="text-center py-6 space-y-2">
          <p className="text-muted-foreground">Não foi possível carregar os dados.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      )}

      {!isLoading && !isError && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tipos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  Nenhum tipo de pessoa cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              tipos.map((t) => (
                <TableRow key={t.idTipoPessoa}>
                  <TableCell>{t.idTipoPessoa}</TableCell>
                  <TableCell>{t.nome}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditando(t); setDialogOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletandoId(t.idTipoPessoa!)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditando(undefined); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Tipo de Pessoa' : 'Novo Tipo de Pessoa'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Aluno, Professor, Responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={criar.isPending || atualizar.isPending}>
                  {criar.isPending || atualizar.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletandoId !== null} onOpenChange={(open) => { if (!open) setDeletandoId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tipo de pessoa?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletandoId !== null)
                  deletar.mutate(deletandoId, { onSuccess: () => setDeletandoId(null) });
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
