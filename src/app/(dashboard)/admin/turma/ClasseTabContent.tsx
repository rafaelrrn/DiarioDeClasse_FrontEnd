'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useClasses,
  useCriarClasse,
  useAtualizarClasse,
  useDeletarClasse,
  useTurmas,
  useComponentesCurriculares,
} from '@/features/turma/turmaQueries';
import {
  useInstituicoes,
  useCursos,
  useTurnos,
} from '@/features/instituicao/instituicaoQueries';
import { usePessoas } from '@/features/pessoa/pessoaQueries';
import { useRoles } from '@/shared/hooks/useRoles';
import { Button } from '@/components/ui/button';
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
import type { ClasseDTO } from '@/features/turma/types';

const schema = z.object({
  idInstituicaoEnsino: z.number().positive('Selecione uma instituição'),
  idCurso: z.number().positive('Selecione um curso'),
  idTurno: z.number().positive('Selecione um turno'),
  idTurma: z.number().positive('Selecione uma turma'),
  idProfessor: z.number().positive('Selecione um professor'),
  idComponenteCurricular: z.number().optional(),
});
type FormData = z.infer<typeof schema>;

export function ClasseTabContent() {
  const { hasAny } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR');

  const { data: classes = [], isLoading, isError, refetch } = useClasses();
  const criar = useCriarClasse();
  const atualizar = useAtualizarClasse();
  const deletar = useDeletarClasse();

  // Lookups for selects and display
  const { data: instituicoes = [] } = useInstituicoes();
  const { data: cursos = [] } = useCursos();
  const { data: turnos = [] } = useTurnos();
  const { data: turmas = [] } = useTurmas();
  const { data: pessoas = [] } = usePessoas();
  const { data: componentes = [] } = useComponentesCurriculares();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<ClasseDTO | undefined>();
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editando) {
      form.reset({
        idInstituicaoEnsino: editando.idInstituicaoEnsino,
        idCurso: editando.idCurso,
        idTurno: editando.idTurno,
        idTurma: editando.idTurma,
        idProfessor: editando.idProfessor,
        idComponenteCurricular: editando.idComponenteCurricular,
      });
    } else {
      form.reset({
        idInstituicaoEnsino: 0,
        idCurso: 0,
        idTurno: 0,
        idTurma: 0,
        idProfessor: 0,
        idComponenteCurricular: undefined,
      });
    }
  }, [editando, dialogOpen]);

  function onSubmit(data: FormData) {
    const dto: Omit<ClasseDTO, 'idClasse'> = {
      idInstituicaoEnsino: data.idInstituicaoEnsino,
      idCurso: data.idCurso,
      idTurno: data.idTurno,
      idTurma: data.idTurma,
      idProfessor: data.idProfessor,
      idComponenteCurricular: data.idComponenteCurricular || undefined,
    };
    if (editando?.idClasse) {
      atualizar.mutate(
        { id: editando.idClasse, dto },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      criar.mutate(dto, { onSuccess: () => setDialogOpen(false) });
    }
  }

  function nomePorId<T extends Record<string, any>>(
    list: T[],
    idKey: keyof T,
    nameKey: keyof T,
    id: number | undefined
  ): string {
    const item = list.find((x) => x[idKey] === id);
    return item ? String(item[nameKey]) : id ? String(id) : '—';
  }

  const loadingLookups = !instituicoes.length && !cursos.length;

  return (
    <div>
      {podeEscrever && (
        <div className="flex justify-end mb-3">
          <Button size="sm" onClick={() => { setEditando(undefined); setDialogOpen(true); }}>
            + Nova Classe
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
              <TableHead>Instituição</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead>Turno</TableHead>
              <TableHead>Professor</TableHead>
              <TableHead>Componente</TableHead>
              {podeEscrever && <TableHead className="w-24">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={podeEscrever ? 7 : 6} className="text-center text-muted-foreground py-8">
                  Nenhuma classe encontrada.
                </TableCell>
              </TableRow>
            ) : (
              classes.map((c) => (
                <TableRow key={c.idClasse}>
                  <TableCell>{c.idClasse}</TableCell>
                  <TableCell>
                    {nomePorId(instituicoes, 'idInstituicaoEnsino', 'descricao', c.idInstituicaoEnsino)}
                  </TableCell>
                  <TableCell>
                    {nomePorId(turmas, 'idTurma', 'nome', c.idTurma)}
                  </TableCell>
                  <TableCell>
                    {nomePorId(turnos, 'idTurno', 'nome', c.idTurno)}
                  </TableCell>
                  <TableCell>
                    {nomePorId(pessoas, 'idPessoa', 'nome', c.idProfessor)}
                  </TableCell>
                  <TableCell>
                    {nomePorId(componentes, 'idComponenteCurricular', 'nome', c.idComponenteCurricular)}
                  </TableCell>
                  {podeEscrever && (
                    <TableCell className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditando(c); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletandoId(c.idClasse!)}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Classe' : 'Nova Classe'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <FormField control={form.control} name="idInstituicaoEnsino" render={({ field }) => (
                <FormItem>
                  <FormLabel>Instituição</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {instituicoes.map((i) => (
                        <SelectItem key={i.idInstituicaoEnsino} value={String(i.idInstituicaoEnsino)}>
                          {i.descricao ?? `#${i.idInstituicaoEnsino}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="idCurso" render={({ field }) => (
                <FormItem>
                  <FormLabel>Curso</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cursos.map((c) => (
                        <SelectItem key={c.idCurso} value={String(c.idCurso)}>
                          {`Curso #${c.idCurso}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="idTurno" render={({ field }) => (
                <FormItem>
                  <FormLabel>Turno</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {turnos.map((t) => (
                        <SelectItem key={t.idTurno} value={String(t.idTurno)}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="idTurma" render={({ field }) => (
                <FormItem>
                  <FormLabel>Turma</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {turmas.map((t) => (
                        <SelectItem key={t.idTurma} value={String(t.idTurma)}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="idProfessor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Professor</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pessoas.map((p) => (
                        <SelectItem key={p.idPessoa} value={String(p.idPessoa)}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="idComponenteCurricular" render={({ field }) => (
                <FormItem>
                  <FormLabel>Componente Curricular <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {componentes.map((c) => (
                        <SelectItem key={c.idComponenteCurricular} value={String(c.idComponenteCurricular)}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <AlertDialogTitle>Excluir classe?</AlertDialogTitle>
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
