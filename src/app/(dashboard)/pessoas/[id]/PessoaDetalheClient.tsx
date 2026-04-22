'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/lib/buttonVariants';
import { usePessoa, useAtualizarPessoa, useTiposPessoa } from '@/features/pessoa/pessoaQueries';
import { SEXO_OPTIONS, SITUACAO_OPTIONS } from '@/features/pessoa/types';
import { useRoles } from '@/shared/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { PessoaDTO } from '@/features/pessoa/types';
import { PerfilCard } from './PerfilCard';
import { ContatosCard } from './ContatosCard';
import { EnderecosCard } from './EnderecosCard';
import { ResponsaveisCard } from './ResponsaveisCard';

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

function labelSexo(code?: string) {
  return SEXO_OPTIONS.find((o) => o.value === code)?.label ?? code ?? '—';
}

function labelSituacao(code?: string) {
  return SITUACAO_OPTIONS.find((o) => o.value === code)?.label ?? code ?? '—';
}

const SITUACAO_BADGE: Record<string, string> = {
  ATIVO:       'bg-green-100 text-green-800',
  INATIVO:     'bg-gray-100 text-gray-700',
  TRANSFERIDO: 'bg-blue-100 text-blue-800',
  EVADIDO:     'bg-yellow-100 text-yellow-800',
  FORMADO:     'bg-purple-100 text-purple-800',
};

// ─── Schema ───────────────────────────────────────────────────────────────────

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

export function PessoaDetalheClient({ idPessoa }: { idPessoa: number }) {
  const { hasAny } = useRoles();
  const podeEditar = hasAny('ADMINISTRADOR', 'COORDENADOR');

  const { data: pessoa, isLoading, isError, refetch } = usePessoa(idPessoa);
  const { data: tipos = [] } = useTiposPessoa();
  const atualizar = useAtualizarPessoa(idPessoa);

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (pessoa && editDialogOpen) {
      form.reset({
        idTipoPessoa: pessoa.idTipoPessoa,
        nome: pessoa.nome,
        cpf: pessoa.cpf ?? '',
        sexo: pessoa.sexo ?? undefined,
        dataNascimento: pessoa.dataNascimento ?? '',
        situacao: pessoa.situacao ?? undefined,
        fotoUrl: pessoa.fotoUrl ?? '',
        obs: pessoa.obs ?? '',
      });
    }
  }, [pessoa, editDialogOpen]);

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
    atualizar.mutate(dto, { onSuccess: () => setEditDialogOpen(false) });
  }

  function nomeTipo(id: number) {
    return tipos.find((t) => t.idTipoPessoa === id)?.nome ?? String(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/pessoas"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold">Detalhe da Pessoa</h1>
      </div>

      {/* Card 1 — Dados Pessoais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dados Pessoais</CardTitle>
          {podeEditar && !isLoading && !isError && (
            <Button size="sm" variant="outline" onClick={() => setEditDialogOpen(true)}>
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-5 w-64" />)}
            </div>
          )}
          {isError && (
            <div className="text-center py-4 space-y-2">
              <p className="text-muted-foreground">Não foi possível carregar os dados.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button>
            </div>
          )}
          {pessoa && (
            <div className="flex gap-6">
              {/* Foto thumbnail */}
              {pessoa.fotoUrl && (
                <div className="shrink-0">
                  <img
                    src={pessoa.fotoUrl}
                    alt={`Foto de ${pessoa.nome}`}
                    className="h-24 w-24 rounded-full object-cover border"
                  />
                </div>
              )}
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm flex-1">
                <div>
                  <dt className="text-muted-foreground">ID</dt>
                  <dd className="font-medium">{pessoa.idPessoa}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Tipo</dt>
                  <dd className="font-medium">{nomeTipo(pessoa.idTipoPessoa)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Nome</dt>
                  <dd className="font-medium">{pessoa.nome}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">CPF</dt>
                  <dd className="font-medium font-mono">{formatCpf(pessoa.cpf)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Sexo</dt>
                  <dd className="font-medium">{labelSexo(pessoa.sexo)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Nascimento</dt>
                  <dd className="font-medium">{formatDate(pessoa.dataNascimento)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Situação</dt>
                  <dd>
                    {pessoa.situacao ? (
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          SITUACAO_BADGE[pessoa.situacao] ?? 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {labelSituacao(pessoa.situacao)}
                      </span>
                    ) : (
                      <span className="font-medium">—</span>
                    )}
                  </dd>
                </div>
                {pessoa.obs && (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Observação</dt>
                    <dd className="font-medium">{pessoa.obs}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 2 — Perfil Específico (condicional ao tipo) */}
      {pessoa && <PerfilCard pessoa={pessoa} />}

      {/* Card 3 — Contatos Vinculados */}
      <ContatosCard idPessoa={idPessoa} />

      {/* Card 4 — Endereços Vinculados */}
      <EnderecosCard idPessoa={idPessoa} />

      {/* Card 5 — Responsáveis */}
      <ResponsaveisCard idPessoa={idPessoa} />

      {/* Dialog editar */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Pessoa</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Tipo */}
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
                  <FormControl><Input {...field} /></FormControl>
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
                  <FormControl><Input type="date" {...field} /></FormControl>
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
                    <Textarea maxLength={255} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="submit" disabled={atualizar.isPending}>
                  {atualizar.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
