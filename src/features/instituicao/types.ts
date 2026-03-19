export interface InstituicaoEnsinoDTO {
  idInstituicaoEnsino?: number;
  descricao?: string;
  codigoEstadual?: string;
}

export interface EnsinoDTO {
  idEnsino?: number;
  nome: string;
}

export interface GrauDTO {
  idGrau?: number;
  nome: string;
}

export interface SerieDTO {
  idSerie?: number;
  nome: string;
}

export interface TurnoDTO {
  idTurno?: number;
  nome: string;
}

export interface CursoDTO {
  idCurso?: number;
  idEnsino: number;
  idGrau: number;
  idSerie: number;
}
