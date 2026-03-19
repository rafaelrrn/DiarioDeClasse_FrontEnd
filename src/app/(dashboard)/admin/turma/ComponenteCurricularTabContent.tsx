'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useComponentesCurriculares,
  useCriarComponenteCurricular,
  useAtualizarComponenteCurricular,
  useDeletarComponenteCurricular,
} from '@/features/turma/turmaQueries';
import { useRoles } from '@/shared/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import type { ComponenteCurricularDTO } from '@/features/turma/types';

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  obs: z.string().max(255).optional(),
});
type FormData = z.infer<typeof schema>;

export function ComponenteCurricularTabContent() {
  const { hasAny } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR');

  const { data: componentes = [], isLoading, isError, refetch } = useComponentesCurriculares();
  const criar = useCriarComponenteCurricular();
  const atualizar = useAtualizarComponenteCurricular();
  const deletar = useDeletarComponenteCurricular();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<ComponenteCurricularDTO | undefined>();
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    form.reset({ nome: editando?.nome ?? '', obs: editando?.obs ?? '' });
  }, [editando, dialogOpen]);

  function onSubmit(data: FormData) {
    if (editando?.idComponenteCurricular) {
      atualizar.mutate(
        { id: editando.idComponenteCurricular, dto: data },
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
            + Novo Componente
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
              <TableHead>Observação</TableHead>
              {podeEscrever && <TableHead className="w-24">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {componentes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={podeEscrever ? 4 : 3} className="text-center text-muted-foreground py-8">
                  Nenhum componente curricular encontrado.
                </TableCell>
              </TableRow>
            ) : (
              componentes.map((c) => (
                <TableRow key={c.idComponenteCurricular}>
                  <TableCell>{c.idComponenteCurricular}</TableCell>
                  <TableCell>{c.nome}</TableCell>
                  <TableCell>{c.obs ?? '—'}</TableCell>
                  {podeEscrever && (
                    <TableCell className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditando(c); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletandoId(c.idComponenteCurricular!)}>
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
            <DialogTitle>{editando ? 'Editar Componente Curricular' : 'Novo Componente Curricular'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input placeholder="Ex: Língua Portuguesa" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="obs" render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observação opcional" maxLength={255} {...field} />
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
            <AlertDialogTitle>Excluir componente curricular?</AlertDialogTitle>
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
