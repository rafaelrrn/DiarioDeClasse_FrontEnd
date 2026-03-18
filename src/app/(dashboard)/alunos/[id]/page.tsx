'use client';
import { use } from 'react';
import Link from 'next/link';
import { useResumoFrequencia } from '@/features/frequencia/frequenciaQueries';
import { usePessoa } from '@/features/pessoa/pessoaQueries';
import { FrequenciaBadge } from '@/shared/components/FrequenciaBadge';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/lib/buttonVariants';
import { cn } from '@/lib/utils';

export default function AlunoPerfil({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const idAluno = Number(id);

  const { data: pessoa } = usePessoa(idAluno);
  const { data: resumo } = useResumoFrequencia(idAluno);

  return (
    <div>
      <PageHeader
        title={pessoa?.nome ?? 'Aluno'}
        action={
          <Link
            href={`/alunos/${idAluno}/boletim`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            Ver Boletim
          </Link>
        }
      />

      {resumo && (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="text-base">Frequência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Presença:</span>
              <FrequenciaBadge
                percentual={resumo.percentualPresenca}
                emRisco={resumo.emRiscoReprovacao}
              />
            </div>
            <div className="flex justify-between">
              <span>Total de aulas:</span>
              <span>{resumo.totalAulas}</span>
            </div>
            <div className="flex justify-between">
              <span>Faltas:</span>
              <span>{resumo.totalFaltas}</span>
            </div>
            <div className="flex justify-between">
              <span>Faltas justificadas:</span>
              <span>{resumo.totalFaltasJust}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
