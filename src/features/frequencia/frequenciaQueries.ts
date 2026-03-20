'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listarFrequencias,
  buscarFrequenciasDoAluno,
  buscarResumoFrequencia,
  lancarFrequencia,
  corrigirFrequencia,
  desativarFrequencia,
} from './frequenciaService';
import type { LancamentoFrequenciaBody, TipoFrequencia } from './types';

export const frequenciaKeys = {
  all: ['frequencias'] as const,
  aluno: (id: number) => ['frequencias', 'aluno', id] as const,
  resumo: (id: number) => ['frequencias', 'aluno', id, 'resumo'] as const,
};

export function useFrequencias() {
  return useQuery({
    queryKey: frequenciaKeys.all,
    queryFn: listarFrequencias,
  });
}

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
  const qc = useQueryClient();
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
      qc.invalidateQueries({ queryKey: frequenciaKeys.all });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCorrigirFrequencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tipoFrequencia }: { id: number; tipoFrequencia: TipoFrequencia }) =>
      corrigirFrequencia(id, tipoFrequencia),
    onSuccess: () => {
      toast.success('Frequência corrigida');
      qc.invalidateQueries({ queryKey: frequenciaKeys.all });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDesativarFrequencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => desativarFrequencia(id),
    onSuccess: () => {
      toast.success('Frequência desativada');
      qc.invalidateQueries({ queryKey: frequenciaKeys.all });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
