'use client';
import { use, useState } from 'react';
import {
  useFrequenciasDoAluno,
  useResumoFrequencia,
  useCorrigirFrequencia,
} from '@/features/frequencia/frequenciaQueries';
import { useMeses, useAnosCalendario, usePeriodos, useCalendarios } from '@/features/calendario/calendarioQueries';
import { usePessoa } from '@/features/pessoa/pessoaQueries';
import { useRoles } from '@/shared/hooks/useRoles';
import { TipoFrequenciaBadge } from '@/shared/components/TipoFrequenciaBadge';
import { FrequenciaBadge } from '@/shared/components/FrequenciaBadge';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
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

export default function AlunoFrequenciaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const idAluno = Number(id);

  const { hasAny } = useRoles();
  const podeCorrigir = hasAny('ADMINISTRADOR', 'COORDENADOR', 'PROFESSOR');

  const { data: pessoa } = usePessoa(idAluno);
  const { data: resumo, isLoading: loadingResumo } = useResumoFrequencia(idAluno);
  const { data: frequencias = [], isLoading: loadingFreq } = useFrequenciasDoAluno(idAluno);
  const { data: calendarios = [] } = useCalendarios();
  const { data: meses = [] } = useMeses();
  const { data: anos = [] } = useAnosCalendario();
  const { data: periodos = [] } = usePeriodos();

  const corrigir = useCorrigirFrequencia();

  const [corrigindoItem, setCorrigindoItem] = useState<AlunoFrequenciaDTO | undefined>();
  const [novoTipo, setNovoTipo] = useState<TipoFrequencia>('PRESENTE');

  function labelCalendario(idCal: number) {
    const c = calendarios.find((x) => x.idCalendarioEscolar === idCal);
    if (!c) return `Calendário #${idCal}`;
    const mes = meses.find((m) => m.idMes === c.idMes)?.nome ?? `Mês ${c.idMes}`;
    const per = periodos.find((p) => p.idPeriodo === c.idPeriodo)?.nome ?? `Período ${c.idPeriodo}`;
    const ano = anos.find((a) => a.idAnoCalendario === c.idAnoCalendario)?.ano;
    return ano ? `${mes} — ${per} (${ano})` : `${mes} — ${per}`;
  }

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

  const isLoading = loadingResumo || loadingFreq;

  return (
    <div className="space-y-6">
      <PageHeader title={`Frequência — ${pessoa?.nome ?? `Aluno #${idAluno}`}`} />

      {/* Resumo */}
      {loadingResumo && <Skeleton className="h-32 w-full max-w-sm" />}

      {!loadingResumo && resumo && (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Resumo de Frequência
              <FrequenciaBadge
                percentual={resumo.percentualPresenca}
                emRisco={resumo.emRiscoReprovacao}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {/* Barra de progresso simples */}
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all ${resumo.emRiscoReprovacao ? 'bg-destructive' : 'bg-primary'}`}
                style={{ width: `${Math.min(resumo.percentualPresenca, 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-1 pt-1">
              <span className="text-muted-foreground">Total de aulas:</span>
              <span className="text-right font-medium">{resumo.totalAulas}</span>
              <span className="text-muted-foreground">Presenças:</span>
              <span className="text-right font-medium">{resumo.totalPresencas}</span>
              <span className="text-muted-foreground">Faltas:</span>
              <span className="text-right font-medium">{resumo.totalFaltas}</span>
              <span className="text-muted-foreground">Faltas justificadas:</span>
              <span className="text-right font-medium">{resumo.totalFaltasJust}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!loadingResumo && !resumo && (
        <p className="text-muted-foreground text-sm">Nenhum resumo disponível para este aluno.</p>
      )}

      {/* Histórico */}
      <div>
        <h2 className="text-base font-semibold mb-3">Histórico de Frequências</h2>

        {loadingFreq && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        )}

        {!loadingFreq && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Aula</TableHead>
                <TableHead>Tipo</TableHead>
                {podeCorrigir && <TableHead className="w-24">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {frequencias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={podeCorrigir ? 4 : 3} className="text-center text-muted-foreground py-8">
                    Nenhuma frequência registrada.
                  </TableCell>
                </TableRow>
              ) : (
                frequencias.map((f) => (
                  <TableRow key={f.idAlunoFrequencia}>
                    <TableCell>{f.idAlunoFrequencia}</TableCell>
                    <TableCell>{labelCalendario(f.idCalendarioEscolar)}</TableCell>
                    <TableCell><TipoFrequenciaBadge tipo={f.tipoFrequencia} /></TableCell>
                    {podeCorrigir && (
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => abrirCorrecao(f)}>
                          Corrigir
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog corrigir */}
      <Dialog open={!!corrigindoItem} onOpenChange={(open) => { if (!open) setCorrigindoItem(undefined); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Corrigir Frequência</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              {corrigindoItem && labelCalendario(corrigindoItem.idCalendarioEscolar)}
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
    </div>
  );
}
