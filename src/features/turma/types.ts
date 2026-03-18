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
