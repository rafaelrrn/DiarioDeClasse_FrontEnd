'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useAvaliacoes,
  useCriarAvaliacao,
  useAtualizarAvaliacao,
  useDesativarAvaliacao,
} from '@/features/avaliacao/avaliacaoQueries';
import { useDisciplinas } from '@/features/turma/turmaQueries';
import { useCalendarios } from '@/features/calendario/calendarioQueries';
import { useMeses, useAnosCalendario, usePeriodos } from '@/features/calendario/calendarioQueries';
import { useRoles } from '@/shared/hooks/useRoles';
import { PageHeader } from '@/shared/components/PageHeader';
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { buttonVariants } from '@/lib/buttonVariants';
import { cn } from '@/lib/utils';
import type { AvaliacaoDTO } from '@/features/avaliacao/types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  idDisciplina: z.number().positive('Disciplina é obrigatória'),
  idCalendarioEscolar: z.number().optional().nullable(),
  materia: z.string().max(255).optional(),
  dia: z.string().optional(),
  peso: z.number().int().positive().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AvaliacoesPage() {
  const { hasAny } = useRoles();
  const podeCriarEditar = hasAny('ADMINISTRADOR', 'COORDENADOR', 'PROFESSOR');
  const podeDesativar = hasAny('ADMINISTRADOR', 'COORDENADOR');
  const podeLancarNotas = hasAny('ADMINISTRADOR', 'PROFESSOR');

  const { data: avaliacoes = [], isLoading } = useAvaliacoes();
  const { data: disciplinas = [] } = useDisciplinas();
  const { data: calendarios = [] } = useCalendarios();
  const { data: meses = [] } = useMeses();
  const { data: anos = [] } = useAnosCalendario();
  const { data: periodos = [] } = usePeriodos();

  const criar = useCriarAvaliacao();
  const atualizar = useAtualizarAvaliacao();
  const desativar = useDesativarAvaliacao();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<AvaliacaoDTO | null>(null);
  const [desativandoId, setDesativandoId] = useState<number | null>(null);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  function nomeDisciplina(id: number) {
    return disciplinas.find((d) => d.idDisciplina === id)?.nome ?? `Disciplina #${id}`;
  }

  function labelCalendario(idCal: number) {
    const c = calendarios.find((x) => x.idCalendarioEscolar === idCal);
    if (!c) return `Calendário #${idCal}`;
    const mes = meses.find((m) => m.idMes === c.idMes)?.nome ?? `Mês ${c.idMes}`;
    const per = periodos.find((p) => p.idPeriodo === c.idPeriodo)?.nome ?? `Período ${c.idPeriodo}`;
    const ano = anos.find((a) => a.idAnoCalendario === c.idAnoCalendario)?.ano;
    return ano ? `${mes} — ${per} (${ano})` : `${mes} — ${per}`;
  }

  function abrirCriar() {
    setEditando(null);
    form.reset({
      idDisciplina: undefined,
      idCalendarioEscolar: null,
      materia: '',
      dia: '',
      peso: null,
    });
    setDialogOpen(true);
  }

  function abrirEditar(av: AvaliacaoDTO) {
    setEditando(av);
    form.reset({
      idDisciplina: av.idDisciplina,
      idCalendarioEscolar: av.idCalendarioEscolar ?? null,
      materia: av.materia ?? '',
      dia: av.dia ?? '',
      peso: av.peso ?? null,
    });
    setDialogOpen(true);
  }

  function onSubmit(data: FormData) {
    const payload: AvaliacaoDTO = {
      idDisciplina: data.idDisciplina,
      idCalendarioEscolar: data.idCalendarioEscolar ?? undefined,
      materia: data.materia || undefined,
      dia: data.dia || undefined,
      peso: data.peso ?? undefined,
    };

    if (editando?.idAvaliacao) {
      atualizar.mutate(
        { id: editando.idAvaliacao, payload },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      criar.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  }

  const isPending = criar.isPending || atualizar.isPending;

  return (
    <div>
      <PageHeader
        title="Avaliações"
        action={
          podeCriarEditar ? (
            <Button size="sm" onClick={abrirCriar}>+ Nova Avaliação</Button>
          ) : undefined
        }
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      )}

      {!isLoading && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Disciplina</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-16">Peso</TableHead>
              <TableHead>Calendário</TableHead>
              <TableHead className="w-48">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {avaliacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhuma avaliação cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              avaliacoes.map((av) => (
                <TableRow key={av.idAvaliacao}>
                  <TableCell>{av.idAvaliacao}</TableCell>
                  <TableCell>{nomeDisciplina(av.idDisciplina)}</TableCell>
                  <TableCell>{av.materia ?? '—'}</TableCell>
                  <TableCell>{av.dia ?? '—'}</TableCell>
                  <TableCell>{av.peso ?? '—'}</TableCell>
                  <TableCell>
                    {av.idCalendarioEscolar
                      ? labelCalendario(av.idCalendarioEscolar)
                      : '—'}
                  </TableCell>
                  <TableCell className="flex gap-1">
                    {podeLancarNotas && (
                      <Link
                        href={`/avaliacoes/${av.idAvaliacao}/notas`}
                        className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
                      >
                        Lançar Notas
                      </Link>
                    )}
                    {podeCriarEditar && (
                      <Button variant="outline" size="sm" onClick={() => abrirEditar(av)}>
                        Editar
                      </Button>
                    )}
                    {podeDesativar && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setDesativandoId(av.idAvaliacao!)}
                      >
                        Desativar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Dialog criar / editar */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setDialogOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Avaliação' : 'Nova Avaliação'}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Disciplina */}
              <FormField
                control={form.control}
                name="idDisciplina"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disciplina *</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a disciplina..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {disciplinas.map((d) => (
                          <SelectItem key={d.idDisciplina} value={String(d.idDisciplina)}>
                            {d.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Calendário Escolar */}
              <FormField
                control={form.control}
                name="idCalendarioEscolar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calendário Escolar</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional — selecione a aula..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sem calendário</SelectItem>
                        {calendarios.map((c) => (
                          <SelectItem key={c.idCalendarioEscolar} value={String(c.idCalendarioEscolar)}>
                            {labelCalendario(c.idCalendarioEscolar!)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Assunto */}
              <FormField
                control={form.control}
                name="materia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assunto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Frações Decimais" maxLength={255} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data */}
              <FormField
                control={form.control}
                name="dia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Peso */}
              <FormField
                control={form.control}
                name="peso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        placeholder="Sem peso (usa 1 no cálculo)"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Ex: 7 para prova, 3 para trabalho, 1 para participação
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog desativar */}
      <AlertDialog
        open={desativandoId !== null}
        onOpenChange={(open) => { if (!open) setDesativandoId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar avaliação?</AlertDialogTitle>
            <AlertDialogDescription>
              Desativar esta avaliação? As notas vinculadas serão preservadas no histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (desativandoId !== null)
                  desativar.mutate(desativandoId, { onSuccess: () => setDesativandoId(null) });
              }}
              disabled={desativar.isPending}
            >
              {desativar.isPending ? 'Desativando...' : 'Desativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
