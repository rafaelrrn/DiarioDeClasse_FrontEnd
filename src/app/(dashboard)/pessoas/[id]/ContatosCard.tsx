'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useContatosPessoa,
  useContatos,
  useVincularContato,
  useAtualizarApelidoContato,
  useDesvincularContato,
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
  idContato: z.number().positive('Selecione um contato'),
  nome: z.string().max(255).optional(),
});
const schemaApelido = z.object({
  nome: z.string().max(255).min(0),
});
type VincularData = z.infer<typeof schemaVincular>;
type ApelidoData = z.infer<typeof schemaApelido>;

export function ContatosCard({ idPessoa }: { idPessoa: number }) {
  const { hasAny } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR', 'COORDENADOR');
  const podeExcluir = hasAny('ADMINISTRADOR');

  const { data: contatosPessoa = [], isLoading } = useContatosPessoa(idPessoa);
  const { data: contatos = [] } = useContatos();
  const vincular = useVincularContato(idPessoa);
  const atualizarApelido = useAtualizarApelidoContato(idPessoa);
  const desvincular = useDesvincularContato(idPessoa);

  const [vincularOpen, setVincularOpen] = useState(false);
  const [apelidoEditando, setApelidoEditando] = useState<{ id: number; nome: string } | null>(null);
  const [desvinculandoId, setDesvinculandoId] = useState<number | null>(null);

  const formVincular = useForm<VincularData>({ resolver: zodResolver(schemaVincular) });
  const formApelido = useForm<ApelidoData>({ resolver: zodResolver(schemaApelido) });

  useEffect(() => {
    if (!vincularOpen) formVincular.reset({ idContato: 0, nome: '' });
  }, [vincularOpen]);

  useEffect(() => {
    formApelido.reset({ nome: apelidoEditando?.nome ?? '' });
  }, [apelidoEditando]);

  function onVincular(data: VincularData) {
    vincular.mutate(
      { idContato: data.idContato, nome: data.nome || undefined },
      { onSuccess: () => setVincularOpen(false) }
    );
  }

  function onSalvarApelido(data: ApelidoData) {
    if (!apelidoEditando) return;
    atualizarApelido.mutate(
      { id: apelidoEditando.id, nome: data.nome },
      { onSuccess: () => setApelidoEditando(null) }
    );
  }

  function labelContato(idContato: number) {
    const c = contatos.find((x) => x.idContato === idContato);
    return c ? `${c.tipoContato}: ${c.contato}` : String(idContato);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contatos Vinculados</CardTitle>
        {podeEscrever && (
          <Button size="sm" variant="outline" onClick={() => setVincularOpen(true)}>
            + Vincular Contato
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
                <TableHead>Apelido</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contatosPessoa.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    Nenhum contato vinculado.
                  </TableCell>
                </TableRow>
              ) : (
                contatosPessoa.map((cp) => {
                  const c = contatos.find((x) => x.idContato === cp.idContato);
                  return (
                    <TableRow key={cp.idContatoPessoa}>
                      <TableCell>{cp.nome ?? '—'}</TableCell>
                      <TableCell>{c?.tipoContato ?? '—'}</TableCell>
                      <TableCell>{c?.contato ?? cp.idContato}</TableCell>
                      <TableCell className="flex gap-1">
                        {podeEscrever && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar apelido"
                            onClick={() =>
                              setApelidoEditando({ id: cp.idContatoPessoa!, nome: cp.nome ?? '' })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {podeExcluir && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDesvinculandoId(cp.idContatoPessoa!)}
                          >
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
      </CardContent>

      {/* Dialog vincular */}
      <Dialog open={vincularOpen} onOpenChange={setVincularOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Contato</DialogTitle>
          </DialogHeader>
          <Form {...formVincular}>
            <form onSubmit={formVincular.handleSubmit(onVincular)} className="space-y-4">
              <FormField control={formVincular.control} name="idContato" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contato</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contatos.map((c) => (
                        <SelectItem key={c.idContato} value={String(c.idContato)}>
                          {c.tipoContato}: {c.contato}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={formVincular.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Apelido <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Celular pessoal" maxLength={255} {...field} />
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

      {/* Dialog editar apelido */}
      <Dialog open={apelidoEditando !== null} onOpenChange={(open) => { if (!open) setApelidoEditando(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Apelido do Contato</DialogTitle>
          </DialogHeader>
          <Form {...formApelido}>
            <form onSubmit={formApelido.handleSubmit(onSalvarApelido)} className="space-y-4">
              <FormField control={formApelido.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Apelido</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Celular pessoal" maxLength={255} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={atualizarApelido.isPending}>
                  {atualizarApelido.isPending ? 'Salvando...' : 'Salvar'}
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
            <AlertDialogTitle>Desvincular contato?</AlertDialogTitle>
            <AlertDialogDescription>
              O contato será desassociado desta pessoa, mas continuará no cadastro global.
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
