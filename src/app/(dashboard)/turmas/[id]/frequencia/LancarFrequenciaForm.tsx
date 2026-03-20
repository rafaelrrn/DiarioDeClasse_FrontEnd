'use client';
import { useMemo, useState } from 'react';
import { useAlunosDaTurma } from '@/features/turma/turmaQueries';
import { useCalendarios } from '@/features/calendario/calendarioQueries';
import { useLancarFrequencia } from '@/features/frequencia/frequenciaQueries';
import { TipoFrequenciaBadge } from '@/shared/components/TipoFrequenciaBadge';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMeses, useAnosCalendario, usePeriodos } from '@/features/calendario/calendarioQueries';
import type { TipoFrequencia } from '@/features/frequencia/types';

const TIPOS: TipoFrequencia[] = ['PRESENTE', 'FALTA', 'FALTA_JUSTIFICADA'];

const tipoVariant: Record<TipoFrequencia, 'default' | 'destructive' | 'secondary'> = {
  PRESENTE: 'default',
  FALTA: 'destructive',
  FALTA_JUSTIFICADA: 'secondary',
};

const tipoLabel: Record<TipoFrequencia, string> = {
  PRESENTE: 'Presente',
  FALTA: 'Falta',
  FALTA_JUSTIFICADA: 'Falta Just.',
};

export function LancarFrequenciaForm({ idTurma }: { idTurma: number }) {
  const { data: alunos = [] } = useAlunosDaTurma(idTurma);
  const { data: calendarios = [] } = useCalendarios();
  const { data: meses = [] } = useMeses();
  const { data: anos = [] } = useAnosCalendario();
  const { data: periodos = [] } = usePeriodos();
  const lancar = useLancarFrequencia(idTurma);

  const [idCalendario, setIdCalendario] = useState<number | null>(null);
  const [frequencias, setFrequencias] = useState<Record<number, TipoFrequencia>>({});

  function toggleTipo(idAluno: number, tipo: TipoFrequencia) {
    setFrequencias((prev) => ({ ...prev, [idAluno]: tipo }));
  }

  function marcarTodos(tipo: TipoFrequencia) {
    const novas: Record<number, TipoFrequencia> = {};
    alunos.forEach((a) => { novas[a.idAluno] = tipo; });
    setFrequencias(novas);
  }

  function handleSalvar() {
    if (!idCalendario) return;
    lancar.mutate(
      { idCalendario, body: frequencias, tipoPadrao: 'PRESENTE' },
      { onSuccess: () => setFrequencias({}) }
    );
  }

  const contagem = useMemo(() => {
    const counts = { PRESENTE: 0, FALTA: 0, FALTA_JUSTIFICADA: 0 };
    alunos.forEach((a) => {
      const tipo = frequencias[a.idAluno] ?? 'PRESENTE';
      counts[tipo]++;
    });
    return counts;
  }, [frequencias, alunos]);

  function labelCalendario(idCal: number) {
    const c = calendarios.find((x) => x.idCalendarioEscolar === idCal);
    if (!c) return `Calendário #${idCal}`;
    const mes = meses.find((m) => m.idMes === c.idMes)?.nome ?? `Mês ${c.idMes}`;
    const per = periodos.find((p) => p.idPeriodo === c.idPeriodo)?.nome ?? `Período ${c.idPeriodo}`;
    const ano = anos.find((a) => a.idAnoCalendario === c.idAnoCalendario)?.ano;
    return ano ? `${mes} — ${per} (${ano})` : `${mes} — ${per}`;
  }

  return (
    <div>
      <PageHeader title="Lançar Frequência" />

      <div className="mb-4 max-w-sm">
        <label className="text-sm font-medium mb-1 block">Aula (Calendário)</label>
        <Select
          value={idCalendario ? String(idCalendario) : ''}
          onValueChange={(v) => setIdCalendario(v ? Number(v) : null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a aula..." />
          </SelectTrigger>
          <SelectContent>
            {calendarios.map((c) => (
              <SelectItem key={c.idCalendarioEscolar} value={String(c.idCalendarioEscolar)}>
                {labelCalendario(c.idCalendarioEscolar!)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {alunos.length > 0 && (
        <>
          {/* Contagem resumida */}
          <div className="flex gap-3 mb-3">
            <Badge variant="default">{contagem.PRESENTE} Presentes</Badge>
            <Badge variant="destructive">{contagem.FALTA} Faltas</Badge>
            <Badge variant="secondary">{contagem.FALTA_JUSTIFICADA} Just.</Badge>
          </div>

          {/* Ações rápidas */}
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => marcarTodos('PRESENTE')}>
              Todos Presentes
            </Button>
            <Button variant="outline" size="sm" onClick={() => marcarTodos('FALTA')}>
              Todos com Falta
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Aluno</TableHead>
                <TableHead>Frequência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alunos.map((a) => {
                const tipo = frequencias[a.idAluno] ?? 'PRESENTE';
                return (
                  <TableRow key={a.idAluno}>
                    <TableCell className="font-medium">Aluno #{a.idAluno}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {TIPOS.map((t) => (
                          <Badge
                            key={t}
                            variant={tipo === t ? tipoVariant[t] : 'outline'}
                            className="cursor-pointer select-none"
                            onClick={() => toggleTipo(a.idAluno, t)}
                          >
                            {tipoLabel[t]}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Button
            className="mt-4"
            disabled={!idCalendario || lancar.isPending}
            onClick={handleSalvar}
          >
            {lancar.isPending ? 'Salvando...' : 'Salvar Frequência'}
          </Button>
        </>
      )}

      {alunos.length === 0 && (
        <p className="text-muted-foreground text-sm">Nenhum aluno matriculado nesta turma.</p>
      )}
    </div>
  );
}
