export interface CalendarioEscolarDTO {
  idCalendarioEscolar?: number;
  idAnoCalendario: number;
  idMes: number;
  idPeriodo: number;
  data: string;
  descricao?: string;
}

export interface AnoCalendarioDTO {
  idAnoCalendario?: number;
  ano: number;
}
