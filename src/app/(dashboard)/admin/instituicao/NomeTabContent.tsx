'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRoles } from '@/shared/hooks/useRoles';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface NomeItem {
  id: number;
  nome: string;
}

interface NomeTabContentProps {
  label: string;
  items: NomeItem[];
  isLoading: boolean;
  isError: boolean;
  isMutating: boolean;
  onRefetch: () => void;
  onCriar: (nome: string, onSuccess: () => void) => void;
  onAtualizar: (id: number, nome: string, onSuccess: () => void) => void;
  onDeletar: (id: number, onSuccess: () => void) => void;
}

const schema = z.object({ nome: z.string().min(1, 'Nome é obrigatório').max(255) });
type FormData = z.infer<typeof schema>;

export function NomeTabContent({
  label,
  items,
  isLoading,
  isError,
  isMutating,
  onRefetch,
  onCriar,
  onAtualizar,
  onDeletar,
}: NomeTabContentProps) {
  const { hasAny } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<NomeItem | null>(null);
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (dialogOpen) {
      form.reset({ nome: editando?.nome ?? '' });
    }
  }, [dialogOpen, editando, form]);

  function abrirNovo() {
    setEditando(null);
    setDialogOpen(true);
  }

  function abrirEditar(item: NomeItem) {
    setEditando(item);
    setDialogOpen(true);
  }

  function onSubmit(data: FormData) {
    if (editando) {
      onAtualizar(editando.id, data.nome, () => setDialogOpen(false));
    } else {
      onCriar(data.nome, () => setDialogOpen(false));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {podeEscrever && (
          <Button size="sm" onClick={abrirNovo}>
            <Plus className="h-4 w-4 mr-1" />
            Novo
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
          <Button variant="ghost" size="sm" onClick={onRefetch}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Nome</TableHead>
              {podeEscrever && <TableHead className="w-24">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={podeEscrever ? 3 : 2}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.nome}</TableCell>
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
                        onClick={() => setDeletandoId(item.id)}
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
            <DialogTitle>{editando ? `Editar ${label}` : `Novo ${label}`}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder={`Nome do ${label.toLowerCase()}`} {...field} />
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
              Tem certeza que deseja excluir este {label.toLowerCase()}? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletandoId !== null &&
                onDeletar(deletandoId, () => setDeletandoId(null))
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
