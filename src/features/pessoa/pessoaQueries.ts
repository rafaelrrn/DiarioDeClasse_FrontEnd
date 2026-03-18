'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  atualizarPessoa,
  buscarPessoa,
  buscarPessoas,
  criarPessoa,
  deletarPessoa,
} from './pessoaService';
import type { PessoaDTO } from './types';

export const pessoaKeys = {
  all: ['pessoas'] as const,
  detail: (id: number) => ['pessoas', id] as const,
};

export function usePessoas() {
  return useQuery({ queryKey: pessoaKeys.all, queryFn: buscarPessoas });
}

export function usePessoa(id: number) {
  return useQuery({ queryKey: pessoaKeys.detail(id), queryFn: () => buscarPessoa(id) });
}

export function useCriarPessoa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PessoaDTO) => criarPessoa(payload),
    onSuccess: () => {
      toast.success('Pessoa cadastrada com sucesso');
      queryClient.invalidateQueries({ queryKey: pessoaKeys.all });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAtualizarPessoa(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PessoaDTO) => atualizarPessoa(id, payload),
    onSuccess: () => {
      toast.success('Dados atualizados');
      queryClient.invalidateQueries({ queryKey: pessoaKeys.all });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeletarPessoa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarPessoa(id),
    onSuccess: () => {
      toast.success('Pessoa removida');
      queryClient.invalidateQueries({ queryKey: pessoaKeys.all });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
