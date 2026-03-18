'use client';
import { useState } from 'react';
import { useTurmas, useCriarTurma, useDeletarTurma } from '@/features/turma/turmaQueries';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminTurmasPage() {
  const { data: turmas = [], isLoading } = useTurmas();
  const criarTurma = useCriarTurma();
  const deletarTurma = useDeletarTurma();

  const [novoNome, setNovoNome] = useState('');

  function handleCriar() {
    if (!novoNome.trim()) return;
    criarTurma.mutate({ nome: novoNome }, { onSuccess: () => setNovoNome('') });
  }

  return (
    <div>
      <PageHeader title="Gerenciar Turmas" />

      <div className="flex gap-2 mb-6 max-w-sm">
        <Input
          placeholder="Nome da nova turma"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
        />
        <Button onClick={handleCriar} disabled={criarTurma.isPending}>
          Criar
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {turmas.map((t) => (
              <TableRow key={t.idTurma}>
                <TableCell>{t.idTurma}</TableCell>
                <TableCell>{t.nome}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletarTurma.mutate(t.idTurma!)}
                  >
                    Remover
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
