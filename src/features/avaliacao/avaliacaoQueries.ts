'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  buscarAvaliacoes,
  buscarBoletim,
  buscarNotasDoAluno,
  criarAvaliacao,
  deletarAvaliacao,
  lancarNotas,
} from './avaliacaoService';
import type { AvaliacaoDTO, NotaLancamentoDTO } from './types';

export const avaliacaoKeys = {
  all: ['avaliacoes'] as const,
  aluno: (id: number) => ['alunos', id, 'notas'] as const,
  boletim: (id: number) => ['alunos', id, 'boletim'] as const,
};

export function useAvaliacoes() {
  return useQuery({ queryKey: avaliacaoKeys.all, queryFn: buscarAvaliacoes });
}

export function useNotasDoAluno(idAluno: number) {
  return useQuery({
    queryKey: avaliacaoKeys.aluno(idAluno),
    queryFn: () => buscarNotasDoAluno(idAluno),
  });
}

export function useBoletim(idAluno: number) {
  return useQuery({
    queryKey: avaliacaoKeys.boletim(idAluno),
    queryFn: () => buscarBoletim(idAluno),
  });
}

export function useCriarAvaliacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AvaliacaoDTO) => criarAvaliacao(payload),
    onSuccess: () => {
      toast.success('Avaliação criada');
      queryClient.invalidateQueries({ queryKey: avaliacaoKeys.all });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeletarAvaliacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarAvaliacao(id),
    onSuccess: () => {
      toast.success('Avaliação removida');
      queryClient.invalidateQueries({ queryKey: avaliacaoKeys.all });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useLancarNotas(idAvaliacao: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notas: NotaLancamentoDTO[]) => lancarNotas(idAvaliacao, notas),
    onSuccess: () => {
      toast.success('Notas lançadas com sucesso');
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
