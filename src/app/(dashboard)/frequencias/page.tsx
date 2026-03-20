'use client';
import { useState } from 'react';
import { useFrequencias, useCorrigirFrequencia, useDesativarFrequencia } from '@/features/frequencia/frequenciaQueries';
import { useMeses, useAnosCalendario, usePeriodos, useCalendarios } from '@/features/calendario/calendarioQueries';
import { useRoles } from '@/shared/hooks/useRoles';
import { TipoFrequenciaBadge } from '@/shared/components/TipoFrequenciaBadge';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import type { AlunoFrequenciaDTO, TipoFrequencia } from '@/features/frequencia/types';

const TIPOS: TipoFrequencia[] = ['PRESENTE', 'FALTA', 'FALTA_JUSTIFICADA'];

const tipoLabelMap: Record<TipoFrequencia, string> = {
  PRESENTE: 'Presente',
  FALTA: 'Falta',
  FALTA_JUSTIFICADA: 'Falta Justificada',
};

export default function FrequenciasPage() {
  const { hasAny } = useRoles();
  const podeCorrigir = hasAny('ADMINISTRADOR', 'COORDENADOR', 'PROFESSOR');
  const podeDesativar = hasAny('ADMINISTRADOR', 'COORDENADOR');

  const { data: frequencias = [], isLoading, isError, refetch } = useFrequencias();
  const { data: calendarios = [] } = useCalendarios();
  const { data: meses = [] } = useMeses();
  const { data: anos = [] } = useAnosCalendario();
  const { data: periodos = [] } = usePeriodos();

  const corrigir = useCorrigirFrequencia();
  const desativar = useDesativarFrequencia();

  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCalendario, setFiltroCalendario] = useState('');

  const [corrigindoItem, setCorrigindoItem] = useState<AlunoFrequenciaDTO | undefined>();
  const [novoTipo, setNovoTipo] = useState<TipoFrequencia>('PRESENTE');
  const [desativandoId, setDesativandoId] = useState<number | null>(null);

  function labelCalendario(idCal: number) {
    const c = calendarios.find((x) => x.idCalendarioEscolar === idCal);
    if (!c) return `Calendário #${idCal}`;
    const mes = meses.find((m) => m.idMes === c.idMes)?.nome ?? `Mês ${c.idMes}`;
    const per = periodos.find((p) => p.idPeriodo === c.idPeriodo)?.nome ?? `Período ${c.idPeriodo}`;
    const ano = anos.find((a) => a.idAnoCalendario === c.idAnoCalendario)?.ano;
    return ano ? `${mes} — ${per} (${ano})` : `${mes} — ${per}`;
  }

  const filtrados = frequencias.filter((f) => {
    if (filtroTipo && f.tipoFrequencia !== filtroTipo) return false;
    if (filtroCalendario && String(f.idCalendarioEscolar) !== filtroCalendario) return false;
    return true;
  });

  function abrirCorrecao(item: AlunoFrequenciaDTO) {
    setCorrigindoItem(item);
    setNovoTipo(item.tipoFrequencia);
  }

  function confirmarCorrecao() {
    if (!corrigindoItem?.idAlunoFrequencia) return;
    corrigir.mutate(
      { id: corrigindoItem.idAlunoFrequencia, tipoFrequencia: novoTipo },
      { onSuccess: () => setCorrigindoItem(undefined) }
    );
  }

  return (
    <div>
      <PageHeader title="Histórico de Frequências" />

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <div className="w-48">
          <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os tipos</SelectItem>
              {TIPOS.map((t) => (
                <SelectItem key={t} value={t}>{tipoLabelMap[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-64">
          <Select value={filtroCalendario} onValueChange={(v) => setFiltroCalendario(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por aula..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as aulas</SelectItem>
              {calendarios.map((c) => (
                <SelectItem key={c.idCalendarioEscolar} value={String(c.idCalendarioEscolar)}>
                  {labelCalendario(c.idCalendarioEscolar!)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
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
              <TableHead>Aluno</TableHead>
              <TableHead>Aula</TableHead>
              <TableHead>Tipo</TableHead>
              {(podeCorrigir || podeDesativar) && <TableHead className="w-32">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={podeCorrigir || podeDesativar ? 5 : 4} className="text-center text-muted-foreground py-8">
                  Nenhuma frequência encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((f) => (
                <TableRow key={f.idAlunoFrequencia}>
                  <TableCell>{f.idAlunoFrequencia}</TableCell>
                  <TableCell>Aluno #{f.idAluno}</TableCell>
                  <TableCell>{labelCalendario(f.idCalendarioEscolar)}</TableCell>
                  <TableCell><TipoFrequenciaBadge tipo={f.tipoFrequencia} /></TableCell>
                  {(podeCorrigir || podeDesativar) && (
                    <TableCell className="flex gap-1">
                      {podeCorrigir && (
                        <Button variant="outline" size="sm" onClick={() => abrirCorrecao(f)}>
                          Corrigir
                        </Button>
                      )}
                      {podeDesativar && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => setDesativandoId(f.idAlunoFrequencia!)}
                        >
                          Desativar
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Dialog corrigir */}
      <Dialog open={!!corrigindoItem} onOpenChange={(open) => { if (!open) setCorrigindoItem(undefined); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Corrigir Frequência</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Aluno #{corrigindoItem?.idAluno} — {corrigindoItem && labelCalendario(corrigindoItem.idCalendarioEscolar)}
            </p>
            <Select value={novoTipo} onValueChange={(v) => setNovoTipo((v as TipoFrequencia) ?? 'PRESENTE')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>{tipoLabelMap[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={confirmarCorrecao} disabled={corrigir.isPending}>
              {corrigir.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog desativar */}
      <AlertDialog open={desativandoId !== null} onOpenChange={(open) => { if (!open) setDesativandoId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar frequência?</AlertDialogTitle>
            <AlertDialogDescription>
              O registro será marcado como inativo. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (desativandoId !== null)
                  desativar.mutate(desativandoId, { onSuccess: () => setDesativandoId(null) });
              }}
              disabled={desativar.isPending}
            >
              {desativar.isPending ? 'Desativando...' : 'Desativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
