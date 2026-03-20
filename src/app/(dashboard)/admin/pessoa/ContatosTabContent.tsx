'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useContatos,
  useCriarContato,
  useAtualizarContato,
  useDeletarContato,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ContatoDTO } from '@/features/pessoa/types';

const TIPOS_CONTATO = ['Celular', 'Telefone Fixo', 'E-mail', 'WhatsApp', 'Outro'];

const schema = z.object({
  tipoContato: z.string().min(1, 'Tipo é obrigatório').max(255),
  contato: z.string().min(1, 'Valor é obrigatório').max(255),
  tipoCustom: z.string().max(255).optional(),
});
type FormData = z.infer<typeof schema>;

export function ContatosTabContent() {
  const { hasAny, is } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR', 'COORDENADOR');
  const podeExcluir = is('ADMINISTRADOR');

  const { data: contatos = [], isLoading, isError, refetch } = useContatos();
  const criar = useCriarContato();
  const atualizar = useAtualizarContato();
  const deletar = useDeletarContato();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<ContatoDTO | undefined>();
  const [deletandoId, setDeletandoId] = useState<number | null>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState('');

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editando) {
      const isCustom = !TIPOS_CONTATO.slice(0, -1).includes(editando.tipoContato);
      setTipoSelecionado(isCustom ? 'Outro' : editando.tipoContato);
      form.reset({
        tipoContato: editando.tipoContato,
        contato: editando.contato,
        tipoCustom: isCustom ? editando.tipoContato : '',
      });
    } else {
      setTipoSelecionado('');
      form.reset({ tipoContato: '', contato: '', tipoCustom: '' });
    }
  }, [editando, dialogOpen]);

  function onSubmit(data: FormData) {
    const tipoFinal = tipoSelecionado === 'Outro' ? (data.tipoCustom || 'Outro') : data.tipoContato;
    const dto = { tipoContato: tipoFinal, contato: data.contato };
    if (editando?.idContato) {
      atualizar.mutate({ id: editando.idContato, dto }, { onSuccess: () => setDialogOpen(false) });
    } else {
      criar.mutate(dto, { onSuccess: () => setDialogOpen(false) });
    }
  }

  return (
    <div>
      {podeEscrever && (
        <div className="flex justify-end mb-3">
          <Button size="sm" onClick={() => { setEditando(undefined); setDialogOpen(true); }}>
            + Novo Contato
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
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contatos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhum contato cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              contatos.map((c) => (
                <TableRow key={c.idContato}>
                  <TableCell>{c.idContato}</TableCell>
                  <TableCell>{c.tipoContato}</TableCell>
                  <TableCell>{c.contato}</TableCell>
                  <TableCell className="flex gap-1">
                    {podeEscrever && (
                      <Button variant="ghost" size="icon" onClick={() => { setEditando(c); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {podeExcluir && (
                      <Button variant="ghost" size="icon" onClick={() => setDeletandoId(c.idContato!)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
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
            <DialogTitle>{editando ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  value={tipoSelecionado}
                  onValueChange={(v) => {
                    setTipoSelecionado(v ?? '');
                    if (v && v !== 'Outro') form.setValue('tipoContato', v);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_CONTATO.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              {tipoSelecionado === 'Outro' && (
                <FormField control={form.control} name="tipoCustom" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo personalizado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Telegram" maxLength={255} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              <FormField control={form.control} name="contato" render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: (12) 99999-0000" maxLength={255} {...field} />
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
            <AlertDialogTitle>Excluir contato?</AlertDialogTitle>
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
