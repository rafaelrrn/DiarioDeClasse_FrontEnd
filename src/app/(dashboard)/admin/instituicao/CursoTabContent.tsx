'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { useRoles } from '@/shared/hooks/useRoles';
import {
  useCursos,
  useCriarCurso,
  useAtualizarCurso,
  useDeletarCurso,
} from '@/features/instituicao/instituicaoQueries';
import {
  listarEnsinos,
  listarGraus,
  listarSeries,
} from '@/features/instituicao/instituicaoService';
import type { CursoDTO } from '@/features/instituicao/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  idEnsino: z.number().min(1, 'Ensino é obrigatório'),
  idGrau: z.number().min(1, 'Grau é obrigatório'),
  idSerie: z.number().min(1, 'Série é obrigatória'),
});

type FormData = z.infer<typeof schema>;

export function CursoTabContent() {
  const { hasAny } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR');

  const { data: cursos = [], isLoading, isError, refetch } = useCursos();
  const criar = useCriarCurso();
  const atualizar = useAtualizarCurso();
  const deletar = useDeletarCurso();

  // Carrega os lookups em paralelo
  const [ensinosQuery, grausQuery, seriesQuery] = useQueries({
    queries: [
      { queryKey: ['ensinos'], queryFn: listarEnsinos },
      { queryKey: ['graus'], queryFn: listarGraus },
      { queryKey: ['series'], queryFn: listarSeries },
    ],
  });

  const ensinos = ensinosQuery.data ?? [];
  const graus = grausQuery.data ?? [];
  const series = seriesQuery.data ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<CursoDTO | null>(null);
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (dialogOpen) {
      form.reset({
        idEnsino: editando?.idEnsino ?? 0,
        idGrau: editando?.idGrau ?? 0,
        idSerie: editando?.idSerie ?? 0,
      });
    }
  }, [dialogOpen, editando, form]);

  function abrirNovo() {
    setEditando(null);
    setDialogOpen(true);
  }

  function abrirEditar(item: CursoDTO) {
    setEditando(item);
    setDialogOpen(true);
  }

  function onSubmit(data: FormData) {
    if (editando?.idCurso) {
      atualizar.mutate(
        { id: editando.idCurso, dto: data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      criar.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  }

  const isMutating = criar.isPending || atualizar.isPending || deletar.isPending;

  // Helpers para resolver nomes dos IDs
  function nomeEnsino(id: number) {
    return ensinos.find((e) => e.idEnsino === id)?.nome ?? String(id);
  }
  function nomeGrau(id: number) {
    return graus.find((g) => g.idGrau === id)?.nome ?? String(id);
  }
  function nomeSerie(id: number) {
    return series.find((s) => s.idSerie === id)?.nome ?? String(id);
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
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Ensino</TableHead>
              <TableHead>Grau</TableHead>
              <TableHead>Série</TableHead>
              {podeEscrever && <TableHead className="w-24">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {cursos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={podeEscrever ? 5 : 4}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              cursos.map((curso) => (
                <TableRow key={curso.idCurso}>
                  <TableCell>{curso.idCurso}</TableCell>
                  <TableCell>{nomeEnsino(curso.idEnsino)}</TableCell>
                  <TableCell>{nomeGrau(curso.idGrau)}</TableCell>
                  <TableCell>{nomeSerie(curso.idSerie)}</TableCell>
                  {podeEscrever && (
                    <TableCell className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => abrirEditar(curso)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletandoId(curso.idCurso!)}
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
            <DialogTitle>{editando ? 'Editar Curso' : 'Novo Curso'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="idEnsino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ensino</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ensino" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ensinos.map((e) => (
                          <SelectItem key={e.idEnsino} value={String(e.idEnsino)}>
                            {e.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idGrau"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grau</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o grau" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {graus.map((g) => (
                          <SelectItem key={g.idGrau} value={String(g.idGrau)}>
                            {g.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idSerie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Série</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a série" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {series.map((s) => (
                          <SelectItem key={s.idSerie} value={String(s.idSerie)}>
                            {s.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.
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
