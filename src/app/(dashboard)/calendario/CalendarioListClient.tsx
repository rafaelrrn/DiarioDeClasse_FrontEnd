'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useCalendarios,
  useCriarCalendario,
  useAtualizarCalendario,
  useDeletarCalendario,
  useMeses,
  useAnosCalendario,
  usePeriodos,
} from '@/features/calendario/calendarioQueries';
import { useClasses } from '@/features/turma/turmaQueries';
import { useRoles } from '@/shared/hooks/useRoles';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
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
import type { CalendarioEscolarDTO } from '@/features/calendario/types';

const schema = z.object({
  idMes: z.number().positive('Mês é obrigatório'),
  idAnoCalendario: z.number().optional().nullable(),
  idPeriodo: z.number().positive('Período é obrigatório'),
  idClasse: z.number().positive('Classe é obrigatória'),
  diasLetivos: z.string().max(255).optional(),
  diasAvaliacoes: z.string().max(255).optional(),
});
type FormData = z.infer<typeof schema>;

export function CalendarioListClient() {
  const { hasAny, is } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR', 'COORDENADOR');
  const podeExcluir = is('ADMINISTRADOR');

  const { data: calendarios = [], isLoading, isError, refetch } = useCalendarios();
  const { data: meses = [] } = useMeses();
  const { data: anos = [] } = useAnosCalendario();
  const { data: periodos = [] } = usePeriodos();
  const { data: classes = [] } = useClasses();

  const criar = useCriarCalendario();
  const atualizar = useAtualizarCalendario();
  const deletar = useDeletarCalendario();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<CalendarioEscolarDTO | undefined>();
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  // Filtros client-side
  const [filtroAno, setFiltroAno] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editando) {
      form.reset({
        idMes: editando.idMes,
        idAnoCalendario: editando.idAnoCalendario ?? null,
        idPeriodo: editando.idPeriodo,
        idClasse: editando.idClasse,
        diasLetivos: editando.diasLetivos ?? '',
        diasAvaliacoes: editando.diasAvaliacoes ?? '',
      });
    } else {
      form.reset({
        idMes: 0,
        idAnoCalendario: null,
        idPeriodo: 0,
        idClasse: 0,
        diasLetivos: '',
        diasAvaliacoes: '',
      });
    }
  }, [editando, dialogOpen]);

  function onSubmit(data: FormData) {
    const dto: Omit<CalendarioEscolarDTO, 'idCalendarioEscolar'> = {
      idMes: data.idMes,
      idAnoCalendario: data.idAnoCalendario || null,
      idPeriodo: data.idPeriodo,
      idClasse: data.idClasse,
      diasLetivos: data.diasLetivos || undefined,
      diasAvaliacoes: data.diasAvaliacoes || undefined,
    };
    if (editando?.idCalendarioEscolar) {
      atualizar.mutate(
        { id: editando.idCalendarioEscolar, dto },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      criar.mutate(dto, { onSuccess: () => setDialogOpen(false) });
    }
  }

  function nomeMes(id: number) {
    return meses.find((m) => m.idMes === id)?.nome ?? String(id);
  }
  function nomeAno(id?: number | null) {
    if (!id) return '—';
    return anos.find((a) => a.idAnoCalendario === id)?.ano ?? String(id);
  }
  function nomePeriodo(id: number) {
    return periodos.find((p) => p.idPeriodo === id)?.nome ?? String(id);
  }

  const filtrados = calendarios.filter((c) => {
    if (filtroAno && String(c.idAnoCalendario) !== filtroAno) return false;
    if (filtroPeriodo && String(c.idPeriodo) !== filtroPeriodo) return false;
    return true;
  });

  const isPending = criar.isPending || atualizar.isPending;

  return (
    <div>
      <PageHeader
        title="Calendário Escolar"
        action={
          podeEscrever ? (
            <Button size="sm" onClick={() => { setEditando(undefined); setDialogOpen(true); }}>
              + Novo Calendário
            </Button>
          ) : undefined
        }
      />

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <div className="w-48">
          <Select value={filtroAno} onValueChange={(v) => setFiltroAno(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por ano..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os anos</SelectItem>
              {anos.map((a) => (
                <SelectItem key={a.idAnoCalendario} value={String(a.idAnoCalendario)}>
                  {a.ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-52">
          <Select value={filtroPeriodo} onValueChange={(v) => setFiltroPeriodo(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por período..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os períodos</SelectItem>
              {periodos.map((p) => (
                <SelectItem key={p.idPeriodo} value={String(p.idPeriodo)}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
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
              <TableHead>Mês</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Classe</TableHead>
              <TableHead>Dias Letivos</TableHead>
              <TableHead>Dias Aval.</TableHead>
              {(podeEscrever || podeExcluir) && <TableHead className="w-24">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={podeEscrever || podeExcluir ? 8 : 7} className="text-center text-muted-foreground py-8">
                  Nenhum calendário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((c) => (
                <TableRow key={c.idCalendarioEscolar}>
                  <TableCell>{c.idCalendarioEscolar}</TableCell>
                  <TableCell>{nomeMes(c.idMes)}</TableCell>
                  <TableCell>{nomeAno(c.idAnoCalendario)}</TableCell>
                  <TableCell>{nomePeriodo(c.idPeriodo)}</TableCell>
                  <TableCell>Classe #{c.idClasse}</TableCell>
                  <TableCell>{c.diasLetivos ?? '—'}</TableCell>
                  <TableCell>{c.diasAvaliacoes ?? '—'}</TableCell>
                  {(podeEscrever || podeExcluir) && (
                    <TableCell className="flex gap-1">
                      {podeEscrever && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditando(c); setDialogOpen(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {podeExcluir && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletandoId(c.idCalendarioEscolar!)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditando(undefined); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Calendário' : 'Novo Calendário'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="idMes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mês</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {meses.map((m) => (
                        <SelectItem key={m.idMes} value={String(m.idMes)}>{m.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="idAnoCalendario" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano Calendário <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Sem ano definido" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Sem ano definido</SelectItem>
                      {anos.map((a) => (
                        <SelectItem key={a.idAnoCalendario} value={String(a.idAnoCalendario)}>
                          {a.ano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="idPeriodo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Período</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {periodos.map((p) => (
                        <SelectItem key={p.idPeriodo} value={String(p.idPeriodo)}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="idClasse" render={({ field }) => (
                <FormItem>
                  <FormLabel>Classe</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.idClasse} value={String(c.idClasse)}>
                          Classe #{c.idClasse}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="diasLetivos" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dias Letivos</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 20" maxLength={255} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="diasAvaliacoes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dias Avaliações</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 5" maxLength={255} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

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
            <AlertDialogTitle>Excluir calendário?</AlertDialogTitle>
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
