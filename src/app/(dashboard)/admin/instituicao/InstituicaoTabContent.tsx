'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRoles } from '@/shared/hooks/useRoles';
import {
  useInstituicoes,
  useCriarInstituicao,
  useAtualizarInstituicao,
  useDeletarInstituicao,
} from '@/features/instituicao/instituicaoQueries';
import type { InstituicaoEnsinoDTO } from '@/features/instituicao/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const schema = z.object({
  descricao: z.string().max(255),
  codigoEstadual: z.string().max(255),
});

type FormData = z.infer<typeof schema>;

function toFormData(item?: InstituicaoEnsinoDTO): FormData {
  return {
    descricao: item?.descricao ?? '',
    codigoEstadual: item?.codigoEstadual ?? '',
  };
}

export function InstituicaoTabContent() {
  const { hasAny } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR');

  const { data = [], isLoading, isError, refetch } = useInstituicoes();
  const criar = useCriarInstituicao();
  const atualizar = useAtualizarInstituicao();
  const deletar = useDeletarInstituicao();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<InstituicaoEnsinoDTO | null>(null);
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (dialogOpen) {
      form.reset(toFormData(editando ?? undefined));
    }
  }, [dialogOpen, editando, form]);

  function abrirNovo() {
    setEditando(null);
    setDialogOpen(true);
  }

  function abrirEditar(item: InstituicaoEnsinoDTO) {
    setEditando(item);
    setDialogOpen(true);
  }

  function onSubmit(data: FormData) {
    const dto = {
      descricao: data.descricao || undefined,
      codigoEstadual: data.codigoEstadual || undefined,
    };
    if (editando?.idInstituicaoEnsino) {
      atualizar.mutate(
        { id: editando.idInstituicaoEnsino, dto },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      criar.mutate(dto, { onSuccess: () => setDialogOpen(false) });
    }
  }

  const isMutating = criar.isPending || atualizar.isPending || deletar.isPending;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {podeEscrever && (
          <Button size="sm" onClick={abrirNovo}>
            <Plus className="h-4 w-4 mr-1" />
            Nova
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-sm text-destructive flex items-center gap-2">
          Não foi possível carregar os dados.
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Código Estadual</TableHead>
              {podeEscrever && <TableHead className="w-24">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={podeEscrever ? 4 : 3}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.idInstituicaoEnsino}>
                  <TableCell>{item.idInstituicaoEnsino}</TableCell>
                  <TableCell>{item.descricao ?? '—'}</TableCell>
                  <TableCell>{item.codigoEstadual ?? '—'}</TableCell>
                  {podeEscrever && (
                    <TableCell className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => abrirEditar(item)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletandoId(item.idInstituicaoEnsino!)}
                        title="Excluir"
                      >
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

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando ? 'Editar Instituição' : 'Nova Instituição'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição da instituição"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="codigoEstadual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Estadual</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isMutating}>
                  Salvar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog exclusão */}
      <AlertDialog
        open={deletandoId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletandoId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta instituição? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletandoId !== null &&
                deletar.mutate(deletandoId, { onSuccess: () => setDeletandoId(null) })
              }
              disabled={isMutating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
