'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useAlunoPerfilPorPessoa,
  useCriarAlunoPerfil,
  useAtualizarAlunoPerfil,
  useDeletarAlunoPerfil,
  useProfessorPerfilPorPessoa,
  useCriarProfessorPerfil,
  useAtualizarProfessorPerfil,
  useDeletarProfessorPerfil,
  useTiposPessoa,
} from '@/features/pessoa/pessoaQueries';
import { useRoles } from '@/shared/hooks/useRoles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PessoaDTO } from '@/features/pessoa/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

const schemaAluno = z.object({
  matricula: z.string().min(1, 'Matrícula é obrigatória').max(30),
  dataMatricula: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  necessidadeEspecial: z.boolean().default(false),
  descricaoNee: z.string().optional(),
}).refine(
  (d) => !d.necessidadeEspecial || !!d.descricaoNee?.trim(),
  { message: 'Descreva a necessidade especial', path: ['descricaoNee'] }
);
type AlunoFormData = z.infer<typeof schemaAluno>;

const schemaProfessor = z.object({
  registroMec: z.string().max(30).optional(),
  formacao: z.string().max(200).optional(),
  dataAdmissao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
});
type ProfessorFormData = z.infer<typeof schemaProfessor>;

// ─── AlunoPerfilCard ──────────────────────────────────────────────────────────

