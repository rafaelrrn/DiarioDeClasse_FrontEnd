'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { buscarCalendarios, criarCalendario } from './calendarioService';
import type { CalendarioEscolarDTO } from './types';

export const calendarioKeys = {
  all: ['calendarios'] as const,
};

export function useCalendarios() {
  return useQuery({ queryKey: calendarioKeys.all, queryFn: buscarCalendarios });
}

export function useCriarCalendario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CalendarioEscolarDTO) => criarCalendario(payload),
    onSuccess: () => {
      toast.success('Entrada criada no calendário');
      queryClient.invalidateQueries({ queryKey: calendarioKeys.all });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
