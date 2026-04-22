'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Pencil, Trash2, Eye } from 'lucide-react';
import {
  usePessoas,
  useCriarPessoa,
  useAtualizarPessoa,
  useDeletarPessoa,
  useTiposPessoa,
} from '@/features/pessoa/pessoaQueries';
import { SEXO_OPTIONS, SITUACAO_OPTIONS } from '@/features/pessoa/types';
import { useRoles } from '@/shared/hooks/useRoles';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/lib/buttonVariants';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import type { PessoaDTO } from '@/features/pessoa/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCpf(cpf?: string): string {
  if (!cpf || cpf.length !== 11) return '—';
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

function formatCpfInput(value: string): string {
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

// ─── Zod schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  idTipoPessoa: z.coerce.number().positive('Selecione o tipo de pessoa'),
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
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato YYYY-MM-DD')
    .optional()
    .or(z.literal('')),
  situacao: z.enum(['ATIVO', 'INATIVO', 'TRANSFERIDO', 'EVADIDO', 'FORMADO']).optional(),
  fotoUrl: z.string().url('URL inválida').max(500).optional().or(z.literal('')),
  obs: z.string().max(255).optional(),
});
type FormData = z.infer<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────

export function PessoaListClient() {
  const { hasAny, is } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR', 'COORDENADOR');
  const podeExcluir = is('ADMINISTRADOR');

  const { data: pessoas = [], isLoading, isError, refetch } = usePessoas();
  const { data: tipos = [] } = useTiposPessoa();
  const criar = useCriarPessoa();
  const deletar = useDeletarPessoa();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<PessoaDTO | undefined>();
  const [deletandoId, setDeletandoId] = useState<number | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('');

  const atualizarMutation = useAtualizarPessoa(editando?.idPessoa ?? 0);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editando) {
      form.reset({
        idTipoPessoa: editando.idTipoPessoa,
        nome: editando.nome,
        cpf: editando.cpf ?? '',
        sexo: editando.sexo ?? undefined,
        dataNascimento: editando.dataNascimento ?? '',
        situacao: editando.situacao ?? undefined,
        fotoUrl: editando.fotoUrl ?? '',
        obs: editando.obs ?? '',
      });
    } else {
      form.reset({
        idTipoPessoa: 0,
        nome: '',
        cpf: '',
        sexo: undefined,
        dataNascimento: '',
        situacao: undefined,
        fotoUrl: '',
        obs: '',
      });
    }
  }, [editando, dialogOpen]);

  function onSubmit(data: FormData) {
    const dto: Omit<PessoaDTO, 'idPessoa'> = {
      idTipoPessoa: data.idTipoPessoa,
      nome: data.nome,
      cpf: data.cpf || undefined,
      sexo: data.sexo || undefined,
      dataNascimento: data.dataNascimento || undefined,
      situacao: data.situacao || undefined,
      fotoUrl: data.fotoUrl || undefined,
      obs: data.obs || undefined,
    };
    if (editando?.idPessoa) {
      atualizarMutation.mutate(dto, { onSuccess: () => setDialogOpen(false) });
    } else {
      criar.mutate(dto, { onSuccess: () => setDialogOpen(false) });
    }
  }

  function nomeTipo(idTipoPessoa: number) {
    return tipos.find((t) => t.idTipoPessoa === idTipoPessoa)?.nome ?? String(idTipoPessoa);
  }

  function labelSituacao(s?: string) {
    return SITUACAO_OPTIONS.find((o) => o.value === s)?.label ?? s ?? '—';
  }

  const pessoasFiltradas = filtroTipo
    ? pessoas.filter((p) => String(p.idTipoPessoa) === filtroTipo)
    : pessoas;

  const isPending = criar.isPending || atualizarMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Pessoas"
        action={
          podeEscrever ? (
            <Button size="sm" onClick={() => { setEditando(undefined); setDialogOpen(true); }}>
              + Nova Pessoa
            </Button>
          ) : undefined
        }
      />

      {/* Filtro por tipo */}
      <div className="mb-4 w-56">
        <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tipo..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os tipos</SelectItem>
            {tipos.map((t) => (
              <SelectItem key={t.idTipoPessoa} value={String(t.idTipoPessoa)}>
                {t.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pessoasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma pessoa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              pessoasFiltradas.map((p) => (
                <TableRow key={p.idPessoa}>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell className="font-mono text-sm">{formatCpf(p.cpf)}</TableCell>
                  <TableCell>{nomeTipo(p.idTipoPessoa)}</TableCell>
                  <TableCell>
                    {p.situacao ? (
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          SITUACAO_BADGE[p.situacao] ?? 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {labelSituacao(p.situacao)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Link
                      href={`/pessoas/${p.idPessoa}`}
                      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    {podeEscrever && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditando(p); setDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {podeExcluir && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletandoId(p.idPessoa!)}
                      >
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

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditando(undefined); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Pessoa' : 'Nova Pessoa'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Tipo de Pessoa */}
              <FormField control={form.control} name="idTipoPessoa" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pessoa</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tipos.map((t) => (
                        <SelectItem key={t.idTipoPessoa} value={String(t.idTipoPessoa)}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Nome */}
              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input placeholder="Nome completo" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* CPF */}
              <FormField control={form.control} name="cpf" render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000.000.000-00"
                      value={formatCpfInput(field.value ?? '')}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
                        field.onChange(raw);
                      }}
                      maxLength={14}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-3">
                {/* Sexo */}
                <FormField control={form.control} name="sexo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v || undefined)}
                    >
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      </FormControl>
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

                {/* Situação */}
                <FormField control={form.control} name="situacao" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Situação</FormLabel>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v || undefined)}
                    >
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      </FormControl>
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
              </div>

              {/* Data de Nascimento */}
              <FormField control={form.control} name="dataNascimento" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Foto URL */}
              <FormField control={form.control} name="fotoUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto (URL) <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemplo.com/foto.jpg" maxLength={500} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Observação */}
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
            <AlertDialogTitle>Excluir pessoa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os vínculos (contatos, endereços, perfil) serão removidos.
            </AlertDialogDescription>
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
