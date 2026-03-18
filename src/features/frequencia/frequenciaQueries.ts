'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  buscarFrequenciasDoAluno,
  buscarResumoFrequencia,
  lancarFrequencia,
} from './frequenciaService';
import type { LancamentoFrequenciaBody, TipoFrequencia } from './types';

export const frequenciaKeys = {
  aluno: (id: number) => ['frequencias', 'aluno', id] as const,
  resumo: (id: number) => ['frequencias', 'aluno', id, 'resumo'] as const,
};

export function useFrequenciasDoAluno(idAluno: number) {
  return useQuery({
    queryKey: frequenciaKeys.aluno(idAluno),
    queryFn: () => buscarFrequenciasDoAluno(idAluno),
  });
}

export function useResumoFrequencia(idAluno: number) {
  return useQuery({
    queryKey: frequenciaKeys.resumo(idAluno),
    queryFn: () => buscarResumoFrequencia(idAluno),
  });
}

export function useLancarFrequencia(idTurma: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      idCalendario,
      body,
      tipoPadrao,
    }: {
      idCalendario: number;
      body: LancamentoFrequenciaBody;
      tipoPadrao?: TipoFrequencia;
    }) => lancarFrequencia(idTurma, idCalendario, body, tipoPadrao),
    onSuccess: () => {
      toast.success('Frequência lançada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['frequencias'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
