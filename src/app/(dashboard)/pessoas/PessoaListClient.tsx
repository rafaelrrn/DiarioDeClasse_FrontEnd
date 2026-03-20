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

const schema = z.object({
  idTipoPessoa: z.number().positive('Selecione o tipo de pessoa'),
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  sexo: z.string().optional(),
  dataNascimento: z.string().optional(),
  situacao: z.string().optional(),
  obs: z.string().max(255).optional(),
});
type FormData = z.infer<typeof schema>;

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
        sexo: editando.sexo ?? '',
        dataNascimento: editando.dataNascimento ?? '',
        situacao: editando.situacao ?? '',
        obs: editando.obs ?? '',
      });
    } else {
      form.reset({ idTipoPessoa: 0, nome: '', sexo: '', dataNascimento: '', situacao: '', obs: '' });
    }
  }, [editando, dialogOpen]);

  function onSubmit(data: FormData) {
    const dto: Omit<PessoaDTO, 'idPessoa'> = {
      idTipoPessoa: data.idTipoPessoa,
      nome: data.nome,
      sexo: data.sexo || undefined,
      dataNascimento: data.dataNascimento || undefined,
      situacao: data.situacao || undefined,
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

  function formatDate(dateStr?: string) {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
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
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Nascimento</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pessoasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhuma pessoa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              pessoasFiltradas.map((p) => (
                <TableRow key={p.idPessoa}>
                  <TableCell>{p.idPessoa}</TableCell>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell>{nomeTipo(p.idTipoPessoa)}</TableCell>
                  <TableCell>{formatDate(p.dataNascimento)}</TableCell>
                  <TableCell>
                    {p.situacao ? (
                      <Badge variant={p.situacao === 'Ativo' ? 'default' : 'secondary'}>
                        {p.situacao}
                      </Badge>
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
                  <FormControl><Input placeholder="Nome completo" {...field} /></FormControl>
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
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

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
