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
import { useRoles } from '@/shared/hooks/useRoles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
import { ContatosCard } from './ContatosCard';
import { EnderecosCard } from './EnderecosCard';
import { ResponsaveisCard } from './ResponsaveisCard';

const schema = z.object({
  idTipoPessoa: z.number().positive('Selecione o tipo de pessoa'),
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  sexo: z.string().optional(),
  dataNascimento: z.string().optional(),
  situacao: z.string().optional(),
  obs: z.string().max(255).optional(),
});
type FormData = z.infer<typeof schema>;

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

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
        sexo: pessoa.sexo ?? '',
        dataNascimento: pessoa.dataNascimento ?? '',
        situacao: pessoa.situacao ?? '',
        obs: pessoa.obs ?? '',
      });
    }
  }, [pessoa, editDialogOpen]);

  function onSubmit(data: FormData) {
    const dto: Omit<PessoaDTO, 'idPessoa'> = {
      idTipoPessoa: data.idTipoPessoa,
      nome: data.nome,
      sexo: data.sexo || undefined,
      dataNascimento: data.dataNascimento || undefined,
      situacao: data.situacao || undefined,
      obs: data.obs || undefined,
    };
    atualizar.mutate(dto, { onSuccess: () => setEditDialogOpen(false) });
  }

  function nomeTipo(idTipoPessoa: number) {
    return tipos.find((t) => t.idTipoPessoa === idTipoPessoa)?.nome ?? String(idTipoPessoa);
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

      {/* Card 1 — Dados */}
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
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-64" />)}
            </div>
          )}
          {isError && (
            <div className="text-center py-4 space-y-2">
              <p className="text-muted-foreground">Não foi possível carregar os dados.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button>
            </div>
          )}
          {pessoa && (
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
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
                <dt className="text-muted-foreground">Sexo</dt>
                <dd className="font-medium">{pessoa.sexo ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Nascimento</dt>
                <dd className="font-medium">{formatDate(pessoa.dataNascimento)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Situação</dt>
                <dd>
                  {pessoa.situacao ? (
                    <Badge variant={pessoa.situacao === 'Ativo' ? 'default' : 'secondary'}>
                      {pessoa.situacao}
                    </Badge>
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
          )}
        </CardContent>
      </Card>

      {/* Cards 2, 3, 4 */}
      <ContatosCard idPessoa={idPessoa} />
      <EnderecosCard idPessoa={idPessoa} />
      <ResponsaveisCard idPessoa={idPessoa} />

      {/* Dialog editar */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Pessoa</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="sexo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Não informado</SelectItem>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Feminino">Feminino</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="situacao" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Situação</FormLabel>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Não informada</SelectItem>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="dataNascimento" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

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
