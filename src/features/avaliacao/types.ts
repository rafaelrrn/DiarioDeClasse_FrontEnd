import type { FrequenciaResumoDTO } from '@/features/frequencia/types';

export type SituacaoAluno =
  | 'APROVADO'
  | 'EM_RECUPERACAO'
  | 'REPROVADO_NOTA'
  | 'REPROVADO_FREQUENCIA';

export interface AvaliacaoDTO {
  idAvaliacao?: number;
  idDisciplina: number;
  idCalendarioEscolar?: number | null;
  materia?: string;
  dia?: string;    // "YYYY-MM-DD"
  peso?: number | null;
}

export interface NotaLancamentoDTO {
  idAluno: number;
  nota: number;    // 0.0 a 10.0
  obs?: string;
}

export interface AlunoAvaliacaoDTO {
  idAlunoAvaliacao?: number;
  idAluno: number;
  idAvaliacao: number;
  nota?: number;
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
  frequencia: FrequenciaResumoDTO;
  disciplinas: MediaDisciplinaDTO[];
}
