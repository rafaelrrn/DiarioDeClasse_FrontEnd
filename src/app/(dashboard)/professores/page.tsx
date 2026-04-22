'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  usePessoas,
  useDeletarPessoa,
  useTiposPessoa,
  useProfessoresPerfil,
} from '@/features/pessoa/pessoaQueries';
import {
  criarPessoa,
  atualizarPessoa,
  criarProfessorPerfil,
  atualizarProfessorPerfil,
} from '@/features/pessoa/pessoaService';
import { SEXO_OPTIONS, SITUACAO_OPTIONS } from '@/features/pessoa/types';
import { useRoles } from '@/shared/hooks/useRoles';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/lib/buttonVariants';
import { useQueryClient } from '@tanstack/react-query';
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { PessoaDTO, ProfessorPerfilDTO } from '@/features/pessoa/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCpf(cpf?: string) {
  if (!cpf || cpf.length !== 11) return '—';
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

function formatCpfInput(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
}

const SITUACAO_BADGE: Record<string, string> = {
  ATIVO:       'bg-green-100 text-green-800',
  INATIVO:     'bg-gray-100 text-gray-700',
  TRANSFERIDO: 'bg-blue-100 text-blue-800',
  EVADIDO:     'bg-yellow-100 text-yellow-800',
  FORMADO:     'bg-purple-100 text-purple-800',
};

// ─── Schema combinado Pessoa + ProfessorPerfil ────────────────────────────────

const schema = z.object({
  // — Dados pessoais —
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  cpf: z
    .string()
    .length(11, 'CPF deve ter 11 dígitos')
    .regex(/^\d+$/, 'Apenas números')
    .optional()
    .or(z.literal('')),
  sexo: z.enum(['M', 'F', 'NB', 'NI']).optional(),
  dataNascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .optional()
    .or(z.literal('')),
  situacao: z.enum(['ATIVO', 'INATIVO', 'TRANSFERIDO', 'EVADIDO', 'FORMADO']).optional(),
  obs: z.string().max(255).optional(),
  // — Perfil de professor —
  registroMec: z.string().max(30).optional(),
  formacao: z.string().max(200).optional(),
  dataAdmissao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de admissão inválida'),
});

