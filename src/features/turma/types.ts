export interface TurmaDTO {
  idTurma?: number;
  nome: string;
}

export interface AlunoTurmaDTO {
  idAlunoTurma?: number;
  idAluno: number;
  idTurma: number;
  obs?: string;
}

export interface DisciplinaDTO {
  idDisciplina?: number;
  nome: string;
}

export interface ComponenteCurricularDTO {
  idComponenteCurricular?: number;
  nome: string;
  obs?: string;
}

export interface ClasseDTO {
  idClasse?: number;
  idInstituicaoEnsino: number;
  idComponenteCurricular?: number;
  idCurso: number;
  idTurno: number;
  idTurma: number;
  idProfessor: number;
}
