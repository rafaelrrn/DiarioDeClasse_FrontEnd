'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listarCalendarios,
  criarCalendario,
  atualizarCalendario,
  deletarCalendario,
  listarAnosCalendario,
  criarAnoCalendario,
  atualizarAnoCalendario,
  deletarAnoCalendario,
  listarMeses,
  criarMes,
  atualizarMes,
  deletarMes,
  listarPeriodos,
  criarPeriodo,
  atualizarPeriodo,
  deletarPeriodo,
} from './calendarioService';
import type { AnoCalendarioDTO, CalendarioEscolarDTO, MesDTO, PeriodoDTO } from './types';

// ─── CalendarioEscolar ────────────────────────────────────────────────────────

export function useCalendarios() {
  return useQuery({ queryKey: ['calendarios-escolares'], queryFn: listarCalendarios });
}

export function useCriarCalendario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<CalendarioEscolarDTO, 'idCalendarioEscolar'>) => criarCalendario(dto),
    onSuccess: () => {
      toast.success('Calendário criado com sucesso');
      qc.invalidateQueries({ queryKey: ['calendarios-escolares'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarCalendario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: Omit<CalendarioEscolarDTO, 'idCalendarioEscolar'>;
    }) => atualizarCalendario(id, dto),
    onSuccess: () => {
      toast.success('Calendário atualizado');
      qc.invalidateQueries({ queryKey: ['calendarios-escolares'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarCalendario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarCalendario(id),
    onSuccess: () => {
      toast.success('Calendário excluído');
      qc.invalidateQueries({ queryKey: ['calendarios-escolares'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── AnoCalendario ────────────────────────────────────────────────────────────

export function useAnosCalendario() {
  return useQuery({ queryKey: ['anos-calendario'], queryFn: listarAnosCalendario });
}

export function useCriarAnoCalendario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<AnoCalendarioDTO, 'idAnoCalendario'>) => criarAnoCalendario(dto),
    onSuccess: () => {
      toast.success('Ano calendário criado com sucesso');
      qc.invalidateQueries({ queryKey: ['anos-calendario'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarAnoCalendario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<AnoCalendarioDTO, 'idAnoCalendario'> }) =>
      atualizarAnoCalendario(id, dto),
    onSuccess: () => {
      toast.success('Ano calendário atualizado');
      qc.invalidateQueries({ queryKey: ['anos-calendario'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarAnoCalendario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarAnoCalendario(id),
    onSuccess: () => {
      toast.success('Ano calendário excluído');
      qc.invalidateQueries({ queryKey: ['anos-calendario'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Mes ──────────────────────────────────────────────────────────────────────

export function useMeses() {
  return useQuery({ queryKey: ['meses'], queryFn: listarMeses });
}

export function useCriarMes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<MesDTO, 'idMes'>) => criarMes(dto),
    onSuccess: () => {
      toast.success('Mês criado com sucesso');
      qc.invalidateQueries({ queryKey: ['meses'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarMes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<MesDTO, 'idMes'> }) =>
      atualizarMes(id, dto),
    onSuccess: () => {
      toast.success('Mês atualizado');
      qc.invalidateQueries({ queryKey: ['meses'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarMes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarMes(id),
    onSuccess: () => {
      toast.success('Mês excluído');
      qc.invalidateQueries({ queryKey: ['meses'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Periodo ──────────────────────────────────────────────────────────────────

export function usePeriodos() {
  return useQuery({ queryKey: ['periodos'], queryFn: listarPeriodos });
}

export function useCriarPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<PeriodoDTO, 'idPeriodo'>) => criarPeriodo(dto),
    onSuccess: () => {
      toast.success('Período criado com sucesso');
      qc.invalidateQueries({ queryKey: ['periodos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<PeriodoDTO, 'idPeriodo'> }) =>
      atualizarPeriodo(id, dto),
    onSuccess: () => {
      toast.success('Período atualizado');
      qc.invalidateQueries({ queryKey: ['periodos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarPeriodo(id),
    onSuccess: () => {
      toast.success('Período excluído');
      qc.invalidateQueries({ queryKey: ['periodos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
