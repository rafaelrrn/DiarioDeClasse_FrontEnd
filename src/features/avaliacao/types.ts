export type SituacaoAluno =
  | 'APROVADO'
  | 'EM_RECUPERACAO'
  | 'REPROVADO_NOTA'
  | 'REPROVADO_FREQUENCIA';

export interface AvaliacaoDTO {
  idAvaliacao?: number;
  idDisciplina: number;
  idCalendarioEscolar: number;
  materia?: string;
  dia?: string;
  peso?: number;
}

export interface NotaLancamentoDTO {
  idAluno: number;
  nota: number;
  obs?: string;
}

export interface AlunoAvaliacaoDTO {
  idAlunoAvaliacao?: number;
  idAluno: number;
  idAvaliacao: number;
  nota: number;
  obs?: string;
}

export interface MediaDisciplinaDTO {
  idDisciplina: number;
  nomeDisciplina: string;
  mediaCalculada: number;
  situacao: SituacaoAluno;
}

export interface BoletimResponseDTO {
  idAluno: number;
  nomeAluno: string;
  frequencia: {
    idAluno: number;
    totalAulas: number;
    totalPresencas: number;
    totalFaltas: number;
    totalFaltasJust: number;
    percentualPresenca: number;
    emRiscoReprovacao: boolean;
  };
  disciplinas: MediaDisciplinaDTO[];
}
