'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listarAvaliacoes,
  buscarAvaliacao,
  criarAvaliacao,
  atualizarAvaliacao,
  desativarAvaliacao,
  lancarNotasEmLote,
  buscarBoletim,
  buscarNotasDoAluno,
  corrigirNota,
  desativarNota,
} from './avaliacaoService';
import type { AvaliacaoDTO, NotaLancamentoDTO } from './types';

export const avaliacaoKeys = {
  all: ['avaliacoes'] as const,
  one: (id: number) => ['avaliacao', id] as const,
  notasAluno: (id: number) => ['alunos-avaliacao', 'aluno', id] as const,
  boletim: (id: number) => ['boletim', id] as const,
};

// ─── Avaliação ────────────────────────────────────────────────────────────────

export function useAvaliacoes() {
  return useQuery({ queryKey: avaliacaoKeys.all, queryFn: listarAvaliacoes });
}

export function useAvaliacao(id: number) {
  return useQuery({
    queryKey: avaliacaoKeys.one(id),
    queryFn: () => buscarAvaliacao(id),
    enabled: !!id,
  });
}

export function useCriarAvaliacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AvaliacaoDTO) => criarAvaliacao(payload),
    onSuccess: () => {
      toast.success('Avaliação criada');
      qc.invalidateQueries({ queryKey: avaliacaoKeys.all });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarAvaliacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AvaliacaoDTO }) =>
      atualizarAvaliacao(id, payload),
    onSuccess: (_, { id }) => {
      toast.success('Avaliação atualizada');
      qc.invalidateQueries({ queryKey: avaliacaoKeys.all });
      qc.invalidateQueries({ queryKey: avaliacaoKeys.one(id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDesativarAvaliacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => desativarAvaliacao(id),
    onSuccess: () => {
      toast.success('Avaliação desativada');
      qc.invalidateQueries({ queryKey: avaliacaoKeys.all });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** @deprecated use useDesativarAvaliacao */
export const useDeletarAvaliacao = useDesativarAvaliacao;

// ─── Lançamento em lote ───────────────────────────────────────────────────────

export function useLancarNotas(idAvaliacao: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notas: NotaLancamentoDTO[]) => lancarNotasEmLote(idAvaliacao, notas),
    onSuccess: () => {
      toast.success('Notas lançadas com sucesso');
      qc.invalidateQueries({ queryKey: ['alunos-avaliacao'] });
      qc.invalidateQueries({ queryKey: ['boletim'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Notas e correção ─────────────────────────────────────────────────────────

export function useNotasDoAluno(idAluno: number) {
  return useQuery({
    queryKey: avaliacaoKeys.notasAluno(idAluno),
    queryFn: () => buscarNotasDoAluno(idAluno),
  });
}

export function useCorrigirNota() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nota, obs }: { id: number; nota: number; obs?: string }) =>
      corrigirNota(id, nota, obs),
    onSuccess: () => {
      toast.success('Nota corrigida');
      qc.invalidateQueries({ queryKey: ['alunos-avaliacao'] });
      qc.invalidateQueries({ queryKey: ['boletim'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDesativarNota() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => desativarNota(id),
    onSuccess: () => {
      toast.success('Nota desativada');
      qc.invalidateQueries({ queryKey: ['alunos-avaliacao'] });
      qc.invalidateQueries({ queryKey: ['boletim'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Boletim ──────────────────────────────────────────────────────────────────

export function useBoletim(idAluno: number) {
  return useQuery({
    queryKey: avaliacaoKeys.boletim(idAluno),
    queryFn: () => buscarBoletim(idAluno),
    enabled: !!idAluno,
  });
}
