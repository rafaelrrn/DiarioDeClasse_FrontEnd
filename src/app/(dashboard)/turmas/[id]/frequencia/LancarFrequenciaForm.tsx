'use client';
import { useState } from 'react';
import { useAlunosDaTurma } from '@/features/turma/turmaQueries';
import { useCalendarios } from '@/features/calendario/calendarioQueries';
import { useLancarFrequencia } from '@/features/frequencia/frequenciaQueries';
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
import type { TipoFrequencia } from '@/features/frequencia/types';

const TIPOS: TipoFrequencia[] = ['PRESENTE', 'FALTA', 'FALTA_JUSTIFICADA'];

const tipoLabel: Record<TipoFrequencia, string> = {
  PRESENTE: 'Presente',
  FALTA: 'Falta',
  FALTA_JUSTIFICADA: 'Falta Justificada',
};

const tipoVariant: Record<TipoFrequencia, 'default' | 'destructive' | 'secondary'> = {
  PRESENTE: 'default',
  FALTA: 'destructive',
  FALTA_JUSTIFICADA: 'secondary',
};

export function LancarFrequenciaForm({ idTurma }: { idTurma: number }) {
  const { data: alunos = [] } = useAlunosDaTurma(idTurma);
  const { data: calendarios = [] } = useCalendarios();
  const lancar = useLancarFrequencia(idTurma);

  const [idCalendario, setIdCalendario] = useState<number | null>(null);
  const [frequencias, setFrequencias] = useState<Record<number, TipoFrequencia>>({});

  function toggleTipo(idAluno: number, tipo: TipoFrequencia) {
    setFrequencias((prev) => ({ ...prev, [idAluno]: tipo }));
  }

  function handleSalvar() {
    if (!idCalendario) return;
    lancar.mutate({ idCalendario, body: frequencias });
  }

  return (
    <div>
      <PageHeader title="Lançar Frequência" />

      <div className="mb-4 max-w-xs">
        <label className="text-sm font-medium mb-1 block">Aula (Calendário)</label>
        <Select onValueChange={(v) => setIdCalendario(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a aula" />
          </SelectTrigger>
          <SelectContent>
            {calendarios.map((c) => (
              <SelectItem key={c.idCalendarioEscolar} value={String(c.idCalendarioEscolar)}>
                {c.data} {c.descricao ? `— ${c.descricao}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Aluno</TableHead>
            <TableHead>Frequência</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alunos.map((a) => {
            const tipo = frequencias[a.idAluno] ?? 'PRESENTE';
            return (
              <TableRow key={a.idAluno}>
                <TableCell>{a.idAluno}</TableCell>
                <TableCell className="flex gap-2">
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
    </div>
  );
}
