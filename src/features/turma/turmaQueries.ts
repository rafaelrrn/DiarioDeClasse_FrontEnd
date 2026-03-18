'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  atualizarTurma,
  buscarAlunosDaTurma,
  buscarTurma,
  buscarTurmas,
  criarTurma,
  deletarTurma,
  matricularAluno,
} from './turmaService';
import type { TurmaDTO } from './types';

export const turmaKeys = {
  all: ['turmas'] as const,
  detail: (id: number) => ['turmas', id] as const,
  alunos: (id: number) => ['turmas', id, 'alunos'] as const,
};

export function useTurmas() {
  return useQuery({ queryKey: turmaKeys.all, queryFn: buscarTurmas });
}

export function useTurma(id: number) {
  return useQuery({ queryKey: turmaKeys.detail(id), queryFn: () => buscarTurma(id) });
}

export function useAlunosDaTurma(idTurma: number) {
  return useQuery({
    queryKey: turmaKeys.alunos(idTurma),
    queryFn: () => buscarAlunosDaTurma(idTurma),
  });
}

export function useCriarTurma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TurmaDTO) => criarTurma(payload),
    onSuccess: () => {
      toast.success('Turma criada com sucesso');
      queryClient.invalidateQueries({ queryKey: turmaKeys.all });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAtualizarTurma(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TurmaDTO) => atualizarTurma(id, payload),
    onSuccess: () => {
      toast.success('Turma atualizada');
      queryClient.invalidateQueries({ queryKey: turmaKeys.all });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeletarTurma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarTurma(id),
    onSuccess: () => {
      toast.success('Turma removida');
      queryClient.invalidateQueries({ queryKey: turmaKeys.all });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useMatricularAluno(idTurma: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { idAluno: number; obs?: string }) =>
      matricularAluno(idTurma, payload),
    onSuccess: () => {
      toast.success('Aluno matriculado com sucesso');
      queryClient.invalidateQueries({ queryKey: turmaKeys.alunos(idTurma) });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
