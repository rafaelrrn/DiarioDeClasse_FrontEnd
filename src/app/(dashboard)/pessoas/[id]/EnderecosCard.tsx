'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useEnderecosPessoa,
  useEnderecos,
  useVincularEndereco,
  useAtualizarApelidoEndereco,
  useDesvincularEndereco,
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
import type { EnderecoDTO } from '@/features/pessoa/types';

const schemaVincular = z.object({
  idEndereco: z.number().positive('Selecione um endereço'),
  nome: z.string().max(255).optional(),
});
const schemaApelido = z.object({
  nome: z.string().max(255),
});
type VincularData = z.infer<typeof schemaVincular>;
type ApelidoData = z.infer<typeof schemaApelido>;

function labelEndereco(e: EnderecoDTO): string {
  const parts = [e.rua, e.numero, e.cidade, e.uf].filter(Boolean);
  if (parts.length > 0) return parts.join(', ');
  if (e.cep) return `CEP: ${e.cep}`;
  return `#${e.idEndereco}`;
}

export function EnderecosCard({ idPessoa }: { idPessoa: number }) {
  const { hasAny } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR', 'COORDENADOR');
  const podeExcluir = hasAny('ADMINISTRADOR');

  const { data: enderecosPessoa = [], isLoading } = useEnderecosPessoa(idPessoa);
  const { data: enderecos = [] } = useEnderecos();
  const vincular = useVincularEndereco(idPessoa);
  const atualizarApelido = useAtualizarApelidoEndereco(idPessoa);
  const desvincular = useDesvincularEndereco(idPessoa);

  const [vincularOpen, setVincularOpen] = useState(false);
  const [apelidoEditando, setApelidoEditando] = useState<{ id: number; nome: string } | null>(null);
  const [desvinculandoId, setDesvinculandoId] = useState<number | null>(null);

  const formVincular = useForm<VincularData>({ resolver: zodResolver(schemaVincular) });
  const formApelido = useForm<ApelidoData>({ resolver: zodResolver(schemaApelido) });

  useEffect(() => {
    if (!vincularOpen) formVincular.reset({ idEndereco: 0, nome: '' });
  }, [vincularOpen]);

  useEffect(() => {
    formApelido.reset({ nome: apelidoEditando?.nome ?? '' });
  }, [apelidoEditando]);

  function onVincular(data: VincularData) {
    vincular.mutate(
      { idEndereco: data.idEndereco, nome: data.nome || undefined },
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Endereços Vinculados</CardTitle>
        {podeEscrever && (
          <Button size="sm" variant="outline" onClick={() => setVincularOpen(true)}>
            + Vincular Endereço
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
                <TableHead>CEP</TableHead>
                <TableHead>Rua</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Cidade/UF</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enderecosPessoa.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                    Nenhum endereço vinculado.
                  </TableCell>
                </TableRow>
              ) : (
                enderecosPessoa.map((ep) => {
                  const e = enderecos.find((x) => x.idEndereco === ep.idEndereco);
                  return (
                    <TableRow key={ep.idEnderecoPessoa}>
                      <TableCell>{ep.nome ?? '—'}</TableCell>
                      <TableCell>{e?.cep ?? '—'}</TableCell>
                      <TableCell>{e?.rua ?? '—'}</TableCell>
                      <TableCell>{e?.numero ?? '—'}</TableCell>
                      <TableCell>
                        {e ? [e.cidade, e.uf].filter(Boolean).join('/') || '—' : '—'}
                      </TableCell>
                      <TableCell className="flex gap-1">
                        {podeEscrever && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar apelido"
                            onClick={() =>
                              setApelidoEditando({ id: ep.idEnderecoPessoa!, nome: ep.nome ?? '' })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {podeExcluir && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDesvinculandoId(ep.idEnderecoPessoa!)}
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
            <DialogTitle>Vincular Endereço</DialogTitle>
          </DialogHeader>
          <Form {...formVincular}>
            <form onSubmit={formVincular.handleSubmit(onVincular)} className="space-y-4">
              <FormField control={formVincular.control} name="idEndereco" render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {enderecos.map((e) => (
                        <SelectItem key={e.idEndereco} value={String(e.idEndereco)}>
                          {labelEndereco(e)}
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
                    <Input placeholder="Ex: Residencial" maxLength={255} {...field} />
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
            <DialogTitle>Editar Apelido do Endereço</DialogTitle>
          </DialogHeader>
          <Form {...formApelido}>
            <form onSubmit={formApelido.handleSubmit(onSalvarApelido)} className="space-y-4">
              <FormField control={formApelido.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Apelido</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Residencial" maxLength={255} {...field} />
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
            <AlertDialogTitle>Desvincular endereço?</AlertDialogTitle>
            <AlertDialogDescription>
              O endereço será desassociado desta pessoa, mas continuará no cadastro global.
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
