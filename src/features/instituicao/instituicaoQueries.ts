'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  atualizarCurso,
  atualizarEnsino,
  atualizarGrau,
  atualizarInstituicao,
  atualizarSerie,
  atualizarTurno,
  criarCurso,
  criarEnsino,
  criarGrau,
  criarInstituicao,
  criarSerie,
  criarTurno,
  deletarCurso,
  deletarEnsino,
  deletarGrau,
  deletarInstituicao,
  deletarSerie,
  deletarTurno,
  listarCursos,
  listarEnsinos,
  listarGraus,
  listarInstituicoes,
  listarSeries,
  listarTurnos,
} from './instituicaoService';
import type {
  CursoDTO,
  EnsinoDTO,
  GrauDTO,
  InstituicaoEnsinoDTO,
  SerieDTO,
  TurnoDTO,
} from './types';

// ─── InstituicaoEnsino ────────────────────────────────────────────────────────

export function useInstituicoes() {
  return useQuery({ queryKey: ['instituicoes'], queryFn: listarInstituicoes });
}

export function useCriarInstituicao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<InstituicaoEnsinoDTO, 'idInstituicaoEnsino'>) =>
      criarInstituicao(dto),
    onSuccess: () => {
      toast.success('Instituição criada com sucesso');
      qc.invalidateQueries({ queryKey: ['instituicoes'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarInstituicao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: Omit<InstituicaoEnsinoDTO, 'idInstituicaoEnsino'>;
    }) => atualizarInstituicao(id, dto),
    onSuccess: () => {
      toast.success('Instituição atualizada com sucesso');
      qc.invalidateQueries({ queryKey: ['instituicoes'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarInstituicao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarInstituicao(id),
    onSuccess: () => {
      toast.success('Excluído com sucesso');
      qc.invalidateQueries({ queryKey: ['instituicoes'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Ensino ───────────────────────────────────────────────────────────────────

export function useEnsinos() {
  return useQuery({ queryKey: ['ensinos'], queryFn: listarEnsinos });
}

export function useCriarEnsino() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<EnsinoDTO, 'idEnsino'>) => criarEnsino(dto),
    onSuccess: () => {
      toast.success('Ensino criado com sucesso');
      qc.invalidateQueries({ queryKey: ['ensinos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarEnsino() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<EnsinoDTO, 'idEnsino'> }) =>
      atualizarEnsino(id, dto),
    onSuccess: () => {
      toast.success('Ensino atualizado com sucesso');
      qc.invalidateQueries({ queryKey: ['ensinos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarEnsino() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarEnsino(id),
    onSuccess: () => {
      toast.success('Excluído com sucesso');
      qc.invalidateQueries({ queryKey: ['ensinos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Grau ─────────────────────────────────────────────────────────────────────

export function useGraus() {
  return useQuery({ queryKey: ['graus'], queryFn: listarGraus });
}

export function useCriarGrau() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<GrauDTO, 'idGrau'>) => criarGrau(dto),
    onSuccess: () => {
      toast.success('Grau criado com sucesso');
      qc.invalidateQueries({ queryKey: ['graus'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarGrau() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<GrauDTO, 'idGrau'> }) =>
      atualizarGrau(id, dto),
    onSuccess: () => {
      toast.success('Grau atualizado com sucesso');
      qc.invalidateQueries({ queryKey: ['graus'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarGrau() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarGrau(id),
    onSuccess: () => {
      toast.success('Excluído com sucesso');
      qc.invalidateQueries({ queryKey: ['graus'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Série ────────────────────────────────────────────────────────────────────

export function useSeries() {
  return useQuery({ queryKey: ['series'], queryFn: listarSeries });
}

export function useCriarSerie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<SerieDTO, 'idSerie'>) => criarSerie(dto),
    onSuccess: () => {
      toast.success('Série criada com sucesso');
      qc.invalidateQueries({ queryKey: ['series'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarSerie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<SerieDTO, 'idSerie'> }) =>
      atualizarSerie(id, dto),
    onSuccess: () => {
      toast.success('Série atualizada com sucesso');
      qc.invalidateQueries({ queryKey: ['series'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarSerie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarSerie(id),
    onSuccess: () => {
      toast.success('Excluído com sucesso');
      qc.invalidateQueries({ queryKey: ['series'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Turno ────────────────────────────────────────────────────────────────────

export function useTurnos() {
  return useQuery({ queryKey: ['turnos'], queryFn: listarTurnos });
}

export function useCriarTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<TurnoDTO, 'idTurno'>) => criarTurno(dto),
    onSuccess: () => {
      toast.success('Turno criado com sucesso');
      qc.invalidateQueries({ queryKey: ['turnos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<TurnoDTO, 'idTurno'> }) =>
      atualizarTurno(id, dto),
    onSuccess: () => {
      toast.success('Turno atualizado com sucesso');
      qc.invalidateQueries({ queryKey: ['turnos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarTurno(id),
    onSuccess: () => {
      toast.success('Excluído com sucesso');
      qc.invalidateQueries({ queryKey: ['turnos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Curso ────────────────────────────────────────────────────────────────────

export function useCursos() {
  return useQuery({ queryKey: ['cursos'], queryFn: listarCursos });
}

export function useCriarCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<CursoDTO, 'idCurso'>) => criarCurso(dto),
    onSuccess: () => {
      toast.success('Curso criado com sucesso');
      qc.invalidateQueries({ queryKey: ['cursos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<CursoDTO, 'idCurso'> }) =>
      atualizarCurso(id, dto),
    onSuccess: () => {
      toast.success('Curso atualizado com sucesso');
      qc.invalidateQueries({ queryKey: ['cursos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarCurso(id),
    onSuccess: () => {
      toast.success('Excluído com sucesso');
      qc.invalidateQueries({ queryKey: ['cursos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
