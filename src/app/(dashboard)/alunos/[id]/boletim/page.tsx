'use client';
import { use } from 'react';
import { useBoletim } from '@/features/avaliacao/avaliacaoQueries';
import { SituacaoBadge } from '@/shared/components/SituacaoBadge';
import { PageHeader } from '@/shared/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export default function BoletimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const idAluno = Number(id);
  const { data: boletim, isLoading, isError } = useBoletim(idAluno);

  return (
    <div className="space-y-6">
      <PageHeader title="Boletim Escolar" />

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-muted-foreground">Não foi possível carregar o boletim.</p>
      )}

      {!isLoading && !isError && !boletim && (
        <p className="text-muted-foreground">Boletim não disponível para este aluno.</p>
      )}

      {boletim && (
        <>
          {/* Card 1 — Identificação */}
          <Card>
            <CardHeader>
              <CardTitle>{boletim.nomeAluno}</CardTitle>
              <CardDescription>Boletim Escolar — ID {boletim.idAluno}</CardDescription>
            </CardHeader>
          </Card>

          {/* Card 2 — Frequência */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">Frequência Global</CardTitle>
                {boletim.frequencia.emRiscoReprovacao && (
                  <Badge variant="destructive">⚠ Risco de Reprovação (LDB Art. 24)</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Barra de progresso */}
              <div className="space-y-1">
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      boletim.frequencia.emRiscoReprovacao ? 'bg-destructive' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(boletim.frequencia.percentualPresenca, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span
                    className={
                      boletim.frequencia.emRiscoReprovacao
                        ? 'text-destructive font-semibold'
                        : 'text-foreground font-semibold'
                    }
                  >
                    {boletim.frequencia.percentualPresenca.toFixed(1)}% de presença
                  </span>
                  <span className="text-muted-foreground">Mínimo legal: 75%</span>
                </div>
              </div>

              {/* Contadores */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium">{boletim.frequencia.totalPresencas}</div>
                  <div className="text-muted-foreground">Presenças</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{boletim.frequencia.totalFaltas}</div>
                  <div className="text-muted-foreground">Faltas</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{boletim.frequencia.totalFaltasJust}</div>
                  <div className="text-muted-foreground">Justificadas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3 — Desempenho por Disciplina */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Desempenho por Disciplina</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Disciplina</TableHead>
                    <TableHead className="w-24">Média</TableHead>
                    <TableHead className="w-40">Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boletim.disciplinas.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                      >
                        Nenhuma nota lançada ainda
                      </TableCell>
                    </TableRow>
                  ) : (
                    boletim.disciplinas.map((d) => (
                      <TableRow key={d.idDisciplina}>
                        <TableCell>{d.nomeDisciplina}</TableCell>
                        <TableCell>
                          <span
                            className={
                              d.mediaCalculada >= 5
                                ? 'text-green-600 font-bold'
                                : 'text-red-600 font-bold'
                            }
                          >
                            {d.mediaCalculada.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <SituacaoBadge situacao={d.situacao} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Legenda */}
              <div className="px-4 pb-4 pt-3 text-xs text-muted-foreground space-y-1 border-t">
                <p>✅ <strong>Aprovado</strong>: média ≥ 5,0 e frequência ≥ 75%</p>
                <p>🟡 <strong>Em Recuperação</strong>: média entre 3,0 e 4,9</p>
                <p>🔴 <strong>Reprovado (Nota)</strong>: média inferior a 3,0</p>
                <p>🔴 <strong>Reprovado (Frequência)</strong>: menos de 75% de presença (LDB Art. 24)</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
