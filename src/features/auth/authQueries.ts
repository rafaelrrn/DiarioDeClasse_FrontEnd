'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listarUsuarios, buscarUsuario, atualizarUsuario } from './authService';
import type { UserMe, UserUpdateRequest } from './types';

export const userKeys = {
  all: ['users'] as const,
  one: (id: number) => ['users', id] as const,
};

export function useUsuarios() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: listarUsuarios,
  });
}

export function useUsuario(id: number) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: userKeys.one(id),
    queryFn: () => buscarUsuario(id),
    enabled: !!id,
    // Usa o cache da listagem para preencher imediatamente sem fetch extra
    initialData: () => {
      const cached = qc.getQueryData<UserMe[]>(userKeys.all);
      return cached?.find((u) => u.idUser === id);
    },
  });
}

export function useAtualizarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserUpdateRequest }) =>
      atualizarUsuario(id, payload),
    onSuccess: (_, { id }) => {
      toast.success('Usuário atualizado');
      qc.invalidateQueries({ queryKey: userKeys.all });
      qc.invalidateQueries({ queryKey: userKeys.one(id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
