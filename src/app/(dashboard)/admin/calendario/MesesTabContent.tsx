'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useMeses,
  useCriarMes,
  useAtualizarMes,
  useDeletarMes,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MesDTO } from '@/features/calendario/types';

const MESES_SUGERIDOS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro', 'Outro',
];

const schema = z.object({ nome: z.string().min(1, 'Nome é obrigatório').max(255) });
type FormData = z.infer<typeof schema>;

export function MesesTabContent() {
  const { is } = useRoles();
  const podeEscrever = is('ADMINISTRADOR');

  const { data: meses = [], isLoading, isError, refetch } = useMeses();
  const criar = useCriarMes();
  const atualizar = useAtualizarMes();
  const deletar = useDeletarMes();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<MesDTO | undefined>();
  const [deletandoId, setDeletandoId] = useState<number | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState('');

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editando) {
      const isCustom = !MESES_SUGERIDOS.slice(0, -1).includes(editando.nome);
      setMesSelecionado(isCustom ? 'Outro' : editando.nome);
      form.reset({ nome: editando.nome });
    } else {
      setMesSelecionado('');
      form.reset({ nome: '' });
    }
  }, [editando, dialogOpen]);

  function onSubmit(data: FormData) {
    if (editando?.idMes) {
      atualizar.mutate(
        { id: editando.idMes, dto: { nome: data.nome } },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      criar.mutate({ nome: data.nome }, { onSuccess: () => setDialogOpen(false) });
    }
  }

  return (
    <div>
      {podeEscrever && (
        <div className="flex justify-end mb-3">
          <Button size="sm" onClick={() => { setEditando(undefined); setDialogOpen(true); }}>
            + Novo Mês
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
            {meses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={podeEscrever ? 3 : 2} className="text-center text-muted-foreground py-8">
                  Nenhum mês cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              meses.map((m) => (
                <TableRow key={m.idMes}>
                  <TableCell>{m.idMes}</TableCell>
                  <TableCell>{m.nome}</TableCell>
                  {podeEscrever && (
                    <TableCell className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditando(m); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletandoId(m.idMes!)}>
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
            <DialogTitle>{editando ? 'Editar Mês' : 'Novo Mês'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormItem>
                <FormLabel>Mês</FormLabel>
                <Select
                  value={mesSelecionado}
                  onValueChange={(v) => {
                    setMesSelecionado(v ?? '');
                    if (v && v !== 'Outro') form.setValue('nome', v, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione ou use campo livre..." /></SelectTrigger>
                  <SelectContent>
                    {MESES_SUGERIDOS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              {mesSelecionado === 'Outro' && (
                <FormField control={form.control} name="nome" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome personalizado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Recesso" maxLength={255} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

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
            <AlertDialogTitle>Excluir mês?</AlertDialogTitle>
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
