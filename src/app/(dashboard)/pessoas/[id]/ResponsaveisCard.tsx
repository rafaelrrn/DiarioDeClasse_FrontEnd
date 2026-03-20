'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useResponsaveisDoAluno,
  usePessoas,
  useVincularResponsavel,
  useAtualizarParentesco,
  useDesvincularResponsavel,
} from '@/features/pessoa/pessoaQueries';
import { useRoles } from '@/shared/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schemaVincular = z.object({
  idResponsavel: z.number().positive('Selecione o responsável'),
  parentesco: z.string().max(255).optional(),
});
const schemaParentesco = z.object({
  parentesco: z.string().max(255),
});
type VincularData = z.infer<typeof schemaVincular>;
type ParentescoData = z.infer<typeof schemaParentesco>;

export function ResponsaveisCard({ idPessoa }: { idPessoa: number }) {
  const { hasAny } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR', 'COORDENADOR');
  const podeExcluir = hasAny('ADMINISTRADOR');

  const { data: responsaveis = [], isLoading } = useResponsaveisDoAluno(idPessoa);
  const { data: pessoas = [] } = usePessoas();
  const vincular = useVincularResponsavel(idPessoa);
  const atualizarParentesco = useAtualizarParentesco(idPessoa);
  const desvincular = useDesvincularResponsavel(idPessoa);

  const [vincularOpen, setVincularOpen] = useState(false);
  const [parentescoEditando, setParentescoEditando] = useState<{ id: number; parentesco: string } | null>(null);
  const [desvinculandoId, setDesvinculandoId] = useState<number | null>(null);

  const formVincular = useForm<VincularData>({ resolver: zodResolver(schemaVincular) });
  const formParentesco = useForm<ParentescoData>({ resolver: zodResolver(schemaParentesco) });

  useEffect(() => {
    if (!vincularOpen) formVincular.reset({ idResponsavel: 0, parentesco: '' });
  }, [vincularOpen]);

  useEffect(() => {
    formParentesco.reset({ parentesco: parentescoEditando?.parentesco ?? '' });
  }, [parentescoEditando]);

  function onVincular(data: VincularData) {
    vincular.mutate(
      { idResponsavel: data.idResponsavel, parentesco: data.parentesco || undefined },
      { onSuccess: () => setVincularOpen(false) }
    );
  }

  function onSalvarParentesco(data: ParentescoData) {
    if (!parentescoEditando) return;
    atualizarParentesco.mutate(
      { id: parentescoEditando.id, parentesco: data.parentesco },
      { onSuccess: () => setParentescoEditando(null) }
    );
  }

  function nomePessoa(idPessoa: number) {
    return pessoas.find((p) => p.idPessoa === idPessoa)?.nome ?? String(idPessoa);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Responsáveis</CardTitle>
        {podeEscrever && (
          <Button size="sm" variant="outline" onClick={() => setVincularOpen(true)}>
            + Vincular Responsável
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID Resp.</TableHead>
                <TableHead>Nome Responsável</TableHead>
                <TableHead>Parentesco</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responsaveis.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    Nenhum responsável vinculado.
                  </TableCell>
                </TableRow>
              ) : (
                responsaveis.map((pr) => (
                  <TableRow key={pr.idPessoaResponsavel}>
                    <TableCell>{pr.idResponsavel}</TableCell>
                    <TableCell>{nomePessoa(pr.idResponsavel)}</TableCell>
                    <TableCell>{pr.parentesco ?? '—'}</TableCell>
                    <TableCell className="flex gap-1">
                      {podeEscrever && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar parentesco"
                          onClick={() =>
                            setParentescoEditando({
                              id: pr.idPessoaResponsavel!,
                              parentesco: pr.parentesco ?? '',
                            })
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {podeExcluir && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDesvinculandoId(pr.idPessoaResponsavel!)}
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
      </CardContent>

      {/* Dialog vincular */}
      <Dialog open={vincularOpen} onOpenChange={setVincularOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Responsável</DialogTitle>
          </DialogHeader>
          <Form {...formVincular}>
            <form onSubmit={formVincular.handleSubmit(onVincular)} className="space-y-4">
              <FormField control={formVincular.control} name="idResponsavel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável (Pessoa)</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pessoas
                        .filter((p) => p.idPessoa !== idPessoa)
                        .map((p) => (
                          <SelectItem key={p.idPessoa} value={String(p.idPessoa)}>
                            {p.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={formVincular.control} name="parentesco" render={({ field }) => (
                <FormItem>
                  <FormLabel>Parentesco <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mãe, Pai, Avó" maxLength={255} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={vincular.isPending}>
                  {vincular.isPending ? 'Vinculando...' : 'Vincular'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog editar parentesco */}
      <Dialog open={parentescoEditando !== null} onOpenChange={(open) => { if (!open) setParentescoEditando(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Parentesco</DialogTitle>
          </DialogHeader>
          <Form {...formParentesco}>
            <form onSubmit={formParentesco.handleSubmit(onSalvarParentesco)} className="space-y-4">
              <FormField control={formParentesco.control} name="parentesco" render={({ field }) => (
                <FormItem>
                  <FormLabel>Parentesco</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mãe" maxLength={255} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={atualizarParentesco.isPending}>
                  {atualizarParentesco.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog desvincular */}
      <AlertDialog open={desvinculandoId !== null} onOpenChange={(open) => { if (!open) setDesvinculandoId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desvincular responsável?</AlertDialogTitle>
            <AlertDialogDescription>
              O vínculo de responsável será removido. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (desvinculandoId !== null)
                  desvincular.mutate(desvinculandoId, { onSuccess: () => setDesvinculandoId(null) });
              }}
              disabled={desvincular.isPending}
            >
              {desvincular.isPending ? 'Desvinculando...' : 'Desvincular'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
