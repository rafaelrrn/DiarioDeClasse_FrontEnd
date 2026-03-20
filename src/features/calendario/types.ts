export interface CalendarioEscolarDTO {
  idCalendarioEscolar?: number;
  idMes: number;
  idAnoCalendario?: number | null;
  idPeriodo: number;
  idClasse: number;
  diasLetivos?: string;
  diasAvaliacoes?: string;
}

export interface AnoCalendarioDTO {
  idAnoCalendario?: number;
  ano: string; // "2025"
}

export interface MesDTO {
  idMes?: number;
  nome: string;
}

export interface PeriodoDTO {
  idPeriodo?: number;
  nome: string;
}
