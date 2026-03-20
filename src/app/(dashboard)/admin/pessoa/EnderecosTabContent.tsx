'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useEnderecos,
  useCriarEndereco,
  useAtualizarEndereco,
  useDeletarEndereco,
} from '@/features/pessoa/pessoaQueries';
import { useRoles } from '@/shared/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { EnderecoDTO } from '@/features/pessoa/types';

const schema = z.object({
  uf: z.string().max(2).optional(),
  cidade: z.string().max(255).optional(),
  bairro: z.string().max(255).optional(),
  rua: z.string().max(255).optional(),
  numero: z.string().max(10).optional(),
  cep: z.string().max(9).optional(),
  complemento: z.string().max(255).optional(),
});
type FormData = z.infer<typeof schema>;

export function EnderecosTabContent() {
  const { hasAny, is } = useRoles();
  const podeEscrever = hasAny('ADMINISTRADOR', 'COORDENADOR');
  const podeExcluir = is('ADMINISTRADOR');

  const { data: enderecos = [], isLoading, isError, refetch } = useEnderecos();
  const criar = useCriarEndereco();
  const atualizar = useAtualizarEndereco();
  const deletar = useDeletarEndereco();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<EnderecoDTO | undefined>();
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    form.reset(
      editando
        ? {
            uf: editando.uf ?? '',
            cidade: editando.cidade ?? '',
            bairro: editando.bairro ?? '',
            rua: editando.rua ?? '',
            numero: editando.numero ?? '',
            cep: editando.cep ?? '',
            complemento: editando.complemento ?? '',
          }
        : { uf: '', cidade: '', bairro: '', rua: '', numero: '', cep: '', complemento: '' }
    );
  }, [editando, dialogOpen]);

  function onSubmit(data: FormData) {
    const dto: Omit<EnderecoDTO, 'idEndereco'> = {
      uf: data.uf || undefined,
      cidade: data.cidade || undefined,
      bairro: data.bairro || undefined,
      rua: data.rua || undefined,
      numero: data.numero || undefined,
      cep: data.cep || undefined,
      complemento: data.complemento || undefined,
    };
    if (editando?.idEndereco) {
      atualizar.mutate({ id: editando.idEndereco, dto }, { onSuccess: () => setDialogOpen(false) });
    } else {
      criar.mutate(dto, { onSuccess: () => setDialogOpen(false) });
    }
  }

  return (
    <div>
      {podeEscrever && (
        <div className="flex justify-end mb-3">
          <Button size="sm" onClick={() => { setEditando(undefined); setDialogOpen(true); }}>
            + Novo Endereço
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
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
              <TableHead>CEP</TableHead>
              <TableHead>Rua</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead className="w-12">UF</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enderecos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhum endereço cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              enderecos.map((e) => (
                <TableRow key={e.idEndereco}>
                  <TableCell>{e.idEndereco}</TableCell>
                  <TableCell>{e.cep ?? '—'}</TableCell>
                  <TableCell>{e.rua ?? '—'}</TableCell>
                  <TableCell>{e.numero ?? '—'}</TableCell>
                  <TableCell>{e.cidade ?? '—'}</TableCell>
                  <TableCell>{e.uf ?? '—'}</TableCell>
                  <TableCell className="flex gap-1">
                    {podeEscrever && (
                      <Button variant="ghost" size="icon" onClick={() => { setEditando(e); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {podeExcluir && (
                      <Button variant="ghost" size="icon" onClick={() => setDeletandoId(e.idEndereco!)}>
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

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditando(undefined); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Endereço' : 'Novo Endereço'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <FormField control={form.control} name="cep" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl><Input placeholder="12300-000" maxLength={9} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="uf" render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl><Input placeholder="SP" maxLength={2} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="cidade" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl><Input placeholder="Cruzeiro" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="bairro" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl><Input placeholder="Centro" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <FormField control={form.control} name="rua" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl><Input placeholder="Rua das Flores" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="numero" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl><Input placeholder="123" maxLength={10} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="complemento" render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl><Input placeholder="Apto 10" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="submit" disabled={criar.isPending || atualizar.isPending}>
                  {criar.isPending || atualizar.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletandoId !== null} onOpenChange={(open) => { if (!open) setDeletandoId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir endereço?</AlertDialogTitle>
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
