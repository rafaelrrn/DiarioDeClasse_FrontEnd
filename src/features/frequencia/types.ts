export type TipoFrequencia = 'PRESENTE' | 'FALTA' | 'FALTA_JUSTIFICADA';

export interface AlunoFrequenciaDTO {
  idAlunoFrequencia?: number;
  idAluno: number;
  idCalendarioEscolar: number;
  tipoFrequencia: TipoFrequencia;
}

export interface FrequenciaResumoDTO {
  idAluno: number;
  totalAulas: number;
  totalPresencas: number;
  totalFaltas: number;
  totalFaltasJust: number;
  percentualPresenca: number;
  emRiscoReprovacao: boolean;
}

export type LancamentoFrequenciaBody = Record<number, TipoFrequencia>;
