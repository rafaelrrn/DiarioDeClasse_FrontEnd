'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useAnosCalendario,
  useCriarAnoCalendario,
  useAtualizarAnoCalendario,
  useDeletarAnoCalendario,
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
import type { AnoCalendarioDTO } from '@/features/calendario/types';

const schema = z.object({
  ano: z
    .string()
    .min(4, 'Informe o ano com 4 dígitos')
    .max(4, 'Máximo 4 caracteres')
    .regex(/^\d{4}$/, 'Use apenas números — ex: 2025'),
});
type FormData = z.infer<typeof schema>;

export function AnoCalendarioTabContent() {
  const { is } = useRoles();
  const podeEscrever = is('ADMINISTRADOR');

  const { data: anos = [], isLoading, isError, refetch } = useAnosCalendario();
  const criar = useCriarAnoCalendario();
  const atualizar = useAtualizarAnoCalendario();
  const deletar = useDeletarAnoCalendario();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<AnoCalendarioDTO | undefined>();
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    form.reset({ ano: editando?.ano ?? '' });
  }, [editando, dialogOpen]);

  function onSubmit(data: FormData) {
    if (editando?.idAnoCalendario) {
      atualizar.mutate(
        { id: editando.idAnoCalendario, dto: data },
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
            + Novo Ano
          </Button>
        </div>
      )}

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
              <TableHead>Ano</TableHead>
              {podeEscrever && <TableHead className="w-24">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {anos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={podeEscrever ? 3 : 2} className="text-center text-muted-foreground py-8">
                  Nenhum ano calendário cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              anos.map((a) => (
                <TableRow key={a.idAnoCalendario}>
                  <TableCell>{a.idAnoCalendario}</TableCell>
                  <TableCell>{a.ano}</TableCell>
                  {podeEscrever && (
                    <TableCell className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditando(a); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletandoId(a.idAnoCalendario!)}>
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
            <DialogTitle>{editando ? 'Editar Ano Calendário' : 'Novo Ano Calendário'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="ano" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano</FormLabel>
                  <FormControl>
                    <Input placeholder="2025" maxLength={4} {...field} />
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
            <AlertDialogTitle>Excluir ano calendário?</AlertDialogTitle>
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