type FormData = z.infer<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfessoresPage() {
  const { hasAny, is } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR', 'COORDENADOR');
  const podeExcluir = is('ADMINISTRADOR');
  const qc = useQueryClient();

  const { data: todasPessoas = [], isLoading: loadingPessoas } = usePessoas();
  const { data: tipos = [] } = useTiposPessoa();
  const { data: todosPerfis = [], isLoading: loadingPerfis } = useProfessoresPerfil();
  const deletarPessoa = useDeletarPessoa();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<{ pessoa: PessoaDTO; perfil: ProfessorPerfilDTO | null } | null>(null);
  const [deletandoId, setDeletandoId] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Descobrir o ID do tipo "Professor"
  const tipoProfessor = tipos.find((t) => t.nome.toLowerCase().includes('professor'));

  // Filtrar apenas professores
  const professores = tipoProfessor
    ? todasPessoas.filter((p) => p.idTipoPessoa === tipoProfessor.idTipoPessoa)
    : [];

  // Join com perfis
  function perfilDoProfessor(idPessoa: number): ProfessorPerfilDTO | undefined {
    return todosPerfis.find((p) => p.idPessoa === idPessoa);
  }

  const isLoading = loadingPessoas || loadingPerfis;

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!dialogOpen) return;
    if (editando) {
      const { pessoa, perfil } = editando;
      form.reset({
        nome: pessoa.nome,
        cpf: pessoa.cpf ?? '',
        sexo: pessoa.sexo ?? undefined,
        dataNascimento: pessoa.dataNascimento ?? '',
        situacao: pessoa.situacao ?? undefined,
        obs: pessoa.obs ?? '',
        registroMec: perfil?.registroMec ?? '',
        formacao: perfil?.formacao ?? '',
        dataAdmissao: perfil?.dataAdmissao ?? '',
      });
    } else {
      form.reset({
        nome: '', cpf: '', sexo: undefined, dataNascimento: '', situacao: undefined, obs: '',
        registroMec: '', formacao: '', dataAdmissao: '',
      });
    }
  }, [dialogOpen, editando]);

  async function onSubmit(data: FormData) {
    if (!tipoProfessor) {
      toast.error('Tipo "Professor" não encontrado. Cadastre-o em Config. Pessoa primeiro.');
      return;
    }
    setSalvando(true);
    try {
      const pessoaDto: Omit<PessoaDTO, 'idPessoa'> = {
        idTipoPessoa: tipoProfessor.idTipoPessoa!,
        nome: data.nome,
        cpf: data.cpf || undefined,
        sexo: data.sexo,
        dataNascimento: data.dataNascimento || undefined,
        situacao: data.situacao,
        obs: data.obs || undefined,
      };

      const perfilDto = {
        registroMec: data.registroMec || undefined,
        formacao: data.formacao || undefined,
        dataAdmissao: data.dataAdmissao,
      };

      if (editando) {
        const idPessoa = editando.pessoa.idPessoa!;
        await atualizarPessoa(idPessoa, pessoaDto);

        if (editando.perfil) {
          await atualizarProfessorPerfil(editando.perfil.idProfessorPerfil!, perfilDto);
        } else {
          await criarProfessorPerfil({ idPessoa, ...perfilDto });
        }
        toast.success('Professor atualizado com sucesso');
      } else {
        const novaPessoa = await criarPessoa(pessoaDto);
        await criarProfessorPerfil({ idPessoa: novaPessoa.idPessoa!, ...perfilDto });
        toast.success('Professor cadastrado com sucesso');
      }

      await qc.invalidateQueries({ queryKey: ['pessoas'] });
      await qc.invalidateQueries({ queryKey: ['professor-perfil'] });
      await qc.invalidateQueries({ queryKey: ['professor-perfil', 'pessoa'] });
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao salvar professor');
    } finally {
      setSalvando(false);
    }
  }

  function abrirEditar(pessoa: PessoaDTO) {
    const perfil = perfilDoProfessor(pessoa.idPessoa!) ?? null;
    setEditando({ pessoa, perfil });
    setDialogOpen(true);
  }

  function abrirNovo() {
    setEditando(null);
    setDialogOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Professores"
        action={
          podeEscrever ? (
            <Button size="sm" onClick={abrirNovo}>+ Novo Professor</Button>
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
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Registro MEC</TableHead>
              <TableHead>Admissão</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="w-36">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {tipoProfessor
                    ? 'Nenhum professor cadastrado.'
                    : 'Tipo "Professor" não encontrado. Cadastre-o em Config. Pessoa.'}
                </TableCell>
              </TableRow>
            ) : (
              professores.map((p) => {
                const perfil = perfilDoProfessor(p.idPessoa!);
                const labelSit = SITUACAO_OPTIONS.find((o) => o.value === p.situacao)?.label;
                return (
                  <TableRow key={p.idPessoa}>
                    <TableCell className="font-medium">{p.nome}</TableCell>
                    <TableCell className="font-mono text-sm">{formatCpf(p.cpf)}</TableCell>
                    <TableCell>{perfil?.registroMec ?? '—'}</TableCell>
                    <TableCell>{formatDate(perfil?.dataAdmissao)}</TableCell>
                    <TableCell>
                      {p.situacao ? (
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          SITUACAO_BADGE[p.situacao] ?? 'bg-gray-100 text-gray-700'
                        )}>
                          {labelSit ?? p.situacao}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="flex gap-1">
                      <Link
                        href={`/pessoas/${p.idPessoa}`}
                        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
                        title="Ver detalhe completo"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {podeEscrever && (
                        <Button variant="ghost" size="icon" onClick={() => abrirEditar(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {podeExcluir && (
                        <Button variant="ghost" size="icon" onClick={() => setDeletandoId(p.idPessoa!)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      )}

      {/* ── Dialog criar / editar ── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditando(null); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Professor' : 'Novo Professor'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* ── Dados Pessoais ── */}
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Dados Pessoais
              </p>

              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl><Input placeholder="Nome do professor" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="cpf" render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000.000.000-00"
                      value={formatCpfInput(field.value ?? '')}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      maxLength={14}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="sexo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || undefined)}>
                      <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">—</SelectItem>
                        {SEXO_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="dataNascimento" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nascimento</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="situacao" render={({ field }) => (
                <FormItem>
                  <FormLabel>Situação</FormLabel>
                  <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || undefined)}>
                    <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="">—</SelectItem>
                      {SITUACAO_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="obs" render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                  <FormControl><Textarea placeholder="Informações adicionais" maxLength={255} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Separator />

              {/* ── Dados Profissionais ── */}
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Dados Profissionais
              </p>

              <FormField control={form.control} name="dataAdmissao" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de admissão</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

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

              <DialogFooter>
                <Button type="submit" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── AlertDialog excluir ── */}
      <AlertDialog open={deletandoId !== null} onOpenChange={(open) => { if (!open) setDeletandoId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir professor?</AlertDialogTitle>
            <AlertDialogDescription>
              O cadastro da pessoa e o perfil de professor serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletandoId !== null)
                  deletarPessoa.mutate(deletandoId, { onSuccess: () => setDeletandoId(null) });
              }}
              disabled={deletarPessoa.isPending}
            >
              {deletarPessoa.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
