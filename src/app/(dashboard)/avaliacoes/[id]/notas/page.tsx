'use client';
import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAvaliacao, useLancarNotas } from '@/features/avaliacao/avaliacaoQueries';
import { useDisciplinas } from '@/features/turma/turmaQueries';
import { useAlunosDaTurma } from '@/features/turma/turmaQueries';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { buttonVariants } from '@/lib/buttonVariants';
import { cn } from '@/lib/utils';
import type { NotaLancamentoDTO } from '@/features/avaliacao/types';

type NotaEntry = { nota: string; obs: string };

export default function LancarNotasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const idAvaliacao = Number(id);

  const { data: avaliacao, isLoading: loadingAv } = useAvaliacao(idAvaliacao);
  const { data: disciplinas = [] } = useDisciplinas();
  const lancar = useLancarNotas(idAvaliacao);

  // MVP: professor informa o ID da turma para carregar os alunos
  const [idTurmaStr, setIdTurmaStr] = useState('');
  const idTurma = idTurmaStr ? Number(idTurmaStr) : undefined;
  const { data: alunos = [], isLoading: loadingAlunos } = useAlunosDaTurma(idTurma ?? 0);

  const [notas, setNotas] = useState<Record<number, NotaEntry>>({});

  function nomeDisciplina(idDisc: number) {
    return disciplinas.find((d) => d.idDisciplina === idDisc)?.nome ?? `Disciplina #${idDisc}`;
  }

  function setNota(idAluno: number, field: keyof NotaEntry, value: string) {
    setNotas((prev) => {
      const current: NotaEntry = prev[idAluno] ?? { nota: '', obs: '' };
      return { ...prev, [idAluno]: { ...current, [field]: value } };
    });
  }

  const payload = useMemo<NotaLancamentoDTO[]>(() => {
    return Object.entries(notas)
      .filter(([, v]) => v.nota !== '')
      .map(([idAluno, v]) => ({
        idAluno: Number(idAluno),
        nota: parseFloat(v.nota),
        obs: v.obs || undefined,
      }));
  }, [notas]);

  function handleSalvar() {
    if (payload.length === 0) return;
    lancar.mutate(payload, {
      onSuccess: () => setNotas({}),
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Lançar Notas em Lote"
        action={
          <Link
            href="/avaliacoes"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            ← Voltar para Avaliações
          </Link>
        }
      />

      {/* Cabeçalho da avaliação */}
      {loadingAv && <Skeleton className="h-16 w-full max-w-lg" />}
      {avaliacao && (
        <div className="flex flex-wrap items-center gap-3 bg-muted/50 rounded-lg px-4 py-3">
          <span className="font-medium">
            {nomeDisciplina(avaliacao.idDisciplina)}
            {avaliacao.materia && ` — ${avaliacao.materia}`}
          </span>
          {avaliacao.dia && (
            <span className="text-muted-foreground text-sm">{avaliacao.dia}</span>
          )}
          <Badge variant="outline">
            {avaliacao.peso ? `Peso: ${avaliacao.peso}` : 'Peso: 1 (padrão)'}
          </Badge>
        </div>
      )}

      {/* Selecionar turma */}
      <div className="max-w-xs space-y-1">
        <label className="text-sm font-medium">ID da Turma</label>
        <Input
          type="number"
          min={1}
          placeholder="Informe o ID da turma..."
          value={idTurmaStr}
          onChange={(e) => {
            setIdTurmaStr(e.target.value);
            setNotas({}); // limpar notas ao trocar turma
          }}
        />
      </div>

      {/* Aviso transacional */}
      {alunos.length > 0 && (
        <Alert>
          <AlertTitle>Atenção — operação transacional</AlertTitle>
          <AlertDescription>
            Se algum aluno já tiver nota nesta avaliação, o lançamento inteiro será cancelado.
            Verifique antes de confirmar.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabela de notas */}
      {idTurma && loadingAlunos && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      )}

      {idTurma && !loadingAlunos && alunos.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Nenhum aluno encontrado na turma #{idTurma}.
        </p>
      )}

      {alunos.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">ID Aluno</TableHead>
                <TableHead className="w-40">Nota (0–10)</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alunos.map((a) => (
                <TableRow key={a.idAluno}>
                  <TableCell className="font-medium">Aluno #{a.idAluno}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      placeholder="—"
                      value={notas[a.idAluno]?.nota ?? ''}
                      onChange={(e) => setNota(a.idAluno, 'nota', e.target.value)}
                      className="w-28"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Opcional..."
                      maxLength={255}
                      value={notas[a.idAluno]?.obs ?? ''}
                      onChange={(e) => setNota(a.idAluno, 'obs', e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleSalvar}
              disabled={payload.length === 0 || lancar.isPending}
            >
              {lancar.isPending ? 'Lançando...' : `Lançar Notas (${payload.length})`}
            </Button>
            {payload.length === 0 && (
              <span className="text-sm text-muted-foreground">
                Preencha pelo menos uma nota para lançar.
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
