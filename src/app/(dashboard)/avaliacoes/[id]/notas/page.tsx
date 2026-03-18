'use client';
import { use, useState } from 'react';
import { useLancarNotas } from '@/features/avaliacao/avaliacaoQueries';
import { usePessoas } from '@/features/pessoa/pessoaQueries';
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
import type { NotaLancamentoDTO } from '@/features/avaliacao/types';

export default function LancarNotasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const idAvaliacao = Number(id);

  const { data: pessoas = [] } = usePessoas();
  const lancar = useLancarNotas(idAvaliacao);

  const [notas, setNotas] = useState<Record<number, string>>({});

  function handleSalvar() {
    const payload: NotaLancamentoDTO[] = Object.entries(notas)
      .filter(([, v]) => v !== '')
      .map(([idAluno, nota]) => ({ idAluno: Number(idAluno), nota: Number(nota) }));
    lancar.mutate(payload);
  }

  return (
    <div>
      <PageHeader title="Lançar Notas" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="w-32">Nota (0–10)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pessoas.map((p) => (
            <TableRow key={p.idPessoa}>
              <TableCell>{p.nome}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={notas[p.idPessoa!] ?? ''}
                  onChange={(e) =>
                    setNotas((prev) => ({ ...prev, [p.idPessoa!]: e.target.value }))
                  }
                  className="w-24"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button className="mt-4" onClick={handleSalvar} disabled={lancar.isPending}>
        {lancar.isPending ? 'Salvando...' : 'Salvar Notas'}
      </Button>
    </div>
  );
}
