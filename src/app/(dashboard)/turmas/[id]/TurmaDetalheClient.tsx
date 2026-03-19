'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserMinus, Pencil } from 'lucide-react';
import {
  useTurma,
  useAtualizarTurma,
  useAlunosDaTurma,
  useMatricularAluno,
  useDesativarMatricula,
} from '@/features/turma/turmaQueries';
import { useRoles } from '@/shared/hooks/useRoles';
import { PageHeader } from '@/shared/components/PageHeader';
import { buttonVariants } from '@/lib/buttonVariants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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

// ─── Schema editar turma ──────────────────────────────────────────────────────

const schemaTurma = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
});

// ─── Schema matricular aluno ──────────────────────────────────────────────────

const schemaMatricula = z.object({
  idAluno: z.number().positive('ID deve ser positivo'),
  obs: z.string().max(255).optional(),
});
type MatriculaFormData = z.infer<typeof schemaMatricula>;

// ─── Componente ───────────────────────────────────────────────────────────────

export function TurmaDetalheClient({ idTurma }: { idTurma: number }) {
  const { hasAny } = useRoles();
  const podeAdmin = hasAny('ADMINISTRADOR');
  const podeMatricular = hasAny('ADMINISTRADOR', 'COORDENADOR');

  const { data: turma, isLoading: loadingTurma } = useTurma(idTurma);
  const { data: alunos = [], isLoading: loadingAlunos, isError: erroAlunos, refetch: refetchAlunos } =
    useAlunosDaTurma(idTurma);

  const atualizar = useAtualizarTurma();
  const matricular = useMatricularAluno(idTurma);
  const desativar = useDesativarMatricula(idTurma);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [matriculaDialogOpen, setMatriculaDialogOpen] = useState(false);
  const [desativandoId, setDesativandoId] = useState<number | null>(null);

  // ── Formulário editar turma ──
  const formTurma = useForm<{ nome: string }>({ resolver: zodResolver(schemaTurma) });

  useEffect(() => {
    if (editDialogOpen && turma) {
      formTurma.reset({ nome: turma.nome });
    }
  }, [editDialogOpen, turma]);

  function onSubmitTurma(data: { nome: string }) {
    atualizar.mutate(
      { id: idTurma, dto: data },
      { onSuccess: () => setEditDialogOpen(false) }
    );
  }

  // ── Formulário matricular aluno ──
  const formMatricula = useForm<MatriculaFormData>({ resolver: zodResolver(schemaMatricula) });

  useEffect(() => {
    if (!matriculaDialogOpen) formMatricula.reset();
  }, [matriculaDialogOpen]);

  function onSubmitMatricula(data: MatriculaFormData) {
    matricular.mutate(data, { onSuccess: () => setMatriculaDialogOpen(false) });
  }

  return (
    <div className="space-y-6">
      {/* ── Cabeçalho ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/turmas" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
          ← Turmas
        </Link>

        {loadingTurma ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <h1 className="text-2xl font-bold">{turma?.nome ?? `Turma #${idTurma}`}</h1>
        )}

        {podeAdmin && turma && (
          <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
            <Pencil className="h-4 w-4 mr-1" /> Editar
          </Button>
        )}
      </div>

      {/* ── Seção alunos ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Alunos Matriculados</h2>
          {podeMatricular && (
            <Button size="sm" onClick={() => setMatriculaDialogOpen(true)}>
              + Matricular Aluno
            </Button>
          )}
        </div>

        {loadingAlunos && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {erroAlunos && (
          <div className="text-center py-8 space-y-2">
            <p className="text-muted-foreground">Não foi possível carregar os alunos.</p>
            <Button variant="outline" size="sm" onClick={() => refetchAlunos()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!loadingAlunos && !erroAlunos && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">ID Matrícula</TableHead>
                <TableHead className="w-28">ID Aluno</TableHead>
                <TableHead>Observação</TableHead>
                {podeMatricular && <TableHead className="w-24">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {alunos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={podeMatricular ? 4 : 3} className="text-center text-muted-foreground py-8">
                    Nenhum aluno matriculado.
                  </TableCell>
                </TableRow>
              ) : (
                alunos.map((a) => (
                  <TableRow key={a.idAlunoTurma}>
                    <TableCell>{a.idAlunoTurma}</TableCell>
                    <TableCell>{a.idAluno}</TableCell>
                    <TableCell>{a.obs ?? '—'}</TableCell>
                    {podeMatricular && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Desativar matrícula"
                          onClick={() => setDesativandoId(a.idAlunoTurma!)}
                        >
                          <UserMinus className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Dialog editar turma ── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Turma</DialogTitle>
          </DialogHeader>
          <Form {...formTurma}>
            <form onSubmit={formTurma.handleSubmit(onSubmitTurma)} className="space-y-4">
              <FormField
                control={formTurma.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={atualizar.isPending}>
                  {atualizar.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog matricular aluno ── */}
      <Dialog open={matriculaDialogOpen} onOpenChange={setMatriculaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Matricular Aluno</DialogTitle>
          </DialogHeader>
          <Form {...formMatricula}>
            <form onSubmit={formMatricula.handleSubmit(onSubmitMatricula)} className="space-y-4">
              <FormField
                control={formMatricula.control}
                name="idAluno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID do Aluno</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 42"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formMatricula.control}
                name="obs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observação opcional"
                        maxLength={255}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={matricular.isPending}>
                  {matricular.isPending ? 'Matriculando...' : 'Matricular'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── AlertDialog desativar matrícula ── */}
      <AlertDialog
        open={desativandoId !== null}
        onOpenChange={(open) => { if (!open) setDesativandoId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar matrícula?</AlertDialogTitle>
            <AlertDialogDescription>
              O histórico será preservado e o aluno poderá ser rematriculado posteriormente.
              Esta ação não remove o registro — apenas marca a matrícula como inativa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (desativandoId !== null) {
                  desativar.mutate(desativandoId, { onSuccess: () => setDesativandoId(null) });
                }
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
