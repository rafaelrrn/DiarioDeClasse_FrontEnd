'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import {
  usePeriodos,
  useCriarPeriodo,
  useAtualizarPeriodo,
  useDeletarPeriodo,
} from '@/features/calendario/calendarioQueries';
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
import type { PeriodoDTO } from '@/features/calendario/types';

const schema = z.object({ nome: z.string().min(1, 'Nome é obrigatório').max(255) });
type FormData = z.infer<typeof schema>;

export function PeriodosTabContent() {
  const { is } = useRoles();
  const podeEscrever = is('ADMINISTRADOR');

  const { data: periodos = [], isLoading, isError, refetch } = usePeriodos();
  const criar = useCriarPeriodo();
  const atualizar = useAtualizarPeriodo();
  const deletar = useDeletarPeriodo();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<PeriodoDTO | undefined>();
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    form.reset({ nome: editando?.nome ?? '' });
  }, [editando, dialogOpen]);

  function onSubmit(data: FormData) {
    if (editando?.idPeriodo) {
      atualizar.mutate(
        { id: editando.idPeriodo, dto: data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      criar.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  }

  return (
    <div>
      {podeEscrever && (
        <div className="flex justify-end mb-3">
          <Button size="sm" onClick={() => { setEditando(undefined); setDialogOpen(true); }}>
            + Novo Período
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
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
              {podeEscrever && <TableHead className="w-24">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {periodos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={podeEscrever ? 3 : 2} className="text-center text-muted-foreground py-8">
                  Nenhum período cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              periodos.map((p) => (
                <TableRow key={p.idPeriodo}>
                  <TableCell>{p.idPeriodo}</TableCell>
                  <TableCell>{p.nome}</TableCell>
                  {podeEscrever && (
                    <TableCell className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditando(p); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletandoId(p.idPeriodo!)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditando(undefined); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Período' : 'Novo Período'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 1º Bimestre" {...field} />
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
            <AlertDialogTitle>Excluir período?</AlertDialogTitle>
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