function AlunoPerfilCard({ idPessoa }: { idPessoa: number }) {
  const { hasAny } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR', 'COORDENADOR');
  const podeExcluir = hasAny('ADMINISTRADOR');

  const { data: perfil, isLoading } = useAlunoPerfilPorPessoa(idPessoa);

  const criar = useCriarAlunoPerfil(idPessoa);
  const atualizar = useAtualizarAlunoPerfil(perfil?.idAlunoPerfil ?? 0, idPessoa);
  const deletar = useDeletarAlunoPerfil(idPessoa);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletandoOpen, setDeletandoOpen] = useState(false);

  const form = useForm<AlunoFormData>({ resolver: zodResolver(schemaAluno) });
  const watchNee = form.watch('necessidadeEspecial');

  useEffect(() => {
    if (dialogOpen) {
      if (perfil) {
        form.reset({
          matricula: perfil.matricula,
          dataMatricula: perfil.dataMatricula,
          necessidadeEspecial: perfil.necessidadeEspecial,
          descricaoNee: perfil.descricaoNee ?? '',
        });
      } else {
        form.reset({ matricula: '', dataMatricula: '', necessidadeEspecial: false, descricaoNee: '' });
      }
    }
  }, [dialogOpen, perfil]);

  function onSubmit(data: AlunoFormData) {
    const dto = {
      idPessoa,
      matricula: data.matricula,
      dataMatricula: data.dataMatricula,
      necessidadeEspecial: data.necessidadeEspecial,
      descricaoNee: data.necessidadeEspecial ? data.descricaoNee : undefined,
    };
    if (perfil?.idAlunoPerfil) {
      const { idPessoa: _, ...rest } = dto;
      atualizar.mutate(rest, { onSuccess: () => setDialogOpen(false) });
    } else {
      criar.mutate(dto, { onSuccess: () => setDialogOpen(false) });
    }
  }

  const isPending = criar.isPending || atualizar.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Perfil de Aluno</CardTitle>
        <div className="flex gap-2">
          {podeEscrever && !isLoading && (
            <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
              {perfil ? 'Editar' : '+ Criar Perfil de Aluno'}
            </Button>
          )}
          {podeExcluir && perfil && !isLoading && (
            <Button size="sm" variant="ghost" onClick={() => setDeletandoOpen(true)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-5 w-48" />)}
          </div>
        )}
        {!isLoading && !perfil && (
          <p className="text-muted-foreground text-sm">
            Esta pessoa ainda não possui perfil de aluno.
          </p>
        )}
        {!isLoading && perfil && (
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Matrícula</dt>
              <dd className="font-medium">{perfil.matricula}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Data de Matrícula</dt>
              <dd className="font-medium">{formatDate(perfil.dataMatricula)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Necessidade Especial</dt>
              <dd>
                <Badge variant={perfil.necessidadeEspecial ? 'default' : 'secondary'}>
                  {perfil.necessidadeEspecial ? 'Sim' : 'Não'}
                </Badge>
              </dd>
            </div>
            {perfil.necessidadeEspecial && perfil.descricaoNee && (
              <div className="col-span-2">
                <dt className="text-muted-foreground">Descrição NEE</dt>
                <dd className="font-medium">{perfil.descricaoNee}</dd>
              </div>
            )}
          </dl>
        )}
      </CardContent>

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{perfil ? 'Editar Perfil de Aluno' : 'Criar Perfil de Aluno'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="matricula" render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula</FormLabel>
                  <FormControl><Input placeholder="Ex: 2024001" maxLength={30} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="dataMatricula" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Matrícula</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="necessidadeEspecial" render={({ field }) => (
                <FormItem>
                  <FormLabel>Necessidade Especial</FormLabel>
                  <Select
                    value={field.value ? 'true' : 'false'}
                    onValueChange={(v) => field.onChange(v === 'true')}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="false">Não</SelectItem>
                      <SelectItem value="true">Sim</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {watchNee && (
                <FormField control={form.control} name="descricaoNee" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição NEE</FormLabel>
                    <FormControl>
                      <Input placeholder="Descreva a necessidade especial" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

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
      <AlertDialog open={deletandoOpen} onOpenChange={setDeletandoOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir perfil de aluno?</AlertDialogTitle>
            <AlertDialogDescription>
              O perfil de aluno será removido permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (perfil?.idAlunoPerfil)
                  deletar.mutate(perfil.idAlunoPerfil, { onSuccess: () => setDeletandoOpen(false) });
              }}
              disabled={deletar.isPending}
            >
              {deletar.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// ─── ProfessorPerfilCard ──────────────────────────────────────────────────────

function ProfessorPerfilCard({ idPessoa }: { idPessoa: number }) {
  const { hasAny } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR', 'COORDENADOR');
  const podeExcluir = hasAny('ADMINISTRADOR');

  const { data: perfil, isLoading } = useProfessorPerfilPorPessoa(idPessoa);

  const criar = useCriarProfessorPerfil(idPessoa);
  const atualizar = useAtualizarProfessorPerfil(perfil?.idProfessorPerfil ?? 0, idPessoa);
  const deletar = useDeletarProfessorPerfil(idPessoa);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletandoOpen, setDeletandoOpen] = useState(false);

  const form = useForm<ProfessorFormData>({ resolver: zodResolver(schemaProfessor) });

  useEffect(() => {
    if (dialogOpen) {
      form.reset({
        registroMec: perfil?.registroMec ?? '',
        formacao: perfil?.formacao ?? '',
        dataAdmissao: perfil?.dataAdmissao ?? '',
      });
    }
  }, [dialogOpen, perfil]);

  function onSubmit(data: ProfessorFormData) {
    const dto = {
      idPessoa,
      registroMec: data.registroMec || undefined,
      formacao: data.formacao || undefined,
      dataAdmissao: data.dataAdmissao,
    };
    if (perfil?.idProfessorPerfil) {
      const { idPessoa: _, ...rest } = dto;
      atualizar.mutate(rest, { onSuccess: () => setDialogOpen(false) });
    } else {
      criar.mutate(dto, { onSuccess: () => setDialogOpen(false) });
    }
  }

  const isPending = criar.isPending || atualizar.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Perfil de Professor</CardTitle>
        <div className="flex gap-2">
          {podeEscrever && !isLoading && (
            <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
              {perfil ? 'Editar' : '+ Criar Perfil de Professor'}
            </Button>
          )}
          {podeExcluir && perfil && !isLoading && (
            <Button size="sm" variant="ghost" onClick={() => setDeletandoOpen(true)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-5 w-48" />)}
          </div>
        )}
        {!isLoading && !perfil && (
          <p className="text-muted-foreground text-sm">
            Esta pessoa ainda não possui perfil de professor.
          </p>
        )}
        {!isLoading && perfil && (
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Registro MEC</dt>
              <dd className="font-medium">{perfil.registroMec ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Data de Admissão</dt>
              <dd className="font-medium">{formatDate(perfil.dataAdmissao)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Formação</dt>
              <dd className="font-medium">{perfil.formacao ?? '—'}</dd>
            </div>
          </dl>
        )}
      </CardContent>

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{perfil ? 'Editar Perfil de Professor' : 'Criar Perfil de Professor'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="registroMec" render={({ field }) => (
                <FormItem>
                  <FormLabel>Registro MEC <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                  <FormControl><Input placeholder="Ex: MEC123456" maxLength={30} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="formacao" render={({ field }) => (
                <FormItem>
                  <FormLabel>Formação <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                  <FormControl><Input placeholder="Ex: Licenciatura em Matemática" maxLength={200} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="dataAdmissao" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Admissão</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

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
      <AlertDialog open={deletandoOpen} onOpenChange={setDeletandoOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir perfil de professor?</AlertDialogTitle>
            <AlertDialogDescription>
              O perfil de professor será removido permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (perfil?.idProfessorPerfil)
                  deletar.mutate(perfil.idProfessorPerfil, { onSuccess: () => setDeletandoOpen(false) });
              }}
              disabled={deletar.isPending}
            >
              {deletar.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// ─── PerfilCard (conditional) ─────────────────────────────────────────────────

interface PerfilCardProps {
  pessoa: PessoaDTO;
}

export function PerfilCard({ pessoa }: PerfilCardProps) {
  const { data: tipos = [] } = useTiposPessoa();

  const tipoNome = tipos
    .find((t) => t.idTipoPessoa === pessoa.idTipoPessoa)
    ?.nome
    ?.toLowerCase() ?? '';

  const isAluno     = tipoNome.includes('aluno');
  const isProfessor = tipoNome.includes('professor');

  if (isAluno)     return <AlunoPerfilCard     idPessoa={pessoa.idPessoa!} />;
  if (isProfessor) return <ProfessorPerfilCard idPessoa={pessoa.idPessoa!} />;

  // Outros tipos (Responsável, Coordenador etc.) — sem card de perfil
  return null;
}
