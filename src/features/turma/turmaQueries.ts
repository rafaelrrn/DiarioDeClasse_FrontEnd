'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listarTurmas,
  listarTurmasDoProfessor,
  buscarTurma,
  criarTurma,
  atualizarTurma,
  deletarTurma,
  listarAlunosDaTurma,
  matricularAluno,
  desativarMatricula,
  listarDisciplinas,
  criarDisciplina,
  atualizarDisciplina,
  deletarDisciplina,
  listarComponentesCurriculares,
  criarComponenteCurricular,
  atualizarComponenteCurricular,
  deletarComponenteCurricular,
  listarClasses,
  criarClasse,
  atualizarClasse,
  deletarClasse,
} from './turmaService';
import type { ClasseDTO, ComponenteCurricularDTO, DisciplinaDTO, TurmaDTO } from './types';

// ─── Turma ────────────────────────────────────────────────────────────────────

export function useTurmas(enabled = true) {
  return useQuery({ queryKey: ['turmas'], queryFn: listarTurmas, enabled });
}

export function useTurmasDoProfessor(idProfessor: number | null) {
  return useQuery({
    queryKey: ['turmas', 'professor', idProfessor],
    queryFn: () => listarTurmasDoProfessor(idProfessor!),
    enabled: idProfessor !== null,
  });
}

export function useTurma(id: number) {
  return useQuery({ queryKey: ['turma', id], queryFn: () => buscarTurma(id) });
}

export function useCriarTurma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<TurmaDTO, 'idTurma'>) => criarTurma(dto),
    onSuccess: () => {
      toast.success('Turma criada com sucesso');
      qc.invalidateQueries({ queryKey: ['turmas'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarTurma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<TurmaDTO, 'idTurma'> }) =>
      atualizarTurma(id, dto),
    onSuccess: () => {
      toast.success('Turma atualizada');
      qc.invalidateQueries({ queryKey: ['turmas'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarTurma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarTurma(id),
    onSuccess: () => {
      toast.success('Turma excluída');
      qc.invalidateQueries({ queryKey: ['turmas'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── AlunoTurma ───────────────────────────────────────────────────────────────

export function useAlunosDaTurma(idTurma: number) {
  return useQuery({
    queryKey: ['turma', idTurma, 'alunos'],
    queryFn: () => listarAlunosDaTurma(idTurma),
  });
}

export function useMatricularAluno(idTurma: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { idAluno: number; obs?: string }) =>
      matricularAluno(idTurma, payload),
    onSuccess: () => {
      toast.success('Aluno matriculado com sucesso');
      qc.invalidateQueries({ queryKey: ['turma', idTurma, 'alunos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDesativarMatricula(idTurma: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idAlunoTurma: number) => desativarMatricula(idAlunoTurma),
    onSuccess: () => {
      toast.success('Matrícula desativada com sucesso');
      qc.invalidateQueries({ queryKey: ['turma', idTurma, 'alunos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Disciplina ───────────────────────────────────────────────────────────────

export function useDisciplinas() {
  return useQuery({ queryKey: ['disciplinas'], queryFn: listarDisciplinas });
}

export function useCriarDisciplina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<DisciplinaDTO, 'idDisciplina'>) => criarDisciplina(dto),
    onSuccess: () => {
      toast.success('Disciplina criada com sucesso');
      qc.invalidateQueries({ queryKey: ['disciplinas'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarDisciplina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<DisciplinaDTO, 'idDisciplina'> }) =>
      atualizarDisciplina(id, dto),
    onSuccess: () => {
      toast.success('Disciplina atualizada');
      qc.invalidateQueries({ queryKey: ['disciplinas'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarDisciplina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarDisciplina(id),
    onSuccess: () => {
      toast.success('Disciplina excluída');
      qc.invalidateQueries({ queryKey: ['disciplinas'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── ComponenteCurricular ─────────────────────────────────────────────────────

export function useComponentesCurriculares() {
  return useQuery({
    queryKey: ['componentes-curriculares'],
    queryFn: listarComponentesCurriculares,
  });
}

export function useCriarComponenteCurricular() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<ComponenteCurricularDTO, 'idComponenteCurricular'>) =>
      criarComponenteCurricular(dto),
    onSuccess: () => {
      toast.success('Componente criado com sucesso');
      qc.invalidateQueries({ queryKey: ['componentes-curriculares'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarComponenteCurricular() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: Omit<ComponenteCurricularDTO, 'idComponenteCurricular'>;
    }) => atualizarComponenteCurricular(id, dto),
    onSuccess: () => {
      toast.success('Componente atualizado');
      qc.invalidateQueries({ queryKey: ['componentes-curriculares'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarComponenteCurricular() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarComponenteCurricular(id),
    onSuccess: () => {
      toast.success('Componente excluído');
      qc.invalidateQueries({ queryKey: ['componentes-curriculares'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Classe ───────────────────────────────────────────────────────────────────

export function useClasses() {
  return useQuery({ queryKey: ['classes'], queryFn: listarClasses });
}

export function useCriarClasse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<ClasseDTO, 'idClasse'>) => criarClasse(dto),
    onSuccess: () => {
      toast.success('Classe criada com sucesso');
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarClasse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<ClasseDTO, 'idClasse'> }) =>
      atualizarClasse(id, dto),
    onSuccess: () => {
      toast.success('Classe atualizada');
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarClasse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarClasse(id),
    onSuccess: () => {
      toast.success('Classe excluída');
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
