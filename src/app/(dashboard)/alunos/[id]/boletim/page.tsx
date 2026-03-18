'use client';
import { use } from 'react';
import { useBoletim } from '@/features/avaliacao/avaliacaoQueries';
import { SituacaoBadge } from '@/shared/components/SituacaoBadge';
import { FrequenciaBadge } from '@/shared/components/FrequenciaBadge';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function BoletimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: boletim, isLoading } = useBoletim(Number(id));

  if (isLoading) return <p className="text-muted-foreground">Carregando boletim...</p>;
  if (!boletim) return <p className="text-muted-foreground">Boletim não disponível.</p>;

  return (
    <div>
      <PageHeader title={`Boletim — ${boletim.nomeAluno}`} />

      <Card className="mb-6 max-w-sm">
        <CardHeader>
          <CardTitle className="text-base">Frequência</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Presença:</span>
            <FrequenciaBadge
              percentual={boletim.frequencia.percentualPresenca}
              emRisco={boletim.frequencia.emRiscoReprovacao}
            />
          </div>
          <div className="flex justify-between">
            <span>Total de aulas:</span>
            <span>{boletim.frequencia.totalAulas}</span>
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Disciplina</TableHead>
            <TableHead>Média</TableHead>
            <TableHead>Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {boletim.disciplinas.map((d) => (
            <TableRow key={d.idDisciplina}>
              <TableCell>{d.nomeDisciplina}</TableCell>
              <TableCell>{d.mediaCalculada.toFixed(1)}</TableCell>
              <TableCell>
                <SituacaoBadge situacao={d.situacao} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
